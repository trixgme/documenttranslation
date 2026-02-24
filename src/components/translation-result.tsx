"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getLanguageByCode } from "@/lib/languages";
import type { ContentType, OutputFormat } from "@/types";

interface TranslationResultProps {
  translatedContent: string;
  contentType: ContentType;
  targetLanguage: string;
  onDownload: (format: OutputFormat) => void;
  onReset: () => void;
  isGenerating: boolean;
}

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export function TranslationResult({
  translatedContent,
  contentType,
  targetLanguage,
  onDownload,
  onReset,
  isGenerating,
}: TranslationResultProps) {
  const lang = getLanguageByCode(targetLanguage);

  const previewContent = contentType === "html"
    ? translatedContent
        .replace(/<[^>]+>/g, "")
        .replace(/&[^;]+;/g, " ")
    : translatedContent;

  return (
    <div className="w-full rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span className="font-medium text-foreground">Translation Complete</span>
        </div>
        {lang && (
          <Badge variant="secondary">
            {lang.flag} {lang.name}
          </Badge>
        )}
      </div>

      <ScrollArea className="mt-4 h-[240px] rounded-lg border border-border bg-muted/30 p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{previewContent}</p>
      </ScrollArea>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex gap-3">
          <Button
            onClick={() => onDownload("docx")}
            disabled={isGenerating}
            className="flex-1 bg-primary text-white hover:bg-primary/90 cursor-pointer"
            size="lg"
          >
            {isGenerating ? <SpinnerIcon /> : <DownloadIcon />}
            {isGenerating ? "Generating..." : "Download DOCX"}
          </Button>
          <Button
            onClick={() => onDownload("pdf")}
            disabled={isGenerating}
            variant="outline"
            className="flex-1 cursor-pointer"
            size="lg"
          >
            {isGenerating ? <SpinnerIcon /> : <DownloadIcon />}
            {isGenerating ? "Generating..." : "Download PDF"}
          </Button>
        </div>
        <Button variant="ghost" onClick={onReset} className="cursor-pointer" size="lg">
          New Translation
        </Button>
      </div>
    </div>
  );
}
