import { BrowserE2EAlgorithmId } from '@/types/crypto';

export type E2EAlgorithmStatus = 'Ready' | 'Educational / Coming Soon';

export interface E2EAlgorithmOption {
  id: BrowserE2EAlgorithmId | 'Signal Protocol' | 'Double Ratchet' | 'X3DH Key Agreement';
  name: string;
  description: string;
  status: E2EAlgorithmStatus;
}

export type E2EAlgorithmId = E2EAlgorithmOption['id'];

export const E2E_ENCRYPTION_ALGORITHMS: E2EAlgorithmOption[] = [
  {
    id: 'AES-GCM',
    name: 'AES-GCM',
    description: 'Browser-side authenticated encryption using Web Crypto API.',
    status: 'Ready',
  }
];
