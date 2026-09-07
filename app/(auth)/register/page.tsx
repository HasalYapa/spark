"use client";

/**
 * app/(auth)/register/page.tsx
 * ----------------------------
 * Email/password registration. On success the user is created in Firebase
 * Auth, their display name is set, and a seed `users/{uid}` document is
 * written (see lib/auth.ts). The multi-step onboarding flow (built next)
 * completes the rest of the profile.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import GoogleButton from "@/components/auth/GoogleButton";
import { registerWithEmail } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Client-side guard so users get instant feedback.
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(name.trim(), email.trim(), password);
      router.push("/dashboard");
    } catch (err) {
      const code = (err as { code?: string }).code;
      setError(
        code === "auth/email-already-in-use"
          ? "That email is already registered. Try signing in instead."
          : "Could not create your account. Please try again."
      );
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="A few seconds now, forever after."
      footerText="Already have an account?"
      footerLinkHref="/login"
      footerLinkLabel="Sign in"
    >
      <GoogleButton />

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-xs uppercase tracking-wide text-gray-400">
          or
        </span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            First name
          </label>
          <input
            id="name"
            type="text"
            required
            autoComplete="given-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 font-semibold text-white transition hover:bg-rose-600 active:scale-[0.98] disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>
      </form>
    </AuthCard>
  );
}
