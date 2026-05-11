import { HashingAlgorithmId, HashingResult, HashVerificationResult } from '@/types/crypto';
import {
  compareBcrypt,
  hashWithBcrypt,
  hashWithSha,
  isEducationalHashAlgorithm,
} from '@/lib/crypto/hashing';

interface StoredHashRecord extends HashingResult {
  storedAt: number;
}

let storedHashRecord: StoredHashRecord | null = null;

export async function hashInput(
  algorithm: HashingAlgorithmId,
  input: string,
): Promise<HashingResult> {
  if (isEducationalHashAlgorithm(algorithm)) {
    throw new Error('Selected algorithm is educational/coming soon.');
  }

  let hash = '';

  if (algorithm === 'SHA-256' || algorithm === 'SHA-512') {
    hash = hashWithSha(algorithm, input);
  } else if (algorithm === 'bcrypt') {
    hash = await hashWithBcrypt(input);
  } else {
    throw new Error('Selected algorithm is not implemented yet.');
  }

  storedHashRecord = {
    algorithm,
    input,
    hash,
    storedAt: Date.now(),
  };

  return {
    algorithm,
    input,
    hash,
  };
}

export async function verifyInput(
  algorithm: HashingAlgorithmId,
  input: string,
): Promise<HashVerificationResult> {
  if (!storedHashRecord) {
    throw new Error('No stored hash exists for verification.');
  }

  if (storedHashRecord.algorithm !== algorithm) {
    throw new Error('Selected algorithm does not match the stored hash.');
  }

  if (isEducationalHashAlgorithm(algorithm)) {
    throw new Error('Selected algorithm is educational/coming soon.');
  }

  let matched = false;

  if (algorithm === 'SHA-256' || algorithm === 'SHA-512') {
    const inputHash = hashWithSha(algorithm, input);
    matched = inputHash === storedHashRecord.hash;
  } else if (algorithm === 'bcrypt') {
    matched = await compareBcrypt(input, storedHashRecord.hash);
  } else {
    throw new Error('Selected algorithm is not implemented yet.');
  }

  return {
    algorithm,
    input,
    storedHash: storedHashRecord.hash,
    matched,
  };
}

export function getStoredHashRecord(): StoredHashRecord | null {
  return storedHashRecord;
}

export function clearStoredHashRecord(): void {
  storedHashRecord = null;
}
