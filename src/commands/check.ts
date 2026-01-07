
import { Command } from 'commander';
import fs from 'fs/promises';
import chalk from 'chalk';
import * as envManager from '../lib/env-manager.js';

const ENV_FILE = '.env';

export const checkCommand = (program: Command) => {
    program.command('check')
        .description('Validate .env file formatting')
        .option('-f, --file <path>', 'Path to .env file', ENV_FILE)
        .option('--fix', 'Auto-fix simple errors')
        .action(async (options) => {
            await runCheck(options.file, options.fix);
        });
};

export async function runCheck(filePath: string, fix: boolean, silent: boolean = false): Promise<boolean> {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const result = envManager.validateEnv(content);

        if (!silent) {
            console.log(chalk.bold(`Checking ${filePath}...`));
        }

        if (result.valid && result.warnings.length === 0) {
            if (!silent) console.log(chalk.green('✅ No issues found.'));
            return true;
        }

        if (result.warnings.length > 0 && !silent) {
            result.warnings.forEach(w => console.log(chalk.yellow(`⚠️  ${w}`)));
        }

        if (!result.valid) {
            if (!silent) result.errors.forEach(e => console.error(chalk.red(`❌ ${e}`)));

            if (fix && result.fixedContent) {
                await fs.writeFile(filePath, result.fixedContent);
                console.log(chalk.green('\n✅ Fixed formatting issues automatically.'));
                return true;
            } else if (result.fixedContent && !silent) {
                console.log(chalk.blue('\n💡 Run with --fix to automatically resolve formatting issues.'));
            }
            return false;
        }

        return true;
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            console.error(chalk.red(`File not found: ${filePath}`));
        } else {
            console.error(chalk.red('Error reading file:'), err);
        }
        return false;
    }
}
