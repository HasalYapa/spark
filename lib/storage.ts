/**
 * lib/storage.ts
 * --------------
 * Helpers for Firebase Storage — profile photo uploads.
 */

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Uploads a single profile photo for a user and returns its public
 * download URL. Files are namespaced under users/{uid}/photos/ so that
 * storage rules can be scoped per-user.
 */
export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  // Strip problematic characters from the original filename.
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `users/${uid}/photos/${Date.now()}-${safeName}`;
  const photoRef = ref(storage, path);

  await uploadBytes(photoRef, file, { contentType: file.type });
  return getDownloadURL(photoRef);
}
