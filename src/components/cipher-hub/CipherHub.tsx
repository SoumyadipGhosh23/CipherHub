"use client";

import { useEffect, useRef, useState } from 'react';
import {
  Fingerprint,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SecurityModel, FlowStep, ServerLog } from '@/types/cipher-hub';
import {
  BackendEncryptionAlgorithmId,
  DEFAULT_BACKEND_ENCRYPTION_ALGORITHM,
  BACKEND_ENCRYPTION_ALGORITHMS,
} from '@/constants/algorithms';
import {
  E2EAlgorithmId,
  E2E_ENCRYPTION_ALGORITHMS,
} from '@/constants/e2e-algorithms';
import {
  HASHING_ALGORITHMS,
} from '@/constants/hashing-algorithms';
import {
  DEFAULT_PUBLIC_KEY_ALGORITHM,
  PUBLIC_KEY_ALGORITHMS,
} from '@/constants/public-key-algorithms';
import {
  DEFAULT_TLS_VERSION,
  TLS_VERSIONS,
} from '@/constants/tls-algorithms';
import {
  BrowserE2ERelayPayload,
  BrowserE2ERelayResponse,
  BrowserE2EEncryptionResult,
  HashingResult,
  HashVerificationResult,
  HashingAlgorithmId,
  PublicKeyAlgorithmId,
  PublicKeyKeyPreview,
  TlsHandshakeResult,
  TlsTransmissionResult,
  TlsVersionId,
  SymmetricCiphertext,
} from '@/types/crypto';
import { SecurityModelSelector } from './SecurityModelSelector';
import { AlgorithmSelector } from './AlgorithmSelector';
import { MessageComposer } from './MessageComposer';
import { FlowVisualizer } from './FlowVisualizer';
import { ServerConsole } from './ServerConsole';
import { ClientConsole } from './ClientConsole';
import {
  decryptWithBrowserAesGcm,
  encryptWithBrowserAesGcm,
  generateBrowserAesKey,
  importBrowserTlsKey,
  encryptWithBrowserTlsAesGcm,
} from '@/lib/crypto/browser';
import {
  decryptWithBrowserRsaOaep,
  encryptWithBrowserRsaOaep,
  generateBrowserRsaOaepKeyPair,
  generateBrowserRsaPssKeyPair,
  previewBrowserPublicPrivateKeys,
  signWithBrowserRsaPss,
  verifyBrowserRsaPssSignature,
} from '@/lib/crypto/asymmetric';
import { digestBrowserShaHex } from '@/lib/crypto/browser/hash';

interface TlsHandshakeResponse extends TlsHandshakeResult {
  sessionKey: string;
}

