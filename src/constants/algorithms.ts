export type BackendEncryptionAlgorithmId =
  | 'AES-256-CBC'
  | 'AES-256-GCM'
  | 'ChaCha20-Poly1305'
  | 'Triple DES';

export type BackendEncryptionAlgorithmStatus = 'Ready' | 'Legacy' | 'Coming Soon';

export interface AlgorithmOption {
  id: BackendEncryptionAlgorithmId;
  name: string;
  description: string;
  status: BackendEncryptionAlgorithmStatus;
}

export const BACKEND_ENCRYPTION_ALGORITHMS: AlgorithmOption[] = [
  {
    id: 'AES-256-CBC',
    name: 'AES-256-CBC',
    description: 'Classic block cipher mode. Fully supported for the lab.',
    status: 'Ready',
  },
  {
    id: 'AES-256-GCM',
    name: 'AES-256-GCM',
    description: 'Authenticated encryption with an integrity tag.',
    status: 'Ready',
  },
  {
    id: 'ChaCha20-Poly1305',
    name: 'ChaCha20-Poly1305',
    description: 'Modern authenticated cipher with a 96-bit nonce.',
    status: 'Ready',
  },
  {
    id: 'Triple DES',
    name: 'Triple DES',
    description: 'Legacy educational cipher. Kept for compatibility study.',
    status: 'Legacy',
  },
];

export const DEFAULT_BACKEND_ENCRYPTION_ALGORITHM: BackendEncryptionAlgorithmId =
  'AES-256-CBC';
