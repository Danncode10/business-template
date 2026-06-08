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

// This bucket is shared across every Dannflow business on a free Supabase
// storage tier (1 GB total) — keeping each post's images small protects
// everyone's quota, not just this app's.
export const MAX_POST_IMAGES_KB = 2 * 1024; // 2 MB of images per blog post

export interface UploadResult {
  url: string;       // public CDN URL
  path: string;      // storage path for deletion
  sizeKb: number;    // final size after compression
}

// ── Storage path helpers ──────────────────────────────────────────────────────

const PUBLIC_URL_MARKER = `/storage/v1/object/public/${BUCKET}/`;

/** Recovers the storage path (e.g. "business-template/123-abc.jpg") from a public URL. */
export function extractBlogImagePath(url: string): string | null {
  const idx = url.indexOf(PUBLIC_URL_MARKER);
  if (idx === -1) return null;
  return url.slice(idx + PUBLIC_URL_MARKER.length);
}

/** Pulls every <img src="..."> out of the editor's HTML content. */
export function extractImageSrcs(html: string): string[] {
  return Array.from(html.matchAll(/<img[^>]+src="([^"]+)"/g), m => m[1]);
}

/**
 * Sums the storage size (in KB) of the given image URLs, used to show how
 * much of a post's image budget is currently spent. Ignores URLs that aren't
 * in this bucket (e.g. external images).
 */
export async function getBlogImageUsageKb(urls: (string | null | undefined)[]): Promise<number> {
  const paths = Array.from(new Set(
    urls.filter((u): u is string => !!u).map(extractBlogImagePath).filter((p): p is string => !!p)
  ));
  if (!paths.length) return 0;

  const supabase = createClient();
  const { data } = await supabase.storage.from(BUCKET).list(APP_ID, { limit: 1000 });
  if (!data) return 0;

  const sizeByName = new Map(data.map(f => [f.name, f.metadata?.size ?? 0]));
  let bytes = 0;
  for (const path of paths) {
    bytes += sizeByName.get(path.split("/").pop()!) ?? 0;
  }
  return Math.round(bytes / 1024);
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

// ── Data-URL helpers (deferred-upload flow) ─────────────────────────────────
// Images are held as compressed data URLs in the editor and only written to
// Supabase Storage when the user clicks Publish — nothing touches the shared
// bucket while drafting or saving a draft.

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Compresses a picked file and returns a self-contained data URL (no upload). */
export async function compressImageToDataUrl(file: File): Promise<string> {
  const blob = await compressImage(file);
  return blobToDataUrl(blob);
}

export function isDataUrl(src: string): boolean {
  return src.startsWith("data:");
}

/** Approximate decoded byte size (in KB) of a base64 data URL. */
export function dataUrlSizeKb(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  const b64 = comma === -1 ? dataUrl : dataUrl.slice(comma + 1);
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.round((b64.length * 3 / 4 - padding) / 1024);
}

/** Uploads an already-compressed data URL to storage and returns its public URL. */
export async function uploadDataUrl(dataUrl: string): Promise<UploadResult> {
  const blob = await (await fetch(dataUrl)).blob();
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${APP_ID}/${Date.now()}-${rand}.jpg`;

  const supabase = createClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path, sizeKb: Math.round(blob.size / 1024) };
}

// ── Upload ────────────────────────────────────────────────────────────────────

export async function uploadBlogImage(
  file: File,
  onProgress?: (pct: number) => void,
  remainingKb?: number,
): Promise<UploadResult> {
  onProgress?.(5);

  // 1. Compress
  const blob = await compressImage(file);
  const sizeKb = Math.round(blob.size / 1024);

  // Budget check happens *after* compression (so the figure is accurate) but
  // *before* the network upload (so we don't waste storage writes on images
  // that would blow the post's quota).
  if (remainingKb !== undefined && sizeKb > remainingKb) {
    throw new Error(
      `This image is ${sizeKb} KB, but this post only has ${remainingKb} KB left of its ` +
      `${MAX_POST_IMAGES_KB / 1024} MB image budget. Remove an image or pick a smaller one.`
    );
  }
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
    sizeKb,
  };
}

export async function deleteBlogImage(path: string): Promise<void> {
  const supabase = createClient();
  await supabase.storage.from(BUCKET).remove([path]);
}
