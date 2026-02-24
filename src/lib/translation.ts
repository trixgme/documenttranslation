import openai from "./openai";
import anthropic from "./anthropic";
import { MAX_CHARS_PER_CHUNK } from "./constants";
import type { AIProvider, ContentType } from "@/types";

function getSystemPrompt(targetLanguage: string, contentType: ContentType, sourceLanguage?: string, isPdfDirect?: boolean): string {
  const source = sourceLanguage || "the source language (auto-detect)";

  if (isPdfDirect) {
    return `You are a professional document translator. Your task is to produce a COMPLETE, FULL-LENGTH, word-for-word translation of the attached PDF document from ${source} to ${targetLanguage}.

CRITICAL RULES:
- You MUST translate EVERY sentence, EVERY paragraph, EVERY table cell, EVERY heading, EVERY footnote, EVERY line of the original document. Do NOT skip, summarize, condense, or omit ANY part.
- The translated output must be the SAME length and contain the SAME amount of detail as the original.
- Do NOT add summaries, overviews, or commentary. Do NOT say "the document contains..." or "this section discusses...". Translate the actual text.

Output format:
- Output as well-structured HTML.
- Reproduce the document structure faithfully: headings → <h1>-<h3>, paragraphs → <p>, tables → <table>/<tr>/<th>/<td>, lists → <ul>/<ol>/<li>, bold → <strong>, italic → <em>.
- Preserve all table structures exactly, including every row and every cell.
- Preserve any numbers, proper nouns, dates, and technical terms accurately.
- If a term has no direct translation, keep the original with a transliteration in parentheses.
- Do NOT include <html>, <head>, or <body> wrapper tags. Return only the inner content HTML.
- Do NOT include any commentary, explanation, or markdown code fences. Output raw HTML only.`;
  }

  if (contentType === "html") {
    return `You are a professional document translator. Translate the following HTML content from ${source} to ${targetLanguage}.

Rules:
- Translate ONLY the visible text content. Preserve ALL HTML tags, attributes, and structure exactly.
- Preserve the exact meaning of the original text. Do not add, remove, or alter any information.
- Keep <table>, <tr>, <td>, <th> structures intact.
- Keep <strong>, <em>, <ul>, <ol>, <li>, <h1>-<h6>, <p>, <a> tags in place.
- Preserve any numbers, proper nouns, and technical terms accurately.
- If a term has no direct translation, keep the original with a transliteration in parentheses.
- Return the complete HTML with translated text nodes only. No additional commentary.`;
  }

  return `You are a professional document translator. Translate the following text from ${source} to ${targetLanguage}.

Rules:
- Preserve the exact meaning of the original text. Do not add, remove, or alter any information.
- Preserve paragraph breaks and formatting exactly.
- Preserve any numbers, proper nouns, and technical terms accurately.
- If the text contains table-like structures (aligned columns, separators), preserve that formatting.
- If a term has no direct translation, keep the original with a transliteration in parentheses.
- Return ONLY the translated text with no additional commentary.`;
}

export function splitIntoChunks(content: string, maxChars: number, contentType: ContentType): string[] {
  if (content.length <= maxChars) return [content];

  const chunks: string[] = [];
  let remaining = content;

  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      chunks.push(remaining);
      break;
    }

    let splitIndex = maxChars;

    if (contentType === "html") {
      const searchArea = remaining.substring(maxChars - 2000, maxChars);
      const lastClosingTag = Math.max(
        searchArea.lastIndexOf("</p>"),
        searchArea.lastIndexOf("</table>"),
        searchArea.lastIndexOf("</li>"),
        searchArea.lastIndexOf("</h1>"),
        searchArea.lastIndexOf("</h2>"),
        searchArea.lastIndexOf("</h3>"),
        searchArea.lastIndexOf("</div>")
      );
      if (lastClosingTag !== -1) {
        splitIndex = maxChars - 2000 + lastClosingTag + remaining.substring(maxChars - 2000 + lastClosingTag).indexOf(">") + 1;
      }
    } else {
      const searchArea = remaining.substring(maxChars - 2000, maxChars);
      const lastBreak = searchArea.lastIndexOf("\n\n");
      if (lastBreak !== -1) {
        splitIndex = maxChars - 2000 + lastBreak + 2;
      }
    }

    chunks.push(remaining.substring(0, splitIndex));
    remaining = remaining.substring(splitIndex);
  }

  return chunks;
}

