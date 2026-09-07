/**
 * lib/storage.ts
 * --------------
 * Helpers for Firebase Storage — profile photo uploads.
 */

/**
 * lib/storage.ts — profile photo uploads via Cloudinary (free tier).
 *
 * Uses an UNSIGNED upload preset, so no API secret lives in the app.
 * Required env vars (.env.local):
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME      — e.g. zszxrxjr
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET   — unsigned preset name
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

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
 * Uploads a single profile photo and returns its secure CDN URL.
 * Photos are stored under spark/{uid}/ in the Cloudinary account.
 */
export async function uploadProfilePhoto(
  uid: string,
  file: File
): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw Object.assign(
      new Error("Cloudinary is not configured"),
      { code: "config/missing" }
    );
  }

  const blob = await compressImage(file);

  const form = new FormData();
  form.append("file", blob, "photo.jpg");
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("folder", `spark/${uid}`);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: form }
  );

  if (!res.ok) {
    let message = `upload-failed-${res.status}`;
    try {
      const err = await res.json();
      message = err?.error?.message ?? message;
    } catch {
      /* keep default */
    }
    throw Object.assign(new Error(message), { code: `cloudinary/${res.status}` });
  }

  const data = await res.json();
  return data.secure_url as string;
}
