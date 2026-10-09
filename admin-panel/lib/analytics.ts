/**
 * Tool Usage Analytics
 * Logs tool usage events to Supabase for admin tracking
 * Fire-and-forget: never throws, never blocks UI
 */

import { createClient } from "@/utils/supabase/client";

export type ToolStatus = "success" | "error" | "started";

export async function logToolUsage(
  toolId: string,
  toolName: string,
  status: ToolStatus,
  errorMessage?: string
): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from("tool_usage").insert({
      tool_id: toolId,
      tool_name: toolName,
      status,
      error_message: errorMessage ?? null,
      used_at: new Date().toISOString(),
    });
  } catch {
    // Silently swallow — analytics must never block UX
  }
}
