import { publicEnv } from "@/config/env";

/** Storage bucket holding product photos (see supabase/migrations/…_storage.sql). */
export const PRODUCT_IMAGES_BUCKET = "product-images";

/** Upload rules shared by the admin uploader and the server-side checks. */
export const PRODUCT_IMAGE_RULES = {
  /** Types accepted from the device before processing. */
  acceptedInputTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  /** Largest original file accepted from the phone/computer (it is resized before upload). */
  maxInputBytes: 25 * 1024 * 1024,
  /** Longest edge after resizing, in pixels. */
  maxDimension: 1600,
  /** Bucket limit (must match file_size_limit in the storage migration). */
  maxUploadBytes: 5 * 1024 * 1024,
} as const;

/** Public URL of an object in the product-images bucket. */
export function productImageUrl(storagePath: string): string {
  const path = storagePath.split("/").map(encodeURIComponent).join("/");
  return `${publicEnv.supabaseUrl}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${path}`;
}
