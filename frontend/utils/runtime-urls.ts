export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'https://botock.app';
}

const HEALTH_CHECK_TIMEOUT_MS = 2_500;
// A short cache makes an Azure outage switch to an available private tunnel
// quickly, without probing on every UI render.
const HEALTH_CHECK_CACHE_MS = 5_000;

let cachedBackendUrl: string | null = null;
let backendUrlCheckedAt = 0;
let backendUrlRequest: Promise<string> | null = null;

function withoutTrailingSlash(url: string) {
  return url.replace(/\/$/, '');
}

function getPrimaryBackendUrl() {
  const configured = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (configured) {
    const cleanUrl = withoutTrailingSlash(configured);
    // If browser is on HTTPS (e.g. https://botock.app) and backend is plain HTTP,
    // use the Next.js same-origin rewrite proxy to eliminate Mixed Content blocking!
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && cleanUrl.startsWith('http://')) {
      return '/api/proxy';
    }
    return cleanUrl;
  }

  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    if (window.location.protocol === 'https:') {
      return '/api/proxy';
    }
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
  if (cachedBackendUrl && now - backendUrlCheckedAt < HEALTH_CHECK_CACHE_MS) {
    return cachedBackendUrl;
  }

  if (!backendUrlRequest) {
    backendUrlRequest = (async () => {
      const candidates = [primaryBackendUrl, laptopBackendUrl, colabBackendUrl]
        .filter((url): url is string => Boolean(url))
        .map(withoutTrailingSlash);
      for (const candidate of candidates) {
        if (await isBackendHealthy(candidate)) {
          cachedBackendUrl = candidate;
          backendUrlCheckedAt = Date.now();
          return candidate;
        }
      }
      // Keep the normal API error path; do not silently direct user data to an
      // unknown endpoint when every configured backend is offline.
      cachedBackendUrl = primaryBackendUrl || getSiteUrl();
      backendUrlCheckedAt = Date.now();
      return cachedBackendUrl;
    })().finally(() => {
      backendUrlRequest = null;
    });
  }

  return backendUrlRequest;
}
