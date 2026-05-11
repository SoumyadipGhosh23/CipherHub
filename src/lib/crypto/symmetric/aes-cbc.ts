import { createCipheriv, createDecipheriv } from 'crypto';
import { decodeBase64, encodeBase64, generateIv, getKeyBytes } from './shared';
import { SymmetricCiphertext, SymmetricDecryptInput, SymmetricEncryptInput } from '@/types/crypto';

const ALGORITHM = 'AES-256-CBC' as const;
const NODE_ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

export function encryptAesCbc({ message }: SymmetricEncryptInput): SymmetricCiphertext {
  const key = getKeyBytes(KEY_LENGTH);
  const iv = generateIv(IV_LENGTH);
  const cipher = createCipheriv(NODE_ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(message, 'utf8'), cipher.final()]);

  return {
    algorithm: ALGORITHM,
    encrypted: encodeBase64(encrypted),
    iv: encodeBase64(iv),
  };
}

export function decryptAesCbc(payload: SymmetricDecryptInput): string {
  const key = getKeyBytes(KEY_LENGTH);
  const iv = decodeBase64(payload.iv);
  const encrypted = decodeBase64(payload.encrypted);
  const decipher = createDecipheriv(NODE_ALGORITHM, key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString('utf8');
}
