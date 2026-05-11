"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { FlowStep } from "@/types/cipher-lab";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface FlowNodeCardProps {
  step: FlowStep;
  index: number;
}

export function FlowNodeCard({ step, index }: FlowNodeCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(step.value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.3 }}
      className="flex flex-col relative"
    >
      <Card className="w-56 bg-zinc-900/50 backdrop-blur border-zinc-800 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20" />
        <CardHeader className="p-4 pb-3 border-b border-zinc-800/50 bg-zinc-900/80">
          <CardTitle className="text-sm font-medium tracking-wide text-zinc-100 flex items-center justify-center gap-2">
            {step.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-2">
            <div
              className="bg-zinc-950/80 p-3 rounded-md border border-zinc-800/80 font-mono text-xs text-emerald-400 overflow-hidden text-ellipsis whitespace-nowrap"
              title={step.value}
            >
              {step.value}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="w-full border-zinc-800 bg-zinc-950/70 text-zinc-300 hover:bg-zinc-900"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy value'}</span>
            </Button>
          </div>
          <CardDescription className="text-xs text-center text-zinc-400 leading-relaxed">
            {step.description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}
