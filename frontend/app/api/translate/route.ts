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

    // 1. Try LLM translation if GEMINI_API_KEY is configured (Private & High Quality)
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `Translate the following JSON array of text strings into language code '${targetLang}' (source language is '${sourceLang}'). Preserve array structure and indices. Return ONLY a valid JSON array of translated strings with no markdown code blocks:\n\n${JSON.stringify(
          texts
        )}`;
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.2 },
            }),
          }
        );
        if (geminiRes.ok) {
          const gemData = await geminiRes.json();
          const rawReply = gemData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const cleaned = rawReply.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length === texts.length) {
            return NextResponse.json({ translations: parsed, success: true });
          }
        }
      } catch (gemErr) {
        console.warn("Gemini translation fallback:", gemErr);
      }
    }

    const translations: string[] = [];

    // 2. Fallback translation with privacy-compliant de parameter
    for (const text of texts) {
      const trimmed = text.trim();
      if (!trimmed) {
        translations.push("");
        continue;
      }

      try {
        const langpair = `${sourceLang === "auto" ? "autodetect" : sourceLang}|${targetLang}`;
        const contactEmail = process.env.ADMIN_CONTACT_EMAIL || "privacy@botock.app";
        const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          trimmed.slice(0, 500)
        )}&langpair=${encodeURIComponent(langpair)}&de=${encodeURIComponent(contactEmail)}`;

        const res = await fetch(apiUrl, {
          headers: { "User-Agent": "Botock-Secure-Translator/1.0" },
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
        console.warn("Translation failed for chunk:", e);
      }

      // Fallback: Return original text if external service was unavailable
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
