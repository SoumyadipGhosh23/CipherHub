"use client";

import { ENCRYPTION_ALGORITHMS } from '@/constants/algorithms';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlgorithmOption } from '@/types/crypto';

export interface AlgorithmSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function AlgorithmSelector({ value, onChange }: AlgorithmSelectorProps) {
  return (
    <div className="flex flex-col space-y-2 w-full max-w-xs mt-4">
      <label className="text-sm font-medium text-zinc-400">Encryption Algorithm</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-100">
          <SelectValue placeholder="Select an algorithm" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          {ENCRYPTION_ALGORITHMS.map((algo: AlgorithmOption) => (
            <SelectItem key={algo.id} value={algo.id} className="focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer">
              <div className="flex flex-col py-1">
                <span className="font-medium text-sm">{algo.name}</span>
                <span className="text-xs text-zinc-500 mt-0.5">{algo.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
