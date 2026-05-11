import { PublicKeyAlgorithmId } from '@/types/crypto';

export type PublicKeyAlgorithmStatus = 'Ready' | 'Educational / Coming Soon';

export interface PublicKeyAlgorithmOption {
  id: PublicKeyAlgorithmId;
  name: string;
  description: string;
  status: PublicKeyAlgorithmStatus;
}

export const PUBLIC_KEY_ALGORITHMS: PublicKeyAlgorithmOption[] = [
  {
    id: 'RSA-OAEP',
    name: 'RSA-OAEP',
    description: 'Public key encrypts, private key decrypts.',
    status: 'Ready',
  },
  {
    id: 'RSA-PSS',
    name: 'RSA-PSS',
    description: 'Signature-focused asymmetric algorithm. Used to prove authenticity.',
    status: 'Ready',
  }
];

export const DEFAULT_PUBLIC_KEY_ALGORITHM: PublicKeyAlgorithmId = 'RSA-OAEP';
