import { NextResponse } from "next/server";

import { fetchStates } from "@/lib/institutions-api";

export async function GET() {
  try {
    const states = await fetchStates();
    return NextResponse.json({ states });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch states" },
      { status: 500 }
    );
  }
}
