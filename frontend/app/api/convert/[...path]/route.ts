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
  "voice-clone",
  "audio-enhance",
]);

const MAX_CONVERT_PAYLOAD_BYTES = 60 * 1024 * 1024; // 60MB limit

// 🎙️ Maps Edge-TTS Voices to Distinct Real Neural Fallback Voices (Zero API Key Needed)
const NEURAL_FALLBACK_VOICE_MAP: Record<
  string,
  { pollyVoice: string; tiktokVoice: string; lang: string }
> = {
  "en-US-ChristopherNeural": {
    pollyVoice: "Matthew", // Deep US Male Narrator
    tiktokVoice: "en_us_006",
    lang: "en-US",
  },
  "en-US-GuyNeural": {
    pollyVoice: "Joey", // Confident US Male Storyteller
    tiktokVoice: "en_us_009",
    lang: "en-US",
  },
  "en-US-EricNeural": {
    pollyVoice: "Stephen", // Heavy / Authoritative Male
    tiktokVoice: "en_us_010",
    lang: "en-US",
  },
  "en-GB-BrianNeural": {
    pollyVoice: "Brian", // Authentic British Male Narrator
    tiktokVoice: "en_uk_001",
    lang: "en-GB",
  },
  "en-US-JennyNeural": {
    pollyVoice: "Joanna", // Studio US Female Host
    tiktokVoice: "en_us_001",
    lang: "en-US",
  },
  "en-US-AriaNeural": {
    pollyVoice: "Salli", // Expressive Social Female
    tiktokVoice: "en_us_002",
    lang: "en-US",
  },
  "en-GB-SoniaNeural": {
    pollyVoice: "Amy", // Refined British Female
    tiktokVoice: "en_au_001",
    lang: "en-GB",
  },
  "en-AU-WilliamNeural": {
    pollyVoice: "Russell", // Australian Male Narrator
    tiktokVoice: "en_au_002",
    lang: "en-AU",
  },
  "es-ES-AlvaroNeural": {
    pollyVoice: "Enrique", // Spanish Male
    tiktokVoice: "es_002",
    lang: "es-ES",
  },
  "fr-FR-HenriNeural": {
    pollyVoice: "Mathieu", // French Male
    tiktokVoice: "fr_001",
    lang: "fr-FR",
  },
  "en-US-AnaNeural": {
    pollyVoice: "Justin", // Clean Young / Kid Voice
    tiktokVoice: "en_us_ghostface",
    lang: "en-US",
  },
};

/**
 * Splits long text into natural sentence chunks under maxLen characters
 */
