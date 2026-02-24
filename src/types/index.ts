export type ContentType = "text" | "html";

export type OutputFormat = "pdf" | "docx" | "txt";

export type AIProvider = "claude" | "openai";

export type TranslationStatus =
  | "idle"
  | "uploading"
  | "uploaded"
  | "translating"
  | "translated"
  | "generating"
  | "complete"
  | "error";

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  category: "popular" | "european" | "asian" | "middle-eastern" | "african" | "americas" | "other";
}

export interface UploadResult {
  success: boolean;
  extractedContent: string;
  contentType: ContentType;
  pageCount?: number;
  fileName: string;
  fileSize: number;
  originalFormat: string;
  pdfBase64?: string;
  error?: string;
}

export interface TranslationRequest {
  extractedContent: string;
  contentType: ContentType;
  targetLanguage: string;
  sourceLanguage?: string;
  provider?: AIProvider;
  pdfBase64?: string;
}

export interface TranslationResult {
  success: boolean;
  translatedContent: string;
  contentType: ContentType;
  error?: string;
}

export interface GenerateRequest {
  translatedContent: string;
  contentType: ContentType;
  outputFormat: OutputFormat;
  fileName: string;
}
