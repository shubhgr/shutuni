import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
  isAdminPasswordConfigured,
  isValidAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    if (!isAdminPasswordConfigured()) {
      return NextResponse.json(
        { error: "ADMIN_PASSWORD is not configured on the server." },
        { status: 500 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      password?: string;
    };
    const password = String(body.password ?? "");

    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    });
    return res;
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to sign in",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_SESSION_COOKIE);
  return res;
}

export async function GET() {
  const jar = await cookies();
  return NextResponse.json({
    authenticated: isValidAdminSession(jar.get(ADMIN_SESSION_COOKIE)?.value),
  });
}
