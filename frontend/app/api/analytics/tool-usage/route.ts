import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const toolId = body.tool_slug || body.toolId || body.tool_id;
    const rawStatus = (body.status || "started").toLowerCase();

    if (!toolId) {
      return NextResponse.json({ error: "Missing tool identifier" }, { status: 400 });
    }

    const toolName = body.tool_name || body.toolName || toolId;
    const errorMessage = body.error_message || body.errorMessage || null;
    const errorCode = body.error_code || null;
    const stageReached = body.stage_reached || body.stageReached || "init";
    const elapsedMs = Number(body.elapsed_ms || body.elapsedMs || 0);
    const abandonReason = body.abandon_reason || body.abandonReason || null;
    const fileSize = body.file_size_bytes || body.fileSizeBytes || null;
    const sessionId = body.session_id || body.sessionId || null;

    // Normalize status for DB check constraint compatibility
    let dbStatus = rawStatus;
    if (rawStatus === "completed") dbStatus = "success";
    else if (rawStatus === "failed") dbStatus = "error";

    // 1. Log to Supabase if available
    try {
      const supabase = await createClient();
      const payload: Record<string, any> = {
        tool_id: toolId,
        tool_name: toolName,
        status: dbStatus,
        error_message: errorMessage,
        used_at: new Date().toISOString(),
      };

      // Optional extended columns (if migration 015 is applied)
      if (sessionId) payload.session_id = sessionId;
      if (stageReached) payload.stage_reached = stageReached;
      if (elapsedMs) payload.elapsed_ms = elapsedMs;
      if (abandonReason) payload.abandon_reason = abandonReason;
      if (errorCode) payload.error_code = errorCode;
      if (fileSize) payload.file_size_bytes = fileSize;

      const { error } = await supabase.from("tool_usage_log").insert(payload);
      if (error) {
        // Fallback to minimal payload if schema hasn't migrated yet
        await supabase.from("tool_usage_log").insert({
          tool_id: toolId,
          tool_name: toolName,
          status: dbStatus === "abandoned_midway" ? "error" : dbStatus,
          error_message: abandonReason ? `[Drop-off] ${abandonReason}` : errorMessage,
          used_at: new Date().toISOString(),
        });
      }
    } catch (sbErr) {
      // Supabase insert non-fatal
    }

    // 2. Mirror to FastAPI Backend Telemetry (keeps in-memory & admin portal state in sync)
    const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
    fetch(`${backendUrl}/api/admin/telemetry/tool`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool_id: toolId,
        status: rawStatus,
        stage_reached: stageReached,
        elapsed_ms: elapsedMs,
        abandon_reason: abandonReason,
        error_code: errorCode,
        error_message: errorMessage,
        session_id: sessionId,
        file_size_bytes: fileSize,
      }),
      keepalive: true,
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to log" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: initialRows } = await supabase
      .from("tool_usage_log")
      .select("tool_id, tool_name, status, error_message, stage_reached, elapsed_ms, abandon_reason, used_at")
      .order("used_at", { ascending: false })
      .limit(500);

    let usageRows: any[] | null = initialRows;

    if (!usageRows) {
      const res = await supabase
        .from("tool_usage")
        .select("tool_id, tool_name, status, error_message, used_at")
        .order("used_at", { ascending: false })
        .limit(500);
      usageRows = res.data;
    }

    if (!usageRows) return NextResponse.json({ summary: [], errors: [], abandons: [] });

    // Build per-tool summary
    const counts: Record<string, { tool_name: string; success: number; error: number; abandoned: number }> = {};
    for (const row of usageRows) {
      if (!counts[row.tool_id]) {
        counts[row.tool_id] = { tool_name: row.tool_name, success: 0, error: 0, abandoned: 0 };
      }
      if (row.status === "success" || row.status === "completed") counts[row.tool_id].success++;
      else if (row.status === "error" || row.status === "failed") counts[row.tool_id].error++;
      else if (row.status === "abandoned_midway") counts[row.tool_id].abandoned++;
    }

    const summary = Object.entries(counts)
      .map(([tool_id, v]) => ({ tool_id, ...v, total: v.success + v.error + v.abandoned }))
      .sort((a, b) => b.total - a.total);

    const errors = usageRows
      .filter((r) => (r.status === "error" || r.status === "failed") && r.error_message)
      .slice(0, 50);

    const abandons = usageRows
      .filter((r) => r.status === "abandoned_midway" || r.abandon_reason)
      .slice(0, 50);

    return NextResponse.json({ summary, errors, abandons });
  } catch {
    return NextResponse.json({ summary: [], errors: [], abandons: [] });
  }
}
