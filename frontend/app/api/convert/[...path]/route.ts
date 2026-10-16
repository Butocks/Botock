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

    const clonedRequest = request.clone();

    // Direct streaming: forward request.body stream (with duplex: 'half') straight to backend
    let backendRes: Response | null = null;
    try {
      backendRes = await fetch(targetUrl, {
        method: "POST",
        body: request.body,
        // @ts-expect-error duplex: 'half' is required by Node.js fetch when streaming request bodies
        duplex: "half",
        headers,
      });
    } catch (fetchErr) {
      backendRes = null;
    }

    if (!backendRes || !backendRes.ok) {
      // If text-to-speech backend is unavailable or failed, seamlessly synthesize audio via high-speed TTS fallback
      if (subpath === "text-to-speech") {
        try {
          const reqBody = await clonedRequest.json().catch(() => null);
          if (reqBody?.text) {
            const lang = (reqBody.voice || "en").split("-")[0] || "en";
            const chunks = String(reqBody.text).match(/[^.!?\n]+[.!?\n]*/g) || [String(reqBody.text)];
            const buffers: Buffer[] = [];
            for (const chunk of chunks) {
              const trimmed = chunk.trim();
              if (!trimmed) continue;
              const safeChunk = trimmed.slice(0, 180);
              const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(safeChunk)}&tl=${encodeURIComponent(lang)}&client=tw-ob`;
              const gRes = await fetch(url, {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                },
              });
              if (gRes.ok) {
                const ab = await gRes.arrayBuffer();
                buffers.push(Buffer.from(ab));
              }
            }
            if (buffers.length > 0) {
              const fullBuffer = Buffer.concat(buffers);
              return new NextResponse(fullBuffer, {
                status: 200,
                headers: {
                  "Content-Type": "audio/mpeg",
                  "Content-Disposition": 'attachment; filename="botock_voiceover.mp3"',
                },
              });
            }
          }
        } catch (fbErr) {
          console.error("Direct TTS fallback failed:", fbErr);
        }
      }

      let errorMsg = backendRes 
        ? `Server error (${backendRes.status}: ${backendRes.statusText})`
        : "Conversion backend is currently unavailable.";
      if (backendRes) {
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
          // Ignored
        }
      }
      return NextResponse.json({ detail: errorMsg }, { status: backendRes ? backendRes.status : 503 });
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
