"use client";

import { ServerLog } from '@/types/cipher-lab';
import { ConsolePanel } from './ConsolePanel';

interface ServerConsoleProps {
  logs: ServerLog[];
}

export function ServerConsole({ logs }: ServerConsoleProps) {
  return (
    <ConsolePanel
      logs={logs}
      title="server-console.log"
      emptyMessage="Waiting for connection..."
      accentClassName="text-zinc-400"
    />
  );
}
