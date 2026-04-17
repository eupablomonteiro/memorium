export interface FileMetadata {
  originalName: string;
  detectedDate: Date | null;
  dateSource: "exif" | "ffmpeg" | "mtime" | "fallback";
  mimeType: string;
  fileSize: number;
}
