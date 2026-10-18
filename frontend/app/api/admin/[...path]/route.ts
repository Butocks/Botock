import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function getTargetBackendUrl(): string {
  const configured =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_AZURE_BACKEND_URL ||
    "http://127.0.0.1:8000";
  return configured.replace(/\/$/, "");
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subpath = Array.isArray(path) ? path.join("/") : path;
    const backendBase = getTargetBackendUrl();
    const targetUrl = `${backendBase}/api/admin/${subpath}${request.nextUrl.search}`;

    const headers: Record<string, string> = {
      "User-Agent": "Botock-Next-Admin-Proxy",
      "Bypass-Tunnel-Reminder": "true",
      "ngrok-skip-browser-warning": "true",
    };

    const authHeader = request.headers.get("authorization");
    if (authHeader) headers["Authorization"] = authHeader;

    const res = await fetch(targetUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    // If querying public-config and backend is offline, return graceful fallback
    const { path } = await context.params;
    const subpath = Array.isArray(path) ? path.join("/") : path;
    if (subpath === "public-config") {
      return NextResponse.json({ tool_flags: {}, quotas: {} }, { status: 200 });
    }
    return NextResponse.json(
      { detail: "Backend admin service unavailable", error: err?.message },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subpath = Array.isArray(path) ? path.join("/") : path;
    const backendBase = getTargetBackendUrl();
    const targetUrl = `${backendBase}/api/admin/${subpath}${request.nextUrl.search}`;

    const bodyText = await request.text();

    const headers: Record<string, string> = {
      "Content-Type": request.headers.get("content-type") || "application/json",
      "User-Agent": "Botock-Next-Admin-Proxy",
      "Bypass-Tunnel-Reminder": "true",
      "ngrok-skip-browser-warning": "true",
    };

    const authHeader = request.headers.get("authorization");
    if (authHeader) headers["Authorization"] = authHeader;

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "";
    if (clientIp) headers["X-Forwarded-For"] = clientIp;

    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: bodyText,
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    // For telemetry track, swallow error gracefully so user experience is never blocked
    const { path } = await context.params;
    const subpath = Array.isArray(path) ? path.join("/") : path;
    if (subpath.startsWith("telemetry/")) {
      return NextResponse.json({ ok: false, detail: "Telemetry buffered" }, { status: 200 });
    }

    return NextResponse.json(
      { detail: "Backend admin service unavailable", error: err?.message },
      { status: 502 }
    );
  }
}
