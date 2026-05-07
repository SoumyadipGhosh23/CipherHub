import { SecurityModel } from '@/types/cipher-lab';

export interface SecurityModelOption {
  id: SecurityModel;
  name: string;
  description: string;
}

export const SECURITY_MODELS: SecurityModelOption[] = [
  { id: 'plain-text', name: 'Plain Text', description: 'Message travels and is stored without encryption.' },
  { id: 'backend-encryption', name: 'Backend Encryption', description: 'Encrypted at rest on the server.' },
  { id: 'end-to-end-encryption', name: 'End-to-End Encryption', description: 'Encrypted from sender to receiver.' },
  { id: 'hashing', name: 'Hashing', description: 'One-way mathematical transformation.' },
  { id: 'public-key-encryption', name: 'Public Key Encryption', description: 'Encrypted with public key, decrypted with private key.' },
  { id: 'tls-simulation', name: 'TLS Simulation', description: 'Encrypted in transit.' },
];
