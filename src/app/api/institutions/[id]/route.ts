import { NextResponse } from "next/server";

import { fetchInstitutionDetail } from "@/lib/institutions-api";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state") ?? undefined;

  try {
    const institution = await fetchInstitutionDetail(id, state);
    return NextResponse.json(institution);
  } catch {
    return NextResponse.json(
      { error: "Institution not found" },
      { status: 404 }
    );
  }
}
