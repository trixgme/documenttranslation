import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  WidthType,
  BorderStyle,
} from "docx";
import { parseHtmlToElements } from "./html-utils";

function getHeadingLevel(level: number): (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined {
  const map: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
    5: HeadingLevel.HEADING_5,
    6: HeadingLevel.HEADING_6,
  };
  return map[level];
}

function createTextRuns(runs: Array<{ text: string; bold?: boolean; italic?: boolean }>): TextRun[] {
  return runs.map(
    (r) =>
      new TextRun({
        text: r.text,
        bold: r.bold,
        italics: r.italic,
      })
  );
}

export async function generateDocx(content: string, contentType: string): Promise<Buffer> {
  // Auto-detect HTML even if contentType says "text"
  if (contentType !== "html" && /<(?:table|h[1-6]|p)\b/i.test(content)) {
    contentType = "html";
  }

  let children: (Paragraph | Table)[];

  if (contentType === "html") {
    const elements = parseHtmlToElements(content);
    children = elements.map((el) => {
      switch (el.type) {
        case "heading":
          return new Paragraph({
            heading: getHeadingLevel(el.level || 1),
            children: createTextRuns(el.runs || []),
          });
        case "table": {
          const rows = el.rows || [];
          const maxCols = Math.max(...rows.map((r) => r.length), 1);
          return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: rows.map(
              (row) =>
                new TableRow({
                  children: Array.from({ length: maxCols }, (_, i) =>
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: row[i]?.text || "",
                              bold: row[i]?.bold,
                            }),
                          ],
                        }),
                      ],
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1 },
                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1 },
                      },
                    })
                  ),
                })
            ),
          });
        }
        case "list-item":
          return new Paragraph({
            bullet: { level: 0 },
            children: createTextRuns(el.runs || []),
          });
        default:
          return new Paragraph({
            children: createTextRuns(el.runs || []),
          });
      }
    });
  } else {
    children = content.split("\n\n").map(
      (para) =>
        new Paragraph({
          children: [new TextRun(para.replace(/\n/g, " "))],
        })
    );
  }

  if (children.length === 0) {
    children = [new Paragraph({ children: [new TextRun("")] })];
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
