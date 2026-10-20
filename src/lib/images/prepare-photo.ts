/**
 * Resizes a photo in the browser before upload: at most `maxDimension` px on
 * the longest edge, re-encoded as WebP (JPEG fallback). This keeps pages fast on mobile
 * data and removes hidden metadata such as the GPS location of the camera.
 */
export async function preparePhoto(file: File, maxDimension: number) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  let blob = await encode("image/webp");
  if (!blob || blob.type !== "image/webp") blob = await encode("image/jpeg");
  if (!blob) throw new Error("encode");

  return { blob, width, height, extension: blob.type === "image/webp" ? "webp" : "jpg" };
}
