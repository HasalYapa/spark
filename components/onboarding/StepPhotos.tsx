"use client";

/**
 * components/onboarding/StepPhotos.tsx
 * Step 3 — profile photos: pick, preview, and remove.
 * The actual upload happens in the parent (app/onboarding/page.tsx)
 * via lib/storage.ts.
 */

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import type { RefObject } from "react";

const MAX_PHOTOS = 6;

interface StepPhotosProps {
  photos: string[];
  onRemovePhoto: (url: string) => void;
  uploading: boolean;
  onPickFiles: () => void;
  onFilesSelected: (files: FileList | null) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}

export default function StepPhotos({
  photos,
  onRemovePhoto,
  uploading,
  onPickFiles,
  onFilesSelected,
  fileInputRef,
}: StepPhotosProps) {
  const atMax = photos.length >= MAX_PHOTOS;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Your photos</h2>
        <p className="mt-1 text-sm text-gray-500">
          Add up to {MAX_PHOTOS} photos. Profiles with photos get way more
          matches.
        </p>
      </div>

      {/* Hidden native file picker (multiple images) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => onFilesSelected(e.target.files)}
      />

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-3">
        {photos.map((url) => (
          <div
            key={url}
            className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Profile"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemovePhoto(url)}
              aria-label="Remove photo"
              className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 text-red-500 shadow transition hover:bg-white"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Add tile */}
        {!atMax && (
          <button
            type="button"
            onClick={onPickFiles}
            disabled={uploading}
            className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-rose-300 hover:text-rose-400 active:scale-[0.98] disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs font-medium">Add photo</span>
              </>
            )}
          </button>
        )}
      </div>

      {uploading && (
        <p className="text-center text-sm text-gray-500">
          Uploading your photos…
        </p>
      )}
      {atMax && (
        <p className="text-center text-sm text-gray-400">
          Maximum of {MAX_PHOTOS} photos reached.
        </p>
      )}
    </div>
  );
}
