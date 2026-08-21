import { createHash, randomBytes } from "crypto";

export const LINKEDIN_STATE_COOKIE = "li_oauth_state";
export const LINKEDIN_SESSION_COOKIE = "li_verify_session";

export type LinkedInSession = {
  name: string;
  email?: string;
  sub: string;
};

export function getLinkedInConfig() {
  const clientId = process.env.LINKEDIN_CLIENT_ID?.trim();
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET?.trim();
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI?.trim();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, or LINKEDIN_REDIRECT_URI"
    );
  }

  return { clientId, clientSecret, redirectUri };
}

export function createOAuthState() {
  return randomBytes(24).toString("hex");
}

export function buildLinkedInAuthorizeUrl(state: string) {
  const { clientId, redirectUri } = getLinkedInConfig();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: "openid profile email",
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

export async function exchangeLinkedInCode(code: string) {
  const { clientId, clientSecret, redirectUri } = getLinkedInConfig();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text();
    throw new Error(`LinkedIn token exchange failed: ${detail}`);
  }

  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    id_token?: string;
  };

  if (!tokenJson.access_token) {
    throw new Error("LinkedIn token response missing access_token");
  }

  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });

  if (!profileRes.ok) {
    const detail = await profileRes.text();
    throw new Error(`LinkedIn userinfo failed: ${detail}`);
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
    throw new Error("LinkedIn profile missing name or subject");
  }

  const session: LinkedInSession = {
    sub: profile.sub,
    name,
    email: profile.email,
  };

  return session;
}

export function encodeSession(session: LinkedInSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

export function decodeSession(value: string | undefined): LinkedInSession | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8")
    ) as LinkedInSession;
    if (!parsed?.name || !parsed?.sub) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Opaque fingerprint for client-side cache busting only (not a secret). */
export function sessionFingerprint(session: LinkedInSession) {
  return createHash("sha256").update(session.sub).digest("hex").slice(0, 12);
}
