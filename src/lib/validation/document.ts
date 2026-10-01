const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);

const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function validateUploadedDocument(
  file: File
): { error: string; mimeType?: undefined } | { error?: undefined; mimeType: string } {
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return { error: `${file.name} is larger than 10MB` };
  }
  if (!ALLOWED_DOCUMENT_MIME_TYPES.has(file.type)) {
    return { error: `${file.name} must be a JPG, PNG, or PDF file` };
  }
  return { mimeType: file.type };
}
