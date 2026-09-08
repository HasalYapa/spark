/**
 * lib/matching.ts
 * ---------------
 * Swipe (like/pass) handling and match creation.
 *
 * Firestore layout:
 *   likes/{fromUid_toUid}   — positive swipes
 *   passed/{fromUid_toUid}  — negative swipes
 *   matches/{autoId}        — created when two users like each other:
 *                             { users: [uidA, uidB] (sorted), createdAt }
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { UserProfile, LikeDoc } from "./types";
import { createNotification } from "./notifications";

export type SwipeDirection = "like" | "superlike" | "pass";

function pairId(from: string, to: string) {
  return `${from}_${to}`;
}

/** Sorted user pair — used as the users array so queries work with array-contains. */
export function sortedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/**
 * Records a swipe. If it's a like and the target already liked us,
 * a match document is created and its id is returned.
 */
export async function swipe(
  meUid: string,
  targetUid: string,
  direction: SwipeDirection
): Promise<{ matchId: string | null }> {
  const isSuper = direction === "superlike";
  const col = direction === "pass" ? "passed" : "likes";
  await setDoc(doc(db, col, pairId(meUid, targetUid)), {
    from: meUid,
    to: targetUid,
    ...(direction !== "pass" ? { super: isSuper } : {}),
    createdAt: Date.now(),
  });

  if (direction === "pass") return { matchId: null };

  // Let the target know they were liked / super liked.
  await createNotification(targetUid, meUid, isSuper ? "superlike" : "like");

  // Did the target already like me?
  const reciprocal = await getDoc(doc(db, "likes", pairId(targetUid, meUid)));
  if (!reciprocal.exists()) return { matchId: null };

  // It's a match! Create the match document (idempotent via fixed id).
  const [a, b] = sortedPair(meUid, targetUid);
  const matchRef = doc(db, "matches", `${a}_${b}`);
  await setDoc(
    matchRef,
    { users: [a, b], createdAt: Date.now(), lastMessageAt: Date.now() },
    { merge: true }
  );
  // Notify both sides about the new match.
  await Promise.all([
    createNotification(targetUid, meUid, "match"),
    createNotification(meUid, targetUid, "match"),
  ]);
  return { matchId: matchRef.id };
}

/**
 * Fetches swipeable profiles: onboarded users matching my preferences,
 * excluding myself and anyone I've already swiped.
 */
export async function fetchCandidates(me: UserProfile): Promise<UserProfile[]> {
  // Everything I've already swiped.
  const [liked, passed] = await Promise.all([
    getDocs(query(collection(db, "likes"), where("from", "==", me.uid))),
    getDocs(query(collection(db, "passed"), where("from", "==", me.uid))),
  ]);
  const swiped = new Set<string>([
    ...liked.docs.map((d) => d.data().to as string),
    ...passed.docs.map((d) => d.data().to as string),
  ]);

  const snap = await getDocs(
    query(
      collection(db, "users"),
      where("onboarded", "==", true),
      limit(100)
    )
  );

  const pref = me.preferences ?? { gender: "everyone", minAge: 18, maxAge: 99 };

  return snap.docs
    .map((d) => d.data() as UserProfile)
    .filter((u) => {
      if (u.uid === me.uid || swiped.has(u.uid)) return false;
      // Their gender vs my preference ("men"|"women"|"everyone").
      if (pref.gender === "men" && u.gender !== "male") return false;
      if (pref.gender === "women" && u.gender !== "female") return false;
      // Their age vs my range.
      const age = u.age ?? 0;
      if (age < pref.minAge || age > pref.maxAge) return false;
      return true;
    })
    .slice(0, 20);
}

/** Fetches all matches for a user (newest first). */
export async function fetchMatches(meUid: string) {
  const snap = await getDocs(
    query(
      collection(db, "matches"),
      where("users", "array-contains", meUid)
    )
  );

  return snap.docs
    .map((d) => {
      const data = d.data();
      const otherUid = (data.users as string[]).find((u) => u !== meUid)!;
      return { matchId: d.id, otherUid, createdAt: data.createdAt as number };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Fetches a single user profile by uid (null if missing). */
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/**
 * "Likes You" — profiles who liked (or super liked) me but I haven't
 * swiped on yet. Returns [{ profile, super }] rows, newest first.
 */
export async function fetchLikesYou(meUid: string): Promise<
  { profile: UserProfile; superLike: boolean; likedAt: number }[]
> {
  const [received, liked, passed] = await Promise.all([
    getDocs(query(collection(db, "likes"), where("to", "==", meUid))),
    getDocs(query(collection(db, "likes"), where("from", "==", meUid))),
    getDocs(query(collection(db, "passed"), where("from", "==", meUid))),
  ]);

  const alreadySwiped = new Set<string>([
    ...liked.docs.map((d) => d.data().to as string),
    ...passed.docs.map((d) => d.data().to as string),
  ]);

  const rows = received.docs
    .map((d) => d.data() as LikeDoc)
    .filter((l) => !alreadySwiped.has(l.from))
    .sort((a, b) => b.createdAt - a.createdAt);

  const out: { profile: UserProfile; superLike: boolean; likedAt: number }[] = [];
  await Promise.all(
    rows.map(async (l) => {
      const profile = await fetchUserProfile(l.from);
      if (profile) {
        out.push({ profile, superLike: !!l.super, likedAt: l.createdAt });
      }
    })
  );
  return out.sort((a, b) => b.likedAt - a.likedAt);
}
