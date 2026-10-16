export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'https://botock.app';
}

export function sanitizeRedirectUrl(url: string | null | undefined, fallback: string = "/"): string {
  if (!url) return fallback;
  const trimmed = url.trim();
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("/\\") &&
    !trimmed.includes("://") &&
    !trimmed.includes("@")
  ) {
    return trimmed;
  }
  return fallback;
}


const HEALTH_CHECK_TIMEOUT_MS = 1_000;
// Cache healthy/fallback backend selection for 60s so UI actions remain instantaneous
const HEALTH_CHECK_CACHE_MS = 60_000;

let cachedBackendUrl: string | null = null;
let backendUrlCheckedAt = 0;
let backendUrlRequest: Promise<string> | null = null;

function withoutTrailingSlash(url: string) {
  return url.replace(/\/$/, '');
}

function getPrimaryBackendUrl() {
  const configured = process.env.NEXT_PUBLIC_BACKEND_URL;

  // When running in a browser on HTTPS (production), always use the
  // same-origin Next.js proxy to avoid CORS errors entirely.
  // The proxy rewrites /api/proxy/* → backend/* server-side.
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return '/api/proxy';
  }

  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
  }

  if (configured) {
    return withoutTrailingSlash(configured);
  }

  return '';
}

async function isBackendHealthy(backendUrl: string) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(`${backendUrl}/health`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

/**
 * Uses Azure first. If it is unavailable, safely fails over to the configured
 * laptop tunnel and then Colab tunnel. All backends must share the same
 * Supabase queue/database; only workers may differ.
 */
export async function getBackendUrl() {
  const primaryBackendUrl = getPrimaryBackendUrl();
  const laptopBackendUrl = process.env.NEXT_PUBLIC_LAPTOP_BACKEND_URL;
  const colabBackendUrl = process.env.NEXT_PUBLIC_COLAB_BACKEND_URL;

  if (typeof window === 'undefined') {
    return primaryBackendUrl || getSiteUrl();
  }

  const now = Date.now();
  if (cachedBackendUrl !== null && now - backendUrlCheckedAt < HEALTH_CHECK_CACHE_MS) {
    return cachedBackendUrl;
  }

  if (!backendUrlRequest) {
    backendUrlRequest = (async () => {
      const localUrl = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8000'
        : null;
      const candidates = [primaryBackendUrl, localUrl, laptopBackendUrl, colabBackendUrl]
        .filter((url): url is string => Boolean(url))
        .map(withoutTrailingSlash);

      // Run health checks in parallel to eliminate sequential timeout delays
      const checks = await Promise.all(
        candidates.map(async (candidate) => ({
          url: candidate,
          healthy: await isBackendHealthy(candidate),
        }))
      );

      const firstHealthy = checks.find((c) => c.healthy);
      if (firstHealthy) {
        cachedBackendUrl = firstHealthy.url;
        backendUrlCheckedAt = Date.now();
        return firstHealthy.url;
      }

      // If no external backend is healthy, fall back to relative path so same-origin Next.js API routes handle it
      cachedBackendUrl = '';
      backendUrlCheckedAt = Date.now();
      return '';
    })().finally(() => {
      backendUrlRequest = null;
    });
  }

  return backendUrlRequest;
}
