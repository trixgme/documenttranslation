"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getLanguageByCode } from "@/lib/languages";

interface TranslationProgressProps {
  status: string;
  targetLanguage: string;
  streamingContent?: string;
  chunkProgress?: { current: number; total: number } | null;
  onCancel?: () => void;
}

export function TranslationProgress({
  status,
  targetLanguage,
  streamingContent,
  chunkProgress,
  onCancel,
}: TranslationProgressProps) {
  const lang = getLanguageByCode(targetLanguage);
  const langName = lang?.name || targetLanguage;
  const contentEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamingContent]);

  const messages: Record<string, string> = {
    uploading: "Uploading file...",
    translating: `Translating to ${langName}...`,
    generating: "Generating file...",
  };

  const showStreaming = status === "translating" && streamingContent;

  return (
    <div className="w-full rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center">
              <svg className="h-8 w-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {messages[status] || "Processing..."}
              </p>
              {chunkProgress && chunkProgress.total > 1 && (
                <p className="text-xs text-muted-foreground">
                  Chunk {chunkProgress.current} of {chunkProgress.total}
                </p>
              )}
            </div>
          </div>
          {status === "translating" && onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground hover:text-destructive">
              Cancel
            </Button>
          )}
        </div>

        {/* Chunk progress bar */}
        {chunkProgress && chunkProgress.total > 1 && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(chunkProgress.current / chunkProgress.total) * 100}%` }}
            />
          </div>
        )}

        {/* Streaming content */}
        {showStreaming ? (
          <ScrollArea className="h-[280px] rounded-lg border border-border bg-muted/30 p-4">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
              {streamingContent}
              <span className="inline-block h-4 w-0.5 animate-pulse bg-primary" />
              <div ref={contentEndRef} />
            </div>
          </ScrollArea>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            This may take a moment depending on the document size.
          </p>
        )}
      </div>
    </div>
  );
}
