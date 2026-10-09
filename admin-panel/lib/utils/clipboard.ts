/**
 * Resilient clipboard utility for Botock Platform.
 * Supports modern Async Clipboard API in secure contexts (localhost, HTTPS),
 * and gracefully falls back to document.execCommand in insecure contexts
 * (e.g. LAN IP addresses like http://192.168.x.x:3000) or restricted webviews.
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined" || !text) {
    return false;
  }

  // 1. Try modern navigator.clipboard API if available (secure contexts)
  if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Modern API failed or permission was denied - attempt fallback below
    }
  }

  // 2. Fallback using document.execCommand('copy')
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Prevent scrolling to bottom of page on iOS/Safari
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "-9999px";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    textArea.setAttribute("readonly", "");

    document.body.appendChild(textArea);
    textArea.focus({ preventScroll: true });
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("copyToClipboard fallback failed:", err);
    return false;
  }
}
