"use client";

import { SecurityModel } from '@/types/cipher-lab';
import { SECURITY_MODELS } from '@/constants/security-models';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SecurityModelSelectorProps {
  value: SecurityModel;
  onChange: (value: SecurityModel) => void;
}

export function SecurityModelSelector({ value, onChange }: SecurityModelSelectorProps) {
  return (
    <div className="flex flex-col space-y-2 w-full max-w-xs">
      <label className="text-sm font-medium text-zinc-400">Security Model</label>
      <Select value={value} onValueChange={(val) => onChange(val as SecurityModel)}>
        <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-100">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          {SECURITY_MODELS.map((model) => (
            <SelectItem key={model.id} value={model.id} className="focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer">
              <div className="flex flex-col py-1">
                <span className="font-medium text-sm">{model.name}</span>
                <span className="text-xs text-zinc-500 mt-0.5">{model.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
