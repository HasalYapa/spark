"use client";

/**
 * components/discover/SwipeCard.tsx
 * A single swipeable profile card with a tappable photo carousel
 * (left third = previous photo, right third = next photo) and
 * Like / Pass action buttons.
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight, Heart, X } from "lucide-react";
import type { UserProfile } from "@/lib/types";

interface SwipeCardProps {
  profile: UserProfile;
  onDecide: (direction: "like" | "pass") => void;
  busy: boolean;
}

export default function SwipeCard({
  profile,
  onDecide,
  busy,
}: SwipeCardProps) {
  const photos = profile.photos?.length
    ? profile.photos
    : [""]; // placeholder when the profile has no photos
  const [photoIdx, setPhotoIdx] = useState(0);

  function tapPhoto(side: "left" | "right") {
    if (side === "left") {
      setPhotoIdx((i) => Math.max(0, i - 1));
    } else {
      setPhotoIdx((i) => Math.min(photos.length - 1, i + 1));
    }
  }

  return (
    <div className="relative h-[70vh] max-h-[620px] w-full">
      {/* Card body */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl bg-gray-900 shadow-2xl">
        {photos[photoIdx] ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={photos[photoIdx]}
            alt={profile.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-400 to-rose-600">
            <span className="text-7xl font-bold text-white/90">
              {profile.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Invisible tap zones for the photo carousel */}
        {photos.length > 1 && (
          <>
            <button
              aria-label="Previous photo"
              onClick={() => tapPhoto("left")}
              className="absolute inset-y-0 left-0 w-1/3"
            />
            <button
              aria-label="Next photo"
              onClick={() => tapPhoto("right")}
              className="absolute inset-y-0 right-0 w-1/3"
            />
          </>
        )}

        {/* Carousel dots */}
        {photos.length > 1 && (
          <div className="absolute inset-x-0 top-3 flex justify-center gap-1.5 px-3">
            {photos.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 max-w-[40px] rounded-full transition ${
                  i === photoIdx ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        {/* Arrow affordances */}
        {photoIdx > 0 && (
          <ChevronLeft className="absolute left-2 top-1/2 h-7 w-7 -translate-y-1/2 text-white/70" />
        )}
        {photoIdx < photos.length - 1 && (
          <ChevronRight className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 text-white/70" />
        )}

        {/* Bottom gradient + info */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-16 text-white">
          <h2 className="text-2xl font-bold">
            {profile.name}
            <span className="ml-2 font-normal"> {profile.age}</span>
          </h2>
          {profile.bio && (
            <p className="mt-1 line-clamp-2 text-sm text-white/80">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute -bottom-7 inset-x-0 flex justify-center gap-8">
        <button
          onClick={() => onDecide("pass")}
          disabled={busy}
          aria-label="Pass"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-gray-400 shadow-lg transition hover:bg-gray-50 hover:text-red-400 active:scale-90 disabled:opacity-50"
        >
          <X className="h-8 w-8" />
        </button>
        <button
          onClick={() => onDecide("like")}
          disabled={busy}
          aria-label="Like"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-300 transition hover:bg-rose-600 active:scale-90 disabled:opacity-50"
        >
          <Heart className="h-8 w-8 fill-current" />
        </button>
      </div>
    </div>
  );
}
