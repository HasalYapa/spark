"use client";

/**
 * app/page.tsx — public landing page.
 * Simple mobile-first hero that funnels visitors into /register or /login.
 */

import Link from "next/link";
import { Heart, MessageCircle, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-white px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-200">
        <Heart className="h-8 w-8 fill-current" />
      </div>

      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        Spark
      </h1>
      <p className="mt-4 max-w-md text-lg text-gray-600">
        Swipe. Match. Chat in real time. Find your person, one spark at a time.
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/register"
          className="w-full rounded-xl bg-rose-500 py-3 font-semibold text-white transition hover:bg-rose-600 active:scale-[0.98]"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="w-full rounded-xl border border-gray-200 bg-white py-3 font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-[0.98]"
        >
          I already have an account
        </Link>
      </div>

      {/* Quick feature highlights */}
      <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-rose-400" /> Smart matching
        </span>
        <span className="flex items-center gap-1.5">
          <MessageCircle className="h-4 w-4 text-rose-400" /> Live chat
        </span>
      </div>
    </main>
  );
}
