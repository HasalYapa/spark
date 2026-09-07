"use client";

/**
 * app/dashboard/page.tsx
 * ----------------------
 * Protected placeholder page proving the auth guard works. Wrapped in
 * <ProtectedRoute>: unauthenticated visitors are bounced to /login, and
 * signed-in users see a minimal shell that the swipe deck, chat list,
 * and onboarding will plug into in upcoming tasks.
 */

import { Heart, LogOut } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/lib/auth";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-rose-50 to-white">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-4">
        <span className="flex items-center gap-2 font-bold text-gray-900">
          <Heart className="h-5 w-5 fill-rose-500 text-rose-500" /> Spark
        </span>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-500"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </header>

      {/* Placeholder body */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          You&apos;re in! 🎉
        </h1>
        <p className="mt-2 max-w-sm text-gray-600">
          Signed in as{" "}
          <span className="font-medium text-rose-500">
            {user?.email ?? "unknown"}
          </span>
          . The swipe deck, onboarding and chat will live here.
        </p>
      </div>
    </main>
  );
}
