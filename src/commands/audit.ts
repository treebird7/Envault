
import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import * as envManager from '../lib/env-manager.js';

export const auditCommand = (program: Command) => {
    program.command('audit')
        .description('Global health check: Scan all subdirectories for .env issues')
        .option('-d, --dir <path>', 'Root directory to scan', '.')
        .option('--fix', 'Auto-fix issues where possible')
        .action(async (options) => {
            const rootDir = path.resolve(options.dir);
            console.log(chalk.bold(`\n🔍 Auditing .env files in: ${chalk.cyan(rootDir)}`));

            try {
                const entries = await fs.readdir(rootDir, { withFileTypes: true });
                const dirs = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'));

                console.log(chalk.gray(`Found ${dirs.length} directories to scan...\n`));

                let issuesFound = 0;
                let scanned = 0;
                let fixed = 0;

                for (const dir of dirs) {
                    const envPath = path.join(rootDir, dir.name, '.env');
                    const encPath = path.join(rootDir, dir.name, 'config.enc');

                    let envExists = false;
                    let encExists = false;

                    try { await fs.access(envPath); envExists = true; } catch { }
                    try { await fs.access(encPath); encExists = true; } catch { }

                    // 1. Case: MISSING (Encrypted exists, but local .env missing)
                    if (encExists && !envExists) {
                        issuesFound++;
                        console.log(`${chalk.blue('MISSING')}   ${dir.name} ${chalk.gray('(found config.enc, needs pull)')}`);
                        continue;
                    }

                    // 2. Case: UNTRACKED (Local .env exists, but no encrypted backup)
                    if (envExists && !encExists) {
                        // Not necessarily an error, but good to know
                        console.log(`${chalk.magenta('UNTRACKED')} ${dir.name} ${chalk.gray('(has .env, but no config.enc)')}`);
                    }

                    if (envExists) {
                        // .env exists, let's check it
                        scanned++;
                        const content = await fs.readFile(envPath, 'utf-8');
                        const result = envManager.validateEnv(content);

                        if (result.valid && result.warnings.length === 0) {
                            console.log(`${chalk.green('PASS')}      ${dir.name}`);
                        } else {
                            if (options.fix && result.fixedContent) {
                                // 1. Create Backup
                                const backupPath = path.join(rootDir, dir.name, '.env.bak');
                                await fs.copyFile(envPath, backupPath);

                                // 2. Add to .gitignore if needed
                                const gitignorePath = path.join(rootDir, dir.name, '.gitignore');
                                try {
                                    await fs.access(gitignorePath);
                                    const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
                                    if (!gitignoreContent.includes('.env.bak')) {
                                        const newContent = gitignoreContent.endsWith('\n')
                                            ? gitignoreContent + '.env.bak\n'
                                            : gitignoreContent + '\n.env.bak\n';
                                        await fs.writeFile(gitignorePath, newContent);
                                    }
                                } catch { }

                                // 3. Apply Fix
                                await fs.writeFile(envPath, result.fixedContent);
                                console.log(`${chalk.green('FIXED')}     ${dir.name} ${chalk.gray('(backup created)')}`);
                                fixed++;
                            } else {
                                issuesFound++;
                                console.log(`${chalk.red('FAIL')}      ${dir.name}`);
                                result.errors.forEach(e => console.log(chalk.red(`          - ${e}`)));
                                result.warnings.forEach(w => console.log(chalk.yellow(`          - ${w}`)));
                            }
                        }
                    }
                }

                console.log(chalk.gray('---'));
                if (issuesFound === 0) {
                    if (fixed > 0) {
                        console.log(chalk.green(`\n✨ Perfect! checked ${scanned} repos, fixed ${fixed} issues.`));
                    } else {
                        console.log(chalk.green(`\n✨ Perfect! checked ${scanned} repos, 0 issues found.`));
                    }
                } else {
                    console.log(chalk.red(`\n⚠️  Found issues in ${issuesFound} repos.`));
                    if (!options.fix) {
                        console.log(chalk.blue('💡 Run with --fix to automatically resolve formatting issues.'));
                    }
                }

            } catch (err) {
                console.error(chalk.red('Audit failed:'), err);
            }
        });
};
