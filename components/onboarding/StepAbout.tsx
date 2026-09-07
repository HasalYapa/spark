"use client";

/**
 * components/onboarding/StepAbout.tsx
 * Step 2 — bio and matching preferences.
 */

import type { PrefGender } from "@/lib/types";

const PREF_OPTIONS: { value: PrefGender; label: string }[] = [
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
  { value: "everyone", label: "Everyone" },
];

interface StepAboutProps {
  bio: string;
  onBioChange: (v: string) => void;
  prefGender: PrefGender;
  onPrefGenderChange: (v: PrefGender) => void;
  prefMinAge: number;
  prefMaxAge: number;
  onPrefRangeChange: (min: number, max: number) => void;
}

export default function StepAbout({
  bio,
  onBioChange,
  prefGender,
  onPrefGenderChange,
  prefMinAge,
  prefMaxAge,
  onPrefRangeChange,
}: StepAboutProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">About you</h2>
        <p className="mt-1 text-sm text-gray-500">
          A good bio makes all the difference.
        </p>
      </div>

      <div>
        <label htmlFor="ob-bio" className="mb-1.5 block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="ob-bio"
          rows={4}
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder="Two truths and a lie…"
          maxLength={300}
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
        <p className="mt-1 text-right text-xs text-gray-400">
          {bio.length}/300
        </p>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-gray-700">
          Show me
        </span>
        <div className="grid grid-cols-3 gap-2">
          {PREF_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onPrefGenderChange(opt.value)}
              className={`rounded-xl border py-2.5 text-sm font-medium transition active:scale-[0.98] ${
                prefGender === opt.value
                  ? "border-rose-500 bg-rose-50 text-rose-600"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-gray-700">
          Age range:{" "}
          <span className="font-semibold text-rose-500">
            {prefMinAge} – {prefMaxAge}
          </span>
        </span>
        <div className="space-y-3 pt-1">
          <div>
            <label htmlFor="ob-minage" className="mb-1 block text-xs text-gray-400">
              Minimum
            </label>
            <input
              id="ob-minage"
              type="range"
              min={18}
              max={99}
              value={prefMinAge}
              onChange={(e) =>
                onPrefRangeChange(
                  Math.min(Number(e.target.value), prefMaxAge),
                  prefMaxAge
                )
              }
              className="w-full accent-rose-500"
            />
          </div>
          <div>
            <label htmlFor="ob-maxage" className="mb-1 block text-xs text-gray-400">
              Maximum
            </label>
            <input
              id="ob-maxage"
              type="range"
              min={18}
              max={99}
              value={prefMaxAge}
              onChange={(e) =>
                onPrefRangeChange(
                  prefMinAge,
                  Math.max(Number(e.target.value), prefMinAge)
                )
              }
              className="w-full accent-rose-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
