export const REVIEW_DOCUMENT_MAX_BYTES = 200 * 1024; // 200 KB

export const REVIEW_DOCUMENT_ACCEPT =
  ".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
}

export function validateReviewDocument(file: {
  name: string;
  type: string;
  size: number;
}): string | null {
  if (!file.size) return "Please choose a file.";
  if (file.size > REVIEW_DOCUMENT_MAX_BYTES) {
    return `File must be ${formatBytes(REVIEW_DOCUMENT_MAX_BYTES)} or smaller (yours is ${formatBytes(file.size)}).`;
  }

  const type = file.type.toLowerCase();
  const lowerName = file.name.toLowerCase();
  const byExt =
    lowerName.endsWith(".jpg") ||
    lowerName.endsWith(".jpeg") ||
    lowerName.endsWith(".png") ||
    lowerName.endsWith(".webp") ||
    lowerName.endsWith(".pdf");

  if (type && !ALLOWED_MIME.has(type) && !byExt) {
    return "Use a JPG, PNG, WebP, or PDF file.";
  }
  if (!type && !byExt) {
    return "Use a JPG, PNG, WebP, or PDF file.";
  }

  return null;
}

export function sanitizeDocumentFilename(name: string) {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
  const trimmed = base.replace(/^\.+/, "").slice(0, 80);
  return trimmed || "document";
}
