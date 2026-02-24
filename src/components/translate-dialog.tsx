"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "./language-selector";
import { AIProviderSelector } from "./ai-provider-selector";
import { DEFAULT_PROVIDER } from "@/lib/constants";
import type { AIProvider } from "@/types";

interface TranslateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTranslate: (targetLanguage: string, provider: AIProvider) => void;
}

export function TranslateDialog({ open, onOpenChange, onTranslate }: TranslateDialogProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(DEFAULT_PROVIDER);

  const handleTranslate = () => {
    if (!selectedLanguage) return;
    onTranslate(selectedLanguage, selectedProvider);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Translation Options</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Target Language</p>
            <LanguageSelector selectedLanguage={selectedLanguage} onSelect={setSelectedLanguage} />
          </div>
          <AIProviderSelector selectedProvider={selectedProvider} onSelect={setSelectedProvider} />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
            Cancel
          </Button>
          <Button
            onClick={handleTranslate}
            disabled={!selectedLanguage}
            className="bg-[#F97316] text-white hover:bg-[#EA580C] cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
              <path d="m5 8 6 6" />
              <path d="m4 14 6-6 2-3" />
              <path d="M2 5h12" />
              <path d="M7 2h1" />
              <path d="m22 22-5-10-5 10" />
              <path d="M14 18h6" />
            </svg>
            Translate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
