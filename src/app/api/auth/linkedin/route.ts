import { NextResponse } from "next/server";

import {
  LINKEDIN_STATE_COOKIE,
  buildLinkedInAuthorizeUrl,
  createOAuthState,
} from "@/lib/linkedin-oauth";

export async function GET() {
  try {
    const state = createOAuthState();
    const url = buildLinkedInAuthorizeUrl(state);
    const response = NextResponse.redirect(url);
    response.cookies.set(LINKEDIN_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10,
    });
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "LinkedIn is not configured";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
