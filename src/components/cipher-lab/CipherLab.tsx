"use client";

import { useEffect, useRef, useState } from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { SecurityModel, FlowStep, ServerLog } from '@/types/cipher-lab';
import {
  BackendEncryptionAlgorithmId,
  DEFAULT_BACKEND_ENCRYPTION_ALGORITHM,
} from '@/constants/algorithms';
import { SymmetricCiphertext } from '@/types/crypto';
import { SecurityModelSelector } from './SecurityModelSelector';
import { AlgorithmSelector } from './AlgorithmSelector';
import { MessageComposer } from './MessageComposer';
import { FlowVisualizer } from './FlowVisualizer';
import { ServerConsole } from './ServerConsole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function CipherLab() {
  const [selectedModel, setSelectedModel] = useState<SecurityModel>('plain-text');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<BackendEncryptionAlgorithmId>(
    DEFAULT_BACKEND_ENCRYPTION_ALGORITHM,
  );
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>([]);
  const [serverLogs, setServerLogs] = useState<ServerLog[]>([]);
  const [backendStoredMessage, setBackendStoredMessage] = useState<SymmetricCiphertext | null>(null);
  const [isSending, setIsSending] = useState(false);
  const flowTimerRef = useRef<number | null>(null);

  const appendLog = (type: ServerLog['type'], message: string) => {
    setServerLogs((prev) => [
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

  const handleSecurityModelChange = (model: SecurityModel) => {
    setSelectedModel(model);
    if (model !== 'backend-encryption') {
      setBackendStoredMessage(null);
      setFlowSteps([]);
    }
  };

  const buildPlainTextSteps = (message: string): FlowStep[] => [
    {
      id: 'alice',
      label: 'Alice Browser',
      value: message,
      description: 'Original message created by sender.',
    },
    {
      id: 'network',
      label: 'Network Payload',
      value: message,
      description: 'Travels across the internet unencrypted.',
    },
    {
      id: 'server',
      label: 'Server Received',
      value: message,
      description: 'Server can read the full text.',
    },
    {
      id: 'storage',
      label: 'Storage',
      value: message,
      description: 'Stored as raw plain text in database.',
    },
  ];

  const buildBackendEncryptSteps = (
    message: string,
    payload: SymmetricCiphertext,
  ): FlowStep[] => [
    {
      id: 'alice',
      label: 'Alice Browser',
      value: message,
      description: 'Client sends plaintext to the server.',
    },
    {
      id: 'network',
      label: 'Network Payload',
      value: message,
      description: 'Plaintext reaches the backend over the network.',
    },
    {
      id: 'server',
      label: 'Server Received',
      value: message,
      description: 'Server receives readable plaintext.',
    },
    {
      id: 'encryption',
      label: 'Server Encryption',
      value: payload.encrypted,
      description: `Server encrypts before storage using ${payload.algorithm}.`,
    },
    {
      id: 'storage',
      label: 'Storage',
      value: payload.encrypted,
      description: 'Encrypted value is stored at rest.',
    },
  ];

  const buildBackendDecryptSteps = (payload: SymmetricCiphertext): FlowStep[] => [
    {
      id: 'storage',
      label: 'Storage',
      value: payload.encrypted,
      description: 'Encrypted value exists in storage.',
    },
    {
      id: 'read',
      label: 'Server Reads Storage',
      value: payload.encrypted,
      description: 'Server can access stored encrypted data.',
    },
    {
      id: 'decrypt',
      label: 'Server Decrypts',
      value: payload.decrypted ?? '',
      description: 'Server decrypts using the selected algorithm and server-owned key.',
    },
    {
      id: 'response',
      label: 'Network Response',
      value: payload.decrypted ?? '',
      description: 'Server sends readable plaintext back to the client.',
    },
    {
      id: 'alice-receives',
      label: 'Alice Browser Receives',
      value: payload.decrypted ?? '',
      description: 'Client receives the original message.',
    },
  ];

  const handleSend = async (message: string) => {
    setIsSending(true);
    setFlowSteps([]);

    if (selectedModel === 'backend-encryption') {
      try {
        appendLog('info', `CLIENT SENT: ${message}`);
        const response = await fetch('/api/backend-encryption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, algorithm: selectedAlgorithm }),
        });
        const result = (await response.json()) as SymmetricCiphertext & { error?: string };

        if (!response.ok) {
          throw new Error(result.error ?? 'Encryption failed');
        }

        setBackendStoredMessage(result);
        playFlowSequence(buildBackendEncryptSteps(message, result), (step, index) => {
          if (index === 2) {
            appendLog('info', `SERVER RECEIVED PLAIN TEXT: ${message}`);
          }

          if (index === 3) {
            appendLog('info', `SERVER ENCRYPTING USING: ${result.algorithm}`);
            appendLog('info', `GENERATED IV: ${result.iv}`);
            if (result.authTag) {
              appendLog('info', `GENERATED AUTH TAG: ${result.authTag}`);
            }
            appendLog('info', `STORED ENCRYPTED VALUE: ${result.encrypted}`);
          }
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Encryption failed';
        appendLog(errorMessage.includes('not implemented') ? 'warning' : 'error', errorMessage);
        setIsSending(false);
      }
      return;
    }

    if (selectedModel !== 'plain-text') {
      appendLog('warning', `[${selectedModel.toUpperCase()}] mode is coming soon.`);
      setIsSending(false);
      return;
    }

    const steps = buildPlainTextSteps(message);
    playFlowSequence(steps, (_, index) => {
      if (index === 2) {
        appendLog('info', `SERVER RECEIVED PLAIN TEXT: ${message}`);
      }
    });
  };

  const handleFetchAndDecrypt = async () => {
    if (!backendStoredMessage || selectedModel !== 'backend-encryption') {
      return;
    }

    setIsSending(true);
    appendLog('info', 'FETCH REQUEST RECEIVED');

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

      appendLog('info', `SERVER READ ENCRYPTED VALUE: ${result.encrypted}`);
      appendLog('info', `SERVER DECRYPTING USING: ${result.algorithm}`);
      appendLog('info', `SERVER DECRYPTED MESSAGE: ${result.decrypted ?? ''}`);
      appendLog('info', 'SERVER SENT PLAINTEXT BACK TO CLIENT');

      playFlowSequence(buildBackendDecryptSteps(result));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Decryption failed';
      appendLog('error', errorMessage);
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 px-3 py-4 text-zinc-100 font-sans selection:bg-emerald-500/30 md:px-5 md:py-5 lg:px-6 lg:py-6">
      <div className="flex w-full flex-1 flex-col space-y-6">
        <header className="flex items-center gap-4 border-b border-zinc-800/80 pb-5">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 shadow-lg shadow-emerald-500/5">
            <Shield className="h-8 w-8 text-emerald-400" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-50 leading-none">CipherLab</h1>
            <p className="text-sm font-medium text-zinc-400">Interactive Encryption Visualizer</p>
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="flex flex-col space-y-6 xl:col-span-7">
            <div className="space-y-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md md:p-6">
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="w-full shrink-0 space-y-4 sm:w-72">
                  <SecurityModelSelector value={selectedModel} onChange={handleSecurityModelChange} />
                  {selectedModel === 'backend-encryption' ? (
                    <AlgorithmSelector value={selectedAlgorithm} onChange={setSelectedAlgorithm} />
                  ) : null}
                </div>
                <div className="flex-1 space-y-4">
                  <MessageComposer onSend={handleSend} isSending={isSending} />
                  {selectedModel === 'backend-encryption' && backendStoredMessage ? (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={handleFetchAndDecrypt}
                        disabled={isSending}
                        className="bg-emerald-600/90 text-zinc-50 border border-emerald-500/20 shadow-lg shadow-emerald-900/20 transition-all hover:bg-emerald-500 active:scale-95"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Fetch &amp; Decrypt Stored Message</span>
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
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
      </div>
    </div>
  );
}
