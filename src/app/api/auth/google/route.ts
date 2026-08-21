import { NextResponse } from "next/server";

import {
  GOOGLE_STATE_COOKIE,
  buildGoogleAuthorizeUrl,
  createOAuthState,
} from "@/lib/google-oauth";

export async function GET() {
  try {
    const state = createOAuthState();
    const url = buildGoogleAuthorizeUrl(state);
    const response = NextResponse.redirect(url);
    response.cookies.set(GOOGLE_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10,
    });
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Google is not configured";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
