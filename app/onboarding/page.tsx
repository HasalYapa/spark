"use client";

/**
 * app/onboarding/page.tsx
 * -----------------------
 * Multi-step profile setup for new users:
 *   Step 1 — Name, Age, Gender
 *   Step 2 — Bio + Preferences (interested in, age range)
 *   Step 3 — Profile photos (upload to Firebase Storage)
 *
 * On finish, the `users/{uid}` document is updated with `onboarded: true`
 * and the user lands on /dashboard. Incomplete profiles are redirected
 * here automatically (see app/dashboard/page.tsx).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { uploadProfilePhoto } from "@/lib/storage";
import { useProfile } from "@/lib/useProfile";
import type { Gender, PrefGender } from "@/lib/types";
import StepBasics from "@/components/onboarding/StepBasics";
import StepAbout from "@/components/onboarding/StepAbout";
import StepPhotos from "@/components/onboarding/StepPhotos";

const TOTAL_STEPS = 3;
const MAX_PHOTOS = 6;

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingFlow />
    </ProtectedRoute>
  );
}

function OnboardingFlow() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  // ── Form state ────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [bio, setBio] = useState("");
  const [prefGender, setPrefGender] = useState<PrefGender>("everyone");
  const [prefMinAge, setPrefMinAge] = useState(18);
  const [prefMaxAge, setPrefMaxAge] = useState(40);
  const [photos, setPhotos] = useState<string[]>([]);

  // ── UI state ──────────────────────────────────────────────────
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill from the existing profile (e.g. returning users).
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setAge(profile.age ? String(profile.age) : "");
      setGender(profile.gender ?? null);
      setBio(profile.bio ?? "");
      setPrefGender(profile.preferences?.gender ?? "everyone");
      setPrefMinAge(profile.preferences?.minAge ?? 18);
      setPrefMaxAge(profile.preferences?.maxAge ?? 40);
      setPhotos(profile.photos ?? []);
    }
  }, [profile]);

  // Already onboarded? No need to be here.
  useEffect(() => {
    if (!profileLoading && profile?.onboarded) {
      router.replace("/dashboard");
    }
  }, [profile, profileLoading, router]);

  /** Per-step validation before allowing "Continue". */
  const canContinue = useCallback((): string | null => {
    if (step === 1) {
      if (!name.trim()) return "Please enter your name.";
      const ageNum = Number(age);
      if (!age || Number.isNaN(ageNum) || ageNum < 18 || ageNum > 120)
        return "Please enter a valid age (18–120).";
      if (!gender) return "Please select your gender.";
    }
    if (step === 2) {
      if (bio.length > 300) return "Bio must be 300 characters or less.";
      if (prefMinAge < 18 || prefMaxAge > 120 || prefMinAge > prefMaxAge)
        return "Age preference range is invalid.";
    }
    if (step === 3 && photos.length === 0)
      return "Please add at least one photo.";
    return null;
  }, [step, name, age, gender, bio, prefMinAge, prefMaxAge, photos.length]);

  function handleContinue() {
    const problem = canContinue();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  /** Picks files, uploads them straight to Storage, appends the URLs. */
  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || !user) return;
    setError(null);

    const remaining = MAX_PHOTOS - photos.length;
    const files = Array.from(fileList).slice(0, remaining);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const urls = await Promise.all(
        files.map((f) => uploadProfilePhoto(user.uid, f))
      );
      setPhotos((prev) => [...prev, ...urls]);
    } catch {
      setError(
        "Photo upload failed. Make sure Storage rules allow signed-in writes, then retry."
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  /** Saves the completed profile and moves to the dashboard. */
  async function handleFinish() {
    const problem = canContinue();
    if (problem) {
      setError(problem);
      return;
    }
    if (!user) return;

    setSaving(true);
    setError(null);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          name: name.trim(),
          age: Number(age),
          gender,
          bio: bio.trim(),
          photos,
          preferences: {
            gender: prefGender,
            minAge: prefMinAge,
            maxAge: prefMaxAge,
          },
          onboarded: true,
        },
        { merge: true }
      );
      router.replace("/dashboard");
    } catch {
      setError("Could not save your profile. Please try again.");
      setSaving(false);
    }
  }

  // ── UI ─────────────────────────────────────────────────────────
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-rose-50 to-white">
      <header className="px-5 pt-5">
        <div className="mx-auto max-w-md">
          <div className="mb-3 flex items-center justify-between text-sm text-gray-500">
            <span className="font-semibold text-gray-900">
              Set up your profile
            </span>
            <span>
              Step {step} of {TOTAL_STEPS}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-rose-500 transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl shadow-rose-100 sm:p-8">
          {step === 1 && (
            <StepBasics
              name={name}
              onNameChange={setName}
              age={age}
              onAgeChange={setAge}
              gender={gender}
              onGenderChange={setGender}
            />
          )}
          {step === 2 && (
            <StepAbout
              bio={bio}
              onBioChange={setBio}
              prefGender={prefGender}
              onPrefGenderChange={setPrefGender}
              prefMinAge={prefMinAge}
              prefMaxAge={prefMaxAge}
              onPrefRangeChange={(min, max) => {
                setPrefMinAge(min);
                setPrefMaxAge(max);
              }}
            />
          )}
          {step === 3 && (
            <StepPhotos
              photos={photos}
              onRemovePhoto={(url) =>
                setPhotos((prev) => prev.filter((p) => p !== url))
              }
              uploading={uploading}
              onPickFiles={() => fileInputRef.current?.click()}
              onFilesSelected={handleFilesSelected}
              fileInputRef={fileInputRef}
            />
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">
              {error}
            </p>
          )}

          {/* Navigation */}
          <div className="mt-6 flex gap-3">
            {step > 1 && (
              <button
                onClick={() => {
                  setError(null);
                  setStep((s) => s - 1);
                }}
                aria-label="Back"
                className="flex items-center justify-center rounded-xl border border-gray-200 px-4 py-3 font-medium text-gray-600 transition hover:bg-gray-50 active:scale-[0.98]"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button
                onClick={handleContinue}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 font-semibold text-white transition hover:bg-rose-600 active:scale-[0.98]"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving || uploading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 font-semibold text-white transition hover:bg-rose-600 active:scale-[0.98] disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
