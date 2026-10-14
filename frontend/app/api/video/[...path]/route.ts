import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // Allow long video rendering jobs
export const dynamic = "force-dynamic";

const ALLOWED_VIDEO_ACTIONS = new Set([
  "generate",
  "close-session",
  "credits",
  "status",
  "download",
  "list",
  "remove-bg",
  "auto-reframe",
  "reaction-combine",
  "rotate",
]);

const MAX_VIDEO_PAYLOAD_BYTES = 100 * 1024 * 1024; // 100MB limit

function isAllowedVideoSubpath(pathSegments: string[] | string): boolean {
  const segments = Array.isArray(pathSegments) ? pathSegments : [pathSegments];
  if (!segments.length || segments.some((s) => !s || s.includes("..") || s.includes("\\"))) {
    return false;
  }
  const [action, id, ...rest] = segments;
  if (rest.length > 0) return false;
  if (!ALLOWED_VIDEO_ACTIONS.has(action)) return false;

  if (action === "status" || action === "download") {
    return Boolean(id && /^[a-zA-Z0-9_\-\.]+$/.test(id));
  }
  return !id;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subpath = Array.isArray(path) ? path.join("/") : path;

    // SSRF & Path Traversal Protection
    if (!isAllowedVideoSubpath(path)) {
      return NextResponse.json(
        { detail: "Forbidden: Invalid or unapproved video endpoint." },
        { status: 403 }
      );
    }

    // Payload size validation
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_VIDEO_PAYLOAD_BYTES) {
      return NextResponse.json(
        { detail: "Payload Too Large: Maximum allowed video payload is 100MB." },
        { status: 413 }
      );
    }

    const backendUrl = (
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://127.0.0.1:8000"
    ).replace(/\/$/, "");

    const targetUrl = `${backendUrl}/api/video/${subpath}${request.nextUrl.search}`;

    const contentType = request.headers.get("content-type");
    const authHeader = request.headers.get("authorization");
    const guestIdHeader = request.headers.get("x-guest-id");

    const headers: Record<string, string> = {
      "Bypass-Tunnel-Reminder": "true",
      "ngrok-skip-browser-warning": "true",
      "User-Agent": "Botock-Web-Client/1.0",
    };

    if (contentType) headers["content-type"] = contentType;
    if (contentLength) headers["content-length"] = contentLength;
    if (authHeader) headers["authorization"] = authHeader;
    if (guestIdHeader) headers["x-guest-id"] = guestIdHeader;

    // Direct streaming: forward request.body stream (with duplex: 'half') straight to backend
    const backendRes = await fetch(targetUrl, {
      method: "POST",
      body: request.body,
      // @ts-expect-error duplex: 'half' is required by Node.js fetch when streaming request bodies
      duplex: "half",
      headers,
    });

    if (!backendRes.ok) {
      let errorMsg = `Server error (${backendRes.status}: ${backendRes.statusText})`;
      try {
        const text = await backendRes.text();
        if (text) {
          try {
            const errorJson = JSON.parse(text);
            if (errorJson?.detail) {
              errorMsg =
                typeof errorJson.detail === "string"
                  ? errorJson.detail
                  : JSON.stringify(errorJson.detail);
            } else {
              errorMsg = text.slice(0, 300);
            }
          } catch {
            errorMsg = text.slice(0, 300);
          }
        }
      } catch {
        // Fallback to default errorMsg
      }
      return NextResponse.json({ detail: errorMsg }, { status: backendRes.status });
    }

    const resContentType = backendRes.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = backendRes.headers.get("content-disposition");

    const resHeaders: Record<string, string> = {
      "Content-Type": resContentType,
    };
    if (contentDisposition) {
      resHeaders["Content-Disposition"] = contentDisposition;
    }

    // Stream backend response directly to client without buffering full file into RAM
    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      headers: resHeaders,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        detail:
          err.message ||
          "Could not connect to video backend server. Please verify backend is running.",
      },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subpath = Array.isArray(path) ? path.join("/") : path;

    // SSRF & Path Traversal Protection
    if (!isAllowedVideoSubpath(path)) {
      return NextResponse.json(
        { detail: "Forbidden: Invalid or unapproved video endpoint." },
        { status: 403 }
      );
    }

    const backendUrl = (
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://127.0.0.1:8000"
    ).replace(/\/$/, "");

    const targetUrl = `${backendUrl}/api/video/${subpath}${request.nextUrl.search}`;

    const headers: Record<string, string> = {
      "Bypass-Tunnel-Reminder": "true",
      "ngrok-skip-browser-warning": "true",
      "User-Agent": "Botock-Web-Client/1.0",
    };

    const authHeader = request.headers.get("authorization");
    if (authHeader) headers["authorization"] = authHeader;

    const guestIdHeader = request.headers.get("x-guest-id");
    if (guestIdHeader) headers["x-guest-id"] = guestIdHeader;

    const backendRes = await fetch(targetUrl, {
      method: "GET",
      headers,
    });

    const data = await backendRes.arrayBuffer();
    const contentType = backendRes.headers.get("content-type") || "application/json";

    return new NextResponse(data, {
      status: backendRes.status,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 502 });
  }
}
