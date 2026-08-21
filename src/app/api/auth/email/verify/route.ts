import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  EMAIL_OTP_COOKIE_MAX_AGE,
  EMAIL_OTP_PENDING_COOKIE,
  EMAIL_OTP_SESSION_COOKIE,
  EMAIL_SESSION_COOKIE_MAX_AGE,
  decodePending,
  decodeSession,
  encodePending,
  encodeSession,
  verifyOtpCode,
} from "@/lib/brevo-otp";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      code?: string;
    };
    const code = String(body.code ?? "").trim();

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Enter the 6-digit verification code." },
        { status: 400 }
      );
    }

    const jar = await cookies();
    const pending = decodePending(jar.get(EMAIL_OTP_PENDING_COOKIE)?.value);
    if (!pending) {
      return NextResponse.json(
        { error: "No pending code. Request a new one." },
        { status: 400 }
      );
    }

    const result = verifyOtpCode(pending, code);
    if (!result.ok) {
      const res = NextResponse.json({ error: result.reason }, { status: 400 });
      if (result.reason.includes("expired") || result.reason.includes("Too many")) {
        res.cookies.delete(EMAIL_OTP_PENDING_COOKIE);
      } else {
        res.cookies.set(
          EMAIL_OTP_PENDING_COOKIE,
          encodePending(result.pending),
          {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: EMAIL_OTP_COOKIE_MAX_AGE,
          }
        );
      }
      return res;
    }

    const res = NextResponse.json({
      ok: true,
      email: result.session.email,
    });
    res.cookies.delete(EMAIL_OTP_PENDING_COOKIE);
    res.cookies.set(
      EMAIL_OTP_SESSION_COOKIE,
      encodeSession(result.session),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: EMAIL_SESSION_COOKIE_MAX_AGE,
      }
    );
    return res;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to verify code",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const jar = await cookies();
  const session = decodeSession(jar.get(EMAIL_OTP_SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }
  return NextResponse.json({
    connected: true,
    email: session.email,
  });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(EMAIL_OTP_PENDING_COOKIE);
  res.cookies.delete(EMAIL_OTP_SESSION_COOKIE);
  return res;
}