function splitTextIntoChunks(text: string, maxLen = 240): string[] {
  const rawSentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const s of rawSentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if ((current + " " + trimmed).trim().length <= maxLen) {
      current = (current + " " + trimmed).trim();
    } else {
      if (current) chunks.push(current);
      if (trimmed.length <= maxLen) {
        current = trimmed;
      } else {
        // Hard split very long sentences by words
        const words = trimmed.split(/\s+/);
        let temp = "";
        for (const w of words) {
          if ((temp + " " + w).trim().length <= maxLen) {
            temp = (temp + " " + w).trim();
          } else {
            if (temp) chunks.push(temp);
            temp = w;
          }
        }
        current = temp;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Multi-Voice Serverless Neural TTS Fallback
 * Ensures distinct Male, Female, British, Australian, and Kid voices even if Python backend is down
 */
async function synthesizeMultiVoiceFallback(
  text: string,
  voiceId: string
): Promise<Buffer | null> {
  const voiceConfig = NEURAL_FALLBACK_VOICE_MAP[voiceId] || {
    pollyVoice: "Brian",
    tiktokVoice: "en_us_006",
    lang: "en-US",
  };

  const chunks = splitTextIntoChunks(text, 220);
  const audioBuffers: Buffer[] = [];

  for (const chunk of chunks) {
    let chunkBuffer: Buffer | null = null;

    // 1. Try StreamElements Neural Polly Voices (Distinct Male/Female/UK/US/Kid voices)
    try {
      const seUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(
        voiceConfig.pollyVoice
      )}&text=${encodeURIComponent(chunk)}`;

      const seRes = await fetch(seUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (seRes.ok) {
        const ab = await seRes.arrayBuffer();
        if (ab.byteLength > 500) {
          chunkBuffer = Buffer.from(ab);
        }
      }
    } catch {
      // Proceed to secondary neural fallback
    }

    // 2. Try TikTok Neural TTS Engine (Weilbyte Public Endpoint) if Polly is rate-limited
    if (!chunkBuffer) {
      try {
        const ttRes = await fetch(
          "https://tiktok-tts.weilnet.workers.dev/api/generation",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: chunk,
              voice: voiceConfig.tiktokVoice,
            }),
            signal: AbortSignal.timeout(8000),
          }
        );

        if (ttRes.ok) {
          const ttJson = await ttRes.json().catch(() => null);
          if (ttJson?.data) {
            chunkBuffer = Buffer.from(ttJson.data, "base64");
          }
        }
      } catch {
        // Proceed to last-resort fallback
      }
    }

    // 3. Last Resort: Regional Google TTS with TLD accent variation
    if (!chunkBuffer) {
      try {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
          chunk.slice(0, 180)
        )}&tl=${encodeURIComponent(voiceConfig.lang)}&client=tw-ob`;
        const gRes = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          signal: AbortSignal.timeout(6000),
        });
        if (gRes.ok) {
          const ab = await gRes.arrayBuffer();
          chunkBuffer = Buffer.from(ab);
        }
      } catch {
        // Ignore failed chunk
      }
    }

    if (chunkBuffer) {
      audioBuffers.push(chunkBuffer);
    }
  }

  if (audioBuffers.length === 0) return null;
  return Buffer.concat(audioBuffers);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subpath = Array.isArray(path) ? path.join("/") : path;

    // SSRF & Path Traversal Protection
    if (
      !subpath ||
      subpath.includes("..") ||
      !ALLOWED_CONVERT_PATHS.has(subpath)
    ) {
      return NextResponse.json(
        { detail: "Forbidden: Invalid or unapproved conversion endpoint." },
        { status: 403 }
      );
    }

    // Payload size validation
    const contentLength = request.headers.get("content-length");
    if (
      contentLength &&
      parseInt(contentLength, 10) > MAX_CONVERT_PAYLOAD_BYTES
    ) {
      return NextResponse.json(
        { detail: "Payload Too Large: Maximum allowed file size is 60MB." },
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
      "User-Agent": "Botock-Web-Client/2.0",
    };

    if (reqContentType) headers["Content-Type"] = reqContentType;
    if (reqContentLength) headers["Content-Length"] = reqContentLength;
    if (authHeader) headers["Authorization"] = authHeader;

    const clonedRequest = request.clone();

    // Forward request to Python backend
    let backendRes: Response | null = null;
    try {
      backendRes = await fetch(targetUrl, {
        method: "POST",
        body: request.body,
        // @ts-expect-error duplex: 'half' is required by Node.js fetch when streaming request bodies
        duplex: "half",
        headers,
      });
    } catch {
      backendRes = null;
    }

    if (!backendRes || !backendRes.ok) {
      // ✅ MULTI-VOICE NEURAL FALLBACK WHEN PYTHON BACKEND IS OFFLINE
      if (subpath === "text-to-speech") {
        try {
          const reqBody = await clonedRequest.json().catch(() => null);
          if (reqBody?.text) {
            const voiceId = String(reqBody.voice || "en-US-ChristopherNeural");
            const fallbackAudio = await synthesizeMultiVoiceFallback(
              String(reqBody.text),
              voiceId
            );

            if (fallbackAudio && fallbackAudio.length > 0) {
              return new NextResponse(new Uint8Array(fallbackAudio), {
                status: 200,
                headers: {
                  "Content-Type": "audio/mpeg",
                  "Content-Disposition": `attachment; filename="botock_${voiceId}.mp3"`,
                  "X-Voice-Engine": "Botock-Neural-MultiVoice-Fallback",
                },
              });
            }
          }
        } catch (fbErr) {
          console.error("Multi-voice TTS fallback error:", fbErr);
        }
      }

      const errorMsg = backendRes
        ? `Server error (${backendRes.status}: ${backendRes.statusText})`
        : "Backend server is offline. For AI Voice Cloning, please ensure the Python FastAPI server is running.";
      return NextResponse.json(
        { detail: errorMsg },
        { status: backendRes ? backendRes.status : 503 }
      );
    }

    const contentType =
      backendRes.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = backendRes.headers.get("content-disposition");

    const resHeaders: Record<string, string> = {
      "Content-Type": contentType,
    };
    if (contentDisposition) {
      resHeaders["Content-Disposition"] = contentDisposition;
    }

    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      headers: resHeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
