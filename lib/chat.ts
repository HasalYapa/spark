/**
 * lib/chat.ts
 * -----------
 * Real-time messaging for matches.
 *
 * Firestore layout:
 *   matches/{matchId}/messages/{autoId} — { senderId, text, timestamp }
 */

import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Message } from "./types";

/** Sends a chat message. Timestamps use server time for correct ordering. */
export async function sendMessage(
  matchId: string,
  senderId: string,
  text: string
): Promise<void> {
  await addDoc(collection(db, "matches", matchId, "messages"), {
    senderId,
    text: text.trim(),
    timestamp: Date.now(),
  });
}

/**
 * Subscribes to a match's messages in real time (newest last).
 * Returns an unsubscribe function.
 */
export function subscribeMessages(
  matchId: string,
  onUpdate: (messages: Message[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(
    collection(db, "matches", matchId, "messages"),
    orderBy("timestamp", "asc"),
    limit(200)
  );

  return onSnapshot(
    q,
    (snap) => {
      onUpdate(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            senderId: data.senderId as string,
            text: data.text as string,
            timestamp: data.timestamp as number,
          };
        })
      );
    },
    (err) => onError?.(err)
  );
}
