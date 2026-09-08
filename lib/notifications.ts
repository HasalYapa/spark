/**
 * lib/notifications.ts
 * --------------------
 * Firestore layout:
 *   notifications/{autoId} — { to, fromUid, type, read, createdAt }
 *
 * type: "like" | "superlike" | "match"
 */

import {
  addDoc,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { NotificationType } from "./types";

/** Writes a notification for the target user. Never throws (non-critical). */
export async function createNotification(
  toUid: string,
  fromUid: string,
  type: NotificationType
): Promise<void> {
  try {
    await addDoc(collection(db, "notifications"), {
      to: toUid,
      fromUid,
      type,
      read: false,
      createdAt: Date.now(),
    });
  } catch (err) {
    console.error("[notifications] Failed to write notification:", err);
  }
}

/** Marks every unread notification for a user as read. */
export async function markNotificationsRead(
  uid: string,
  unreadIds: string[]
): Promise<void> {
  await Promise.all(
    unreadIds.map((id) =>
      updateDoc(doc(db, "notifications", id), { read: true })
    )
  );
}
