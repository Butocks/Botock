"use client";

import { useEffect, useRef } from "react";
import { createClient } from "../../utils/supabase/client";

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

          const { data: authData, error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
          });

          if (error) {
            console.error("Supabase One Tap signInWithIdToken error:", error);
            return;
          }

          if (authData?.session) {
            window.location.reload();
          }
        } catch (err) {
          console.error("Google One Tap authentication error:", err);
        }
      };

      const initGoogle = () => {
        if (!window.google?.accounts?.id || initializedRef.current) return;
        initializedRef.current = true;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: "signin",
        });

        // Prompt Google One Tap natively on botock.app
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Can be suppressed by browser third-party cookie policy or cooldown
          }
        });

        // Expose helper to trigger prompt when clicking Navbar sign-in button
        window.__botockTriggerGoogleSignIn = () => {
          return new Promise((resolve) => {
            if (!window.google?.accounts?.id) {
              resolve(false);
              return;
            }
            window.google.accounts.id.prompt((notification: any) => {
              if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                resolve(false);
              } else {
                resolve(true);
              }
            });
          });
        };
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

  return null;
}
