/**
 * lib/auth.ts
 * -----------
 * Thin, reusable wrappers around Firebase Authentication so UI components
 * never talk to the SDK directly. Keeping these helpers here makes it easy
 * to swap providers or add logging/analytics later.
 */

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

/** Signs in with an email/password pair. */
export async function loginWithEmail(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

/**
 * Registers a new user with email + password, sets their display name,
 * and creates the initial Firestore profile document.
 */
export async function registerWithEmail(
  name: string,
  email: string,
  password: string
) {
  const { user } = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // Persist the chosen display name on the Auth record too.
  await updateProfile(user, { displayName: name });

  // Seed the `users/{uid}` document the rest of the app will build upon.
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name,
    email,
    age: null,
    gender: null,
    bio: "",
    photos: [],
    location: null,
    preferences: { gender: "everyone", minAge: 18, maxAge: 99 },
    onboarded: false, // onboarding flow flips this to true
    createdAt: Date.now(),
  });

  return user;
}

/** Opens the Google account picker in a popup and signs the user in. */
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const { user } = await signInWithPopup(auth, provider);

  // Google users skip registerWithEmail, so seed their profile doc if new.
  // NOTE: we intentionally don't fail the sign-in if this write is blocked
  // by Firestore rules — the dashboard/onboarding will surface it instead.
  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        name: user.displayName ?? "",
        email: user.email,
        age: null,
        gender: null,
        bio: "",
        photos: [],
        location: null,
        preferences: { gender: "everyone", minAge: 18, maxAge: 99 },
        onboarded: false,
        createdAt: Date.now(),
      },
      { merge: true } // merge so we never overwrite an existing profile
    );
  } catch (err) {
    console.warn("[auth] Profile seeding skipped:", err);
  }

  return user;
}

/** Signs the current user out. */
export async function logout() {
  await signOut(auth);
}
