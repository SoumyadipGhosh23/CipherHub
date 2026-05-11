import { BackendEncryptionAlgorithmId } from '@/constants/algorithms';

export interface SymmetricCiphertext {
  algorithm: BackendEncryptionAlgorithmId;
  encrypted: string;
  iv: string;
  authTag?: string;
  decrypted?: string;
}

export interface SymmetricEncryptInput {
  algorithm: BackendEncryptionAlgorithmId;
  message: string;
}

export interface SymmetricDecryptInput {
  algorithm: BackendEncryptionAlgorithmId;
  encrypted: string;
  iv: string;
  authTag?: string;
}

export interface BackendEncryptionStoredRecord extends SymmetricCiphertext {
  storedAt: number;
}
