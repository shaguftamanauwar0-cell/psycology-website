import crypto from "crypto";

/**
 * Minimal signed-cookie session for the single shared admin password.
 * The cookie holds `admin:<expiry-ms>` plus an HMAC signature, so it
 * can't be forged without ADMIN_SESSION_SECRET.
 */

export const ADMIN_COOKIE = "sm_admin";

function secret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "insecure-dev-secret-change-me"
  );
}

function sign(value: string): string {
  const mac = crypto
    .createHmac("sha256", secret())
    .update(value)
    .digest("base64url");
  return `${value}.${mac}`;
}

/** Create a signed session token valid for `days`. */
export function makeSession(days = 7): string {
  const expiry = Date.now() + days * 24 * 60 * 60 * 1000;
  return sign(`admin:${expiry}`);
}

/** Verify a session token from the cookie. */
export function verifySession(token: string | undefined | null): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return false;
  const value = token.slice(0, dot);
  // constant-time-ish comparison via re-sign
  if (sign(value) !== token) return false;
  const expiry = Number(value.split(":")[1]);
  return Number.isFinite(expiry) && expiry > Date.now();
}

/** Read the admin cookie out of a raw Cookie header. */
export function readAdminCookie(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === ADMIN_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

/** True when the request carries a valid admin session. */
export function isAdminRequest(request: Request): boolean {
  const token = readAdminCookie(request.headers.get("cookie"));
  return verifySession(token);
}

/** Check a submitted password against the configured admin password. */
export function passwordMatches(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
