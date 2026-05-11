import { createDecipheriv, randomBytes } from 'crypto';

import { decodeBase64 } from '@/lib/crypto/symmetric/shared';

export interface TlsSessionRecord {
  version: 'TLS 1.2' | 'TLS 1.3';
  sessionId: string;
  sessionKey: string;
}

export interface TlsTransmittedPacket {
  version: 'TLS 1.2' | 'TLS 1.3';
  encryptedPacket: string;
  iv: string;
  plaintext: string;
}

const TLS_SESSIONS = new Map<string, TlsSessionRecord>();

export function createTlsSession(version: 'TLS 1.2' | 'TLS 1.3'): TlsSessionRecord {
  const sessionId = randomBytes(8).toString('hex');
  const sessionKey = randomBytes(32).toString('base64');

  const record: TlsSessionRecord = {
    version,
    sessionId,
    sessionKey,
  };

  TLS_SESSIONS.set(sessionId, record);
  return record;
}

export function decryptTlsPacket(
  sessionId: string,
  encryptedPacket: string,
  iv: string,
): TlsTransmittedPacket {
  const session = TLS_SESSIONS.get(sessionId);
  if (!session) {
    throw new Error('TLS session not found');
  }

  const key = decodeBase64(session.sessionKey);
  const decipher = createDecipheriv('aes-256-gcm', key, decodeBase64(iv), { authTagLength: 16 });
  const buffer = decodeBase64(encryptedPacket);
  const authTag = buffer.subarray(buffer.length - 16);
  const ciphertext = buffer.subarray(0, buffer.length - 16);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');

  return {
    version: session.version,
    encryptedPacket,
    iv,
    plaintext,
  };
}

export function getTlsSession(sessionId: string): TlsSessionRecord | null {
  return TLS_SESSIONS.get(sessionId) ?? null;
}

export function clearTlsSessions(): void {
  TLS_SESSIONS.clear();
}
