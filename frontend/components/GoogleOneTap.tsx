"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { createClient } from "../utils/supabase/client";

interface GoogleOneTapProps {
  user: any;
  onSuccess?: () => void;
}

export default function GoogleOneTap({ user, onSuccess }: GoogleOneTapProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const initializedRef = useRef(false);
  const supabase = createClient();

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "34248186921-l4aumk2rkmdsvslm6v56ve99kh10n0qa.apps.googleusercontent.com";

  const handleCredentialResponse = async (response: any) => {
    try {
      const idToken = response?.credential;
      if (!idToken) return;

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (error) {
        console.error("[GoogleOneTap] Supabase ID Token Auth Error:", error);
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("botock_last_active", Date.now().toString());
      }

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error("[GoogleOneTap] Authentication Handler Exception:", err);
    }
  };

  const displayOneTap = () => {
    if (
      typeof window === "undefined" ||
      !window.google?.accounts?.id ||
      user ||
      initializedRef.current
    ) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: true,
        cancel_on_tap_outside: false,
        itp_support: true,
        use_fedcm_for_prompt: true,
      });

      initializedRef.current = true;

      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          console.debug(
            "[GoogleOneTap] Prompt not displayed:",
            notification.getNotDisplayedReason?.()
          );
        } else if (notification.isSkippedMoment()) {
          console.debug(
            "[GoogleOneTap] Prompt skipped:",
            notification.getSkippedReason?.()
          );
        } else if (notification.isDismissedMoment()) {
          console.debug(
            "[GoogleOneTap] Prompt dismissed:",
            notification.getDismissedReason?.()
          );
        }
      });
    } catch (e) {
      console.warn("[GoogleOneTap] Initialization failed:", e);
    }
  };

  useEffect(() => {
    if (user) {
      if (typeof window !== "undefined" && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.cancel();
        } catch {
          // ignore
        }
      }
      initializedRef.current = false;
      return;
    }

    if (scriptLoaded) {
      displayOneTap();
    }
  }, [scriptLoaded, user]);

  if (user) return null;

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={() => {
        setScriptLoaded(true);
      }}
    />
  );
}
