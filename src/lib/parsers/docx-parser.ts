import mammoth from "mammoth";

export async function parseDocx(buffer: Buffer): Promise<{
  html: string;
  rawText: string;
}> {
  const htmlResult = await mammoth.convertToHtml({ buffer });
  const textResult = await mammoth.extractRawText({ buffer });
  return {
    html: htmlResult.value,
    rawText: textResult.value,
  };
}
