import { PDFDocument, PDFPage, PDFFont, rgb, RGB } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs/promises";
import path from "path";
import { parseHtmlToElements, stripAllHtml, type ParsedElement } from "./html-utils";

// Layout constants
const PAGE_WIDTH = 595; // A4
const PAGE_HEIGHT = 842;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

const FONT_SIZE_BODY = 10;
const FONT_SIZE_H1 = 18;
const FONT_SIZE_H2 = 15;
const FONT_SIZE_H3 = 13;
const FONT_SIZE_TABLE = 9;

const LINE_HEIGHT_FACTOR = 1.6;
const TABLE_CELL_PADDING = 4;
const PARAGRAPH_SPACING = 8;

const TEXT_COLOR = rgb(0.118, 0.161, 0.231);
const BORDER_COLOR = rgb(0.4, 0.4, 0.4);
const HEADER_BG = rgb(0.93, 0.93, 0.93);

interface PdfContext {
  doc: PDFDocument;
  font: PDFFont;
  boldFont: PDFFont;
  page: PDFPage;
  y: number;
}

function newPage(ctx: PdfContext): void {
  ctx.page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  ctx.y = PAGE_HEIGHT - MARGIN;
}

function ensureSpace(ctx: PdfContext, needed: number): void {
  if (ctx.y - needed < MARGIN) {
    newPage(ctx);
  }
}

/** Word-wrap text to fit within maxWidth, returns lines. */
function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const lines: string[] = [];
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine ? currentLine + " " + word : word;
    let width: number;
    try {
      width = font.widthOfTextAtSize(testLine, fontSize);
    } catch {
      width = testLine.length * fontSize * 0.5; // fallback estimate
    }
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawTextSafe(page: PDFPage, text: string, x: number, y: number, font: PDFFont, size: number, color: RGB): void {
  try {
    page.drawText(text, { x, y, size, font, color });
  } catch {
    // Skip lines with unsupported characters
  }
}

function drawParagraph(ctx: PdfContext, runs: Array<{ text: string; bold?: boolean; italic?: boolean }>, fontSize: number): void {
  const lineHeight = fontSize * LINE_HEIGHT_FACTOR;
  const fullText = runs.map((r) => r.text).join("");
  const lines = wrapText(fullText, ctx.font, fontSize, CONTENT_WIDTH);

  for (const line of lines) {
    ensureSpace(ctx, lineHeight);
    ctx.y -= lineHeight;
    // Use bold font if first run is bold (simplified — full run tracking would be complex)
    const useFont = runs.length > 0 && runs[0].bold ? ctx.boldFont : ctx.font;
    drawTextSafe(ctx.page, line, MARGIN, ctx.y, useFont, fontSize, TEXT_COLOR);
  }

  ctx.y -= PARAGRAPH_SPACING;
}

function drawTable(ctx: PdfContext, rows: Array<Array<{ text: string; bold?: boolean }>>): void {
  if (rows.length === 0) return;

  const numCols = Math.max(...rows.map((r) => r.length), 1);
  const fontSize = FONT_SIZE_TABLE;
  const lineHeight = fontSize * LINE_HEIGHT_FACTOR;
  const cellPadding = TABLE_CELL_PADDING;

  // Calculate column widths based on content
  const colWidths = calculateColumnWidths(ctx, rows, numCols, fontSize);

  // Render each row
  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    const isHeader = rowIdx === 0 && row.some((c) => c.bold);

    // Calculate row height (max wrapped lines across all cells)
    let maxLines = 1;
    const cellLines: string[][] = [];
    for (let colIdx = 0; colIdx < numCols; colIdx++) {
      const cellText = row[colIdx]?.text || "";
      const availWidth = colWidths[colIdx] - 2 * cellPadding;
      const lines = wrapText(cellText, ctx.font, fontSize, Math.max(availWidth, 20));
      cellLines.push(lines);
      maxLines = Math.max(maxLines, lines.length);
    }

    const rowHeight = maxLines * lineHeight + 2 * cellPadding;

    // Check if row fits on current page
    ensureSpace(ctx, rowHeight);

    const rowTop = ctx.y;
    const rowBottom = rowTop - rowHeight;

    // Draw header background
    if (isHeader) {
      let x = MARGIN;
      for (let colIdx = 0; colIdx < numCols; colIdx++) {
        ctx.page.drawRectangle({
          x,
          y: rowBottom,
          width: colWidths[colIdx],
          height: rowHeight,
          color: HEADER_BG,
        });
        x += colWidths[colIdx];
      }
    }

    // Draw cell text
    let x = MARGIN;
    for (let colIdx = 0; colIdx < numCols; colIdx++) {
      const lines = cellLines[colIdx];
      const cellFont = (row[colIdx]?.bold) ? ctx.boldFont : ctx.font;
      let textY = rowTop - cellPadding - lineHeight;

      for (const line of lines) {
        drawTextSafe(ctx.page, line, x + cellPadding, textY, cellFont, fontSize, TEXT_COLOR);
        textY -= lineHeight;
      }

      x += colWidths[colIdx];
    }

    // Draw cell borders
    x = MARGIN;
    for (let colIdx = 0; colIdx < numCols; colIdx++) {
      const cellWidth = colWidths[colIdx];

      // Top border
      ctx.page.drawLine({ start: { x, y: rowTop }, end: { x: x + cellWidth, y: rowTop }, thickness: 0.5, color: BORDER_COLOR });
      // Bottom border
      ctx.page.drawLine({ start: { x, y: rowBottom }, end: { x: x + cellWidth, y: rowBottom }, thickness: 0.5, color: BORDER_COLOR });
      // Left border
      ctx.page.drawLine({ start: { x, y: rowTop }, end: { x, y: rowBottom }, thickness: 0.5, color: BORDER_COLOR });
      // Right border (last column)
      if (colIdx === numCols - 1) {
        ctx.page.drawLine({ start: { x: x + cellWidth, y: rowTop }, end: { x: x + cellWidth, y: rowBottom }, thickness: 0.5, color: BORDER_COLOR });
      }

      x += colWidths[colIdx];
    }

    ctx.y = rowBottom;
  }

  ctx.y -= PARAGRAPH_SPACING;
}

