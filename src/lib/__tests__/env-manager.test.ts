
import { describe, it, expect } from 'vitest';
import { validateEnv, encryptEnv, decryptEnv, generateKey, validateKey } from '../env-manager.js';

describe('Env Manager', () => {
    describe('Key Management', () => {
        it('should generate a valid 256-bit hex key', () => {
            const key = generateKey();
            expect(key).toHaveLength(64); // 32 bytes * 2 hex chars
            expect(validateKey(key)).toBe(true);
        });

        it('should reject invalid keys', () => {
            expect(validateKey('short')).toBe(false);
            expect(validateKey('zz'.repeat(32))).toBe(false); // Valid length, invalid hex
        });
    });

    describe('Environment Validation', () => {
        it('should validate correct env content', () => {
            const content = 'FOO=bar\nBAZ=qux\n';
            const result = validateEnv(content);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail on missing newline', () => {
            const content = 'FOO=bar';
            const result = validateEnv(content);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('File does not end with a newline character');
            expect(result.fixedContent).toBe('FOO=bar\n');
        });
    });

    describe('Encryption', () => {
        it('should encrypt and decrypt correctly', () => {
            const key = generateKey();
            const original = 'SECRET=value\nAPI_KEY=12345\n';

            const encrypted = encryptEnv(original, key);
            expect(encrypted).not.toBe(original);
            expect(encrypted).toContain(':'); // IV:Auth:Content format

            const decrypted = decryptEnv(encrypted, key);
            expect(decrypted).toBe(original);
        });

        it('should fail with wrong key', () => {
            const key1 = generateKey();
            const key2 = generateKey();
            const original = 'SECRET=value\n';

            const encrypted = encryptEnv(original, key1);

            expect(() => decryptEnv(encrypted, key2)).toThrow();
        });
    });
});
