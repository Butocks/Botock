import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // Allow long conversions
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subpath = Array.isArray(path) ? path.join("/") : path;

    const backendUrl = (
      process.env.BACKEND_INTERNAL_URL ||
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL
    )?.replace(/\/$/, "");

    if (!backendUrl) {
      throw new Error("Backend URL is not configured. Please set NEXT_PUBLIC_API_URL.");
    }

    const targetUrl = `${backendUrl}/api/convert/${subpath}`;

    const formData = await request.formData();

    const headers: Record<string, string> = {
      "Bypass-Tunnel-Reminder": "true",
      "ngrok-skip-browser-warning": "true",
      "User-Agent": "Botock-Web-Client/1.0",
    };

    const backendRes = await fetch(targetUrl, {
      method: "POST",
      body: formData,
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
    const arrayBuffer = await backendRes.arrayBuffer();

    const resHeaders: Record<string, string> = {
      "Content-Type": contentType,
    };
    if (contentDisposition) {
      resHeaders["Content-Disposition"] = contentDisposition;
    }

    return new NextResponse(arrayBuffer, {
      status: 200,
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
