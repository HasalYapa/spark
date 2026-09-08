"use client";

/**
 * app/notifications/page.tsx
 * In-app notification feed: likes, super likes, and new matches.
 * Opens as /notifications from the bottom nav bell.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Heart,
  Loader2,
  MessageCircleHeart,
  Star,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/lib/useNotifications";
import { fetchUserProfile } from "@/lib/matching";
import { markNotificationsRead } from "@/lib/notifications";
import type { AppNotification, UserProfile } from "@/lib/types";
import { useState } from "react";

const TYPE_META: Record<
  AppNotification["type"],
  { label: string; icon: typeof Heart; classes: string }
> = {
  like: {
    label: "liked your profile",
    icon: Heart,
    classes: "bg-rose-100 text-rose-500",
  },
  superlike: {
    label: "Super Liked you ⭐",
    icon: Star,
    classes: "bg-sky-100 text-sky-500",
  },
  match: {
    label: "It's a match! Start chatting",
    icon: MessageCircleHeart,
    classes: "bg-amber-100 text-amber-500",
  },
};

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  );
}

function NotificationsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { notifications, loading } = useNotifications();
  const [profiles, setProfiles] = useState<Record<string, UserProfile | null>>(
    {}
  );

  // Mark all as read once the feed is shown.
  useEffect(() => {
    if (!user || loading) return;
    const unread = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unread.length) {
      markNotificationsRead(user.uid, unread).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, notifications.length]);

  // Fetch sender profiles.
  useEffect(() => {
    if (loading) return;
    (async () => {
      const missing = [
        ...new Set(notifications.map((n) => n.fromUid)),
      ].filter((uid) => !(uid in profiles));
      if (!missing.length) return;
      const next: Record<string, UserProfile | null> = {};
      await Promise.all(
        missing.map(async (uid) => {
          next[uid] = await fetchUserProfile(uid);
        })
      );
      setProfiles((prev) => ({ ...prev, ...next }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, loading]);

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-rose-50 to-white pb-24">
      <header className="flex items-center gap-2 px-5 pt-5 pb-4">
        <Bell className="h-5 w-5 text-rose-500" />
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      </header>

      <div className="mx-auto w-full max-w-md px-5">
        {loading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-rose-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex h-[60vh] flex-col items-center justify-center text-center">
            <Bell className="h-12 w-12 text-rose-200" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Nothing here yet
            </h2>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              Likes, Super Likes and matches will show up here.
            </p>
            <Link
              href="/discover"
              className="mt-6 rounded-xl bg-rose-500 px-5 py-2.5 font-semibold text-white transition hover:bg-rose-600 active:scale-[0.98]"
            >
              Start swiping
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => {
              const meta = TYPE_META[n.type];
              const Icon = meta.icon;
              const p = profiles[n.fromUid];
              const isMatch = n.type === "match";
              return (
                <li key={n.id}>
                  <Link
                    href={
                      isMatch
                        ? `/matches`
                        : n.type === "superlike" || n.type === "like"
                        ? "/discover"
                        : "#"
                    }
                    className={`flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm transition hover:shadow-md active:scale-[0.99] ${
                      !n.read ? "ring-1 ring-rose-200" : ""
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${meta.classes}`}
                    >
                      <Icon className="h-6 w-6 fill-current" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {p?.name ?? "Someone"} {meta.label}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {p?.photos?.[0] && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={p.photos[0]}
                        alt={p.name}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
