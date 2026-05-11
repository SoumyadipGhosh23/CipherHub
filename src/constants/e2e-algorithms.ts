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
  },
  {
    id: 'Signal Protocol',
    name: 'Signal Protocol',
    description: 'Educational placeholder for a modern secure messaging protocol.',
    status: 'Educational / Coming Soon',
  },
  {
    id: 'Double Ratchet',
    name: 'Double Ratchet',
    description: 'Educational placeholder for per-message key advancement.',
    status: 'Educational / Coming Soon',
  },
  {
    id: 'X3DH Key Agreement',
    name: 'X3DH Key Agreement',
    description: 'Educational placeholder for secure shared-secret establishment.',
    status: 'Educational / Coming Soon',
  },
];
