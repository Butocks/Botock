"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { createClient } from "../utils/supabase/client";
import { getSiteUrl } from "../utils/runtime-urls";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleAuthButtonProps {
  text?: "signin_with" | "signup_with" | "continue_with";
  onSuccess?: () => void;
  onError?: (err: string) => void;
}

export default function GoogleAuthButton({
  text = "continue_with",
  onSuccess,
  onError,
}: GoogleAuthButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const supabase = createClient();

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "34248186921-l4aumk2rkmdsvslm6v56ve99kh10n0qa.apps.googleusercontent.com";

  const handleCredentialResponse = async (response: any) => {
    try {
      const idToken = response.credential;
      if (!idToken) {
        throw new Error("No credential received from Google.");
      }

      // Exchange Google ID Token directly with Supabase Auth
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (error) {
        console.error("Supabase ID Token Auth Error:", error);
        if (onError) onError(error.message);
        return;
      }

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = `${getSiteUrl()}/tools/video-generator`;
      }
    } catch (err: any) {
      console.error("Google Auth Handler Error:", err);
      if (onError) onError(err.message || "Failed to authenticate with Google.");
    }
  };

  const renderGoogleButton = () => {
    if (typeof window !== "undefined" && window.google && buttonRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Clear previous button child nodes if any
        buttonRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: text,
          shape: "rectangular",
          logo_alignment: "left",
          width: 380,
        });
      } catch (e) {
        console.warn("Google button render error:", e);
      }
    }
  };

  useEffect(() => {
    if (scriptLoaded) {
      renderGoogleButton();
    }
  }, [scriptLoaded, text]);

  return (
    <div className="w-full flex flex-col items-center justify-center my-2">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          setScriptLoaded(true);
        }}
      />
      <div
        ref={buttonRef}
        className="w-full flex justify-center min-h-[44px] overflow-hidden rounded-xl"
      />
    </div>
  );
}
