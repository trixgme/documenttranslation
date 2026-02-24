"use client";

import { useCallback, useRef, useState } from "react";
import { validateFile } from "@/lib/file-utils";
import { SUPPORTED_EXTENSIONS } from "@/lib/constants";

interface FileUploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function FileUploadZone({ onFileSelected, disabled }: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid file.");
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile, disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      if (inputRef.current) inputRef.current.value = "";
    },
    [handleFile]
  );

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a file for translation"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        className={`
          flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-all duration-200
          ${isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}
          ${disabled ? "cursor-not-allowed opacity-50" : ""}
          ${error ? "border-destructive" : ""}
        `}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isDragOver ? "text-primary" : "text-muted-foreground"}
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {isDragOver ? "Drop your file here" : "Drag & drop your file here"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            or click to browse ({SUPPORTED_EXTENSIONS.join(", ")}, max 10MB)
          </p>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={SUPPORTED_EXTENSIONS.join(",")}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