async function* streamWithOpenAI(
  systemPrompt: string,
  chunk: string,
): AsyncGenerator<string> {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: chunk },
    ],
    temperature: 0.1,
    stream: true,
  });

  for await (const part of stream) {
    const token = part.choices[0]?.delta?.content;
    if (token) {
      yield token;
    }
  }
}

async function* streamWithClaude(
  systemPrompt: string,
  chunk: string,
): AsyncGenerator<string> {
  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: systemPrompt,
    messages: [
      { role: "user", content: chunk },
    ],
    temperature: 0.1,
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

async function* streamWithClaudePdf(
  systemPrompt: string,
  pdfBase64: string,
): AsyncGenerator<string> {
  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 64000,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          },
          {
            type: "text",
            text: "Translate this ENTIRE document word-for-word from start to finish. Do NOT summarize or skip any part. Every sentence, every table row, every heading must be translated. Output as HTML.",
          },
        ],
      },
    ],
    temperature: 0.1,
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

/**
 * Streaming translation: yields translated text tokens in real-time.
 * Supports both Claude (default) and OpenAI providers.
 */
export async function* translateContentStream(params: {
  content: string;
  contentType: ContentType;
  targetLanguage: string;
  sourceLanguage?: string;
  provider?: AIProvider;
  pdfBase64?: string;
}): AsyncGenerator<{ type: "token" | "chunk-start" | "chunk-end" | "done"; data: string }> {
  const provider = params.provider || "claude";
  const usePdfDirect = provider === "claude" && !!params.pdfBase64;

  // Claude + PDF: send raw PDF directly via document block (no chunking)
  if (usePdfDirect) {
    const systemPrompt = getSystemPrompt(params.targetLanguage, params.contentType, params.sourceLanguage, true);

    yield { type: "chunk-start", data: JSON.stringify({ current: 1, total: 1 }) };

    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        for await (const token of streamWithClaudePdf(systemPrompt, params.pdfBase64!)) {
          yield { type: "token", data: token };
        }
        break;
      } catch (error: unknown) {
        retries++;
        if (retries >= maxRetries) throw error;
        const statusError = error as { status?: number };
        if (statusError.status === 429) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 1000));
        } else {
          throw error;
        }
      }
    }

    yield { type: "chunk-end", data: JSON.stringify({ current: 1, total: 1 }) };
    yield { type: "done", data: "" };
    return;
  }

  // Default path: text-based chunked translation
  const chunks = splitIntoChunks(params.content, MAX_CHARS_PER_CHUNK, params.contentType);
  const systemPrompt = getSystemPrompt(params.targetLanguage, params.contentType, params.sourceLanguage);
  const totalChunks = chunks.length;

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];

    yield { type: "chunk-start", data: JSON.stringify({ current: chunkIndex + 1, total: totalChunks }) };

    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        const tokenStream = provider === "claude"
          ? streamWithClaude(systemPrompt, chunk)
          : streamWithOpenAI(systemPrompt, chunk);

        for await (const token of tokenStream) {
          yield { type: "token", data: token };
        }

        break;
      } catch (error: unknown) {
        retries++;
        if (retries >= maxRetries) throw error;
        const statusError = error as { status?: number };
        if (statusError.status === 429) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 1000));
        } else {
          throw error;
        }
      }
    }

    yield { type: "chunk-end", data: JSON.stringify({ current: chunkIndex + 1, total: totalChunks }) };

    // Add separator between chunks
    if (chunkIndex < chunks.length - 1) {
      const separator = params.contentType === "html" ? "" : "\n\n";
      if (separator) {
        yield { type: "token", data: separator };
      }
    }
  }

  yield { type: "done", data: "" };
}
