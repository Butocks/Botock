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
    const payload = {
      tool_id: toolId,
      tool_name: toolName,
      status,
      error_message: errorMessage ?? null,
      used_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("tool_usage_log").insert(payload);
    if (error) {
      await supabase.from("tool_usage").insert(payload);
    }
  } catch {
    // Silently swallow — analytics must never block UX
  }
}
