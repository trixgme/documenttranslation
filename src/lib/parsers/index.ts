import type { ContentType } from "@/types";
import { parseDocx } from "./docx-parser";
import { parseTxt } from "./txt-parser";

interface ParseResult {
  content: string;
  contentType: ContentType;
  pageCount?: number;
}

export async function parseFile(buffer: Buffer, mimeType: string): Promise<ParseResult> {
  switch (mimeType) {
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      const result = await parseDocx(buffer);
      return { content: result.html, contentType: "html" };
    }
    case "text/plain": {
      const result = await parseTxt(buffer);
      return { content: result.text, contentType: "text" };
    }
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}
