import { createHash } from 'crypto';
import bcrypt from 'bcrypt';
import { HashingAlgorithmId } from '@/types/crypto';

export function hashWithSha(algorithm: 'SHA-256' | 'SHA-512', input: string): string {
  const nodeAlgorithm = algorithm === 'SHA-256' ? 'sha256' : 'sha512';
  return createHash(nodeAlgorithm).update(input, 'utf8').digest('hex');
}

export async function hashWithBcrypt(input: string): Promise<string> {
  return bcrypt.hash(input, 10);
}

export async function compareBcrypt(input: string, storedHash: string): Promise<boolean> {
  return bcrypt.compare(input, storedHash);
}

export function isEducationalHashAlgorithm(algorithm: HashingAlgorithmId): boolean {
  return algorithm === 'Argon2';
}
