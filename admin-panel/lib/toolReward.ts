import { createClient } from "@/utils/supabase/client";
import { getBackendUrl } from "@/utils/runtime-urls";

export interface RewardResult {
  success: boolean;
  earned_credits: number;
  new_balance?: number;
  message?: string;
  cooldown?: boolean;
}

/**
 * Claims reward credits for executing a creative tool.
 * Credits automatically expire 24 hours after being awarded.
 */
export async function claimToolReward(toolId: string): Promise<RewardResult | null> {
  try {
    const supabase = createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    // Only logged in users can accumulate reward credits
    if (!token) return null;

    const backendUrl = await getBackendUrl();
    const res = await fetch(`${backendUrl}/api/user/claim-tool-reward`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ tool_id: toolId }),
    });

    if (!res.ok) return null;

    const data: RewardResult = await res.json();

    if (data.success && data.earned_credits > 0) {
      // Dispatch credit update event so Navbar / Studio can update immediately
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("botock:credits-updated", {
            detail: { new_balance: data.new_balance, earned: data.earned_credits },
          })
        );

        // Show floating reward notification toast
        showRewardToast(data.message || `🎉 +${data.earned_credits} AI Credits awarded! (Valid for 24h)`);
      }
    }

    return data;
  } catch (err) {
    // Fail silently so tool operation is never disrupted
    return null;
  }
}

function showRewardToast(message: string) {
  if (typeof document === "undefined") return;

  const existingToast = document.getElementById("botock-reward-toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.id = "botock-reward-toast";
  toast.className =
    "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-2xl border border-amber-400/40 text-xs font-bold animate-bounce transition-all select-none";
  const iconSpan = document.createElement("span");
  iconSpan.className = "text-base";
  iconSpan.textContent = "🎁";

  const messageSpan = document.createElement("span");
  messageSpan.textContent = message;

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "ml-2 text-white/80 hover:text-white font-black text-sm";
  closeButton.innerHTML = "&times;";
  closeButton.onclick = () => {
    toast.remove();
  };

  toast.appendChild(iconSpan);
  toast.appendChild(messageSpan);
  toast.appendChild(closeButton);

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}
