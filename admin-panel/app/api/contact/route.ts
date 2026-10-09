import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const backendUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    
    if (!backendUrl) {
      return NextResponse.json({ error: "Backend URL not configured" }, { status: 500 });
    }

    const res = await fetch(`${backendUrl.replace(/\/$/, '')}/api/core/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      return NextResponse.json({ success: true });
    } else {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail || "Failed to submit request" },
        { status: res.status }
      );
    }
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
