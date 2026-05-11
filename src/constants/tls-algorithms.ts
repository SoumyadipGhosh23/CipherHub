import { TlsVersionId } from '@/types/crypto';

export interface TlsVersionOption {
  id: TlsVersionId;
  name: string;
  description: string;
  status: 'Ready';
}

export const TLS_VERSIONS: TlsVersionOption[] = [
  {
    id: 'TLS 1.2',
    name: 'TLS 1.2',
    description: 'Older TLS handshake model.',
    status: 'Ready',
  },
  {
    id: 'TLS 1.3',
    name: 'TLS 1.3',
    description: 'Modern TLS with a shorter handshake.',
    status: 'Ready',
  },
];

export const DEFAULT_TLS_VERSION: TlsVersionId = 'TLS 1.3';
