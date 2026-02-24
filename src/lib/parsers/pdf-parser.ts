import { PDFParse } from "pdf-parse";

export async function parsePdf(buffer: Buffer): Promise<{
  html: string;
  text: string;
  pageCount: number;
}> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const textResult = await parser.getText();

  // Try structured table extraction (geometry-based)
  const structuredTables: string[][][] = [];
  try {
    const tableResult = await parser.getTable();
    if (tableResult?.pages) {
      for (const page of tableResult.pages as any[]) {
        if (!Array.isArray(page?.tables)) continue;
        for (const table of page.tables) {
          if (!Array.isArray(table) || table.length === 0) continue;
          const rows: string[][] = table.map((row: any) =>
            Array.isArray(row)
              ? row.map((cell: any) =>
                  typeof cell === "string"
                    ? cell
                    : Array.isArray(cell?.text)
                      ? cell.text.join(" ")
                      : String(cell ?? "")
                )
              : [String(row ?? "")]
          );
          structuredTables.push(rows);
        }
      }
    }
  } catch {
    // Geometry-based table detection not available for this PDF
  }

  await parser.destroy();

  const html = buildHtml(textResult.text, structuredTables);
  return { html, text: textResult.text, pageCount: textResult.total };
}

const PAGE_MARKER_RE = /^--\s*\d+\s+of\s+\d+\s*--$/;
const PAGE_NUMBER_RE = /^\d+\s*\/\s*\d+$/;

/**
 * Converts raw PDF text + optional structured tables into HTML.
 * 1. Detects and filters repeating header/footer lines
 * 2. Tab-separated lines → table rows (with continuation merging)
 * 3. Regular lines → paragraphs with heading detection
 */
function buildHtml(rawText: string, structuredTables: string[][][]): string {
  const repeatingLines = detectRepeatingLines(rawText);

  let tableIdx = 0;
  const lines = rawText.split("\n");
  const parts: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (shouldSkipLine(trimmed, repeatingLines)) {
      i++;
      continue;
    }

    if (trimmed.includes("\t")) {
      // Table block with continuation support
      const { tableRows, endIdx } = collectTableBlock(lines, i, repeatingLines);
      i = endIdx;

      if (tableIdx < structuredTables.length) {
        parts.push(renderTable(structuredTables[tableIdx]));
        tableIdx++;
      } else if (tableRows.length > 0) {
        parts.push(renderTable(tableRows));
      }
    } else {
      // Text block
      const textLines: string[] = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (!t) { i++; break; }
        if (t.includes("\t") && !repeatingLines.has(t)) break;
        if (shouldSkipLine(t, repeatingLines)) { i++; continue; }
        textLines.push(t);
        i++;
      }

      if (textLines.length === 1 && isHeading(textLines[0])) {
        parts.push(`<h2>${escapeHtml(textLines[0])}</h2>`);
      } else if (textLines.length > 0) {
        parts.push(`<p>${textLines.map(escapeHtml).join(" ")}</p>`);
      }
    }
  }

  // Append remaining structured tables
  while (tableIdx < structuredTables.length) {
    parts.push(renderTable(structuredTables[tableIdx]));
    tableIdx++;
  }

  return parts.join("\n");
}

/** Detect lines that repeat across 3+ pages (headers, footers, watermarks). */
function detectRepeatingLines(rawText: string): Set<string> {
  const pages = rawText.split(/--\s*\d+\s+of\s+\d+\s*--/);
  const linePageCount = new Map<string, number>();

  for (const page of pages) {
    const seenOnPage = new Set<string>();
    for (const line of page.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || PAGE_NUMBER_RE.test(trimmed) || PAGE_MARKER_RE.test(trimmed)) continue;
      if (!seenOnPage.has(trimmed)) {
        seenOnPage.add(trimmed);
        linePageCount.set(trimmed, (linePageCount.get(trimmed) || 0) + 1);
      }
    }
  }

  const repeating = new Set<string>();
  for (const [line, count] of linePageCount) {
    if (count >= 3) repeating.add(line);
  }
  return repeating;
}

