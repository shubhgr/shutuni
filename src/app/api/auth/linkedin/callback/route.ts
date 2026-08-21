import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  LINKEDIN_SESSION_COOKIE,
  LINKEDIN_STATE_COOKIE,
  encodeSession,
  exchangeLinkedInCode,
} from "@/lib/linkedin-oauth";

function popupResultHtml(ok: boolean, message: string) {
  const payload = JSON.stringify({ type: "linkedin-auth", ok, message });
  return `<!DOCTYPE html>
<html lang="en">
  <head><meta charset="utf-8" /><title>LinkedIn</title></head>
  <body>
    <p>${ok ? "Connected. You can close this window." : "Connection failed."}</p>
    <script>
      (function () {
        var payload = ${payload};
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(payload, window.location.origin);
          }
        } catch (e) {}
        window.close();
        setTimeout(function () {
          if (!window.closed) {
            window.location.replace(payload.ok ? "/review?linkedin=connected" : "/review?linkedin=error");
          }
        }, 400);
      })();
    </script>
  </body>
</html>`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const jar = await cookies();
  const expectedState = jar.get(LINKEDIN_STATE_COOKIE)?.value;

  if (oauthError) {
    const html = popupResultHtml(
      false,
      searchParams.get("error_description") || oauthError
    );
    const res = new NextResponse(html, {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
    res.cookies.delete(LINKEDIN_STATE_COOKIE);
    return res;
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    const html = popupResultHtml(false, "Invalid or expired LinkedIn login.");
    const res = new NextResponse(html, {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
    res.cookies.delete(LINKEDIN_STATE_COOKIE);
    return res;
  }

  try {
    const session = await exchangeLinkedInCode(code);
    const html = popupResultHtml(true, "LinkedIn verified");
    const res = new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
    res.cookies.delete(LINKEDIN_STATE_COOKIE);
    res.cookies.set(LINKEDIN_SESSION_COOKIE, encodeSession(session), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60,
    });
    return res;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "LinkedIn verification failed";
    const html = popupResultHtml(false, message);
    const res = new NextResponse(html, {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
    res.cookies.delete(LINKEDIN_STATE_COOKIE);
    return res;
  }
}
