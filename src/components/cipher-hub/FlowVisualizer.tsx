"use client";

import { FlowStep } from "@/types/cipher-hub";
import { FlowNodeCard } from "./FlowNodeCard";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface FlowVisualizerProps {
  steps: FlowStep[];
}

export function FlowVisualizer({ steps }: FlowVisualizerProps) {
  if (steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-72 border-2 border-dashed border-zinc-800/50 rounded-xl bg-zinc-950/20">
        <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">
          Waiting for input...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center justify-start overflow-x-auto p-8 gap-2 rounded-xl bg-zinc-950/40 border border-zinc-800/50 min-h-[18rem] custom-scrollbar">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center shrink-0">
          <FlowNodeCard step={step} index={index} />
          {index < steps.length - 1 && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              transition={{ delay: index * 0.15 + 0.15, duration: 0.3 }}
              className="px-6 text-zinc-600 flex items-center justify-center"
            >
              <ArrowRight className="w-6 h-6 animate-pulse" />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}
