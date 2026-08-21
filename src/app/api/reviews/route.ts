import { NextResponse } from "next/server";

import { isReviewSubmitPayload } from "@/lib/review-types";
import { saveReview } from "@/lib/save-review";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isReviewSubmitPayload(body)) {
    return NextResponse.json({ error: "Invalid review payload" }, { status: 400 });
  }

  if (!body.institutionId.trim() || !body.institutionName.trim()) {
    return NextResponse.json(
      { error: "Institution is required" },
      { status: 400 }
    );
  }
  if (!body.overallSentiment || !body.recommend) {
    return NextResponse.json(
      { error: "Review content is incomplete" },
      { status: 400 }
    );
  }
  if (!body.verification.displayName.trim()) {
    return NextResponse.json(
      { error: "Display name is required" },
      { status: 400 }
    );
  }

  try {
    const saved = await saveReview(body);
    return NextResponse.json({ ok: true, id: saved.id });
  } catch (error) {
    console.error("Failed to save review", error);
    const message =
      error instanceof Error ? error.message : "Failed to save review";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
