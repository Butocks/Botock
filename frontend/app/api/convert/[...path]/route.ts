import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // Allow long conversions
export const dynamic = "force-dynamic";

const ALLOWED_CONVERT_PATHS = new Set([
  "pdf-to-docx",
  "pdf-to-excel",
  "docx-to-pdf",
  "pdf-protect",
  "tts-voices",
  "text-to-speech",
  "voice-changer",
  "audio-enhance",
]);

const MAX_CONVERT_PAYLOAD_BYTES = 50 * 1024 * 1024; // 50MB limit

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subpath = Array.isArray(path) ? path.join("/") : path;

    // SSRF & Path Traversal Protection
    if (!subpath || subpath.includes("..") || !ALLOWED_CONVERT_PATHS.has(subpath)) {
      return NextResponse.json(
        { detail: "Forbidden: Invalid or unapproved conversion endpoint." },
        { status: 403 }
      );
    }

    // Payload size validation
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_CONVERT_PAYLOAD_BYTES) {
      return NextResponse.json(
        { detail: "Payload Too Large: Maximum allowed file size is 50MB." },
        { status: 413 }
      );
    }

    const backendUrl = (
      process.env.BACKEND_INTERNAL_URL ||
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000"
    ).replace(/\/$/, "");

    const targetUrl = `${backendUrl}/api/convert/${subpath}`;

    const reqContentType = request.headers.get("content-type");
    const reqContentLength = request.headers.get("content-length");
    const authHeader = request.headers.get("authorization");

    const headers: Record<string, string> = {
      "Bypass-Tunnel-Reminder": "true",
      "ngrok-skip-browser-warning": "true",
      "User-Agent": "Botock-Web-Client/1.0",
    };

    if (reqContentType) {
      headers["Content-Type"] = reqContentType;
    }
    if (reqContentLength) {
      headers["Content-Length"] = reqContentLength;
    }
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

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
              errorMsg = typeof errorJson.detail === "string" 
                ? errorJson.detail 
                : JSON.stringify(errorJson.detail);
            } else {
              errorMsg = text.slice(0, 300);
            }
          } catch (e) {
            errorMsg = text.slice(0, 300);
          }
        }
      } catch (err) {
        // Ignored, just use default errorMsg
      }
      return NextResponse.json({ detail: errorMsg }, { status: backendRes.status });
    }

    const contentType = backendRes.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = backendRes.headers.get("content-disposition");

    const resHeaders: Record<string, string> = {
      "Content-Type": contentType,
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
          "Could not connect to conversion backend server. Please verify backend is active.",
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

    if (!subpath || subpath.includes("..") || !ALLOWED_CONVERT_PATHS.has(subpath)) {
      return NextResponse.json(
        { detail: "Forbidden: Invalid or unapproved conversion endpoint." },
        { status: 403 }
      );
    }

    const backendUrl = (
      process.env.BACKEND_INTERNAL_URL ||
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000"
    ).replace(/\/$/, "");

    const targetUrl = `${backendUrl}/api/convert/${subpath}${request.nextUrl.search}`;

    const backendRes = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Bypass-Tunnel-Reminder": "true",
        "ngrok-skip-browser-warning": "true",
        "User-Agent": "Botock-Web-Client/1.0",
      },
    });

    const data = await backendRes.arrayBuffer();
    const contentType = backendRes.headers.get("content-type") || "application/json";

    return new NextResponse(data, {
      status: backendRes.status,
      headers: { "Content-Type": contentType },
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 502 });
  }
}
