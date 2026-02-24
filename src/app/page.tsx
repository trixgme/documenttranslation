"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { FileUploadZone } from "@/components/file-upload-zone";
import { FileInfoCard } from "@/components/file-info-card";
import { TranslateDialog } from "@/components/translate-dialog";
import { TranslationProgress } from "@/components/translation-progress";
import { TranslationResult } from "@/components/translation-result";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import type { AIProvider } from "@/types";

export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    status,
    uploadResult,
    translatedContent,
    translatedContentType,
    selectedLanguage,
    error,
    streamingContent,
    chunkProgress,
    uploadFile,
    translate,
    cancelTranslation,
    downloadFile,
    reset,
    clearError,
  } = useTranslation();

  const handleFileSelected = (file: File) => {
    uploadFile(file);
  };

  const handleTranslate = (targetLanguage: string, provider: AIProvider) => {
    translate(targetLanguage, provider);
  };

  // Show error toast
  if (error) {
    toast.error(error);
    clearError();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex flex-1 flex-col items-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Title section */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Document Translation
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload your document and translate it to any language with AI.
              <br />
              Supports PDF, DOCX, and TXT files.
            </p>
          </div>

          {/* Security disclaimer */}
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-sm font-semibold text-red-700">
              문서 누출로 인해 발생하는 문제는 전적으로 개인 책임임을 양지하시기 바랍니다.
            </p>
            <p className="mt-1 text-xs font-medium text-red-600">
              Please be advised that any issues arising from document leakage are solely the responsibility of the individual.
            </p>
          </div>

          {/* Content area */}
          <div className="flex flex-col gap-6">
            {/* Upload zone - show when idle */}
            {(status === "idle" || status === "uploading") && (
              <FileUploadZone
                onFileSelected={handleFileSelected}
                disabled={status === "uploading"}
              />
            )}

            {/* Uploading progress */}
            {status === "uploading" && (
              <TranslationProgress status="uploading" targetLanguage="" />
            )}

            {/* File info card - show when uploaded */}
            {status === "uploaded" && uploadResult && (
              <FileInfoCard
                uploadResult={uploadResult}
                onTranslate={() => setDialogOpen(true)}
                onRemove={reset}
              />
            )}

            {/* Translating progress */}
            {status === "translating" && (
              <TranslationProgress
                status="translating"
                targetLanguage={selectedLanguage}
                streamingContent={streamingContent}
                chunkProgress={chunkProgress}
                onCancel={cancelTranslation}
              />
            )}

            {/* Translation result */}
            {(status === "translated" || status === "generating" || status === "complete") && (
              <TranslationResult
                translatedContent={translatedContent}
                contentType={translatedContentType}
                targetLanguage={selectedLanguage}
                onDownload={downloadFile}
                onReset={reset}
                isGenerating={status === "generating"}
              />
            )}
          </div>
        </div>
      </main>

      {/* Translate dialog */}
      <TranslateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onTranslate={handleTranslate}
      />
    </div>
  );
}
