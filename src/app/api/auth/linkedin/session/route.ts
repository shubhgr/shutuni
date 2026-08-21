import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  LINKEDIN_SESSION_COOKIE,
  decodeSession,
} from "@/lib/linkedin-oauth";

export async function GET() {
  const jar = await cookies();
  const session = decodeSession(jar.get(LINKEDIN_SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }
  return NextResponse.json({
    connected: true,
    name: session.name,
    email: session.email ?? null,
  });
}