function shouldSkipLine(trimmed: string, repeatingLines: Set<string>): boolean {
  return !trimmed || PAGE_MARKER_RE.test(trimmed) || PAGE_NUMBER_RE.test(trimmed) || repeatingLines.has(trimmed);
}

/**
 * Collects a table block starting from a tab-separated line.
 * Merges non-tab continuation lines into the previous row's last cell
 * when more tab lines follow within a look-ahead window.
 */
function collectTableBlock(
  lines: string[],
  startIdx: number,
  repeatingLines: Set<string>,
): { tableRows: string[][]; endIdx: number } {
  const tableRows: string[][] = [];
  let continuationBuffer: string[] = [];
  let i = startIdx;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (shouldSkipLine(trimmed, repeatingLines)) {
      i++;
      continue;
    }

    if (trimmed.includes("\t")) {
      // Flush continuation to previous row's last cell
      flushContinuation(tableRows, continuationBuffer);
      continuationBuffer = [];

      // New table row
      tableRows.push(trimmed.split("\t").map((c) => c.trim()));
      i++;
    } else {
      // Non-tab line: check if more tab lines follow (= cell content continuation)
      if (hasTabLineAhead(lines, i + 1, repeatingLines, 6)) {
        continuationBuffer.push(trimmed);
        i++;
      } else {
        // No more tab lines ahead → table has ended
        break;
      }
    }
  }

  // Flush any remaining continuation
  flushContinuation(tableRows, continuationBuffer);

  return { tableRows, endIdx: i };
}

function flushContinuation(tableRows: string[][], buffer: string[]): void {
  if (buffer.length > 0 && tableRows.length > 0) {
    const lastRow = tableRows[tableRows.length - 1];
    lastRow[lastRow.length - 1] += " " + buffer.join(" ");
  }
}

/**
 * Looks ahead up to maxNonTab non-empty, non-filtered lines
 * to find a tab-separated line. Skips repeating/marker lines.
 */
function hasTabLineAhead(
  lines: string[],
  startIdx: number,
  repeatingLines: Set<string>,
  maxNonTabLines: number,
): boolean {
  let nonTabCount = 0;
  for (let j = startIdx; j < lines.length && nonTabCount < maxNonTabLines; j++) {
    const t = lines[j].trim();
    if (!t || PAGE_MARKER_RE.test(t) || PAGE_NUMBER_RE.test(t) || repeatingLines.has(t)) continue;
    if (t.includes("\t")) return true;
    nonTabCount++;
  }
  return false;
}

function renderTable(rows: string[][]): string {
  if (!rows || rows.length === 0) return "";

  const htmlRows = rows.map((row, idx) => {
    const tag = idx === 0 ? "th" : "td";
    const cells = row.map((cell) => `<${tag}>${escapeHtml(cell)}</${tag}>`).join("");
    return `<tr>${cells}</tr>`;
  });

  return `<table>${htmlRows.join("")}</table>`;
}

function isHeading(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length > 80) return false;

  // Numbered sections: "1 DEFINITIONS", "5 Partner OBLIGATIONS", "6.1 INBOUND TRANSACTIONS"
  const numberedMatch = trimmed.match(/^(\d+(?:\.\d+)*)\s+(.+)$/);
  if (numberedMatch) {
    const textPart = numberedMatch[2];
    if (textPart.length <= 50 && /^[A-Z]/.test(textPart) && !/[,'".]/.test(textPart)) {
      return true;
    }
  }

  // All-caps titles: "RECITALS", "GME (C2C) REMITTANCE AGREEMENT"
  if (/^[A-Z][A-Z0-9\s()&\-\/]+$/.test(trimmed) && trimmed.length >= 3 && trimmed.length <= 60) {
    return true;
  }

  return false;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
