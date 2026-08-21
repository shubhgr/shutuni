import { NextResponse } from "next/server";

import {
  EMAIL_OTP_COOKIE_MAX_AGE,
  EMAIL_OTP_PENDING_COOKIE,
  createPendingOtp,
  encodePending,
  generateOtpCode,
  isValidEmail,
  normalizeEmail,
  sendOtpEmail,
} from "@/lib/brevo-otp";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
    };
    const email = normalizeEmail(body.email ?? "");

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    const code = generateOtpCode();
    await sendOtpEmail(email, code);

    const pending = createPendingOtp(email, code);
    const res = NextResponse.json({ ok: true, email });
    res.cookies.set(EMAIL_OTP_PENDING_COOKIE, encodePending(pending), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: EMAIL_OTP_COOKIE_MAX_AGE,
    });
    return res;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send verification code";
    const status =
      message.includes("Missing BREVO") || message.includes("BREVO_SENDER")
        ? 500
        : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
