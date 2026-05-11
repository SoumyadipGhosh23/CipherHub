"use client";

import { AlgorithmOption, BACKEND_ENCRYPTION_ALGORITHMS } from '@/constants/algorithms';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface AlgorithmSelectorProps {
  value: AlgorithmOption['id'];
  onChange: (value: AlgorithmOption['id']) => void;
}

export function AlgorithmSelector({ value, onChange }: AlgorithmSelectorProps) {
  return (
    <div className="flex w-full flex-col space-y-2">
      <label className="text-sm font-medium text-zinc-400">Algorithm</label>
      <Select value={value} onValueChange={(nextValue) => onChange(nextValue as AlgorithmOption['id'])}>
        <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-100">
          <SelectValue placeholder="Select an algorithm" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          {BACKEND_ENCRYPTION_ALGORITHMS.map((algo: AlgorithmOption) => (
            <SelectItem key={algo.id} value={algo.id} className="focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer">
              <div className="flex flex-col gap-1 py-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{algo.name}</span>
                  <span className="rounded-full border border-zinc-700 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
                    {algo.status}
                  </span>
                </div>
                <span className="text-xs text-zinc-500">{algo.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
