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
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left">
            <p className="text-xs leading-relaxed text-amber-900">
              Anthropic API를 통해 전송된 데이터는 모델 학습에 사용되지 않으며, 다른 사용자의 응답에 노출되지 않습니다.
              <br />
              단, API 사용 과정에서 <span className="font-semibold text-red-600">민감 정보(고객 개인정보, 금융 데이터 등)를 포함하여 전송할 경우</span>, 이로 인해 발생하는 정보 유출 및 관련 문제에 대한 책임은 <strong>사용자 본인</strong>에게 있음을 양지하시기 바랍니다.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-amber-800">
              Data transmitted through the Anthropic API is not used for model training and is not exposed in responses to other users.
              <br />
              However, please be advised that <span className="font-semibold text-red-600">if sensitive information (such as personal customer data or financial records) is included in API transmissions</span>, <strong>the user assumes full responsibility</strong> for any data leakage or related issues that may arise.
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
