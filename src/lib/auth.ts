const AUTH_KEY = "college-review-auth";

function readAuthEmail(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem(AUTH_KEY) ?? sessionStorage.getItem(AUTH_KEY);
  } catch {
    return sessionStorage.getItem(AUTH_KEY);
  }
}

function writeAuthEmail(email: string): void {
  try {
    localStorage.setItem(AUTH_KEY, email);
  } catch {
    sessionStorage.setItem(AUTH_KEY, email);
  }
}

function clearAuthEmail(): void {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    // Ignore storage restrictions in private browsing.
  }

  try {
    sessionStorage.removeItem(AUTH_KEY);
  } catch {
    // Ignore storage restrictions in private browsing.
  }
}

export function isAuthenticated(): boolean {
  return !!readAuthEmail();
}

export function login(email: string): void {
  writeAuthEmail(email);
}

export function logout(): void {
  clearAuthEmail();
}

export function getAuthEmail(): string | null {
  return readAuthEmail();
}
