import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120; // 2 minutes max for image generation proxy
export const dynamic = "force-dynamic";

const ALLOWED_IMAGE_ACTIONS = new Set([
  "generate",
  "status",
  "download",
  "credits",
  "list",
]);

const MAX_IMAGE_PAYLOAD_BYTES = 50 * 1024 * 1024; // 50MB limit

function isAllowedImageSubpath(pathSegments: string[] | string): boolean {
  const segments = Array.isArray(pathSegments) ? pathSegments : [pathSegments];
  if (!segments.length || segments.length > 3) return false;

  const isSafeChars = segments.every(
    (seg) => /^[a-zA-Z0-9_\-\.]+$/.test(seg) && !seg.includes("..") && !seg.includes("\\")
  );
  if (!isSafeChars) return false;

  const root = segments[0];
  return ALLOWED_IMAGE_ACTIONS.has(root);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subpath = Array.isArray(path) ? path.join("/") : path;

    if (!isAllowedImageSubpath(path)) {
      return NextResponse.json(
        { detail: "Forbidden: Invalid or unapproved image endpoint." },
        { status: 403 }
      );
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_IMAGE_PAYLOAD_BYTES) {
      return NextResponse.json(
        { detail: "Payload Too Large: Maximum allowed image payload is 50MB." },
        { status: 413 }
      );
    }

    const backendUrl = (
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://127.0.0.1:8000"
    ).replace(/\/$/, "");

    const targetUrl = `${backendUrl}/api/image/${subpath}${request.nextUrl.search}`;

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
                  : Array.isArray(errorJson.detail)
                  ? errorJson.detail.map((e: any) => e.msg || JSON.stringify(e)).join(", ")
                  : JSON.stringify(errorJson.detail);
            } else if (text.trim().startsWith("<")) {
              errorMsg = `AI generation server is temporarily unavailable (${backendRes.status} ${backendRes.statusText}). Please verify backend is running.`;
            } else {
              errorMsg = text.slice(0, 300);
            }
          } catch {
            if (text.trim().startsWith("<")) {
              errorMsg = `AI generation server is temporarily unavailable (${backendRes.status} ${backendRes.statusText}). Please verify backend is running.`;
            } else {
              errorMsg = text.slice(0, 300);
            }
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

    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      headers: resHeaders,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        detail:
          err.message ||
          "Could not connect to image backend server. Please verify backend is running.",
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

    if (!isAllowedImageSubpath(path)) {
      return NextResponse.json(
        { detail: "Forbidden: Invalid or unapproved image endpoint." },
        { status: 403 }
      );
    }

    const backendUrl = (
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://127.0.0.1:8000"
    ).replace(/\/$/, "");

    const targetUrl = `${backendUrl}/api/image/${subpath}${request.nextUrl.search}`;

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
