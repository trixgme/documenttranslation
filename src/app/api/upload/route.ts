import { NextRequest, NextResponse } from "next/server";
import { parseFile } from "@/lib/parsers";
import { SUPPORTED_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.` },
        { status: 400 }
      );
    }

    // Determine MIME type from file name if browser MIME type is unreliable
    const extension = file.name.split(".").pop()?.toLowerCase();
    let mimeType = file.type;

    if (!SUPPORTED_MIME_TYPES[mimeType]) {
      // Fallback: determine from extension
      const mimeMap: Record<string, string> = {
        pdf: "application/pdf",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        txt: "text/plain",
      };
      mimeType = mimeMap[extension || ""] || mimeType;
    }

    if (!SUPPORTED_MIME_TYPES[mimeType]) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${extension}. Supported: PDF, DOCX, TXT.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await parseFile(buffer, mimeType);

    if (!result.content.trim()) {
      return NextResponse.json(
        { success: false, error: "The file appears to be empty or contains no extractable text." },
        { status: 400 }
      );
    }

    const isPdf = mimeType === "application/pdf";

    return NextResponse.json({
      success: true,
      extractedContent: result.content,
      contentType: result.contentType,
      pageCount: result.pageCount,
      fileName: file.name,
      fileSize: file.size,
      originalFormat: SUPPORTED_MIME_TYPES[mimeType],
      ...(isPdf && { pdfBase64: buffer.toString("base64") }),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process the file. Please try again." },
      { status: 500 }
    );
  }
}
