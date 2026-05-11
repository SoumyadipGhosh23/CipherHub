import { createCipheriv, createDecipheriv } from 'crypto';
import { decodeBase64, encodeBase64, generateIv, getKeyBytes } from './shared';
import { SymmetricCiphertext, SymmetricDecryptInput, SymmetricEncryptInput } from '@/types/crypto';

const ALGORITHM = 'Triple DES' as const;
const NODE_ALGORITHM = 'des-ede3-cbc';
const KEY_LENGTH = 24;
const IV_LENGTH = 8;

export function encryptTripleDes({ message }: SymmetricEncryptInput): SymmetricCiphertext {
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

export function decryptTripleDes(payload: SymmetricDecryptInput): string {
  const key = getKeyBytes(KEY_LENGTH);
  const iv = decodeBase64(payload.iv);
  const encrypted = decodeBase64(payload.encrypted);
  const decipher = createDecipheriv(NODE_ALGORITHM, key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString('utf8');
}
