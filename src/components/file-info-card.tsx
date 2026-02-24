"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatFileSize } from "@/lib/file-utils";
import { FILE_TYPE_LABELS, MAX_PREVIEW_LENGTH } from "@/lib/constants";
import type { UploadResult } from "@/types";

interface FileInfoCardProps {
  uploadResult: UploadResult;
  onTranslate: () => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function FileInfoCard({ uploadResult, onTranslate, onRemove, disabled }: FileInfoCardProps) {
  const preview = uploadResult.contentType === "html"
    ? uploadResult.extractedContent
        .replace(/<[^>]+>/g, "")
        .replace(/&[^;]+;/g, " ")
        .substring(0, MAX_PREVIEW_LENGTH)
    : uploadResult.extractedContent.substring(0, MAX_PREVIEW_LENGTH);

  return (
    <div className="w-full rounded-xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-foreground">{uploadResult.fileName}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary">{FILE_TYPE_LABELS[uploadResult.originalFormat] || uploadResult.originalFormat.toUpperCase()}</Badge>
              <span className="text-xs text-muted-foreground">{formatFileSize(uploadResult.fileSize)}</span>
              {uploadResult.pageCount && (
                <span className="text-xs text-muted-foreground">{uploadResult.pageCount} pages</span>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove} disabled={disabled} className="text-muted-foreground hover:text-destructive">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Button>
      </div>

      {preview && (
        <div className="mt-4 max-h-32 overflow-hidden rounded-lg bg-muted/50 p-3">
          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-5">{preview}</p>
        </div>
      )}

      <Button
        onClick={onTranslate}
        disabled={disabled}
        className="mt-4 w-full bg-[#F97316] text-white hover:bg-[#EA580C] cursor-pointer"
        size="lg"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <path d="m5 8 6 6" />
          <path d="m4 14 6-6 2-3" />
          <path d="M2 5h12" />
          <path d="M7 2h1" />
          <path d="m22 22-5-10-5 10" />
          <path d="M14 18h6" />
        </svg>
        Translate
      </Button>
    </div>
  );
}
