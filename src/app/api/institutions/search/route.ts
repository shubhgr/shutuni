import { NextResponse } from "next/server";

import {
  ALL_STATES_NAME,
  searchInstitutions,
} from "@/lib/institutions-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const state = searchParams.get("state") ?? ALL_STATES_NAME;
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "25");

  if (!q.trim()) {
    return NextResponse.json({ total: 0, page: 1, limit, results: [] });
  }

  try {
    const data = await searchInstitutions(q, state, page, limit);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to search institutions" },
      { status: 500 }
    );
  }
}
