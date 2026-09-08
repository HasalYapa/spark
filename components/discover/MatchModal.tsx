"use client";

/**
 * components/discover/MatchModal.tsx
 * Full-screen overlay shown when two users like each other.
 */

import Link from "next/link";
import { Heart } from "lucide-react";
import type { UserProfile } from "@/lib/types";

interface MatchModalProps {
  me: UserProfile;
  other: UserProfile;
  matchId: string;
  onClose: () => void;
}

export default function MatchModal({
  me,
  other,
  matchId,
  onClose,
}: MatchModalProps) {
  const photo = (p: UserProfile) =>
    p.photos?.[0] ?? null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-rose-500/95 to-pink-600/95 px-6 text-center text-white">
      <div className="flex items-center gap-3">
        <Heart className="h-10 w-10 fill-current" />
        <h1 className="text-4xl font-extrabold tracking-tight">
          It&apos;s a Match!
        </h1>
        <Heart className="h-10 w-10 fill-current" />
      </div>
      <p className="mt-2 text-white/90">
        You and {other.name} liked each other.
      </p>

      {/* Both profile photos */}
      <div className="mt-8 flex items-center justify-center gap-4">
        {[me, other].map((p, idx) => (
          <div
            key={idx}
            className={`h-36 w-28 overflow-hidden rounded-2xl bg-white/20 shadow-xl ${
              idx === 0 ? "-rotate-6" : "rotate-6"
            }`}
          >
            {photo(p) ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={photo(p)!}
                alt={p.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl font-bold">
                {p.name.charAt(0)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 w-full max-w-xs space-y-3">
        <Link
          href={`/chat/${matchId}`}
          className="block w-full rounded-xl bg-white py-3 font-semibold text-rose-600 transition hover:bg-rose-50 active:scale-[0.98]"
        >
          Send a message
        </Link>
        <button
          onClick={onClose}
          className="w-full rounded-xl border border-white/50 py-3 font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
        >
          Keep swiping
        </button>
      </div>
    </div>
  );
}