export function CipherHub() {
  const [selectedModel, setSelectedModel] = useState<SecurityModel>('plain-text');
  const [backendAlgorithm, setBackendAlgorithm] = useState<BackendEncryptionAlgorithmId>(
    DEFAULT_BACKEND_ENCRYPTION_ALGORITHM,
  );
  const [e2eAlgorithm, setE2EAlgorithm] = useState<E2EAlgorithmId>('AES-GCM');
  const [hashingAlgorithm, setHashingAlgorithm] = useState<HashingAlgorithmId>('SHA-256');
  const [publicKeyAlgorithm, setPublicKeyAlgorithm] = useState<PublicKeyAlgorithmId>(
    DEFAULT_PUBLIC_KEY_ALGORITHM,
  );
  const [tlsVersion, setTlsVersion] = useState<TlsVersionId>(DEFAULT_TLS_VERSION);
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>([]);
  const [serverLogs, setServerLogs] = useState<ServerLog[]>([]);
  const [clientLogs, setClientLogs] = useState<ServerLog[]>([]);
  const [backendStoredMessage, setBackendStoredMessage] = useState<SymmetricCiphertext | null>(null);
  const [hashResult, setHashResult] = useState<HashingResult | null>(null);
  const [rsaOaepKeys, setRsaOaepKeys] = useState<CryptoKeyPair | null>(null);
  const [rsaOaepPreview, setRsaOaepPreview] = useState<PublicKeyKeyPreview | null>(null);
  const [rsaPssKeys, setRsaPssKeys] = useState<CryptoKeyPair | null>(null);
  const [rsaPssPreview, setRsaPssPreview] = useState<PublicKeyKeyPreview | null>(null);
  const [tlsSession, setTlsSession] = useState<TlsHandshakeResponse | null>(null);
  const [tlsSessionKey, setTlsSessionKey] = useState<CryptoKey | null>(null);
  const [isSending, setIsSending] = useState(false);
  const flowTimerRef = useRef<number | null>(null);
  const e2eKeyRef = useRef<CryptoKey | null>(null);

  const appendServerLog = (type: ServerLog['type'], message: string) => {
    setServerLogs((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(7), type, message, timestamp: Date.now() },
    ]);
  };

  const appendClientLog = (type: ServerLog['type'], message: string) => {
    setClientLogs((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(7), type, message, timestamp: Date.now() },
    ]);
  };

  const clearFlowTimer = () => {
    if (flowTimerRef.current !== null) {
      window.clearInterval(flowTimerRef.current);
      flowTimerRef.current = null;
    }
  };

  const playFlowSequence = (
    steps: FlowStep[],
    onStep?: (step: FlowStep, index: number) => void,
  ) => {
    clearFlowTimer();
    setFlowSteps([]);

    if (steps.length === 0) {
      setIsSending(false);
      return;
    }

    let currentIndex = 0;
    flowTimerRef.current = window.setInterval(() => {
      const step = steps[currentIndex];

      if (!step) {
        clearFlowTimer();
        setIsSending(false);
        return;
      }

      setFlowSteps((prev) => [...prev, step]);
      onStep?.(step, currentIndex);

      currentIndex += 1;
      if (currentIndex >= steps.length) {
        clearFlowTimer();
        setIsSending(false);
      }
    }, 700);
  };

  useEffect(() => {
    return () => {
      clearFlowTimer();
    };
  }, []);

  const resetModeState = (model: SecurityModel) => {
    if (model !== 'backend-encryption') {
      setBackendStoredMessage(null);
    }

    if (model !== 'end-to-end-encryption') {
      e2eKeyRef.current = null;
      setClientLogs([]);
    }

    if (model !== 'hashing') {
      setHashResult(null);
    }

    if (model !== 'public-key-encryption') {
      setRsaOaepKeys(null);
      setRsaOaepPreview(null);
      setRsaPssKeys(null);
      setRsaPssPreview(null);
    }

    if (model !== 'tls-simulation') {
      setTlsSession(null);
      setTlsSessionKey(null);
    }
  };

  const handleSecurityModelChange = (model: SecurityModel) => {
    setSelectedModel(model);
    resetModeState(model);
    setFlowSteps([]);
  };

  const buildPlainTextSteps = (message: string): FlowStep[] => [
    { id: 'alice', label: 'Alice Browser', value: message, description: 'Original message created by sender.' },
    { id: 'network', label: 'Network Payload', value: message, description: 'Travels across the internet unencrypted.' },
    { id: 'server', label: 'Server Received', value: message, description: 'Server can read the full text.' },
    { id: 'storage', label: 'Storage', value: message, description: 'Stored as raw plain text in database.' },
  ];

  const buildBackendEncryptSteps = (message: string, payload: SymmetricCiphertext): FlowStep[] => [
    { id: 'alice', label: 'Alice Browser', value: message, description: 'Client sends plaintext to the server.' },
    { id: 'network', label: 'Network Payload', value: message, description: 'Plaintext reaches the backend over the network.' },
    { id: 'server', label: 'Server Received', value: message, description: 'Server receives readable plaintext.' },
    { id: 'encryption', label: 'Server Encryption', value: payload.encrypted, description: `Server encrypts before storage using ${payload.algorithm}.` },
    { id: 'storage', label: 'Storage', value: payload.encrypted, description: 'Encrypted value is stored at rest.' },
  ];

  const buildBackendDecryptSteps = (payload: SymmetricCiphertext): FlowStep[] => [
    { id: 'storage', label: 'Storage', value: payload.encrypted, description: 'Encrypted value exists in storage.' },
    { id: 'read', label: 'Server Reads Storage', value: payload.encrypted, description: 'Server can access stored encrypted data.' },
    { id: 'decrypt', label: 'Server Decrypts', value: payload.decrypted ?? '', description: 'Server decrypts using the selected algorithm and server-owned key.' },
    { id: 'response', label: 'Network Response', value: payload.decrypted ?? '', description: 'Server sends readable plaintext back to the client.' },
    { id: 'alice-receives', label: 'Alice Browser Receives', value: payload.decrypted ?? '', description: 'Client receives the original message.' },
  ];

  const buildE2EFlowSteps = (
    plaintext: string,
    encrypted: BrowserE2ERelayPayload,
    decrypted: string,
  ): FlowStep[] => [
    { id: 'alice-plaintext', label: 'Alice Browser', value: plaintext, description: 'Alice has the original plaintext.' },
    { id: 'alice-encrypts', label: 'Alice Encrypts Locally', value: encrypted.ciphertext, description: 'Message is encrypted inside Alice browser before leaving the device.' },
    { id: 'network', label: 'Network Payload', value: encrypted.ciphertext, description: 'Only ciphertext travels through the network.' },
    { id: 'server-receives', label: 'Server Receives', value: encrypted.ciphertext, description: 'Server receives encrypted data and cannot read the original message.' },
    { id: 'server-storage', label: 'Server Storage', value: encrypted.ciphertext, description: 'Server stores only encrypted data.' },
    { id: 'bob-network', label: 'Network Payload', value: encrypted.ciphertext, description: 'Ciphertext is relayed to Bob.' },
    { id: 'bob-decrypts', label: 'Bob Browser Decrypts', value: decrypted, description: 'Bob decrypts locally using the shared browser key.' },
  ];

  const buildHashSteps = (input: string, algorithm: HashingAlgorithmId, hash: string): FlowStep[] => [
    { id: 'input', label: 'User Input', value: input, description: 'Original plaintext input.' },
    { id: 'function', label: 'Hashing Function', value: `${algorithm}(${input})`, description: 'One-way cryptographic transformation.' },
    { id: 'hash', label: 'Generated Hash', value: hash, description: 'Fixed-length irreversible fingerprint.' },
    { id: 'storage', label: 'Storage', value: hash, description: 'Only hash value is stored.' },
  ];

  const buildHashVerificationSteps = (
    input: string,
    storedHash: string,
    matched: boolean,
  ): FlowStep[] => [
    { id: 'verify-input', label: 'User Input', value: input, description: 'User entered password for comparison.' },
    { id: 'comparison', label: 'Hash Comparison', value: 'Hash(input) === storedHash', description: 'The input is hashed again and compared to the stored hash.' },
    { id: 'result', label: 'Verification Result', value: matched ? 'MATCHED' : 'INVALID', description: matched ? 'Input matches the stored hash.' : 'Input does not match the stored hash.' },
    { id: 'storage', label: 'Stored Hash', value: storedHash, description: 'The original hash remains unchanged.' },
  ];

  const buildPublicKeyKeyGenSteps = (preview: PublicKeyKeyPreview): FlowStep[] => [
    { id: 'generate', label: 'Key Generation', value: 'Generating RSA key pair', description: 'Browser creates a public/private key pair.' },
    { id: 'public', label: 'Public Key', value: preview.publicKey, description: 'Safe to share.' },
    { id: 'private', label: 'Private Key', value: preview.privateKey, description: 'Must remain secret.' },
  ];

  const buildPublicKeyEncryptSteps = (
    message: string,
    ciphertext: string,
    decrypted: string,
  ): FlowStep[] => [
    { id: 'alice', label: 'Alice Browser', value: message, description: 'Alice has the original plaintext.' },
    { id: 'encrypt', label: 'Encrypt With Public Key', value: ciphertext, description: 'Only the public key can encrypt.' },
    { id: 'network', label: 'Network Payload', value: ciphertext, description: 'Ciphertext travels over the network.' },
    { id: 'server', label: 'Server', value: 'Cannot decrypt without private key.', description: 'Server only relays ciphertext.' },
    { id: 'bob', label: 'Bob Private Key Decrypts', value: decrypted, description: 'Bob decrypts locally with the private key.' },
  ];

  const buildPublicKeySignatureSteps = (
    message: string,
    hash: string,
    signature: string,
    verified: boolean,
  ): FlowStep[] => [
    { id: 'message', label: 'Message', value: message, description: 'Message that will be signed.' },
    { id: 'hash', label: 'Hash', value: hash, description: 'Message hash used for the signature.' },
    { id: 'sign', label: 'Sign With Private Key', value: signature, description: 'Private key creates the signature.' },
    { id: 'verify', label: 'Verify With Public Key', value: verified ? 'VALID' : 'INVALID', description: verified ? 'Signature is valid.' : 'Signature failed verification.' },
  ];

  const buildTlsHandshakeSteps = (version: TlsVersionId, sessionKeyPreview: string): FlowStep[] => [
    { id: 'client-hello', label: 'Client Hello', value: version, description: 'Browser initiates the TLS negotiation.' },
    { id: 'server-hello', label: 'Server Hello', value: version, description: 'Server responds with TLS parameters.' },
    { id: 'certificate', label: 'Certificate Exchange', value: 'Server certificate', description: 'Certificate is exchanged in the handshake.' },
    { id: 'key-exchange', label: 'Key Exchange', value: sessionKeyPreview, description: 'A shared session key is negotiated.' },
    { id: 'session-key', label: 'Session Key Created', value: sessionKeyPreview, description: 'Both sides can now encrypt transport traffic.' },
    { id: 'tunnel', label: 'Encrypted Tunnel Established', value: sessionKeyPreview, description: 'TLS tunnel is ready for encrypted transport.' },
  ];

  const buildTlsTransmissionSteps = (
    message: string,
    encryptedPacket: string,
    plaintext: string,
  ): FlowStep[] => [
    { id: 'browser', label: 'Browser Plaintext', value: message, description: 'Browser creates readable application data.' },
    { id: 'encrypt', label: 'TLS Tunnel Encryption', value: encryptedPacket, description: 'TLS encrypts the transport packet.' },
    { id: 'network', label: 'Network Payload', value: encryptedPacket, description: 'Encrypted TLS packet crosses the network.' },
    { id: 'tls-layer', label: 'Server TLS Layer', value: 'Decrypting TLS transport', description: 'Server decrypts the transport envelope.' },
    { id: 'app', label: 'Server Application Receives', value: plaintext, description: 'Application server reads plaintext after TLS decryption.' },
  ];

  const ensureE2EKey = async (): Promise<CryptoKey> => {
    if (e2eKeyRef.current) {
      return e2eKeyRef.current;
    }

    const key = await generateBrowserAesKey();
    e2eKeyRef.current = key;
    return key;
  };

  const handlePlainTextSend = (message: string) => {
    playFlowSequence(buildPlainTextSteps(message), (_, index) => {
      if (index === 2) {
        appendServerLog('info', `SERVER RECEIVED PLAIN TEXT: ${message}`);
      }
    });
  };

  const handleBackendSend = async (message: string) => {
    try {
      appendServerLog('info', `CLIENT SENT: ${message}`);
      const response = await fetch('/api/backend-encryption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, algorithm: backendAlgorithm }),
      });
      const result = (await response.json()) as SymmetricCiphertext & { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? 'Encryption failed');
      }

      setBackendStoredMessage(result);
      playFlowSequence(buildBackendEncryptSteps(message, result), (step, index) => {
        if (index === 2) {
          appendServerLog('info', `SERVER RECEIVED PLAIN TEXT: ${message}`);
        }

        if (index === 3) {
          appendServerLog('info', `SERVER ENCRYPTING USING: ${result.algorithm}`);
          appendServerLog('info', `GENERATED IV: ${result.iv}`);
          if (result.authTag) {
            appendServerLog('info', `GENERATED AUTH TAG: ${result.authTag}`);
          }
          appendServerLog('info', `STORED ENCRYPTED VALUE: ${result.encrypted}`);
        }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Encryption failed';
      appendServerLog(errorMessage.includes('not implemented') ? 'warning' : 'error', errorMessage);
      setIsSending(false);
    }
  };

  const handleBackendDecrypt = async () => {
    if (!backendStoredMessage) {
      return;
    }

    setIsSending(true);
    appendServerLog('info', 'FETCH REQUEST RECEIVED');

    try {
      const response = await fetch('/api/backend-encryption/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algorithm: backendStoredMessage.algorithm,
          encrypted: backendStoredMessage.encrypted,
          iv: backendStoredMessage.iv,
          authTag: backendStoredMessage.authTag,
        }),
      });

      const result = (await response.json()) as SymmetricCiphertext & { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? 'Decryption failed');
      }

      appendServerLog('info', `SERVER READ ENCRYPTED VALUE: ${result.encrypted}`);
      appendServerLog('info', `SERVER DECRYPTING USING: ${result.algorithm}`);
      appendServerLog('info', `SERVER DECRYPTED MESSAGE: ${result.decrypted ?? ''}`);
      appendServerLog('info', 'SERVER SENT PLAINTEXT BACK TO CLIENT');

      playFlowSequence(buildBackendDecryptSteps(result));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Decryption failed';
      appendServerLog('error', errorMessage);
      setIsSending(false);
    }
  };

  const handleE2ESend = async (message: string) => {
    if (e2eAlgorithm !== 'AES-GCM') {
      appendServerLog('warning', 'Selected E2E algorithm is educational/coming soon.');
      setIsSending(false);
      return;
    }

    try {
      appendClientLog('info', `ALICE PLAINTEXT: ${message}`);
      const key = await ensureE2EKey();
      appendClientLog('info', 'ALICE GENERATED/USED LOCAL AES-GCM KEY');

      const encrypted = await encryptWithBrowserAesGcm(key, message);
      const relayResponse = await fetch('/api/e2e/relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encrypted),
      });
      const relayPayload = (await relayResponse.json()) as BrowserE2ERelayResponse & { error?: string };

      if (!relayResponse.ok) {
        throw new Error(relayPayload.error ?? 'E2E relay failed');
      }

      appendServerLog('info', `CLIENT SENT CIPHERTEXT: ${encrypted.ciphertext}`);
      appendServerLog('info', `SERVER RECEIVED CIPHERTEXT: ${relayPayload.ciphertext}`);
      appendServerLog('info', 'SERVER DOES NOT HAVE KEY');
      appendServerLog('info', 'SERVER CANNOT DECRYPT MESSAGE');
      appendServerLog('info', `SERVER STORED ENCRYPTED VALUE: ${relayPayload.ciphertext}`);
      appendServerLog('info', 'SERVER RELAYED CIPHERTEXT TO BOB');

      appendClientLog('info', 'ALICE ENCRYPTED LOCALLY');
      appendClientLog('info', 'BOB RECEIVED CIPHERTEXT');

      const decrypted = await decryptWithBrowserAesGcm(key, relayPayload);
      appendClientLog('info', `BOB DECRYPTED LOCALLY: ${decrypted}`);

      const flowPayload: BrowserE2EEncryptionResult = {
        algorithm: relayPayload.algorithm,
        ciphertext: relayPayload.ciphertext,
        iv: relayPayload.iv,
        plaintext: decrypted,
      };

      playFlowSequence(buildE2EFlowSteps(message, flowPayload, decrypted));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'E2E encryption failed';
      appendServerLog('error', errorMessage);
      setIsSending(false);
    }
  };

  const handleHashSend = async (message: string) => {
    if (hashingAlgorithm === 'Argon2') {
      appendServerLog('warning', 'Selected algorithm is educational/coming soon.');
      setIsSending(false);
      return;
    }

    try {
      appendServerLog('info', `HASH INPUT RECEIVED: ${message}`);
      appendServerLog('info', `RUNNING HASH FUNCTION: ${hashingAlgorithm}`);

      const response = await fetch('/api/hashing/hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm: hashingAlgorithm, input: message }),
      });
      const result = (await response.json()) as HashingResult & { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? 'Hashing failed');
      }

      setHashResult(result);
      appendServerLog('info', `GENERATED HASH: ${result.hash}`);
      appendServerLog('info', 'STORED HASH VALUE');
      appendServerLog('info', 'NO DECRYPTION POSSIBLE');

      playFlowSequence(buildHashSteps(message, hashingAlgorithm, result.hash));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Hashing failed';
      appendServerLog('error', errorMessage);
      setIsSending(false);
    }
  };

  const handleHashVerify = async (message: string) => {
    if (!hashResult) {
      return;
    }

    if (hashingAlgorithm === 'Argon2') {
      appendServerLog('warning', 'Selected algorithm is educational/coming soon.');
      setIsSending(false);
      return;
    }

    setIsSending(true);
    try {
      appendServerLog('info', 'VERIFY REQUEST RECEIVED');
      appendServerLog('info', 'HASHING INPUT FOR COMPARISON');

      const response = await fetch('/api/hashing/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm: hashingAlgorithm, input: message }),
      });
      const result = (await response.json()) as HashVerificationResult & { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? 'Verification failed');
      }

      appendServerLog('info', `HASH MATCH RESULT: ${result.matched ? 'MATCHED' : 'INVALID'}`);
      playFlowSequence(buildHashVerificationSteps(message, result.storedHash, result.matched));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      appendServerLog('error', errorMessage);
      setIsSending(false);
    }
  };

  const generatePublicKeyPair = async () => {
    if (publicKeyAlgorithm === 'ECIES') {
      appendServerLog('warning', 'Selected public-key algorithm is educational/coming soon.');
      setIsSending(false);
      return;
    }

    setIsSending(true);
    try {
      appendServerLog('info', 'GENERATING RSA KEY PAIR');

      if (publicKeyAlgorithm === 'RSA-PSS') {
        const keyPair = await generateBrowserRsaPssKeyPair();
        const preview = await previewBrowserPublicPrivateKeys(keyPair.publicKey, keyPair.privateKey);
        setRsaPssKeys(keyPair);
        setRsaPssPreview(preview);
        appendServerLog('info', 'PUBLIC KEY GENERATED');
        appendServerLog('info', 'PRIVATE KEY GENERATED');
        playFlowSequence(buildPublicKeyKeyGenSteps(preview));
        return;
      }

      const keyPair = await generateBrowserRsaOaepKeyPair();
      const preview = await previewBrowserPublicPrivateKeys(keyPair.publicKey, keyPair.privateKey);
      setRsaOaepKeys(keyPair);
      setRsaOaepPreview(preview);
      appendServerLog('info', 'PUBLIC KEY GENERATED');
      appendServerLog('info', 'PRIVATE KEY GENERATED');
      playFlowSequence(buildPublicKeyKeyGenSteps(preview));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Key generation failed';
      appendServerLog('error', errorMessage);
      setIsSending(false);
    }
  };

  const handlePublicKeySend = async (message: string) => {
    if (publicKeyAlgorithm === 'ECIES') {
      appendServerLog('warning', 'Selected public-key algorithm is educational/coming soon.');
      setIsSending(false);
      return;
    }

    try {
      if (publicKeyAlgorithm === 'RSA-PSS') {
        const effectiveKeyPair = rsaPssKeys ?? (await generateBrowserRsaPssKeyPair());
        if (!rsaPssKeys) {
          const preview = await previewBrowserPublicPrivateKeys(effectiveKeyPair.publicKey, effectiveKeyPair.privateKey);
          setRsaPssKeys(effectiveKeyPair);
          setRsaPssPreview(preview);
          appendServerLog('info', 'GENERATING RSA KEY PAIR');
          appendServerLog('info', 'PUBLIC KEY GENERATED');
          appendServerLog('info', 'PRIVATE KEY GENERATED');
        }

        const hash = await digestBrowserShaHex(message, 'SHA-256');
        const signature = await signWithBrowserRsaPss(effectiveKeyPair.privateKey, message);
        const verified = await verifyBrowserRsaPssSignature(effectiveKeyPair.publicKey, message, signature);
        appendServerLog('info', 'SIGNING MESSAGE WITH PRIVATE KEY');
        appendServerLog('info', 'SIGNATURE GENERATED');
        appendServerLog('info', `SIGNATURE VERIFY RESULT: ${verified ? 'VALID' : 'INVALID'}`);
        playFlowSequence(buildPublicKeySignatureSteps(message, hash, signature, verified));
        return;
      }

      const effectiveKeyPair = rsaOaepKeys ?? (await generateBrowserRsaOaepKeyPair());
      if (!rsaOaepKeys) {
        const preview = await previewBrowserPublicPrivateKeys(effectiveKeyPair.publicKey, effectiveKeyPair.privateKey);
        setRsaOaepKeys(effectiveKeyPair);
        setRsaOaepPreview(preview);
        appendServerLog('info', 'GENERATING RSA KEY PAIR');
        appendServerLog('info', 'PUBLIC KEY GENERATED');
        appendServerLog('info', 'PRIVATE KEY GENERATED');
      }

      appendServerLog('info', 'ENCRYPTING USING PUBLIC KEY');
      const ciphertext = await encryptWithBrowserRsaOaep(effectiveKeyPair.publicKey, message);
      const relayResponse = await fetch('/api/public-key/relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm: publicKeyAlgorithm, ciphertext }),
      });
      const relayPayload = (await relayResponse.json()) as { algorithm: PublicKeyAlgorithmId; ciphertext: string; serverCanDecrypt: false; error?: string };

      if (!relayResponse.ok) {
        throw new Error(relayPayload.error ?? 'Public-key relay failed');
      }

      appendServerLog('info', `SERVER RECEIVED CIPHERTEXT: ${relayPayload.ciphertext}`);
      appendServerLog('info', 'SERVER DOES NOT HAVE PRIVATE KEY');
      const decrypted = await decryptWithBrowserRsaOaep(effectiveKeyPair.privateKey, relayPayload.ciphertext);
      appendServerLog('info', 'BOB DECRYPTED USING PRIVATE KEY');

      playFlowSequence(buildPublicKeyEncryptSteps(message, relayPayload.ciphertext, decrypted));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Public-key encryption failed';
      appendServerLog('error', errorMessage);
      setIsSending(false);
    }
  };

  const handleTlsHandshake = async () => {
    setIsSending(true);
    setFlowSteps([]);

    try {
      const response = await fetch('/api/tls/handshake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: tlsVersion }),
      });
      const result = (await response.json()) as TlsHandshakeResponse & { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? 'TLS handshake failed');
      }

      const key = await importBrowserTlsKey(result.sessionKey);
      setTlsSession(result);
      setTlsSessionKey(key);

      const handshakeSteps = buildTlsHandshakeSteps(result.version, result.sessionKeyPreview);
      playFlowSequence(handshakeSteps, (_, index) => {
        if (index === 0) {
          appendServerLog('info', 'CLIENT HELLO RECEIVED');
        }
        if (index === 1) {
          appendServerLog('info', 'SERVER HELLO SENT');
        }
        if (index === 2) {
          appendServerLog('info', 'TLS CERTIFICATE EXCHANGED');
        }
        if (index === 3) {
          appendServerLog('info', 'SESSION KEY ESTABLISHED');
        }
        if (index === 4) {
          appendServerLog('info', 'TLS ENCRYPTED CHANNEL ACTIVE');
        }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'TLS handshake failed';
      appendServerLog('error', errorMessage);
      setIsSending(false);
    }
  };

  const handleTlsSend = async (message: string) => {
    if (!tlsSession || !tlsSessionKey) {
      appendServerLog('warning', 'Establish a TLS session before sending data.');
      setIsSending(false);
      return;
    }

    try {
      const encrypted = await encryptWithBrowserTlsAesGcm(tlsSessionKey, message);
      const response = await fetch('/api/tls/transmit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: tlsSession.sessionId,
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
        }),
      });
      const result = (await response.json()) as TlsTransmissionResult & { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? 'TLS transmit failed');
      }

      appendServerLog('info', 'ENCRYPTED PACKET RECEIVED');
      appendServerLog('info', 'TLS LAYER DECRYPTED PACKET');
      appendServerLog('info', `APPLICATION SERVER RECEIVED PLAINTEXT: ${result.plaintext}`);

      playFlowSequence(buildTlsTransmissionSteps(message, encrypted.ciphertext, result.plaintext), () => {
        // no per-step logging needed beyond the server terminal messages above
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'TLS transmission failed';
      appendServerLog('error', errorMessage);
      setIsSending(false);
    }
  };

  const handleSend = async (message: string) => {
    setIsSending(true);
    setFlowSteps([]);

    if (selectedModel === 'backend-encryption') {
      await handleBackendSend(message);
      return;
    }

    if (selectedModel === 'end-to-end-encryption') {
      await handleE2ESend(message);
      return;
    }

    if (selectedModel === 'hashing') {
      await handleHashSend(message);
      return;
    }

    if (selectedModel === 'public-key-encryption') {
      await handlePublicKeySend(message);
      return;
    }

    if (selectedModel === 'tls-simulation') {
      await handleTlsSend(message);
      return;
    }

    if (selectedModel !== 'plain-text') {
      appendServerLog('warning', `[${String(selectedModel).toUpperCase()}] mode is coming soon.`);
      setIsSending(false);
      return;
    }

    handlePlainTextSend(message);
  };

  const canVerifyHash = Boolean(hashResult && hashResult.algorithm === hashingAlgorithm);
  const currentPublicKeyPreview = publicKeyAlgorithm === 'RSA-PSS' ? rsaPssPreview : rsaOaepPreview;
  const currentTlsReady = Boolean(tlsSession && tlsSessionKey);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 px-3 py-4 font-sans text-zinc-100 selection:bg-emerald-500/30 md:px-5 md:py-5 lg:px-6 lg:py-6">
      <div className="flex w-full flex-1 flex-col space-y-6">
        <header className="flex items-center gap-4 border-b border-zinc-800/80 pb-5">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 shadow-lg shadow-emerald-500/5">
            <Shield className="h-8 w-8 text-emerald-400" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold leading-none tracking-tight text-zinc-50">CipherHub</h1>
            <p className="text-sm font-heading font-medium text-zinc-400">Interactive Encryption Visualizer</p>
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="flex flex-col space-y-6 xl:col-span-7">
            <div className="space-y-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md md:p-6">
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="w-full shrink-0 space-y-4 sm:w-80">
                  <SecurityModelSelector value={selectedModel} onChange={handleSecurityModelChange} />

                  {selectedModel === 'backend-encryption' ? (
                    <AlgorithmSelector
                      label="Algorithm"
                      value={backendAlgorithm}
                      placeholder="Select an algorithm"
                      options={BACKEND_ENCRYPTION_ALGORITHMS}
                      onChange={setBackendAlgorithm}
                    />
                  ) : null}

                  {selectedModel === 'end-to-end-encryption' ? (
                    <AlgorithmSelector
                      label="Algorithm"
                      value={e2eAlgorithm}
                      placeholder="Select an algorithm"
                      options={E2E_ENCRYPTION_ALGORITHMS}
                      onChange={setE2EAlgorithm}
                    />
                  ) : null}

                  {selectedModel === 'hashing' ? (
                    <AlgorithmSelector
                      label="Algorithm"
                      value={hashingAlgorithm}
                      placeholder="Select a hash function"
                      options={HASHING_ALGORITHMS}
                      onChange={setHashingAlgorithm}
                    />
                  ) : null}

                  {selectedModel === 'public-key-encryption' ? (
                    <div className="space-y-3">
                      <AlgorithmSelector
                        label="Algorithm"
                        value={publicKeyAlgorithm}
                        placeholder="Select an asymmetric algorithm"
                        options={PUBLIC_KEY_ALGORITHMS}
                        onChange={setPublicKeyAlgorithm}
                      />
                      <Button
                        type="button"
                        onClick={generatePublicKeyPair}
                        disabled={isSending}
                        className="w-full bg-zinc-900 text-zinc-100 border border-zinc-800 hover:bg-zinc-800"
                      >
                        <KeyRound className="h-4 w-4" />
                        <span>Generate Key Pair</span>
                      </Button>
                    </div>
                  ) : null}

                  {selectedModel === 'tls-simulation' ? (
                    <div className="space-y-3">
                      <AlgorithmSelector
                        label="TLS Version"
                        value={tlsVersion}
                        placeholder="Select a TLS version"
                        options={TLS_VERSIONS}
                        onChange={setTlsVersion}
                      />
                      <Button
                        type="button"
                        onClick={handleTlsHandshake}
                        disabled={isSending}
                        className="w-full bg-sky-600/90 text-zinc-50 hover:bg-sky-500"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>{tlsSession ? 'Re-establish TLS Session' : 'Establish TLS Session'}</span>
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div className="flex-1 space-y-4">
                  {selectedModel === 'plain-text' ? (
                    <MessageComposer onSend={handleSend} isSending={isSending} />
                  ) : null}

                  {selectedModel === 'backend-encryption' ? (
                    <MessageComposer onSend={handleSend} isSending={isSending} />
                  ) : null}

                  {selectedModel === 'end-to-end-encryption' ? (
                    <MessageComposer onSend={handleSend} isSending={isSending} />
                  ) : null}

                  {selectedModel === 'hashing' ? (
                    <div className="space-y-4">
                      <MessageComposer
                        onSend={handleSend}
                        isSending={isSending}
                        label="Password"
                        placeholder="Enter password to hash..."
                        buttonLabel="Hash"
                        buttonIcon={<Fingerprint className="h-5 w-5" />}
                      />

                      {canVerifyHash ? (
                        <MessageComposer
                          onSend={handleHashVerify}
                          isSending={isSending}
                          label="Verify Password"
                          placeholder="Enter password to verify..."
                          buttonLabel="Verify"
                          buttonIcon={<Fingerprint className="h-5 w-5" />}
                        />
                      ) : null}
                    </div>
                  ) : null}

                  {selectedModel === 'public-key-encryption' ? (
                    <MessageComposer
                      onSend={handleSend}
                      isSending={isSending}
                      label="Message"
                      placeholder={
                        publicKeyAlgorithm === 'RSA-PSS'
                          ? 'Enter message to sign...'
                          : 'Enter message to encrypt...'
                      }
                      buttonLabel={publicKeyAlgorithm === 'RSA-PSS' ? 'Sign Message' : 'Encrypt Message'}
                      buttonIcon={<KeyRound className="h-5 w-5" />}
                    />
                  ) : null}

                  {selectedModel === 'tls-simulation' ? (
                    <MessageComposer
                      onSend={handleSend}
                      isSending={isSending}
                      disabled={!currentTlsReady}
                      label="Application Data"
                      placeholder="Enter plaintext to send through TLS..."
                      buttonLabel="Send over TLS"
                      buttonIcon={<LockKeyhole className="h-5 w-5" />}
                    />
                  ) : null}

                  {selectedModel === 'backend-encryption' && backendStoredMessage ? (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={handleBackendDecrypt}
                        disabled={isSending}
                        className="border border-emerald-500/20 bg-emerald-600/90 text-zinc-50 shadow-lg shadow-emerald-900/20 transition-all hover:bg-emerald-500 active:scale-95"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Fetch &amp; Decrypt Stored Message</span>
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>

              {selectedModel === 'public-key-encryption' && currentPublicKeyPreview ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Public Key Preview</p>
                    <p className="mt-2 font-mono text-sm text-cyan-400 break-all">{currentPublicKeyPreview.publicKey}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Private Key Preview</p>
                    <p className="mt-2 font-mono text-sm text-emerald-400 break-all">{currentPublicKeyPreview.privateKey}</p>
                  </div>
                </div>
              ) : null}

              {selectedModel === 'tls-simulation' && tlsSession ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">TLS Session</p>
                    <p className="mt-2 font-mono text-sm text-cyan-400">{tlsSession.sessionId}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Session Key Preview</p>
                    <p className="mt-2 font-mono text-sm text-emerald-400">{tlsSession.sessionKeyPreview}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex min-h-[520px] flex-col space-y-4 xl:col-span-5">
            <h2 className="flex items-center gap-2 px-1 text-lg font-semibold tracking-tight text-zinc-300">
              <span className="h-6 w-1.5 rounded-full bg-amber-500" />
              Server Terminal
            </h2>
            <div className="min-h-[520px] flex-1">
              <ServerConsole logs={serverLogs} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="flex items-center gap-2 px-1 text-lg font-semibold tracking-tight text-zinc-300">
            <span className="h-6 w-1.5 rounded-full bg-emerald-500" />
            Flow Visualizer
          </h2>
          <FlowVisualizer steps={flowSteps} />
        </div>

        {selectedModel === 'backend-encryption' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Card className="border-emerald-500/10 bg-zinc-900/40 shadow-xl">
              <CardHeader className="border-b border-zinc-800/60">
                <CardTitle className="text-zinc-100">Backend Encryption Learning Panel</CardTitle>
                <CardDescription className="text-zinc-400">
                  Backend encryption protects storage, not the server from itself.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 pt-5 md:grid-cols-2">
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Can the server read this data?</p>
                  <p className="text-sm font-semibold text-emerald-400">YES</p>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    The encryption key lives on the server, so the backend can encrypt and decrypt the stored value.
                  </p>
                </div>
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">What does it protect against?</p>
                  <ul className="space-y-1 text-sm text-zinc-400">
                    <li>Database leaks</li>
                    <li>Raw storage exposure</li>
                    <li>Someone viewing stored records directly</li>
                  </ul>
                </div>
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">What does it not protect against?</p>
                  <ul className="space-y-1 text-sm text-zinc-400">
                    <li>Malicious backend</li>
                    <li>Compromised server</li>
                    <li>Admin access</li>
                    <li>Poor key management</li>
                    <li>Plaintext payload reaching the server</li>
                  </ul>
                </div>
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Bottom line</p>
                  <p className="text-sm font-medium text-zinc-200">
                    Backend encryption is storage protection, not end-to-end privacy.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}

        {selectedModel === 'end-to-end-encryption' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="grid gap-6 lg:grid-cols-2">
            <ClientConsole logs={clientLogs} />
            <Card className="border-cyan-500/10 bg-zinc-900/40 shadow-xl">
              <CardHeader className="border-b border-zinc-800/60">
                <CardTitle className="text-zinc-100">End-to-End Encryption Learning Panel</CardTitle>
                <CardDescription className="text-zinc-400">Encryption happens before the message reaches the server.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 pt-5 md:grid-cols-2">
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Can the server read this message?</p>
                  <p className="text-sm font-semibold text-cyan-400">NO</p>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    The server never receives the decryption key, so it only relays ciphertext.
                  </p>
                </div>
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">What does E2E protect against?</p>
                  <ul className="space-y-1 text-sm text-zinc-400">
                    <li>Database leaks</li>
                    <li>Server-side storage exposure</li>
                    <li>Malicious backend trying to inspect content</li>
                    <li>Network interception</li>
                  </ul>
                </div>
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">What does E2E not automatically protect against?</p>
                  <ul className="space-y-1 text-sm text-zinc-400">
                    <li>Compromised user device</li>
                    <li>Bad key exchange</li>
                    <li>Users exporting shared decrypted data</li>
                    <li>Metadata leakage</li>
                    <li>Poor implementation</li>
                  </ul>
                </div>
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Bottom line</p>
                  <p className="text-sm font-medium text-zinc-200">
                    Backend encryption protects storage. End-to-end encryption protects message content from the server itself.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}

        {selectedModel === 'hashing' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Card className="border-amber-500/10 bg-zinc-900/40 shadow-xl">
              <CardHeader className="border-b border-zinc-800/60">
                <CardTitle className="text-zinc-100">Hashing Learning Panel</CardTitle>
                <CardDescription className="text-zinc-400">Hashing is one-way. It proves or verifies data instead of decrypting it.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 pt-5 md:grid-cols-2">
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Can hashes be decrypted?</p>
                  <p className="text-sm font-semibold text-amber-400">NO</p>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    Hashing is one-way, so the original input is not recovered from the hash.
                  </p>
                </div>
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">What are hashes used for?</p>
                  <ul className="space-y-1 text-sm text-zinc-400">
                    <li>Password storage</li>
                    <li>File integrity</li>
                    <li>Checksums</li>
                    <li>Digital signatures</li>
                  </ul>
                </div>
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Why bcrypt for passwords?</p>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    bcrypt is intentionally slow, which makes brute-force attacks more expensive than fast hashes like SHA-256.
                  </p>
                </div>
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Bottom line</p>
                  <p className="text-sm font-medium text-zinc-200">
                    Encryption protects readable data. Hashing proves and verifies data.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}

        {selectedModel === 'public-key-encryption' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Card className="border-cyan-500/10 bg-zinc-900/40 shadow-xl">
              <CardHeader className="border-b border-zinc-800/60">
                <CardTitle className="text-zinc-100">Public Key Learning Panel</CardTitle>
                <CardDescription className="text-zinc-400">Public key cryptography separates what can encrypt, what can decrypt, and what can verify.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 pt-5 md:grid-cols-2">
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Can public key decrypt?</p>
                  <p className="text-sm font-semibold text-cyan-400">NO</p>
                </div>
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Can private key decrypt?</p>
                  <p className="text-sm font-semibold text-emerald-400">YES</p>
                </div>
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Why use asymmetric cryptography?</p>
                  <ul className="space-y-1 text-sm text-zinc-400">
                    <li>Secure key exchange</li>
                    <li>HTTPS / TLS</li>
                    <li>Digital signatures</li>
                    <li>Identity verification</li>
                  </ul>
                </div>
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Important</p>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    Public key crypto is slower than symmetric encryption, so real systems usually use hybrid encryption.
                  </p>
                  <p className="text-sm leading-relaxed text-zinc-200">
                    RSA or ECC for key exchange, AES or ChaCha20 for message encryption.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}

        {selectedModel === 'tls-simulation' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Card className="border-sky-500/10 bg-zinc-900/40 shadow-xl">
              <CardHeader className="border-b border-zinc-800/60">
                <CardTitle className="text-zinc-100">TLS Learning Panel</CardTitle>
                <CardDescription className="text-zinc-400">TLS protects data in transit, not the server from the plaintext it receives after decryption.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 pt-5 md:grid-cols-2">
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Does TLS protect against network sniffing?</p>
                  <p className="text-sm font-semibold text-sky-400">YES</p>
                </div>
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Can the server still read plaintext?</p>
                  <p className="text-sm font-semibold text-emerald-400">YES</p>
                </div>
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">What does TLS protect?</p>
                  <ul className="space-y-1 text-sm text-zinc-400">
                    <li>Data in transit</li>
                    <li>MITM attacks</li>
                    <li>Packet sniffing</li>
                  </ul>
                </div>
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">What does TLS not automatically protect?</p>
                  <ul className="space-y-1 text-sm text-zinc-400">
                    <li>Malicious backend</li>
                    <li>Server-side inspection</li>
                    <li>End-to-end privacy</li>
                  </ul>
                </div>
                <div className="space-y-2 rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-4 md:col-span-2">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Bottom line</p>
                  <p className="text-sm font-medium text-zinc-200">
                    TLS protects transport. E2E protects message content from the server itself.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
