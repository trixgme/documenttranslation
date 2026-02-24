/**
 * PDF text extraction using pdfjs-dist (pure JavaScript, Vercel-compatible).
 * Used for upload preview only — actual translation uses Claude's direct PDF mode.
 */

interface TextItem {
  str: string;
  transform: number[];
}

export async function parsePdf(buffer: Buffer): Promise<{
  html: string;
  text: string;
  pageCount: number;
}> {
  // Dynamic import to avoid bundling issues; use legacy build for Node.js compatibility
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const data = new Uint8Array(buffer);
  const doc = await pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: true,
  }).promise;

  const pageTexts: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const items = content.items as TextItem[];

    // Group items into lines by Y-coordinate
    const lines: { y: number; items: { x: number; str: string }[] }[] = [];

    for (const item of items) {
      if (!item.str) continue;
      const y = Math.round(item.transform[5]);
      const x = item.transform[4];

      let line = lines.find((l) => Math.abs(l.y - y) < 3);
      if (!line) {
        line = { y, items: [] };
        lines.push(line);
      }
      line.items.push({ x, str: item.str });
    }

    // Sort lines top-to-bottom, items left-to-right
    lines.sort((a, b) => b.y - a.y);
    for (const line of lines) {
      line.items.sort((a, b) => a.x - b.x);
    }

    const lineTexts = lines.map((line) =>
      line.items.map((it) => it.str).join(" ")
    );
    pageTexts.push(lineTexts.join("\n"));
  }

  const text = pageTexts.join("\n\n");
  const html = buildSimpleHtml(text);

  return { html, text, pageCount: doc.numPages };
}

function buildSimpleHtml(text: string): string {
  const paragraphs = text.split(/\n{2,}/);
  return paragraphs
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
