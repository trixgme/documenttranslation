import { NextRequest, NextResponse } from "next/server";
import { generateFile } from "@/lib/generators";
import type { GenerateRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    if (!body.translatedContent || !body.outputFormat) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: translatedContent, outputFormat." },
        { status: 400 }
      );
    }

    // Auto-detect HTML: if content contains HTML table/heading tags, treat as HTML
    let contentType = body.contentType || "text";
    if (contentType !== "html" && /<(?:table|h[1-6]|p)\b/i.test(body.translatedContent)) {
      console.log("[generate] Auto-detected HTML content (was:", contentType, ")");
      contentType = "html";
    }
    console.log("[generate] contentType:", contentType, "format:", body.outputFormat, "contentLength:", body.translatedContent.length);
    console.log("[generate] content preview:", body.translatedContent.substring(0, 300));

    const result = await generateFile(
      body.translatedContent,
      contentType,
      body.outputFormat
    );

    const originalName = body.fileName?.replace(/\.[^.]+$/, "") || "translated";
    const outputFileName = `${originalName}_translated.${result.extension}`;

    const responseBuffer = result.buffer instanceof Uint8Array
      ? Buffer.from(result.buffer)
      : result.buffer;

    return new NextResponse(responseBuffer, {
      status: 200,
      headers: {
        "Content-Type": result.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(outputFileName)}"`,
      },
    });
  } catch (error) {
    console.error("Generate error:", error);
    const message = error instanceof Error ? error.message : "File generation failed.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
