import { randomBytes } from "crypto";

export const GOOGLE_STATE_COOKIE = "google_oauth_state";
export const GOOGLE_SESSION_COOKIE = "google_verify_session";

export type GoogleSession = {
  name: string;
  email?: string;
  sub: string;
};

export function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REDIRECT_URI"
    );
  }

  return { clientId, clientSecret, redirectUri };
}

export function createOAuthState() {
  return randomBytes(24).toString("hex");
}

export function buildGoogleAuthorizeUrl(state: string) {
  const { clientId, redirectUri } = getGoogleConfig();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: "openid email profile",
    prompt: "select_account",
    access_type: "online",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string) {
  const { clientId, clientSecret, redirectUri } = getGoogleConfig();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text();
    throw new Error(`Google token exchange failed: ${detail}`);
  }

  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  if (!tokenJson.access_token) {
    throw new Error("Google token response missing access_token");
  }

  const profileRes = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    }
  );

  if (!profileRes.ok) {
    const detail = await profileRes.text();
    throw new Error(`Google userinfo failed: ${detail}`);
  }

  const profile = (await profileRes.json()) as {
    sub?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    email?: string;
  };

  const name =
    profile.name?.trim() ||
    [profile.given_name, profile.family_name].filter(Boolean).join(" ").trim();

  if (!profile.sub || !name) {
    throw new Error("Google profile missing name or subject");
  }

  return {
    sub: profile.sub,
    name,
    email: profile.email,
  } satisfies GoogleSession;
}

export function encodeSession(session: GoogleSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

export function decodeSession(value: string | undefined): GoogleSession | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8")
    ) as GoogleSession;
    if (!parsed?.name || !parsed?.sub) return null;
    return parsed;
  } catch {
    return null;
  }
}
