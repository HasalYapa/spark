"use client";

/**
 * app/dashboard/page.tsx
 * ----------------------
 * Profile hub: shows the user's own info with the shared bottom nav.
 * Onboarding redirect handled here; full profile editing comes later.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Pencil } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useProfile } from "@/lib/useProfile";
import { logout } from "@/lib/auth";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { profile, loading } = useProfile();
  const router = useRouter();

  // Incomplete (or missing) profile? Send them to onboarding first.
  useEffect(() => {
    if (!loading && (!profile || !profile.onboarded)) {
      router.replace("/onboarding");
    }
  }, [profile, loading, router]);

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-rose-50 to-white pb-24">
      <header className="flex items-center justify-between px-5 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-500"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </header>

      <div className="mx-auto w-full max-w-md px-5">
        {/* Photo + basics */}
        <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-rose-100">
            {profile.photos?.[0] ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profile.photos[0]}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-rose-500">
                {profile.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-gray-900">
              {profile.name}
            </p>
            <p className="text-sm text-gray-500">
              {profile.age} · {profile.gender ?? "—"}
            </p>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
            About me
          </p>
          <p className="text-sm text-gray-700">
            {profile.bio || "No bio yet."}
          </p>
        </div>

        {/* Edit profile → runs the onboarding steps again */}
        <Link
          href="/onboarding?edit=1"
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
        >
          <Pencil className="h-4 w-4" /> Edit profile
        </Link>
      </div>

      <BottomNav />
    </main>
  );
}
