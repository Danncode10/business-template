/**
 * Client-side image compression + Supabase Storage upload for blog cover images.
 *
 * Compression is done entirely in the browser using the Canvas API (no extra npm).
 * Target: ≤ 1200px wide, JPEG quality 0.82 — keeps images sharp on retina screens
 * while staying well under the 5 MB bucket limit.
 */

import { createClient } from "@/utils/supabase/client";

const APP_ID = process.env.NEXT_PUBLIC_APP_ID ?? "business-template";
const BUCKET  = "blog-images";
const MAX_PX  = 1200;   // longest edge target
const QUALITY = 0.82;   // JPEG quality (0–1)

export interface UploadResult {
  url: string;       // public CDN URL
  path: string;      // storage path for deletion
  sizeKb: number;    // final size after compression
}

// ── Compress via Canvas ───────────────────────────────────────────────────────

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function compressImage(file: File): Promise<Blob> {
  const img = await loadImage(file);

  // Scale down if either dimension exceeds MAX_PX
  let { width, height } = img;
  if (width > MAX_PX || height > MAX_PX) {
    if (width >= height) {
      height = Math.round((height / width) * MAX_PX);
      width  = MAX_PX;
    } else {
      width  = Math.round((width / height) * MAX_PX);
      height = MAX_PX;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width  = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error("Canvas compression failed")),
      "image/jpeg",
      QUALITY,
    );
  });
}

// ── Upload ────────────────────────────────────────────────────────────────────

export async function uploadBlogImage(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<UploadResult> {
  onProgress?.(5);

  // 1. Compress
  const blob = await compressImage(file);
  onProgress?.(40);

  // 2. Unique path: app-id/timestamp-randomhex.jpg
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${APP_ID}/${Date.now()}-${rand}.jpg`;

  // 3. Upload to Supabase Storage
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) throw new Error(error.message);
  onProgress?.(90);

  // 4. Get public URL
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  onProgress?.(100);

  return {
    url: data.publicUrl,
    path,
    sizeKb: Math.round(blob.size / 1024),
  };
}

export async function deleteBlogImage(path: string): Promise<void> {
  const supabase = createClient();
  await supabase.storage.from(BUCKET).remove([path]);
}
