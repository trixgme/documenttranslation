import { NextRequest, NextResponse } from "next/server";
import { translateContentStream } from "@/lib/translation";
import type { TranslationRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: TranslationRequest = await request.json();

    if (!body.extractedContent || !body.targetLanguage) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: extractedContent, targetLanguage." },
        { status: 400 }
      );
    }

    const provider = body.provider || "claude";

    if (provider === "claude") {
      if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your-anthropic-api-key-here") {
        return NextResponse.json(
          { success: false, error: "Anthropic API key is not configured. Please set ANTHROPIC_API_KEY in .env.local." },
          { status: 500 }
        );
      }
    } else {
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your-openai-api-key-here") {
        return NextResponse.json(
          { success: false, error: "OpenAI API key is not configured. Please set OPENAI_API_KEY in .env.local." },
          { status: 500 }
        );
      }
    }

    const contentType = body.contentType || "text";

    console.log("[translate] provider:", provider, "contentType:", contentType, "hasPdfBase64:", !!body.pdfBase64, "contentLength:", body.extractedContent.length);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullOutput = "";
        try {
          const generator = translateContentStream({
            content: body.extractedContent,
            contentType,
            targetLanguage: body.targetLanguage,
            sourceLanguage: body.sourceLanguage,
            provider,
            pdfBase64: body.pdfBase64,
          });

          for await (const event of generator) {
            if (event.type === "token") {
              fullOutput += event.data;
            }
            if (event.type === "done") {
              console.log("[translate] DONE. Output length:", fullOutput.length);
              console.log("[translate] Has <table>:", fullOutput.includes("<table"));
              console.log("[translate] Has <tr>:", fullOutput.includes("<tr"));
              console.log("[translate] First 500 chars:", fullOutput.substring(0, 500));
            }
            // SSE spec: multi-line data needs each line prefixed with "data:"
            const dataLines = event.data.split("\n").map((line: string) => `data: ${line}`).join("\n");
            const sseMessage = `event: ${event.type}\n${dataLines}\n\n`;
            controller.enqueue(encoder.encode(sseMessage));
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Translation failed.";
          const errorEvent = `event: error\ndata: ${JSON.stringify({ error: message })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Translation error:", error);
    const message = error instanceof Error ? error.message : "Translation failed.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
