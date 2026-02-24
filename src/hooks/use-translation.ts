"use client";

import { useState, useCallback, useRef } from "react";
import type { AIProvider, TranslationStatus, UploadResult, ContentType, OutputFormat } from "@/types";

interface TranslationState {
  status: TranslationStatus;
  uploadResult: UploadResult | null;
  translatedContent: string;
  translatedContentType: ContentType;
  selectedLanguage: string;
  error: string | null;
  streamingContent: string;
  chunkProgress: { current: number; total: number } | null;
}

export function useTranslation() {
  const [state, setState] = useState<TranslationState>({
    status: "idle",
    uploadResult: null,
    translatedContent: "",
    translatedContentType: "text",
    selectedLanguage: "",
    error: null,
    streamingContent: "",
    chunkProgress: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setState((prev) => ({ ...prev, status: "uploading", error: null }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data: UploadResult = await response.json();

      if (!data.success) {
        setState((prev) => ({ ...prev, status: "error", error: data.error || "Upload failed." }));
        return;
      }

      setState((prev) => ({ ...prev, status: "uploaded", uploadResult: data }));
    } catch {
      setState((prev) => ({ ...prev, status: "error", error: "Failed to upload file." }));
    }
  }, []);

  const translate = useCallback(
    async (targetLanguage: string, provider: AIProvider = "claude") => {
      if (!state.uploadResult) return;

      // Abort previous request if any
      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setState((prev) => ({
        ...prev,
        status: "translating",
        selectedLanguage: targetLanguage,
        error: null,
        streamingContent: "",
        translatedContent: "",
        chunkProgress: null,
      }));

      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            extractedContent: state.uploadResult.extractedContent,
            contentType: state.uploadResult.contentType,
            targetLanguage,
            provider,
            ...(state.uploadResult.pdfBase64 && { pdfBase64: state.uploadResult.pdfBase64 }),
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          setState((prev) => ({ ...prev, status: "error", error: errorData.error || "Translation failed." }));
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          setState((prev) => ({ ...prev, status: "error", error: "Streaming not supported." }));
          return;
        }

        const decoder = new TextDecoder();
        let fullContent = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events from buffer
          const events = buffer.split("\n\n");
          // Keep last incomplete event in buffer
          buffer = events.pop() || "";

          for (const eventStr of events) {
            if (!eventStr.trim()) continue;

            const lines = eventStr.split("\n");
            let eventType = "";
            let eventData = "";

            for (const line of lines) {
              if (line.startsWith("event: ")) {
                eventType = line.slice(7);
              } else if (line.startsWith("data: ")) {
                // SSE spec: multiple "data:" lines are joined with newlines
                eventData += (eventData ? "\n" : "") + line.slice(6);
              }
            }

            switch (eventType) {
              case "token":
                fullContent += eventData;
                setState((prev) => ({ ...prev, streamingContent: fullContent }));
                break;
              case "chunk-start": {
                const progress = JSON.parse(eventData);
                setState((prev) => ({ ...prev, chunkProgress: progress }));
                break;
              }
              case "chunk-end":
                break;
              case "done": {
                // When Claude PDF direct mode is used, the output is always HTML
                // regardless of the original upload content type
                const isPdfDirect = !!state.uploadResult?.pdfBase64 && (provider === "claude");
                const outputContentType = isPdfDirect ? "html" : (state.uploadResult?.contentType || "text");
                setState((prev) => ({
                  ...prev,
                  status: "translated",
                  translatedContent: fullContent,
                  translatedContentType: outputContentType,
                  streamingContent: "",
                }));
                break;
              }
              case "error": {
                const errorInfo = JSON.parse(eventData);
                setState((prev) => ({ ...prev, status: "error", error: errorInfo.error }));
                break;
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState((prev) => ({ ...prev, status: "error", error: "Translation failed. Please try again." }));
      }
    },
    [state.uploadResult]
  );

  const cancelTranslation = useCallback(() => {
    abortControllerRef.current?.abort();
    setState((prev) => ({
      ...prev,
      status: prev.uploadResult ? "uploaded" : "idle",
      streamingContent: "",
      chunkProgress: null,
    }));
  }, []);

  const downloadFile = useCallback(async (format: OutputFormat) => {
    if (!state.translatedContent) return;

    const outputFormat = format;

    setState((prev) => ({ ...prev, status: "generating" }));

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          translatedContent: state.translatedContent,
          contentType: state.translatedContentType,
          outputFormat,
          fileName: state.uploadResult?.fileName || "document",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setState((prev) => ({ ...prev, status: "error", error: errorData.error || "Download failed." }));
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="?(.+?)"?$/);
      a.download = filenameMatch ? decodeURIComponent(filenameMatch[1]) : `translated.${outputFormat}`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);

      setState((prev) => ({ ...prev, status: "complete" }));
    } catch {
      setState((prev) => ({ ...prev, status: "error", error: "Failed to generate file." }));
    }
  }, [state.translatedContent, state.translatedContentType, state.uploadResult]);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setState({
      status: "idle",
      uploadResult: null,
      translatedContent: "",
      translatedContentType: "text",
      selectedLanguage: "",
      error: null,
      streamingContent: "",
      chunkProgress: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: prev.uploadResult ? "uploaded" : "idle",
      error: null,
    }));
  }, []);

  return {
    ...state,
    uploadFile,
    translate,
    cancelTranslation,
    downloadFile,
    reset,
    clearError,
  };
}
