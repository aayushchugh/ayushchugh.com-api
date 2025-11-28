import crypto from "crypto";

/**
 * Generates a cryptographically secure random state token for OAuth CSRF protection
 * @returns A base64-encoded random state token
 */
export function generateStateToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}
