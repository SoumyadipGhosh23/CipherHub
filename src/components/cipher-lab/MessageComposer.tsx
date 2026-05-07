"use client";

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface MessageComposerProps {
  onSend: (message: string) => void;
  isSending: boolean;
}

export function MessageComposer({ onSend, isSending }: MessageComposerProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim() || isSending) return;
    onSend(message);
    setMessage('');
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <label className="text-sm font-medium text-zinc-400">Payload</label>
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter a secret message... (Press Enter to send)"
          className="resize-none min-h-[5rem] bg-zinc-900/80 border-zinc-800 text-emerald-400 font-mono text-sm flex-1 focus-visible:ring-emerald-500/50"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button 
          onClick={handleSend} 
          disabled={!message.trim() || isSending}
          className="h-auto min-h-[5rem] w-full sm:w-28 bg-emerald-600/90 hover:bg-emerald-500 text-zinc-50 border border-emerald-500/20 shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
        >
          <div className="flex flex-col items-center gap-1.5">
            <Send className="w-5 h-5" />
            <span className="font-medium tracking-wide">Send</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
