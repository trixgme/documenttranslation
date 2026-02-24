export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const SUPPORTED_MIME_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "text/plain": "txt",
};

export const SUPPORTED_EXTENSIONS = [".pdf", ".docx", ".txt"];

export const FILE_TYPE_LABELS: Record<string, string> = {
  pdf: "PDF",
  docx: "Word Document",
  txt: "Text File",
};

export const OUTPUT_FORMAT_OPTIONS = [
  { value: "pdf" as const, label: "PDF", description: "Portable Document Format" },
  { value: "docx" as const, label: "DOCX", description: "Microsoft Word" },
  { value: "txt" as const, label: "TXT", description: "Plain Text" },
];

export const AI_PROVIDER_OPTIONS = [
  { value: "claude" as const, label: "Claude", description: "Anthropic Claude Sonnet" },
  { value: "openai" as const, label: "GPT-4o", description: "OpenAI GPT-4o" },
];

export const DEFAULT_PROVIDER = "claude" as const;

export const MAX_CHARS_PER_CHUNK = 80000;

export const MAX_PREVIEW_LENGTH = 2000;
