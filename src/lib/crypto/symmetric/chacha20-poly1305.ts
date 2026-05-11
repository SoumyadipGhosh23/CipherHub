import { createCipheriv, createDecipheriv } from 'crypto';
import { decodeBase64, encodeBase64, generateIv, getKeyBytes } from './shared';
import { SymmetricCiphertext, SymmetricDecryptInput, SymmetricEncryptInput } from '@/types/crypto';

const ALGORITHM = 'ChaCha20-Poly1305' as const;
const NODE_ALGORITHM = 'chacha20-poly1305';
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

export function encryptChaCha20Poly1305({ message }: SymmetricEncryptInput): SymmetricCiphertext {
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

export function decryptChaCha20Poly1305(payload: SymmetricDecryptInput): string {
  if (!payload.authTag) {
    throw new Error('ChaCha20-Poly1305 requires authTag');
  }

  const key = getKeyBytes(KEY_LENGTH);
  const iv = decodeBase64(payload.iv);
  const encrypted = decodeBase64(payload.encrypted);
  const decipher = createDecipheriv(NODE_ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(decodeBase64(payload.authTag));
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString('utf8');
}
