/**
 * Utilities to generate and manage cryptographic nonces for Google Identity Services / One Tap
 * and Supabase Authentication.
 *
 * In OpenID Connect:
 * 1. Google Identity Services requires the SHA-256 hexadecimal digest of the nonce during
 *    initialization: `google.accounts.id.initialize({ ..., nonce: hashedNonce })`.
 * 2. Supabase Auth (`signInWithIdToken`) requires the raw unhashed nonce:
 *    `supabase.auth.signInWithIdToken({ provider: 'google', token, nonce: rawNonce })`.
 *    Supabase hashes the provided raw nonce and verifies it matches the nonce claim embedded
 *    in Google's ID token.
 */

const NONCE_STORAGE_KEY = "botock_google_auth_nonce";

export async function generateAuthNonce(): Promise<{ nonce: string; hashedNonce: string }> {
  // Generate 32 cryptographically random bytes
  const rawBytes = new Uint8Array(32);
  crypto.getRandomValues(rawBytes);
  const rawNonce = btoa(String.fromCharCode(...rawBytes));

  // Compute SHA-256 digest
  const encoder = new TextEncoder();
  const encodedNonce = encoder.encode(rawNonce);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return { nonce: rawNonce, hashedNonce };
}

export function storeAuthNonce(nonce: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(NONCE_STORAGE_KEY, nonce);
  } catch {
    // Gracefully handle restricted storage (e.g. private mode, disabled cookies)
  }
}

export function getStoredAuthNonce(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(NONCE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearStoredAuthNonce(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(NONCE_STORAGE_KEY);
  } catch {}
}
