/** Demo helpers for review email verification until real domain data exists. */

const PERSONAL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "me.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
  "rediffmail.com",
  "zoho.com",
]);

export type EmailDomainKind = "institutional" | "personal" | "unknown";

export function getEmailDomain(email: string): string {
  const at = email.lastIndexOf("@");
  if (at < 0) return "";
  return email.slice(at + 1).trim().toLowerCase();
}

export function classifyEmailDomain(email: string): EmailDomainKind {
  const domain = getEmailDomain(email);
  if (!domain) return "unknown";
  if (PERSONAL_DOMAINS.has(domain)) return "personal";

  // Common education / institution patterns in India & globally.
  if (
    domain.endsWith(".edu") ||
    domain.endsWith(".edu.in") ||
    domain.endsWith(".ac.in") ||
    domain.endsWith(".ac.uk") ||
    domain.includes(".edu.") ||
    domain.includes(".ac.")
  ) {
    return "institutional";
  }

  return "unknown";
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
