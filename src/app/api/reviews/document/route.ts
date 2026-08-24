import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import {
  REVIEW_DOCUMENT_MAX_BYTES,
  sanitizeDocumentFilename,
  validateReviewDocument,
} from "@/lib/review-document";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
      return NextResponse.json(
        {
          error:
            "Document storage is not configured (missing BLOB_READ_WRITE_TOKEN).",
        },
        { status: 500 }
      );
    }

    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded." },
        { status: 400 }
      );
    }

    const validationError = validateReviewDocument(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const safeName = sanitizeDocumentFilename(file.name);
    const pathname = `review-docs/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

    const blob = await put(pathname, file, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: file.type || undefined,
      addRandomSuffix: false,
    });

    return NextResponse.json({
      ok: true,
      url: blob.url,
      pathname: blob.pathname,
      filename: file.name,
      size: file.size,
      contentType: file.type || null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload document";
    // Helpful hint when over Blob size/op limits
    if (message.toLowerCase().includes("too large")) {
      return NextResponse.json(
        {
          error: `File must be ${REVIEW_DOCUMENT_MAX_BYTES / 1024} KB or smaller.`,
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
