export const MAX_GALLERY_IMAGE_SIZE_BYTES = 25 * 1024 * 1024;

export const ALLOWED_GALLERY_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export const GALLERY_IMAGE_ACCEPT =
  ".jpg,.jpeg,.png,.webp,.gif,.avif,image/jpeg,image/png,image/webp,image/gif,image/avif";

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

export function getGalleryImageTypeError(file: Pick<File, "type">) {
  if (!file.type) {
    return "This image type could not be identified. Please export it as JPG, PNG, WebP, GIF, or AVIF and try again.";
  }

  if (!ALLOWED_GALLERY_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_GALLERY_IMAGE_TYPES)[number])) {
    return `Unsupported image type: ${file.type}. Please use JPG, PNG, WebP, GIF, or AVIF.`;
  }

  return null;
}

export function getGalleryImageSizeError(file: Pick<File, "size">) {
  if (file.size > MAX_GALLERY_IMAGE_SIZE_BYTES) {
    return `Image is too large (${formatBytes(file.size)}). Maximum allowed size is ${formatBytes(MAX_GALLERY_IMAGE_SIZE_BYTES)}.`;
  }

  return null;
}
