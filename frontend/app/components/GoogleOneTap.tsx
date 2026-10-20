"use client";

import { useEffect, useRef } from "react";
import { createClient } from "../../utils/supabase/client";
import {
  generateAuthNonce,
  storeAuthNonce,
  getStoredAuthNonce,
  clearStoredAuthNonce,
} from "../../utils/auth-nonce";

declare global {
  interface Window {
    google?: any;
    __botockGoogleOneTapInit?: boolean;
    __botockTriggerGoogleSignIn?: () => Promise<boolean>;
  }
}

export default function GoogleOneTap() {
  const supabase = createClient();
  const initializedRef = useRef(false);
  const rawNonceRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted || data?.session) return; // User already logged in

      const handleCredentialResponse = async (response: any) => {
        try {
          if (!response?.credential) return;

          // Retrieve the raw nonce from memory or sessionStorage fallback
          const rawNonce = rawNonceRef.current || getStoredAuthNonce();

          const { data: authData, error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
            nonce: rawNonce || undefined,
          });

          if (error) {
            console.error("Supabase One Tap signInWithIdToken error, falling back to OAuth:", error);
            clearStoredAuthNonce();

            // Seamless fallback to standard OAuth redirect so user is never stuck
            const origin = window.location.origin;
            const currentNext = window.location.pathname || "/";
            await supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(currentNext)}`,
                queryParams: {
                  access_type: "offline",
                  prompt: "select_account",
                },
              },
            });
            return;
          }

          clearStoredAuthNonce();

          if (authData?.session) {
            window.location.reload();
          }
        } catch (err) {
          console.error("Google One Tap authentication error:", err);
        }
      };

      const initGoogle = async () => {
        if (!window.google?.accounts?.id || initializedRef.current) return;
        initializedRef.current = true;

        try {
          const { nonce, hashedNonce } = await generateAuthNonce();
          rawNonceRef.current = nonce;
          storeAuthNonce(nonce);

          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            nonce: hashedNonce,
            use_fedcm_for_prompt: true,
            auto_select: false,
            cancel_on_tap_outside: true,
            context: "signin",
            prompt_parent_id: "google-one-tap-container",
          });

          // Prompt Google One Tap natively on botock.app
          window.google.accounts.id.prompt();

          // Expose helper to trigger prompt when clicking Navbar sign-in button
          window.__botockTriggerGoogleSignIn = () => {
            return new Promise((resolve) => {
              if (!window.google?.accounts?.id) {
                resolve(false);
                return;
              }
              window.google.accounts.id.prompt();
              resolve(true);
            });
          };
        } catch (err) {
          console.warn("Failed to initialize Google One Tap with nonce:", err);
        }
      };

      // Check if Google GSI script already exists
      if (window.google?.accounts?.id) {
        initGoogle();
      } else {
        const existingScript = document.getElementById("google-gsi-client");
        if (!existingScript) {
          const script = document.createElement("script");
          script.id = "google-gsi-client";
          script.src = "https://accounts.google.com/gsi/client";
          script.async = true;
          script.defer = true;
          script.onload = () => {
            if (isMounted) initGoogle();
          };
          document.body.appendChild(script);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  return (
    <div
      id="google-one-tap-container"
      className="fixed z-[99999] pointer-events-auto"
      style={{
        position: "fixed",
        top: "96px",
        right: "24px",
        zIndex: 99999,
      }}
    />
  );
}
