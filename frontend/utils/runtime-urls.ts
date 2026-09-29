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
const HEALTH_CHECK_CACHE_MS = 15_000;

let cachedBackendUrl: string | null = null;
let backendUrlCheckedAt = 0;
let backendUrlRequest: Promise<string> | null = null;

function withoutTrailingSlash(url: string) {
  return url.replace(/\/$/, '');
}

function getFallbackBackendUrl() {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return withoutTrailingSlash(process.env.NEXT_PUBLIC_BACKEND_URL);
  }

  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8000';
  }

  return 'https://botock.azurewebsites.net';
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
 * Chooses the laptop tunnel when it is reachable, otherwise the configured
 * cloud backend. Set NEXT_PUBLIC_LAPTOP_BACKEND_URL to enable this behavior.
 */
export async function getBackendUrl() {
  const fallbackBackendUrl = getFallbackBackendUrl();
  const laptopBackendUrl = process.env.NEXT_PUBLIC_LAPTOP_BACKEND_URL;

  // Server-rendered code and deployments without a laptop tunnel keep the
  // original, synchronous-config behavior without performing a browser probe.
  if (typeof window === 'undefined' || !laptopBackendUrl) {
    return fallbackBackendUrl;
  }

  const now = Date.now();
  if (cachedBackendUrl && now - backendUrlCheckedAt < HEALTH_CHECK_CACHE_MS) {
    return cachedBackendUrl;
  }

  if (!backendUrlRequest) {
    backendUrlRequest = (async () => {
      const laptopUrl = withoutTrailingSlash(laptopBackendUrl);
      cachedBackendUrl = await isBackendHealthy(laptopUrl) ? laptopUrl : fallbackBackendUrl;
      backendUrlCheckedAt = Date.now();
      return cachedBackendUrl;
    })().finally(() => {
      backendUrlRequest = null;
    });
  }

  return backendUrlRequest;
}
