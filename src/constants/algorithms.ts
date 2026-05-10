export interface AlgorithmOption {
  id: string; // e.g., 'AES-256-CBC'
  name: string;
  description: string;
}

export const ENCRYPTION_ALGORITHMS: AlgorithmOption[] = [
  {
    id: 'AES-256-CBC',
    name: 'AES-256-CBC',
    description: 'Advanced Encryption Standard with 256-bit key in CBC mode.',
  },
  // Future algorithms can be added here.
];
