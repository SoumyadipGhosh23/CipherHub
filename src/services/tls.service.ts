import { createTlsSession, decryptTlsPacket, getTlsSession } from '@/lib/crypto/tls';
import { TlsHandshakeResult, TlsTransmissionResult, TlsVersionId } from '@/types/crypto';

export interface TlsHandshakeRecord extends TlsHandshakeResult {
  sessionKey: string;
}

export function startTlsHandshake(version: TlsVersionId): TlsHandshakeRecord {
  const session = createTlsSession(version);
  return {
    version: session.version,
    sessionId: session.sessionId,
    sessionKeyPreview: session.sessionKey.slice(0, 24),
    sessionKey: session.sessionKey,
  };
}

export function transmitTlsPacket(
  sessionId: string,
  ciphertext: string,
  iv: string,
): TlsTransmissionResult {
  const session = getTlsSession(sessionId);
  if (!session) {
    throw new Error('TLS session not found');
  }

  const result = decryptTlsPacket(sessionId, ciphertext, iv);
  return {
    version: result.version,
    encryptedPacket: result.encryptedPacket,
    iv: result.iv,
    plaintext: result.plaintext,
  };
}
