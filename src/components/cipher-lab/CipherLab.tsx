"use client";

import { useState } from 'react';
import { SecurityModel, FlowStep, ServerLog } from '@/types/cipher-lab';
import { SecurityModelSelector } from './SecurityModelSelector';
import { MessageComposer } from './MessageComposer';
import { FlowVisualizer } from './FlowVisualizer';
import { ServerConsole } from './ServerConsole';
import { Shield } from 'lucide-react';

export function CipherLab() {
  const [selectedModel, setSelectedModel] = useState<SecurityModel>('plain-text');
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>([]);
  const [serverLogs, setServerLogs] = useState<ServerLog[]>([]);
  const [isSending, setIsSending] = useState(false);

  const appendLog = (type: ServerLog['type'], message: string) => {
    setServerLogs(prev => [
      ...prev,
      { id: Math.random().toString(36).substring(7), type, message, timestamp: Date.now() }
    ]);
  };

  const handleSend = (message: string) => {
    setIsSending(true);
    setFlowSteps([]);

    if (selectedModel !== 'plain-text') {
      appendLog('warning', `[${selectedModel.toUpperCase()}] mode is coming soon.`);
      setIsSending(false);
      return;
    }

    // Plain text simulation
    const steps: FlowStep[] = [
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
      }
    ];

    let currentStep = 0;
    
    // Initial clear
    setFlowSteps([]);
    
    const interval = setInterval(() => {
      // Capture the current step value before it gets incremented,
      // so the React state updater uses the correct index even if it runs asynchronously.
      const stepToPush = steps[currentStep];
      
      setFlowSteps(prev => {
        if (!stepToPush) return prev;
        return [...prev, stepToPush];
      });
      
      if (currentStep === 2) {
        appendLog('info', `SERVER RECEIVED PLAIN TEXT: ${message}`);
      }

      currentStep++;
      if (currentStep >= steps.length) {
        clearInterval(interval);
        setIsSending(false);
      }
    }, 700);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-8 lg:p-12 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl w-full mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex items-center gap-4 border-b border-zinc-800/80 pb-6">
          <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-50 leading-none">CipherLab</h1>
            <p className="text-zinc-400 font-medium text-sm">Interactive Encryption Visualizer</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8 flex flex-col">
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-64 shrink-0">
                  <SecurityModelSelector value={selectedModel} onChange={setSelectedModel} />
                </div>
                <div className="flex-1">
                  <MessageComposer onSend={handleSend} isSending={isSending} />
                </div>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-300 px-1 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                Flow Visualizer
              </h2>
              <FlowVisualizer steps={flowSteps} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4 h-full flex flex-col">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-300 px-1 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
              Server Terminal
            </h2>
            <div className="flex-1 min-h-[400px]">
              <ServerConsole logs={serverLogs} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
