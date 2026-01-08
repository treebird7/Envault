import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { spawn } from 'child_process';

export const scanCommand = (program: Command) => {
    program.command('scan <subcommand> [args...]')
        .description('Run an Envault command in all subdirectories containing .env')
        .allowUnknownOption()
        .action(async (subcommand, args) => {
            const rootDir = process.cwd();
            console.log(chalk.bold(`\n🔍 Scanning subdirectories in ${rootDir} for .env files...\n`));

            let dirs: string[];
            try {
                const entries = await fs.readdir(rootDir, { withFileTypes: true });
                dirs = entries
                    .filter(e => e.isDirectory())
                    .map(e => e.name);
            } catch (err: any) {
                console.error(chalk.red('Failed to read directory:'), err.message);
                process.exit(1);
            }

            const targets: string[] = [];

            // Filter for managed directories
            // managed = has .env OR .envault_key (if initializing)
            for (const dir of dirs) {
                const fullPath = path.join(rootDir, dir);
                try {
                    // Check for .env or .envault_key
                    const files = await fs.readdir(fullPath);
                    if (files.includes('.env') || files.includes('.envault_key') || files.includes('config.enc')) {
                        targets.push(dir);
                    }
                } catch {
                    // Ignore access errors
                }
            }

            if (targets.length === 0) {
                console.log(chalk.yellow('No managed subdirectories found (dirs with .env, .envault_key, or config.enc).'));
                return;
            }

            console.log(chalk.blue(`Found ${targets.length} targets: ${targets.join(', ')}\n`));

            let failures = 0;

            for (const dir of targets) {
                console.log(chalk.bgBlue.white.bold(` 📂 ${dir} `) + chalk.gray(` (Running ${subcommand})...`));

                const fullPath = path.join(rootDir, dir);

                await new Promise<void>((resolve) => {
                    const child = spawn(
                        process.execPath, // node
                        [process.argv[1], subcommand, ...args], // envault <cmd> [args]
                        {
                            cwd: fullPath,
                            stdio: 'inherit',
                            env: { ...process.env, FORCE_COLOR: '1' } // Force color for child output
                        }
                    );

                    child.on('close', (code) => {
                        if (code !== 0) {
                            console.log(chalk.red(`\n❌ Command failed in ${dir} (exit code ${code})\n`));
                            failures++;
                        } else {
                            console.log(chalk.green(`\n✅ Success in ${dir}\n`));
                        }
                        resolve();
                    });

                    child.on('error', (err) => {
                        console.error(chalk.red(`Failed to start process:`), err.message);
                        failures++;
                        resolve();
                    });
                });
            }

            if (failures > 0) {
                console.log(chalk.red(`Scan completed with ${failures} failures.`));
                process.exit(1);
            } else {
                console.log(chalk.green('✨ Scan completed successfully on all targets.'));
            }
        });
};
