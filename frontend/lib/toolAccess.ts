/**
 * toolAccess.ts - Unified Tool Access Controller for Botock
 * Checks real-time tool availability (enabled, maintenance, access_mode)
 * from Botock Command Center public config.
 */

export interface ToolAccessInfo {
  enabled: boolean;
  access_mode: "all" | "login_only" | "off";
  maintenance: boolean;
  name: string;
}

let cachedFlags: Record<string, ToolAccessInfo> | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 15000; // 15-second cache for instant responsiveness

export async function fetchAllToolConfigs(): Promise<Record<string, ToolAccessInfo>> {
  if (typeof window === "undefined") return {};
  const now = Date.now();
  if (cachedFlags && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedFlags;
  }

  try {
    const res = await fetch("/api/admin/public-config", {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.tool_flags) {
        cachedFlags = data.tool_flags;
        lastFetchTime = now;
        return cachedFlags!;
      }
    }
  } catch (err) {
    // If backend is unreachable, don't crash
  }

  return cachedFlags || {};
}

export async function getToolStatus(toolId: string): Promise<ToolAccessInfo | null> {
  const flags = await fetchAllToolConfigs();
  const normalizedId = toolId.replace(/^ai-/, "");
  return (
    flags[toolId] ||
    flags[normalizedId] ||
    flags[`ai-${normalizedId}`] ||
    null
  );
}

export function isToolBlocked(status: ToolAccessInfo | null): { blocked: boolean; reason: string } {
  if (!status) return { blocked: false, reason: "" };

  if (status.maintenance) {
    return {
      blocked: true,
      reason: `${status.name || "This tool"} is currently undergoing maintenance. Please check back shortly.`,
    };
  }

  if (status.access_mode === "off" || status.enabled === false) {
    return {
      blocked: true,
      reason: `${status.name || "This tool"} has been disabled by the administrator.`,
    };
  }

  return { blocked: false, reason: "" };
}
