import {
  BackendEncryptionStoredRecord,
  SymmetricCiphertext,
  SymmetricDecryptInput,
  SymmetricEncryptInput,
} from '@/types/crypto';
import { decryptSymmetric, encryptSymmetric } from '@/lib/crypto/symmetric';

let storedRecord: BackendEncryptionStoredRecord | null = null;

export function encryptBackendMessage(
  input: SymmetricEncryptInput,
): BackendEncryptionStoredRecord {
  const encrypted = encryptSymmetric(input);
  storedRecord = {
    ...encrypted,
    storedAt: Date.now(),
  };

  return storedRecord;
}

export function decryptBackendMessage(input: SymmetricDecryptInput): SymmetricCiphertext {
  const decrypted = decryptSymmetric(input);

  return {
    algorithm: input.algorithm,
    encrypted: input.encrypted,
    iv: input.iv,
    authTag: input.authTag,
    decrypted,
  };
}

export function getStoredBackendMessage(): SymmetricDecryptInput | null {
  if (!storedRecord) {
    return null;
  }

  return {
    algorithm: storedRecord.algorithm,
    encrypted: storedRecord.encrypted,
    iv: storedRecord.iv,
    authTag: storedRecord.authTag,
  };
}

export function getStoredBackendRecord(): BackendEncryptionStoredRecord | null {
  return storedRecord;
}

export function clearStoredBackendMessage(): void {
  storedRecord = null;
}
