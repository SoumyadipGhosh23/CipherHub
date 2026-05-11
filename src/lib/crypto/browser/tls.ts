import { decodeBase64, encodeBase64, encodeUtf8, decodeUtf8 } from './encoding';

export async function importBrowserTlsKey(rawKeyBase64: string): Promise<CryptoKey> {
  const rawKey = decodeBase64(rawKeyBase64);
  return window.crypto.subtle.importKey(
    'raw',
    rawKey.buffer as ArrayBuffer,
    {
      name: 'AES-GCM',
    },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptWithBrowserTlsAesGcm(
  key: CryptoKey,
  plaintext: string,
): Promise<{ ciphertext: string; iv: string }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ivBuffer = iv.buffer as ArrayBuffer;
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    key,
    encodeUtf8(plaintext).buffer as ArrayBuffer,
  );

  return {
    ciphertext: encodeBase64(encrypted),
    iv: encodeBase64(iv),
  };
}

export async function decryptWithBrowserTlsAesGcm(
  key: CryptoKey,
  ciphertext: string,
  iv: string,
): Promise<string> {
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: decodeBase64(iv).buffer as ArrayBuffer },
    key,
    decodeBase64(ciphertext).buffer as ArrayBuffer,
  );

  return decodeUtf8(decrypted);
}
