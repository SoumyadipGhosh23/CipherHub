import { BackendEncryptionAlgorithmId } from '@/constants/algorithms';
import { SymmetricCiphertext, SymmetricDecryptInput, SymmetricEncryptInput } from '@/types/crypto';
import { decryptAesCbc, encryptAesCbc } from './aes-cbc';
import { decryptAesGcm, encryptAesGcm } from './aes-gcm';
import { decryptChaCha20Poly1305, encryptChaCha20Poly1305 } from './chacha20-poly1305';
import { decryptTripleDes, encryptTripleDes } from './triple-des';

type SymmetricHandler = {
  encrypt: (input: SymmetricEncryptInput) => SymmetricCiphertext;
  decrypt: (input: SymmetricDecryptInput) => string;
};

const HANDLERS: Record<BackendEncryptionAlgorithmId, SymmetricHandler> = {
  'AES-256-CBC': {
    encrypt: encryptAesCbc,
    decrypt: decryptAesCbc,
  },
  'AES-256-GCM': {
    encrypt: encryptAesGcm,
    decrypt: decryptAesGcm,
  },
  'ChaCha20-Poly1305': {
    encrypt: encryptChaCha20Poly1305,
    decrypt: decryptChaCha20Poly1305,
  },
  'Triple DES': {
    encrypt: encryptTripleDes,
    decrypt: decryptTripleDes,
  },
};

export function encryptSymmetric(input: SymmetricEncryptInput): SymmetricCiphertext {
  const handler = HANDLERS[input.algorithm];
  if (!handler) {
    throw new Error('Selected algorithm is not implemented yet.');
  }

  return handler.encrypt(input);
}

export function decryptSymmetric(input: SymmetricDecryptInput): string {
  const handler = HANDLERS[input.algorithm];
  if (!handler) {
    throw new Error('Selected algorithm is not implemented yet.');
  }

  return handler.decrypt(input);
}
