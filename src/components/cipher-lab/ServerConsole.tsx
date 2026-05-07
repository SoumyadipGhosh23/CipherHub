"use client";

import { ServerLog } from '@/types/cipher-lab';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ServerConsoleProps {
  logs: ServerLog[];
}

export function ServerConsole({ logs }: ServerConsoleProps) {
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // shadcn ScrollArea injects a viewport div that we need to scroll
    const viewport = document.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 overflow-hidden flex flex-col h-64 shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800/80 bg-zinc-900/80">
        <Terminal className="w-4 h-4 text-zinc-400" />
        <span className="text-xs font-semibold tracking-wider text-zinc-400 font-mono uppercase">server-console.log</span>
        <div className="ml-auto flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4 bg-black/40">
        <div className="space-y-1.5 font-mono text-[13px] leading-relaxed">
          {logs.length === 0 ? (
            <div className="text-zinc-600 animate-pulse">Waiting for connection...</div>
          ) : (
            logs.map((log) => {
              const timeString = new Date(log.timestamp).toISOString().split('T')[1].slice(0, 12);
              return (
                <div key={log.id} className="flex gap-4 break-all">
                  <span className="text-zinc-600 shrink-0 select-none">[{timeString}]</span>
                  <span className={`
                    ${log.type === 'error' ? 'text-red-400' : ''}
                    ${log.type === 'success' ? 'text-emerald-400' : ''}
                    ${log.type === 'warning' ? 'text-amber-400' : ''}
                    ${log.type === 'info' ? 'text-sky-400' : ''}
                    ${!['error', 'success', 'warning', 'info'].includes(log.type) ? 'text-zinc-300' : ''}
                  `}>
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
