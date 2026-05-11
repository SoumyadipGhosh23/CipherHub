import { createCipheriv, createDecipheriv } from 'crypto';
import { decodeBase64, encodeBase64, generateIv, getKeyBytes } from './shared';
import { SymmetricCiphertext, SymmetricDecryptInput, SymmetricEncryptInput } from '@/types/crypto';

const ALGORITHM = 'AES-256-GCM' as const;
const NODE_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

export function encryptAesGcm({ message }: SymmetricEncryptInput): SymmetricCiphertext {
  const key = getKeyBytes(KEY_LENGTH);
  const iv = generateIv(IV_LENGTH);
  const cipher = createCipheriv(NODE_ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(message, 'utf8'), cipher.final()]);

  return {
    algorithm: ALGORITHM,
    encrypted: encodeBase64(encrypted),
    iv: encodeBase64(iv),
    authTag: encodeBase64(cipher.getAuthTag()),
  };
}

export function decryptAesGcm(payload: SymmetricDecryptInput): string {
  if (!payload.authTag) {
    throw new Error('AES-256-GCM requires authTag');
  }

  const key = getKeyBytes(KEY_LENGTH);
  const iv = decodeBase64(payload.iv);
  const encrypted = decodeBase64(payload.encrypted);
  const decipher = createDecipheriv(NODE_ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(decodeBase64(payload.authTag));
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString('utf8');
}
