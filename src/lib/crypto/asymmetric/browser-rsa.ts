import { decodeBase64, decodeUtf8, encodeBase64, encodeUtf8 } from '@/lib/crypto/browser/encoding';
import { PublicKeyAlgorithmId, PublicKeyKeyPreview } from '@/types/crypto';

const RSA_OAEP_ALGORITHM: RsaHashedKeyGenParams = {
  name: 'RSA-OAEP',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256',
};

const RSA_PSS_ALGORITHM: RsaHashedKeyGenParams = {
  name: 'RSA-PSS',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256',
};

export async function generateBrowserRsaOaepKeyPair(): Promise<CryptoKeyPair> {
  return window.crypto.subtle.generateKey(
    RSA_OAEP_ALGORITHM,
    true,
    ['encrypt', 'decrypt'],
  );
}

export async function generateBrowserRsaPssKeyPair(): Promise<CryptoKeyPair> {
  return window.crypto.subtle.generateKey(
    RSA_PSS_ALGORITHM,
    true,
    ['sign', 'verify'],
  );
}

export async function encryptWithBrowserRsaOaep(
  publicKey: CryptoKey,
  plaintext: string,
): Promise<string> {
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    encodeUtf8(plaintext).buffer as ArrayBuffer,
  );

  return encodeBase64(encrypted);
}

export async function decryptWithBrowserRsaOaep(
  privateKey: CryptoKey,
  ciphertext: string,
): Promise<string> {
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    privateKey,
    decodeBase64(ciphertext).buffer as ArrayBuffer,
  );

  return decodeUtf8(decrypted);
}

export async function signWithBrowserRsaPss(
  privateKey: CryptoKey,
  message: string,
): Promise<string> {
  const signature = await window.crypto.subtle.sign(
    {
      name: 'RSA-PSS',
      saltLength: 32,
    },
    privateKey,
    encodeUtf8(message).buffer as ArrayBuffer,
  );

  return encodeBase64(signature);
}

export async function verifyBrowserRsaPssSignature(
  publicKey: CryptoKey,
  message: string,
  signature: string,
): Promise<boolean> {
  return window.crypto.subtle.verify(
    {
      name: 'RSA-PSS',
      saltLength: 32,
    },
    publicKey,
    decodeBase64(signature).buffer as ArrayBuffer,
    encodeUtf8(message).buffer as ArrayBuffer,
  );
}

export async function exportBrowserKeyPreview(key: CryptoKey): Promise<string> {
  const jwk = await window.crypto.subtle.exportKey('jwk', key);
  if ('n' in jwk && typeof jwk.n === 'string') {
    return jwk.n.slice(0, 24);
  }

  if ('d' in jwk && typeof jwk.d === 'string') {
    return jwk.d.slice(0, 24);
  }

  return JSON.stringify(jwk).slice(0, 24);
}

export async function previewBrowserPublicPrivateKeys(
  publicKey: CryptoKey,
  privateKey: CryptoKey,
): Promise<PublicKeyKeyPreview> {
  return {
    publicKey: await exportBrowserKeyPreview(publicKey),
    privateKey: await exportBrowserKeyPreview(privateKey),
  };
}

export async function generateBrowserKeyPairForAlgorithm(
  algorithm: PublicKeyAlgorithmId,
): Promise<CryptoKeyPair> {
  if (algorithm === 'RSA-PSS') {
    return generateBrowserRsaPssKeyPair();
  }

  return generateBrowserRsaOaepKeyPair();
}
