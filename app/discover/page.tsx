"use client";

/**
 * app/discover/page.tsx
 * Tinder-style swipe deck. Loads candidates matching the user's
 * preferences, records likes/passes in Firestore, and shows the
 * match modal on a mutual like.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, RefreshCw } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import SwipeCard from "@/components/discover/SwipeCard";
import MatchModal from "@/components/discover/MatchModal";
import { useProfile } from "@/lib/useProfile";
import {
  fetchCandidates,
  fetchUserProfile,
  swipe,
} from "@/lib/matching";
import type { UserProfile } from "@/lib/types";

export default function DiscoverPage() {
  return (
    <ProtectedRoute>
      <DiscoverContent />
    </ProtectedRoute>
  );
}

function DiscoverContent() {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const [candidates, setCandidates] = useState<UserProfile[]>([]);
  const [deckLoading, setDeckLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [match, setMatch] = useState<{ other: UserProfile; id: string } | null>(
    null
  );

  const loadDeck = useCallback(async () => {
    if (!profile) return;
    setDeckLoading(true);
    try {
      setCandidates(await fetchCandidates(profile));
    } finally {
      setDeckLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    // Redirect to onboarding when the profile isn't ready.
    if (!loading && (!profile || !profile.onboarded)) {
      router.replace("/onboarding");
      return;
    }
    if (profile?.onboarded) loadDeck();
  }, [profile, loading, router, loadDeck]);

  async function handleDecide(direction: "like" | "superlike" | "pass") {
    if (!profile || !candidates.length || busy) return;
    const target = candidates[0];
    setBusy(true);
    setError(null);
    try {
      const { matchId } = await swipe(profile.uid, target.uid, direction);
      setCandidates((prev) => prev.slice(1));
      if (matchId) {
        setMatch({ other: target, id: matchId });
      } else if (direction === "like") {
        // No mutual like yet — tell the user what happens next.
        setToast(
          `You liked ${target.name}! 💛 You'll be able to chat when they like you back.`
        );
        setTimeout(() => setToast(null), 3500);
      } else if (direction === "superlike") {
        setToast(
          `Super Liked ${target.name}! ⭐ They'll see it instantly and can match right away.`
        );
        setTimeout(() => setToast(null), 3500);
      }
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setError(
        code.includes("permission")
          ? "Write blocked by Firestore rules. Check the rules in Firebase Console."
          : "Something went wrong while swiping. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  const current = candidates[0];
  const next = candidates[1];

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-rose-50 to-white pb-24">
      {/* Header */}
      <header className="px-5 pt-4 pb-6">
        <span className="flex items-center justify-center gap-2 font-bold text-gray-900">
          <Heart className="h-5 w-5 fill-rose-500 text-rose-500" /> Spark
        </span>
      </header>

      {/* Deck */}
      <div className="mx-auto w-full max-w-sm px-5">
        {loading || deckLoading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-rose-400" />
          </div>
        ) : current ? (
          <div className="relative">
            {/* Next card peeking behind */}
            {next && (
              <div className="absolute inset-0 scale-95 rounded-3xl bg-gray-200 shadow-lg" />
            )}
            <div className="relative">
              <SwipeCard
                key={current.uid}
                profile={current}
                onDecide={handleDecide}
                busy={busy}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-[60vh] flex-col items-center justify-center text-center">
            <Heart className="h-12 w-12 text-rose-200" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              You&apos;re all caught up!
            </h2>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              No new profiles right now. Check back later for new sparks.
            </p>
            <button
              onClick={loadDeck}
              className="mt-6 flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 font-semibold text-white transition hover:bg-rose-600 active:scale-[0.98]"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        )}
      </div>

      {/* Toast feedback after a like */}
      {toast && (
        <div className="fixed inset-x-0 top-6 z-50 mx-auto max-w-sm px-4">
          <div className="rounded-xl bg-gray-900/90 px-4 py-3 text-center text-sm text-white shadow-lg">
            {toast}
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mx-auto mt-3 max-w-sm px-5">
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        </div>
      )}

      {/* Match celebration */}
      {match && profile && (
        <MatchModal
          me={profile}
          other={match.other}
          matchId={match.id}
          onClose={() => setMatch(null)}
        />
      )}

      <BottomNav />
    </main>
  );
}
