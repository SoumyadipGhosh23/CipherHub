import {
  decodeBase64,
  decodeUtf8,
  encodeBase64,
  encodeUtf8,
} from './encoding';
import { BrowserE2EAlgorithmId, BrowserE2ERelayPayload } from '@/types/crypto';

export const BROWSER_E2E_ALGORITHM: BrowserE2EAlgorithmId = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

export async function generateBrowserAesKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptWithBrowserAesGcm(
  key: CryptoKey,
  plaintext: string,
): Promise<BrowserE2ERelayPayload> {
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const plaintextBuffer = encodeUtf8(plaintext).buffer as ArrayBuffer;
  const ivBuffer = iv.buffer as ArrayBuffer;
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    key,
    plaintextBuffer,
  );

  return {
    algorithm: BROWSER_E2E_ALGORITHM,
    ciphertext: encodeBase64(encrypted),
    iv: encodeBase64(iv),
  };
}

export async function decryptWithBrowserAesGcm(
  key: CryptoKey,
  payload: BrowserE2ERelayPayload,
): Promise<string> {
  const ivBuffer = decodeBase64(payload.iv).buffer as ArrayBuffer;
  const ciphertextBuffer = decodeBase64(payload.ciphertext).buffer as ArrayBuffer;
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    key,
    ciphertextBuffer,
  );

  return decodeUtf8(decrypted);
}
