/**
 * Shared HTML utilities for generators.
 * Cleans Claude output and parses HTML into structured elements.
 */

export interface ParsedElement {
  type: "heading" | "paragraph" | "table" | "list-item";
  level?: number;
  runs?: Array<{ text: string; bold?: boolean; italic?: boolean }>;
  rows?: Array<Array<{ text: string; bold?: boolean }>>;
}

/**
 * Cleans raw Claude output:
 * - Strips markdown code fences (```html ... ```)
 * - Trims whitespace
 */
export function cleanHtml(raw: string): string {
  let cleaned = raw.trim();

  // Strip markdown code fences: ```html\n...\n``` or ```\n...\n```
  cleaned = cleaned.replace(/^```(?:html|HTML)?\s*\n?/m, "");
  cleaned = cleaned.replace(/\n?```\s*$/m, "");

  return cleaned.trim();
}

/**
 * Parses HTML string into structured elements.
 * Handles tables by extracting them first to prevent split breakage.
 */
export function parseHtmlToElements(rawHtml: string): ParsedElement[] {
  const html = cleanHtml(rawHtml);
  const elements: ParsedElement[] = [];

  // Step 1: Extract complete <table>...</table> blocks
  // Use a manual approach to handle nested tags inside cells
  const tables: string[] = [];
  const withPlaceholders = extractTables(html, tables);

  // Step 2: Split remaining content by block elements
  const blocks = withPlaceholders.split(/(?=<(?:h[1-6]|p|ul|ol|li)[>\s])|(?<=<\/(?:h[1-6]|p|ul|ol|li)>)/i);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Table placeholder (standalone)
    const placeholderMatch = trimmed.match(/^__TABLE_(\d+)__$/);
    if (placeholderMatch) {
      const rows = parseTableHtml(tables[parseInt(placeholderMatch[1])]);
      if (rows.length > 0) {
        elements.push({ type: "table", rows });
      }
      continue;
    }

    // Table placeholder mixed with other content
    if (trimmed.includes("__TABLE_")) {
      const parts = trimmed.split(/(__TABLE_\d+__)/);
      for (const part of parts) {
        const pm = part.match(/^__TABLE_(\d+)__$/);
        if (pm) {
          const rows = parseTableHtml(tables[parseInt(pm[1])]);
          if (rows.length > 0) elements.push({ type: "table", rows });
        } else {
          const text = stripAllHtml(part);
          if (text.trim()) elements.push({ type: "paragraph", runs: [{ text }] });
        }
      }
      continue;
    }

    // Heading
    const headingMatch = trimmed.match(/^<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/i);
    if (headingMatch) {
      elements.push({
        type: "heading",
        level: parseInt(headingMatch[1]),
        runs: parseInlineElements(headingMatch[2]),
      });
      continue;
    }

    // List item
    if (trimmed.match(/^<li[^>]*>/i)) {
      const content = trimmed.replace(/<\/?li[^>]*>/gi, "").trim();
      elements.push({
        type: "list-item",
        runs: parseInlineElements(content),
      });
      continue;
    }

    // Paragraph
    const pMatch = trimmed.match(/^<p[^>]*>([\s\S]*?)<\/p>/i);
    if (pMatch) {
      elements.push({
        type: "paragraph",
        runs: parseInlineElements(pMatch[1]),
      });
      continue;
    }

    // Plain text fallback
    const plainText = stripAllHtml(trimmed);
    if (plainText.trim()) {
      elements.push({
        type: "paragraph",
        runs: [{ text: plainText }],
      });
    }
  }

  return elements;
}

/**
 * Extracts <table>...</table> blocks, handling the fact that
 * cells may contain other tags. Uses a depth counter for correctness.
 */
function extractTables(html: string, tables: string[]): string {
  let result = "";
  let i = 0;

  while (i < html.length) {
    const tableStart = html.indexOf("<table", i);
    if (tableStart === -1) {
      result += html.substring(i);
      break;
    }

    // Add content before the table
    result += html.substring(i, tableStart);

    // Find matching </table> with depth counting
    let depth = 0;
    let j = tableStart;
    let tableEnd = -1;

    while (j < html.length) {
      const nextOpen = html.indexOf("<table", j + 1);
      const nextClose = html.indexOf("</table>", j);

      if (nextClose === -1) {
        // No closing tag found, take rest
        tableEnd = html.length;
        break;
      }

      if (nextOpen !== -1 && nextOpen < nextClose) {
        // Nested table opens before this one closes
        depth++;
        j = nextOpen + 1;
      } else {
        if (depth === 0) {
          tableEnd = nextClose + "</table>".length;
          break;
        }
        depth--;
        j = nextClose + 1;
      }
    }

    if (tableEnd === -1) tableEnd = html.length;

    const tableHtml = html.substring(tableStart, tableEnd);
    tables.push(tableHtml);
    result += `__TABLE_${tables.length - 1}__`;
    i = tableEnd;
  }

  return result;
}

function parseTableHtml(tableHtml: string): Array<Array<{ text: string; bold?: boolean }>> {
  const rows: Array<Array<{ text: string; bold?: boolean }>> = [];
  const rowMatches = tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
  for (const rowMatch of rowMatches) {
    const cells: Array<{ text: string; bold?: boolean }> = [];
    const cellMatches = rowMatch[1].matchAll(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi);
    for (const cellMatch of cellMatches) {
      const isHeader = cellMatch[0].startsWith("<th");
      cells.push({ text: stripAllHtml(cellMatch[1]), bold: isHeader });
    }
    if (cells.length > 0) rows.push(cells);
  }
  return rows;
}

function parseInlineElements(html: string): Array<{ text: string; bold?: boolean; italic?: boolean }> {
  const runs: Array<{ text: string; bold?: boolean; italic?: boolean }> = [];
  let remaining = html;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^([\s\S]*?)<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/i);
    if (boldMatch) {
      if (boldMatch[1]) runs.push({ text: stripAllHtml(boldMatch[1]) });
      runs.push({ text: stripAllHtml(boldMatch[2]), bold: true });
      remaining = remaining.substring(boldMatch[0].length);
      continue;
    }

    const italicMatch = remaining.match(/^([\s\S]*?)<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/i);
    if (italicMatch) {
      if (italicMatch[1]) runs.push({ text: stripAllHtml(italicMatch[1]) });
      runs.push({ text: stripAllHtml(italicMatch[2]), italic: true });
      remaining = remaining.substring(italicMatch[0].length);
      continue;
    }

    runs.push({ text: stripAllHtml(remaining) });
    break;
  }

  return runs.filter((r) => r.text.trim());
}

export function stripAllHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}
