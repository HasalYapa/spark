"use client";

/**
 * app/matches/page.tsx
 * Lists the user's matches (newest first). Tapping a match opens the
 * chat screen (built in the next task — for now links to /chat/{id}).
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MessageCircleHeart } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/lib/useProfile";
import { fetchMatches, fetchUserProfile } from "@/lib/matching";
import type { UserProfile } from "@/lib/types";

interface MatchRow {
  matchId: string;
  profile: UserProfile | null;
}

export default function MatchesPage() {
  return (
    <ProtectedRoute>
      <MatchesContent />
    </ProtectedRoute>
  );
}

function MatchesContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [rows, setRows] = useState<MatchRow[] | null>(null);

  useEffect(() => {
    if (!profileLoading && (!profile || !profile.onboarded)) {
      router.replace("/onboarding");
    }
  }, [profile, profileLoading, router]);

  useEffect(() => {
    if (!user || !profile?.onboarded) return;
    (async () => {
      const matches = await fetchMatches(user.uid);
      const withProfiles = await Promise.all(
        matches.map(async (m) => ({
          matchId: m.matchId,
          profile: await fetchUserProfile(m.otherUid),
        }))
      );
      setRows(withProfiles);
    })();
  }, [user, profile?.onboarded]);

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-rose-50 to-white pb-24">
      <header className="px-5 pt-5 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
      </header>

      <div className="mx-auto w-full max-w-md px-5">
        {rows === null ? (
          <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-rose-400" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-[60vh] flex-col items-center justify-center text-center">
            <MessageCircleHeart className="h-12 w-12 text-rose-200" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              No matches yet
            </h2>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              Keep swiping — your spark is out there waiting.
            </p>
            <Link
              href="/discover"
              className="mt-6 rounded-xl bg-rose-500 px-5 py-2.5 font-semibold text-white transition hover:bg-rose-600 active:scale-[0.98]"
            >
              Start swiping
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map(({ matchId, profile: p }) =>
              p ? (
                <li key={matchId}>
                  <Link
                    href={`/chat/${matchId}`}
                    className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm transition hover:shadow-md active:scale-[0.99]"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-rose-100">
                      {p.photos?.[0] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={p.photos[0]}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xl font-bold text-rose-500">
                          {p.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">
                        {p.name}
                        <span className="ml-1.5 font-normal text-gray-500">
                          {p.age}
                        </span>
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        {p.bio || "You matched! Say hi 👋"}
                      </p>
                    </div>
                  </Link>
                </li>
              ) : null
            )}
          </ul>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
