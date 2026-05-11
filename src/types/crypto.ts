import { BackendEncryptionAlgorithmId } from '@/constants/algorithms';

export interface SymmetricCiphertext {
  algorithm: BackendEncryptionAlgorithmId;
  encrypted: string;
  iv: string;
  authTag?: string;
  decrypted?: string;
}

export interface SymmetricEncryptInput {
  algorithm: BackendEncryptionAlgorithmId;
  message: string;
}

export interface SymmetricDecryptInput {
  algorithm: BackendEncryptionAlgorithmId;
  encrypted: string;
  iv: string;
  authTag?: string;
}

export interface BackendEncryptionStoredRecord extends SymmetricCiphertext {
  storedAt: number;
}

export type BrowserE2EAlgorithmId = 'AES-GCM';
export type HashingAlgorithmId = 'SHA-256' | 'SHA-512' | 'bcrypt' | 'Argon2';
export type PublicKeyAlgorithmId = 'RSA-OAEP' | 'RSA-PSS' | 'ECIES';
export type TlsVersionId = 'TLS 1.2' | 'TLS 1.3';

export interface BrowserE2ERelayPayload {
  algorithm: BrowserE2EAlgorithmId;
  ciphertext: string;
  iv: string;
}

export interface BrowserE2EEncryptionResult extends BrowserE2ERelayPayload {
  plaintext?: string;
}

export interface BrowserE2ERelayResponse extends BrowserE2ERelayPayload {
  serverCanDecrypt: false;
}

export interface HashingResult {
  algorithm: HashingAlgorithmId;
  input: string;
  hash: string;
}

export interface HashVerificationResult {
  algorithm: HashingAlgorithmId;
  input: string;
  storedHash: string;
  matched: boolean;
}

export interface PublicKeyKeyPreview {
  publicKey: string;
  privateKey: string;
}

export interface PublicKeyEncryptionResult {
  algorithm: PublicKeyAlgorithmId;
  ciphertext: string;
  publicKeyPreview: string;
  privateKeyPreview: string;
}

export interface PublicKeySignatureResult {
  algorithm: PublicKeyAlgorithmId;
  message: string;
  hash: string;
  signature: string;
  verified: boolean;
  publicKeyPreview: string;
  privateKeyPreview: string;
}

export interface TlsHandshakeResult {
  version: TlsVersionId;
  sessionId: string;
  sessionKeyPreview: string;
}

export interface TlsTransmissionResult {
  version: TlsVersionId;
  encryptedPacket: string;
  iv: string;
  plaintext: string;
}
