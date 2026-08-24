import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) {
    throw new Error("Missing ADMIN_PASSWORD");
  }
  return password;
}

export function isAdminPasswordConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

export function verifyAdminPassword(input: string) {
  const expected = Buffer.from(getAdminPassword(), "utf8");
  const actual = Buffer.from(input, "utf8");
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export function createAdminSessionToken() {
  const secret = getAdminPassword();
  const exp = Date.now() + ADMIN_SESSION_MAX_AGE * 1000;
  const payload = `admin:${exp}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ payload, sig }), "utf8").toString(
    "base64url"
  );
}

export function isValidAdminSession(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const secret = getAdminPassword();
    const parsed = JSON.parse(
      Buffer.from(token, "base64url").toString("utf8")
    ) as { payload?: string; sig?: string };
    if (!parsed.payload || !parsed.sig) return false;
    const expectedSig = createHmac("sha256", secret)
      .update(parsed.payload)
      .digest("hex");
    const a = Buffer.from(expectedSig, "utf8");
    const b = Buffer.from(parsed.sig, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
    const exp = Number(parsed.payload.split(":")[1]);
    return Number.isFinite(exp) && Date.now() < exp;
  } catch {
    return false;
  }
}
