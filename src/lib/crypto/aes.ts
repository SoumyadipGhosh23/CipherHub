import { createCipheriv, createDecipheriv, randomBytes, CipherGCM, DecipherGCM } from 'crypto';

/**
 * Encryption result returned from encryptAES.
 */
export interface EncryptionResult {
  algorithm: string; // e.g., 'AES-256-CBC'
  encrypted: string; // base64 string of ciphertext
  iv: string; // base64 iv used for encryption
}

/**
 * Internal static key used for demo purposes.
 * In a real application this would be securely managed.
 */
const KEY = randomBytes(32); // 256‑bit key

/**
 * Encrypt a plaintext message using AES‑256‑CBC.
 * Returns ciphertext, iv and algorithm name.
 */
export function encryptAES(message: string): EncryptionResult {
  const iv = randomBytes(16); // 128‑bit IV for CBC
  const cipher = createCipheriv('aes-256-cbc', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(message, 'utf8'), cipher.final()]);
  return {
    algorithm: 'AES-256-CBC',
    encrypted: encrypted.toString('base64'),
    iv: iv.toString('base64'),
  };
}

/**
 * Decrypt a ciphertext produced by encryptAES.
 * Expects the same static KEY.
 */
export function decryptAES(payload: EncryptionResult): string {
  const iv = Buffer.from(payload.iv, 'base64');
  const encrypted = Buffer.from(payload.encrypted, 'base64');
  const decipher = createDecipheriv('aes-256-cbc', KEY, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
