"use client";

import { AI_PROVIDER_OPTIONS } from "@/lib/constants";
import type { AIProvider } from "@/types";

interface AIProviderSelectorProps {
  selectedProvider: AIProvider;
  onSelect: (provider: AIProvider) => void;
}

export function AIProviderSelector({ selectedProvider, onSelect }: AIProviderSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-foreground">AI Model</p>
      <div className="flex gap-2">
        {AI_PROVIDER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`
              flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg border-2 px-3 py-3 transition-all duration-150
              ${
                selectedProvider === option.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/30 hover:bg-muted/50"
              }
            `}
          >
            <span className="text-sm font-semibold">{option.label}</span>
            <span className="text-[10px] text-muted-foreground">{option.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
