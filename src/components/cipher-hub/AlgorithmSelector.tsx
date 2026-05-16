"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface AlgorithmSelectorOption<TValue extends string> {
  id: TValue;
  name: string;
  description: string;
  status: string;
}

export interface AlgorithmSelectorProps<TValue extends string> {
  label: string;
  value: TValue;
  placeholder: string;
  options: ReadonlyArray<AlgorithmSelectorOption<TValue>>;
  onChange: (value: TValue) => void;
}

export function AlgorithmSelector<TValue extends string>({
  label,
  value,
  placeholder,
  options,
  onChange,
}: AlgorithmSelectorProps<TValue>) {
  return (
    <div className="flex w-full flex-col space-y-2">
      <label className="text-sm font-heading font-medium text-zinc-400">{label}</label>
      <Select value={value} onValueChange={(nextValue) => onChange(nextValue as TValue)}>
        <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-100">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          {options.map((algo) => (
            <SelectItem key={algo.id} value={algo.id} className="cursor-pointer focus:bg-zinc-800 focus:text-zinc-100">
              <div className="flex flex-col gap-1 py-1">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-medium text-sm">{algo.name}</span>
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
