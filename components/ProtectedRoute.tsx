"use client";

/**
 * components/ProtectedRoute.tsx
 * -----------------------------
 * Client-side route guard. Firebase sessions live in an http-only IndexedDB
 * token that server middleware cannot easily read, so protection happens
 * here: while the session is loading we show a spinner, and once resolved
 * unauthenticated visitors are redirected to /login (or /onboarding).
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Where to send unauthenticated users. Defaults to /login. */
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until Firebase resolves the session before deciding anything.
    if (!loading && !user) {
      router.replace(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // Session still hydrating — render a centered loader (mobile-first).
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return <>{children}</>;
}
