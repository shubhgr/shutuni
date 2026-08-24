import { get } from "@vercel/blob";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSession,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const jar = await cookies();
  if (!isValidAdminSession(jar.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url).searchParams.get("url")?.trim();
  if (!url) {
    return NextResponse.json({ error: "Missing document url." }, { status: 400 });
  }

  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
      return NextResponse.json(
        { error: "Document storage is not configured." },
        { status: 500 }
      );
    }

    const result = await get(url, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const headers = new Headers();
    const contentType =
      result.blob.contentType ||
      result.headers.get("content-type") ||
      "application/octet-stream";
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "private, max-age=60");

    const filename = result.blob.pathname.split("/").pop();
    if (filename) {
      headers.set(
        "Content-Disposition",
        `inline; filename="${filename.replace(/"/g, "")}"`
      );
    }

    return new NextResponse(result.stream, { headers });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load document",
      },
      { status: 500 }
    );
  }
}
