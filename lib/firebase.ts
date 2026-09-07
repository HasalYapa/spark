/**
 * lib/firebase.ts
 * ---------------
 * Central Firebase initialization for the client-side app.
 *
 * Exposes lazily-initialized singletons so that any module in the app can
 * import { auth, db, storage } without worrying about duplicate setup.
 * The config values come from environment variables (see `.env.example`).
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

/** Firebase web-app configuration, sourced from public env vars. */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Initialize (or reuse) the Firebase app.
 * `getApps()` guard prevents re-initialization during Next.js hot reloads.
 */
export const firebaseApp: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

/** Firebase Authentication instance. */
export const auth: Auth = getAuth(firebaseApp);

/** Cloud Firestore instance (users, matches, messages). */
export const db: Firestore = getFirestore(firebaseApp);

/** Cloud Storage instance (profile pictures). */
export const storage: FirebaseStorage = getStorage(firebaseApp);
