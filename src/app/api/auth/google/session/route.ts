import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  GOOGLE_SESSION_COOKIE,
  GOOGLE_STATE_COOKIE,
  decodeSession,
} from "@/lib/google-oauth";

export async function GET() {
  const jar = await cookies();
  const session = decodeSession(jar.get(GOOGLE_SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }
  return NextResponse.json({
    connected: true,
    name: session.name,
    email: session.email ?? null,
  });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true, connected: false });
  res.cookies.delete(GOOGLE_SESSION_COOKIE);
  res.cookies.delete(GOOGLE_STATE_COOKIE);
  return res;
}
