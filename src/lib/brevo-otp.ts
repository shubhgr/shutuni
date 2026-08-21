import { createHash, randomBytes, timingSafeEqual } from "crypto";

export const EMAIL_OTP_PENDING_COOKIE = "email_otp_pending";
export const EMAIL_OTP_SESSION_COOKIE = "email_otp_session";

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export type EmailOtpPending = {
  email: string;
  hash: string;
  exp: number;
  attempts: number;
};

export type EmailOtpSession = {
  email: string;
  verifiedAt: number;
};

export function getBrevoConfig() {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
  const senderName =
    process.env.BREVO_SENDER_NAME?.trim() || "VerdictED";

  if (!apiKey) {
    throw new Error("Missing BREVO_API_KEY");
  }
  if (!senderEmail) {
    throw new Error(
      "Missing BREVO_SENDER_EMAIL — add a verified sender from Brevo"
    );
  }

  return { apiKey, senderEmail, senderName };
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

export function generateOtpCode() {
  const n = randomBytes(3).readUIntBE(0, 3) % 1_000_000;
  return n.toString().padStart(6, "0");
}

function otpPepper() {
  return process.env.BREVO_API_KEY?.trim() || "verdicted-otp";
}

export function hashOtp(email: string, code: string) {
  return createHash("sha256")
    .update(`${normalizeEmail(email)}:${code}:${otpPepper()}`)
    .digest("hex");
}

export function createPendingOtp(email: string, code: string): EmailOtpPending {
  return {
    email: normalizeEmail(email),
    hash: hashOtp(email, code),
    exp: Date.now() + OTP_TTL_MS,
    attempts: 0,
  };
}

export function encodePending(pending: EmailOtpPending) {
  return Buffer.from(JSON.stringify(pending), "utf8").toString("base64url");
}

export function decodePending(
  value: string | undefined
): EmailOtpPending | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8")
    ) as EmailOtpPending;
    if (
      !parsed?.email ||
      !parsed?.hash ||
      typeof parsed.exp !== "number" ||
      typeof parsed.attempts !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function encodeSession(session: EmailOtpSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

export function decodeSession(
  value: string | undefined
): EmailOtpSession | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8")
    ) as EmailOtpSession;
    if (!parsed?.email || typeof parsed.verifiedAt !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function verifyOtpCode(
  pending: EmailOtpPending,
  code: string
): { ok: true; session: EmailOtpSession } | { ok: false; reason: string; pending: EmailOtpPending } {
  if (Date.now() > pending.exp) {
    return { ok: false, reason: "Code expired. Request a new one.", pending };
  }
  if (pending.attempts >= MAX_ATTEMPTS) {
    return {
      ok: false,
      reason: "Too many attempts. Request a new code.",
      pending,
    };
  }

  const next: EmailOtpPending = {
    ...pending,
    attempts: pending.attempts + 1,
  };
  const expected = Buffer.from(pending.hash, "utf8");
  const actual = Buffer.from(hashOtp(pending.email, code.trim()), "utf8");
  if (
    expected.length !== actual.length ||
    !timingSafeEqual(expected, actual)
  ) {
    return { ok: false, reason: "Invalid code. Try again.", pending: next };
  }

  return {
    ok: true,
    session: { email: pending.email, verifiedAt: Date.now() },
  };
}

export async function sendOtpEmail(toEmail: string, code: string) {
  const { apiKey, senderEmail, senderName } = getBrevoConfig();
  const email = normalizeEmail(toEmail);

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email }],
      subject: `${code} is your VerdictED verification code`,
      textContent: `Your VerdictED verification code is ${code}.\n\nIt expires in 10 minutes. If you did not request this, you can ignore this email.`,
      htmlContent: `<p>Your VerdictED verification code is <strong style="font-size:20px;letter-spacing:2px">${code}</strong>.</p><p>It expires in 10 minutes. If you did not request this, you can ignore this email.</p>`,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Brevo send failed: ${detail}`);
  }
}

export const EMAIL_OTP_COOKIE_MAX_AGE = Math.floor(OTP_TTL_MS / 1000);
export const EMAIL_SESSION_COOKIE_MAX_AGE = 60 * 60;
