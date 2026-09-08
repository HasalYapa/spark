/**
 * lib/types.ts
 * ------------
 * Shared TypeScript types for the app's Firestore documents.
 */

/** Gender options stored on the user profile. */
export type Gender = "male" | "female" | "other";

/** Who the user wants to see in the swipe deck. */
export type PrefGender = "men" | "women" | "everyone";

/** Firestore `users/{uid}` document shape. */
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  age: number | null;
  gender: Gender | null;
  bio: string;
  /** Download URLs of profile photos stored in Firebase Storage. */
  photos: string[];
  location: string | null;
  preferences: {
    gender: PrefGender;
    minAge: number;
    maxAge: number;
  };
  /** Flipped to true once onboarding is complete. */
  onboarded: boolean;
  createdAt: number;
}

/** Firestore `notifications/{autoId}` shape. */
export type NotificationType = "like" | "superlike" | "match";

export interface AppNotification {
  id: string;
  to: string;
  fromUid: string;
  type: NotificationType;
  read: boolean;
  createdAt: number;
}

/** Firestore `likes/{fromUid_toUid}` shape. */
export interface LikeDoc {
  from: string;
  to: string;
  /** True when the like was a Super Like. */
  super?: boolean;
  createdAt: number;
}

/** Firestore `matches/{matchId}` document shape (used in later tasks). */
export interface Match {
  matchId: string;
  users: [string, string];
  timestamp: number;
}

/** Firestore `matches/{matchId}/messages/{msgId}` shape (later tasks). */
export interface Message {
  senderId: string;
  text: string;
  timestamp: number;
}
