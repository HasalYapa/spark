"use client";

/**
 * components/onboarding/StepBasics.tsx
 * Step 1 — name, age, and gender selection.
 */

import type { Gender } from "@/lib/types";

const GENDERS: { value: Gender; label: string; emoji: string }[] = [
  { value: "male", label: "Male", emoji: "👨" },
  { value: "female", label: "Female", emoji: "👩" },
  { value: "other", label: "Other", emoji: "🌈" },
];

interface StepBasicsProps {
  name: string;
  onNameChange: (v: string) => void;
  age: string;
  onAgeChange: (v: string) => void;
  gender: Gender | null;
  onGenderChange: (g: Gender) => void;
}

export default function StepBasics({
  name,
  onNameChange,
  age,
  onAgeChange,
  gender,
  onGenderChange,
}: StepBasicsProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">The basics</h2>
        <p className="mt-1 text-sm text-gray-500">
          Tell us who you are — this shows on your profile.
        </p>
      </div>

      <div>
        <label htmlFor="ob-name" className="mb-1.5 block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="ob-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Alex"
          maxLength={40}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
      </div>

      <div>
        <label htmlFor="ob-age" className="mb-1.5 block text-sm font-medium text-gray-700">
          Age
        </label>
        <input
          id="ob-age"
          type="number"
          inputMode="numeric"
          min={18}
          max={120}
          value={age}
          onChange={(e) => onAgeChange(e.target.value)}
          placeholder="21"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-gray-700">
          Gender
        </span>
        <div className="grid grid-cols-3 gap-2">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => onGenderChange(g.value)}
              className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-sm font-medium transition active:scale-[0.98] ${
                gender === g.value
                  ? "border-rose-500 bg-rose-50 text-rose-600"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">{g.emoji}</span>
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
