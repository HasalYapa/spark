/**
 * lib/storage.ts
 * --------------
 * Helpers for Firebase Storage — profile photo uploads.
 */

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Downscales and re-compresses an image in the browser before upload.
 * A 4000px / 8MB phone photo becomes roughly 1080px / ~200KB, which
 * uploads fast even on slow connections.
 */
async function compressImage(
  file: File,
  maxDim = 1080,
  quality = 0.8
): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file; // don't touch GIFs (animation) or non-images
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));

    // Small enough already — skip re-encoding.
    if (scale >= 1 && file.size < 500_000) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) =>
      canvas.toBlob(
        (blob) => resolve(blob ?? file),
        "image/jpeg",
        quality
      )
    );
  } catch {
    return file; // decode failed — try the original anyway
  }
}

/**
 * Uploads a single profile photo for a user and returns its public
 * download URL. Files are namespaced under users/{uid}/photos/ so that
 * storage rules can be scoped per-user.
 */
export async function uploadProfilePhoto(
  uid: string,
  file: File
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `users/${uid}/photos/${Date.now()}-${safeName}.jpg`;
  const photoRef = ref(storage, path);

  const blob = await compressImage(file);
  await uploadBytes(photoRef, blob, { contentType: "image/jpeg" });
  return getDownloadURL(photoRef);
}
