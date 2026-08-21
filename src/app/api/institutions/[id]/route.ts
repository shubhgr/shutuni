import { NextResponse } from "next/server";

import { fetchInstitutionDetail } from "@/lib/institutions-api";
import { withReviewAverages } from "@/lib/review-averages";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state") ?? undefined;

  try {
    const institution = await fetchInstitutionDetail(id, state);
    const [withAverage] = await withReviewAverages([institution]);
    return NextResponse.json(withAverage ?? institution);
  } catch {
    return NextResponse.json(
      { error: "Institution not found" },
      { status: 404 }
    );
  }
}
