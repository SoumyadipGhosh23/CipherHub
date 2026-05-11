"use client";

import { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { ServerLog } from '@/types/cipher-lab';

interface ConsolePanelProps {
  logs: ServerLog[];
  title: string;
  emptyMessage: string;
  accentClassName: string;
}

export function ConsolePanel({ logs, title, emptyMessage, accentClassName }: ConsolePanelProps) {
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950 shadow-2xl">
      <div className="flex items-center gap-2 border-b border-zinc-800/80 bg-zinc-900/80 px-4 py-2.5">
        <Terminal className={`h-4 w-4 ${accentClassName}`} />
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">{title}</span>
        <div className="ml-auto flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full border border-red-500/50 bg-red-500/20" />
          <div className="h-2.5 w-2.5 rounded-full border border-amber-500/50 bg-amber-500/20" />
          <div className="h-2.5 w-2.5 rounded-full border border-emerald-500/50 bg-emerald-500/20" />
        </div>
      </div>
      <div ref={scrollViewportRef} className="scrollbar-hidden flex-1 overflow-y-auto bg-black/40 p-4">
        <div className="space-y-1.5 font-mono text-[13px] leading-relaxed">
          {logs.length === 0 ? (
            <div className="animate-pulse text-zinc-600">{emptyMessage}</div>
          ) : (
            logs.map((log) => {
              const timeString = new Date(log.timestamp).toISOString().split('T')[1].slice(0, 12);

              return (
                <div key={log.id} className="flex gap-4 break-all">
                  <span className="shrink-0 select-none text-zinc-600">[{timeString}]</span>
                  <span
                    className={`
                    ${log.type === 'error' ? 'text-red-400' : ''}
                    ${log.type === 'success' ? 'text-emerald-400' : ''}
                    ${log.type === 'warning' ? 'text-amber-400' : ''}
                    ${log.type === 'info' ? 'text-sky-400' : ''}
                    ${!['error', 'success', 'warning', 'info'].includes(log.type) ? 'text-zinc-300' : ''}
                  `}
                  >
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
