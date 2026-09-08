/**
 * lib/useNotifications.ts
 * -----------------------
 * Real-time subscription to the signed-in user's notifications.
 * Returns the list (newest first), unread count, and loading flag.
 */

import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { AppNotification } from "@/lib/types";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("to", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setNotifications(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<AppNotification, "id">),
          }))
        );
        setLoading(false);
      },
      (err) => {
        console.error("[useNotifications] Snapshot failed:", err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  return { notifications, unreadCount, loading };
}
