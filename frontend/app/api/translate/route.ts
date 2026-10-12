import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface TranslateRequest {
  texts: string[];
  sourceLang?: string;
  targetLang: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: TranslateRequest = await req.json();
    const { texts, sourceLang = "auto", targetLang } = body;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: "No texts provided for translation." }, { status: 400 });
    }

    if (!targetLang) {
      return NextResponse.json({ error: "Target language is required." }, { status: 400 });
    }

    const translations: string[] = [];

    // Translate each text item (with small chunks)
    for (const text of texts) {
      const trimmed = text.trim();
      if (!trimmed) {
        translations.push("");
        continue;
      }

      // 1. Try MyMemory Translation API
      try {
        const langpair = `${sourceLang === "auto" ? "autodetect" : sourceLang}|${targetLang}`;
        const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          trimmed.slice(0, 500)
        )}&langpair=${encodeURIComponent(langpair)}`;

        const res = await fetch(apiUrl, {
          headers: { "User-Agent": "Botock-PDF-Translator/1.0" },
          next: { revalidate: 3600 },
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.responseData?.translatedText) {
            translations.push(data.responseData.translatedText);
            continue;
          }
        }
      } catch (e) {
        console.warn("MyMemory translation failed for chunk:", e);
      }

      // Fallback: Return original text if external translation service was unavailable
      translations.push(trimmed);
    }

    return NextResponse.json({ translations, success: true });
  } catch (err: any) {
    console.error("API /api/translate error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process translation." },
      { status: 500 }
    );
  }
}
