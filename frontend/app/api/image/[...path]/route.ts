import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const ALLOWED_IMAGE_ACTIONS = new Set([
  "generate",
  "status",
  "download",
  "credits",
  "list",
]);

const ASPECT_RATIO_MAP: Record<string, { width: number; height: number }> = {
  "16:9": { width: 1280, height: 720 },
  "9:16": { width: 720, height: 1280 },
  "4:3": { width: 1024, height: 768 },
  "3:4": { width: 768, height: 1024 },
  "1:1": { width: 1024, height: 1024 },
};

interface CachedImage {
  buffer: Buffer;
  contentType: string;
  prompt: string;
  aspectRatio: string;
  createdAt: number;
}

const imageStore = new Map<string, CachedImage>();

function cleanOldImages() {
  const oneHourAgo = Date.now() - 3600 * 1000;
  for (const [id, item] of imageStore.entries()) {
    if (item.createdAt < oneHourAgo) {
      imageStore.delete(id);
    }
  }
}

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

    // High-Definition Neural Diffusion generation (FLUX.1 + SDXL Turbo)
    if (subpath === "generate") {
      let body: any = {};
      try {
        body = await request.json();
      } catch {
        return NextResponse.json({ detail: "Invalid JSON body." }, { status: 400 });
      }

      const prompt = (body.prompt || "").trim();
      if (!prompt) {
        return NextResponse.json({ detail: "Please provide an image prompt." }, { status: 400 });
      }

      const aspectRatio = body.aspect_ratio || "1:1";
      const style = (body.style || "").trim();
      const dimensions = ASPECT_RATIO_MAP[aspectRatio] || { width: 1024, height: 1024 };

      let fullPrompt = prompt;
      if (style) {
        fullPrompt = `${prompt}, ${style}`;
      }

      const genId = crypto.randomUUID();
      const seed = Math.floor(Math.random() * 10000000);
      const encodedPrompt = encodeURIComponent(fullPrompt);

      const fluxUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dimensions.width}&height=${dimensions.height}&model=flux&seed=${seed}&nologo=true&enhance=true`;
      const turboUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dimensions.width}&height=${dimensions.height}&model=turbo&seed=${seed}&nologo=true`;

      let imgBuffer: Buffer | null = null;
      let contentType = "image/jpeg";

      try {
        const res = await fetch(fluxUrl, {
          headers: { "User-Agent": "Botock-AI-Studio/2.0" },
          signal: AbortSignal.timeout(35000),
        });
        if (res.ok) {
          const ab = await res.arrayBuffer();
          if (ab.byteLength > 15000) {
            imgBuffer = Buffer.from(ab);
            contentType = res.headers.get("content-type") || "image/jpeg";
          }
        }
      } catch (err) {
        console.warn("FLUX generation attempt note:", err);
      }

      if (!imgBuffer) {
        try {
          const res = await fetch(turboUrl, {
            headers: { "User-Agent": "Botock-AI-Studio/2.0" },
            signal: AbortSignal.timeout(20000),
          });
          if (res.ok) {
            const ab = await res.arrayBuffer();
            if (ab.byteLength > 15000) {
              imgBuffer = Buffer.from(ab);
              contentType = res.headers.get("content-type") || "image/jpeg";
            }
          }
        } catch (err) {
          console.error("Turbo fallback error:", err);
        }
      }

      if (!imgBuffer) {
        return NextResponse.json(
          { detail: "AI creative engine is momentarily busy. Please try clicking Generate again." },
          { status: 503 }
        );
      }

      cleanOldImages();
      imageStore.set(genId, {
        buffer: imgBuffer,
        contentType,
        prompt: fullPrompt,
        aspectRatio,
        createdAt: Date.now(),
      });

      const downloadUrl = `/api/image/download/${genId}?prompt=${encodeURIComponent(fullPrompt)}&w=${dimensions.width}&h=${dimensions.height}`;

      return NextResponse.json({
        generation_id: genId,
        status: "completed",
        message: "Your photo has been generated successfully!",
        download_url: downloadUrl,
        image_url: downloadUrl,
      });
    }

    // Forward any other endpoints to backend if needed
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
    if (authHeader) headers["authorization"] = authHeader;
    if (guestIdHeader) headers["x-guest-id"] = guestIdHeader;

    const backendRes = await fetch(targetUrl, {
      method: "POST",
      body: request.body,
      // @ts-expect-error duplex: 'half' is required by Node.js fetch when streaming request bodies
      duplex: "half",
      headers,
    });

    const resContentType = backendRes.headers.get("content-type") || "application/octet-stream";
    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      headers: { "Content-Type": resContentType },
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Image generation service error." },
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

    // Status endpoint check
    if (subpath.startsWith("status/")) {
      const genId = subpath.replace("status/", "").trim();
      const cached = imageStore.get(genId);
      if (cached) {
        const downloadUrl = `/api/image/download/${genId}`;
        return NextResponse.json({
          generation_id: genId,
          status: "completed",
          message: "Your photo has been generated successfully!",
          download_url: downloadUrl,
          image_url: downloadUrl,
        });
      }
    }

    // Download/Serve image endpoint
    if (subpath.startsWith("download/")) {
      const genId = subpath.replace("download/", "").trim();
      const cached = imageStore.get(genId);
      if (cached) {
        return new NextResponse(new Uint8Array(cached.buffer), {
          status: 200,
          headers: {
            "Content-Type": cached.contentType,
            "Content-Disposition": `inline; filename="botock_${genId}.jpg"`,
            "Cache-Control": "public, max-age=86400, immutable",
          },
        });
      }

      // If serverless memory was refreshed, regenerate seamlessly using stored prompt
      const promptQuery = request.nextUrl.searchParams.get("prompt");
      if (promptQuery) {
        const w = request.nextUrl.searchParams.get("w") || "1024";
        const h = request.nextUrl.searchParams.get("h") || "1024";
        const regenUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptQuery)}?width=${w}&height=${h}&model=flux&nologo=true`;
        const regenRes = await fetch(regenUrl, { signal: AbortSignal.timeout(30000) });
        if (regenRes.ok) {
          const ab = await regenRes.arrayBuffer();
          return new NextResponse(new Uint8Array(ab), {
            status: 200,
            headers: {
              "Content-Type": regenRes.headers.get("content-type") || "image/jpeg",
              "Content-Disposition": `inline; filename="botock_${genId}.jpg"`,
              "Cache-Control": "public, max-age=86400, immutable",
            },
          });
        }
      }
    }

    // Fallback: proxy to backend for other GET endpoints
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
      headers: { "Content-Type": contentType },
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 502 });
  }
}
