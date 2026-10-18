/**
 * Smart Hybrid Tool Execution Engine (hybridEngine.ts)
 * 
 * Automatically routes creative processing to Fast Server Backend first.
 * If backend is unavailable, unreachable, or errors, seamlessly auto-falls back to
 * Client-Side Browser execution (FFmpeg.wasm, Canvas, pdf-lib, etc.) with zero downtime.
 */

const getBackendUrl = (): string => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  }
  return process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
};

const getClientAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'X-Client-Source': 'botock-web',
    'Bypass-Tunnel-Reminder': 'true',
    'ngrok-skip-browser-warning': 'true',
  };

  if (typeof window !== 'undefined') {
    // 1. Search localStorage for active session or admin token
    const candidateKeys = [
      'sb-access-token',
      'supabase.auth.token',
      'botock_auth_token',
      'auth_token',
      'token',
      'admin_token',
    ];

    for (const key of candidateKeys) {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          const parsed = JSON.parse(item);
          const tok = parsed?.access_token || parsed?.token || parsed;
          if (typeof tok === 'string' && tok.length > 10) {
            headers['Authorization'] = `Bearer ${tok}`;
            break;
          }
        } catch {
          if (item.length > 10) {
            headers['Authorization'] = `Bearer ${item}`;
            break;
          }
        }
      }
    }

    // 2. Attach guest tracking ID if available
    const guestId = localStorage.getItem('botock_guest_id') || localStorage.getItem('guest_id');
    if (guestId) {
      headers['X-Guest-ID'] = guestId;
    }
  }

  return headers;
};

let cachedBackendStatus: boolean | null = null;
let lastCheckTime = 0;
const CACHE_TTL = 15000; // 15-second status cache to avoid repeated ping overhead

export async function isBackendAvailable(): Promise<boolean> {
  const now = Date.now();
  if (cachedBackendStatus !== null && now - lastCheckTime < CACHE_TTL) {
    return cachedBackendStatus;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500); // 1.5s fast timeout

    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeout);
    cachedBackendStatus = res.ok;
  } catch {
    cachedBackendStatus = false;
  }

  lastCheckTime = now;
  return cachedBackendStatus;
}

export function resetBackendHealthCache(): void {
  cachedBackendStatus = null;
  lastCheckTime = 0;
}

export interface HybridJobOptions<T> {
  toolName: string;
  endpoint: string; // e.g. '/api/video/video-compress'
  formData: FormData;
  onProgress?: (percent: number, mode: 'backend' | 'local') => void;
  localFallback: (onLocalProgress: (p: number) => void) => Promise<T>;
  parseBackendResponse?: (res: Response) => Promise<T>;
  timeoutMs?: number;
}

/**
 * Runs tool with Backend First strategy + Automatic Local Browser Fallback.
 * Direct XHR upload bypasses Next.js API proxy to eliminate double upload latency,
 * includes simulated processing progression after upload, and passes proper security headers.
 */
import { getToolStatus, isToolBlocked } from "../toolAccess";

export async function runHybridTool<T = Blob>({
  toolName,
  endpoint,
  formData,
  onProgress,
  localFallback,
  parseBackendResponse,
  timeoutMs = 120000,
}: HybridJobOptions<T>): Promise<{ result: T; executedOn: 'backend' | 'local' }> {
  // 1. Strict Administrator Block Check
  const toolId = endpoint.split("/").filter(Boolean).pop() || toolName.toLowerCase().replace(/\s+/g, "-");
  try {
    const status = await getToolStatus(toolId);
    const { blocked, reason } = isToolBlocked(status);
    if (blocked) {
      throw new Error(reason);
    }
  } catch (accessErr: any) {
    if (accessErr?.message && (accessErr.message.includes("disabled") || accessErr.message.includes("maintenance"))) {
      throw accessErr;
    }
  }

  const backendUp = await isBackendAvailable();

  if (backendUp) {
    let progressTimer: any = null;
    let currentProgress = 5;

    const safeProgress = (pct: number) => {
      currentProgress = Math.max(currentProgress, pct);
      onProgress?.(currentProgress, 'backend');
    };

    try {
      safeProgress(5);

      const backendUrl = getBackendUrl();
      const url = endpoint.startsWith('http') ? endpoint : `${backendUrl}${endpoint}`;

      const result = await new Promise<T>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.timeout = timeoutMs;
        xhr.responseType = parseBackendResponse ? 'json' : 'blob';

        // Attach security, auth, and client identifying headers
        const headers = getClientAuthHeaders();
        for (const [key, value] of Object.entries(headers)) {
          xhr.setRequestHeader(key, value);
        }

        // Upload phase: maps to 5% - 65%
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && event.total > 0) {
            const uploadPct = Math.round((event.loaded / event.total) * 60) + 5;
            safeProgress(Math.min(65, uploadPct));
          }
        };

        xhr.upload.onload = () => {
          safeProgress(68);
          clearInterval(progressTimer);
          progressTimer = setInterval(() => {
            if (currentProgress < 94) {
              safeProgress(currentProgress + 1);
            }
          }, 350);
        };

        xhr.onload = async () => {
          clearInterval(progressTimer);
          if (xhr.status >= 200 && xhr.status < 300) {
            safeProgress(100);
            if (parseBackendResponse) {
              const fakeRes = new Response(JSON.stringify(xhr.response), {
                status: xhr.status,
                headers: { 'Content-Type': 'application/json' },
              });
              resolve(await parseBackendResponse(fakeRes));
            } else {
              resolve(xhr.response as T);
            }
          } else if (xhr.status === 403 || xhr.status === 503 || xhr.status === 401) {
            // Direct Administrator Block: Do NOT fall back to local engine!
            let errorMsg = `Access Restricted (${xhr.status})`;
            try {
              const resData = typeof xhr.response === "string" ? JSON.parse(xhr.response) : xhr.response;
              if (resData?.detail) errorMsg = resData.detail;
            } catch {}
            const adminErr = new Error(errorMsg);
            (adminErr as any).isAdminBlock = true;
            reject(adminErr);
          } else {
            reject(new Error(`Backend returned status ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          clearInterval(progressTimer);
          reject(new Error('Network error on backend request'));
        };

        xhr.ontimeout = () => {
          clearInterval(progressTimer);
          reject(new Error('Backend request timeout'));
        };

        xhr.send(formData);
      });

      return { result, executedOn: 'backend' };
    } catch (err: any) {
      clearInterval(progressTimer);
      if (err?.isAdminBlock) {
        throw err; // Stop immediately, do not run client-side engine!
      }
      console.warn(`[HybridEngine] ${toolName} backend attempt failed, falling back to client-side engine:`, err);
      cachedBackendStatus = false;
      lastCheckTime = Date.now();
    }
  }

  // --- CLIENT-SIDE FALLBACK ---
  onProgress?.(10, 'local');
  const localResult = await localFallback((p) => {
    const clamped = Math.min(99, Math.max(10, Math.round(p)));
    onProgress?.(clamped, 'local');
  });
  onProgress?.(100, 'local');

  return { result: localResult, executedOn: 'local' };
}
