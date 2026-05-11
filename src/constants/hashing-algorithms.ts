import { HashingAlgorithmId } from '@/types/crypto';

export type HashingAlgorithmStatus = 'Ready' | 'Educational / Coming Soon';

export interface HashingAlgorithmOption {
  id: HashingAlgorithmId;
  name: string;
  description: string;
  status: HashingAlgorithmStatus;
}

export const HASHING_ALGORITHMS: HashingAlgorithmOption[] = [
  {
    id: 'SHA-256',
    name: 'SHA-256',
    description: 'Fast one-way hash used for integrity and fingerprints.',
    status: 'Ready',
  },
  {
    id: 'SHA-512',
    name: 'SHA-512',
    description: 'Longer SHA family hash with a wider output.',
    status: 'Ready',
  },
  {
    id: 'bcrypt',
    name: 'bcrypt',
    description: 'Slow password hashing algorithm designed for resistance to brute force.',
    status: 'Ready',
  },
];
