import { MAX_FILE_SIZE, SUPPORTED_MIME_TYPES, SUPPORTED_EXTENSIONS } from "./constants";

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.` };
  }

  const extension = "." + file.name.split(".").pop()?.toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    return { valid: false, error: `Unsupported file type. Supported: ${SUPPORTED_EXTENSIONS.join(", ")}` };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

export function getMimeType(fileName: string): string | undefined {
  const ext = getFileExtension(fileName);
  return Object.entries(SUPPORTED_MIME_TYPES).find(([, v]) => v === ext)?.[0];
}
