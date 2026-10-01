import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { toolId, toolName, status, errorMessage } = await req.json();
    if (!toolId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const supabase = await createClient();
    await supabase.from("tool_usage").insert({
      tool_id: toolId,
      tool_name: toolName ?? toolId,
      status,
      error_message: errorMessage ?? null,
      used_at: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to log" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: usageRows } = await supabase
      .from("tool_usage")
      .select("tool_id, tool_name, status, error_message, used_at")
      .order("used_at", { ascending: false });

    if (!usageRows) return NextResponse.json({ summary: [], errors: [] });

    // Build per-tool summary
    const counts: Record<string, { tool_name: string; success: number; error: number }> = {};
    for (const row of usageRows) {
      if (!counts[row.tool_id]) counts[row.tool_id] = { tool_name: row.tool_name, success: 0, error: 0 };
      if (row.status === "success") counts[row.tool_id].success++;
      if (row.status === "error") counts[row.tool_id].error++;
    }

    const summary = Object.entries(counts)
      .map(([tool_id, v]) => ({ tool_id, ...v, total: v.success + v.error }))
      .sort((a, b) => b.total - a.total);

    const errors = usageRows
      .filter(r => r.status === "error" && r.error_message)
      .slice(0, 50);

    return NextResponse.json({ summary, errors });
  } catch {
    return NextResponse.json({ summary: [], errors: [] });
  }
}
