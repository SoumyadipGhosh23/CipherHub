import { PublicKeyAlgorithmId } from '@/types/crypto';

export interface PublicKeyRelayRecord {
  algorithm: PublicKeyAlgorithmId;
  ciphertext: string;
  storedAt: number;
}

let lastRelayRecord: PublicKeyRelayRecord | null = null;

export function relayPublicKeyCiphertext(
  algorithm: PublicKeyAlgorithmId,
  ciphertext: string,
): PublicKeyRelayRecord {
  lastRelayRecord = {
    algorithm,
    ciphertext,
    storedAt: Date.now(),
  };

  return lastRelayRecord;
}

export function getLastPublicKeyRelayRecord(): PublicKeyRelayRecord | null {
  return lastRelayRecord;
}
