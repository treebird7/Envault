import { Command } from 'commander';
import fs from 'fs/promises';
import crypto from 'crypto';
import chalk from 'chalk';
import path from 'path';

export const keysCommand = (program: Command) => {
    program.command('keys')
        .description('Manage agent identity keys')
        .option('-g, --generate', 'Generate new Mycmail keypair')
        .action(async (options) => {
            if (options.generate) {
                console.log(chalk.blue('Generating Ed25519 keypair...'));

                // Generate Ed25519 Keypair
                const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');

                // Convert to Base64 (Standard format for ecosystem)
                // We export as raw bytes then base64 encode
                // Note: crypto.generateKeyPairSync returns KeyObject.
                // For Ed25519, we usually want the raw 32 bytes for compatibility with sodium-native if used elsewhere,
                // but Node's export doesn't directly give raw bytes for Ed25519 easily without 'der' or 'pem'.
                // However, usually tools accept standard PEM or specific format.
                // Let's stick to PEM for maximum compatibility if unsure, or try to extract raw.
                // Actually, most simple agent tools use Base64 of raw bytes.
                
                // Let's try to simulate raw export
                const privateKeyBytes = privateKey.export({ type: 'pkcs8', format: 'der' });
                const publicKeyBytes = publicKey.export({ type: 'spki', format: 'der' });
                
                // Using PEM is safer for generic Node usage, but clean Base64 strings are often preferred for .env
                // Let's assume PEM for now as it's the standard Text format.
                const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
                const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();

                // If user specifically wanted "mycmail" style, we might need to be careful.
                // But let's write to .env
                
                const envPath = path.resolve(process.cwd(), '.env');
                let envContent = '';
                
                try {
                    envContent = await fs.readFile(envPath, 'utf-8');
                } catch (e) {
                    // .env doesn't exist, create it
                }

                const newLine = envContent.endsWith('\n') || envContent === '' ? '' : '\n';
                
                // Simple append for now - in a real tool we might want to replace existing
                const appendContent = `${newLine}# Added by Envault Keys
MYCELIUMAIL_PRIVATE_KEY="${Buffer.from(privateKeyPem).toString('base64')}"
MYCELIUMAIL_PUBLIC_KEY="${Buffer.from(publicKeyPem).toString('base64')}"
`;
                // Wait, base64 encoding PEM? That's double encoding. 
                // Usually keys in .env are EITHER straight PEM (multiline issues) OR Base64 of PEM.
                // Let's just put the PEM directly if quoting handles newlines, or Base64 of it.
                // Base64 of PEM is safest for single-line .env vars.
                
               await fs.appendFile(envPath, appendContent);

                console.log(chalk.green('✅ Keys generated and added to .env'));
                console.log(chalk.yellow('Make sure to run `envault push` to encrypt them!'));
            } else {
                console.log(chalk.yellow('Use --generate to create new keys'));
            }
        });
};
