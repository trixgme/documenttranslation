export async function parseTxt(buffer: Buffer): Promise<{
  text: string;
}> {
  return {
    text: buffer.toString("utf-8"),
  };
}
