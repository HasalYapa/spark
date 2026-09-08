"use client";

/**
 * components/auth/GoogleButton.tsx
 * --------------------------------
 * "Continue with Google" button used by both login and register pages.
 * Fires the shared loginWithGoogle() helper from lib/auth.ts.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { loginWithGoogle } from "@/lib/auth";

/**
 * Maps Firebase auth error codes to helpful, human-readable messages.
 * The raw error code is appended in small text for debugging.
 */
function friendlyGoogleError(code: string, raw: string): string {
  switch (code) {
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase. (Console → Authentication → Settings → Authorized domains)";
    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled yet. (Console → Authentication → Sign-in method → enable Google)";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup. Please allow popups for this site and retry.";
    case "auth/popup-closed-by-user":
      return "The Google popup was closed before finishing. Please try again.";
    case "auth/cancelled-popup-request":
      return "Another sign-in popup is already open. Close it and try again.";
    case "auth/network-request-failed":
      return "Network error — check your internet connection and retry.";
    case "auth/configuration-not-found":
      return "Auth configuration missing — make sure Authentication is enabled in the Firebase project.";
    default:
      return `Google sign-in failed (${code}). ${raw.slice(0, 120)}`;
  }
}

/** Minimal inline Google logo (keeps the bundle free of extra assets). */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export default function GoogleButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      // Onboarded users land straight on the swipe deck; the guards in
      // discover/dashboard still reroute unfinished profiles to onboarding.
      router.push("/discover");
    } catch (err) {
      // Surface Firebase's own error code so failures are diagnosable.
      const code = (err as { code?: string }).code ?? "unknown-error";
      setError(friendlyGoogleError(code, String(err)));
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 font-medium text-gray-700 transition hover:bg-gray-50 active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <GoogleIcon />
            Continue with Google
          </>
        )}
      </button>
      {error && <p className="mt-2 text-center text-sm text-red-500">{error}</p>}
    </div>
  );
}
