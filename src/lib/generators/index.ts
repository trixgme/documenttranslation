import type { OutputFormat, ContentType } from "@/types";
import { generatePdf } from "./pdf-generator";
import { generateDocx } from "./docx-generator";
import { generateTxt } from "./txt-generator";

interface GenerateResult {
  buffer: Buffer | Uint8Array;
  mimeType: string;
  extension: string;
}

export async function generateFile(
  content: string,
  contentType: ContentType,
  outputFormat: OutputFormat
): Promise<GenerateResult> {
  switch (outputFormat) {
    case "pdf": {
      const buffer = await generatePdf(content, contentType);
      return { buffer, mimeType: "application/pdf", extension: "pdf" };
    }
    case "docx": {
      const buffer = await generateDocx(content, contentType);
      return {
        buffer,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        extension: "docx",
      };
    }
    case "txt": {
      const buffer = await generateTxt(content, contentType);
      return { buffer, mimeType: "text/plain; charset=utf-8", extension: "txt" };
    }
    default:
      throw new Error(`Unsupported output format: ${outputFormat}`);
  }
}
