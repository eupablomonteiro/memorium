import { z } from "zod";

/**
 * MIME types permitidos para upload.
 * Fotos (JPEG, PNG, HEIC, WebP) e Vídeos (MP4, MOV, AVI, MKV).
 */
export const ALLOWED_MIME_TYPES = [
  // Imagens
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
  // Vídeos
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
] as const;

/**
 * Extensões de arquivo permitidas.
 */
export const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".heic",
  ".heif",
  ".webp",
  ".mp4",
  ".mov",
  ".avi",
  ".mkv",
] as const;

/**
 * Tamanho máximo de arquivo: 2GB (em bytes).
 */
export const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

/**
 * Schema de validação de um arquivo enviado via upload.
 */
export const uploadFileSchema = z.object({
  originalname: z.string(),
  mimetype: z.enum(ALLOWED_MIME_TYPES),
  size: z.number().max(MAX_FILE_SIZE, "Arquivo excede o tamanho máximo de 2GB"),
  path: z.string(),
});

export type UploadFile = z.infer<typeof uploadFileSchema>;
