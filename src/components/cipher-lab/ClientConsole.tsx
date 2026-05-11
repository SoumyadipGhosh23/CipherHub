"use client";

import { ServerLog } from '@/types/cipher-lab';
import { ConsolePanel } from './ConsolePanel';

interface ClientConsoleProps {
  logs: ServerLog[];
}

export function ClientConsole({ logs }: ClientConsoleProps) {
  return (
    <ConsolePanel
      logs={logs}
      title="client-crypto.log"
      emptyMessage="Waiting for local crypto events..."
      accentClassName="text-cyan-400"
    />
  );
}
