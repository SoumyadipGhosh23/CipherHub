import { encryptAES, EncryptionResult } from '@/lib/crypto/aes';
import { AlgorithmOption } from '@/types/crypto';
import { ENCRYPTION_ALGORITHMS } from '@/constants/algorithms';

/**
 * Service to handle backend encryption based on selected algorithm.
 * Currently supports only AES-256-CBC.
 */
export async function encryptMessage(message: string, algorithmId: string): Promise<EncryptionResult> {
  // Find algorithm definition (future use for validation).
  const algo = ENCRYPTION_ALGORITHMS.find((a: AlgorithmOption) => a.id === algorithmId);
  if (!algo) {
    throw new Error(`Unsupported algorithm: ${algorithmId}`);
  }

  // For now, only AES-256-CBC is implemented.
  if (algorithmId === 'AES-256-CBC') {
    return encryptAES(message);
  }

  // Placeholder for future algorithms.
  throw new Error(`Algorithm ${algorithmId} not implemented yet`);
}