function calculateColumnWidths(
  ctx: PdfContext,
  rows: Array<Array<{ text: string; bold?: boolean }>>,
  numCols: number,
  fontSize: number,
): number[] {
  const cellPadding = TABLE_CELL_PADDING;

  // Measure max content width per column
  const maxContentWidths = new Array(numCols).fill(0);
  for (const row of rows) {
    for (let colIdx = 0; colIdx < numCols; colIdx++) {
      const cellText = row[colIdx]?.text || "";
      let textWidth: number;
      try {
        textWidth = ctx.font.widthOfTextAtSize(cellText, fontSize);
      } catch {
        textWidth = cellText.length * fontSize * 0.5;
      }
      maxContentWidths[colIdx] = Math.max(maxContentWidths[colIdx], textWidth + 2 * cellPadding);
    }
  }

  // Scale to fit within content width
  const totalNatural = maxContentWidths.reduce((a, b) => a + b, 0);
  if (totalNatural <= CONTENT_WIDTH) {
    // Distribute remaining space proportionally
    const remaining = CONTENT_WIDTH - totalNatural;
    return maxContentWidths.map((w) => w + (remaining / numCols));
  }

  // Scale down proportionally
  const scale = CONTENT_WIDTH / totalNatural;
  return maxContentWidths.map((w) => Math.max(w * scale, 30));
}

function renderElement(ctx: PdfContext, el: ParsedElement): void {
  switch (el.type) {
    case "heading": {
      const sizes: Record<number, number> = { 1: FONT_SIZE_H1, 2: FONT_SIZE_H2, 3: FONT_SIZE_H3 };
      const fontSize = sizes[el.level || 2] || FONT_SIZE_H2;
      ctx.y -= 4; // extra space before heading
      drawParagraph(ctx, (el.runs || []).map((r) => ({ ...r, bold: true })), fontSize);
      break;
    }
    case "table":
      drawTable(ctx, el.rows || []);
      break;
    case "list-item": {
      const runs = el.runs || [];
      const bulletRuns = [{ text: "  •  " }, ...runs];
      drawParagraph(ctx, bulletRuns, FONT_SIZE_BODY);
      break;
    }
    default:
      drawParagraph(ctx, el.runs || [], FONT_SIZE_BODY);
      break;
  }
}

export async function generatePdf(content: string, contentType: string): Promise<Uint8Array> {
  // Auto-detect HTML even if contentType says "text"
  if (contentType !== "html" && /<(?:table|h[1-6]|p)\b/i.test(content)) {
    contentType = "html";
  }

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Load fonts
  const fontDir = path.join(process.cwd(), "public", "fonts");
  const regularBytes = await fs.readFile(path.join(fontDir, "NotoSansKR-Regular.ttf"));
  const font = await pdfDoc.embedFont(regularBytes);

  // Try to load bold font, fall back to regular
  let boldFont: PDFFont;
  try {
    const boldBytes = await fs.readFile(path.join(fontDir, "NotoSansKR-Bold.ttf"));
    boldFont = await pdfDoc.embedFont(boldBytes);
  } catch {
    boldFont = font; // fallback to regular
  }

  const ctx: PdfContext = {
    doc: pdfDoc,
    font,
    boldFont,
    page: pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
    y: PAGE_HEIGHT - MARGIN,
  };

  if (contentType === "html") {
    const elements = parseHtmlToElements(content);
    for (const el of elements) {
      renderElement(ctx, el);
    }
  } else {
    // Plain text: split by double newline for paragraphs
    const paragraphs = content.split(/\n\n+/);
    for (const para of paragraphs) {
      const text = para.replace(/\n/g, " ").trim();
      if (text) {
        drawParagraph(ctx, [{ text }], FONT_SIZE_BODY);
      }
    }
  }

  if (pdfDoc.getPageCount() === 0) {
    pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  }

  return pdfDoc.save();
}
