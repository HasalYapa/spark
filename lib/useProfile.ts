"use client";

/**
 * lib/useProfile.ts
 * -----------------
 * Subscribes to the signed-in user's Firestore profile in real time.
 * Returns null while loading; undefined when no user is signed in.
 */

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { UserProfile } from "@/lib/types";

export function useProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to resolve first.
    if (authLoading) return;
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Live subscription — updates automatically when the profile changes
    // (e.g. right after onboarding writes `onboarded: true`).
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snap) => {
      setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, authLoading]);

  return { profile, loading };
}
