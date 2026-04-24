import fs from "fs";
import path from "path";
import exifReader from "exif-reader";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { FileMetadata } from "./types.js";

const PHOTO_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".heic",
  ".heif",
  ".tiff",
  ".tif",
  ".png",
];
const VIDEO_EXTENSIONS = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"];

export class MetadataService {
  constructor() {
    ffmpeg.setFfmpegPath(ffmpegStatic as unknown as string);
  }

  private async fallbackMetadata(
    filePath: string,
    originalName: string,
    mimeType: string,
    fileStats: fs.Stats,
  ): Promise<FileMetadata> {
    const mtime = new Date(fileStats.mtime);

    if (mtime && !isNaN(mtime.getTime()) && mtime.getFullYear() > 2000) {
      return {
        originalName,
        detectedDate: mtime,
        dateSource: "mtime",
        mimeType,
        fileSize: fileStats.size,
      };
    }

    return {
      originalName,
      detectedDate: new Date(),
      dateSource: "fallback",
      mimeType,
      fileSize: fileStats.size,
    };
  }

  private parseExifDate(dateStr: string): Date | null {
    const match = dateStr.match(
      /(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/,
    );
    if (!match) return null;

    const [, year, month, day, hour, minute, second] = match;
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second),
    );
  }

  private parseFFmpegDate(dateStr: string): Date | null {
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    const match = dateStr.match(
      /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/,
    );
    if (match) {
      const [, year, month, day, hour, minute, second] = match;
      date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second),
      );
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    return null;
  }

  private async extractPhotoMetadata(
    filePath: string,
    originalName: string,
    mimeType: string,
    fileStats: fs.Stats,
  ): Promise<FileMetadata> {
    try {
      const buffer = fs.readFileSync(filePath);
      const exif = exifReader(buffer) as Record<string, unknown>;

      const dateTimeOriginal = (exif as Record<string, Record<string, string>>)
        ?.EXIF?.DateTimeOriginal;

      if (dateTimeOriginal) {
        const date = this.parseExifDate(dateTimeOriginal);

        if (date && !isNaN(date.getTime())) {
          return {
            originalName,
            detectedDate: date,
            dateSource: "exif",
            mimeType,
            fileSize: fileStats.size,
          };
        }
      }
    } catch (error) {
      console.warn(
        `[MetadataService] EXIF extract failed for ${originalName}:`,
        error,
      );
    }

    return this.fallbackMetadata(filePath, originalName, mimeType, fileStats);
  }

  private async extractVideoMetadata(
    filePath: string,
    originalName: string,
    mimeType: string,
    fileStats: fs.Stats,
  ): Promise<FileMetadata> {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          console.warn(
            `[MetadataService] FFprobe failed for ${originalName}:`,
            err,
          );
          return resolve(
            this.fallbackMetadata(filePath, originalName, mimeType, fileStats),
          );
        }

        let creationTime =
          metadata.format?.tags?.creation_time ||
          metadata.format?.creation_time;

        if (!creationTime && Array.isArray(metadata.streams)) {
          for (const stream of metadata.streams) {
            if (stream.tags?.creation_time) {
              creationTime = stream.tags.creation_time;
              break;
            }
          }
        }

        if (creationTime) {
          const date = this.parseFFmpegDate(creationTime);
          if (date && !isNaN(date.getTime())) {
            return resolve({
              originalName,
              detectedDate: date,
              dateSource: "ffmpeg",
              mimeType,
              fileSize: fileStats.size,
            });
          } else {
            console.warn(
              `[MetadataService] Failed to parse creation time "${creationTime}" for ${originalName}`,
            );
          }
        }

        return resolve(
          this.fallbackMetadata(filePath, originalName, mimeType, fileStats),
        );
      });
    });
  }

  async extractMetadata(
    filePath: string,
    originalName: string,
    mimeType: string,
  ): Promise<FileMetadata> {
    const ext = path.extname(originalName).toLowerCase();
    const fileStats = fs.statSync(filePath);

    if (PHOTO_EXTENSIONS.includes(ext)) {
      return this.extractPhotoMetadata(
        filePath,
        originalName,
        mimeType,
        fileStats,
      );
    }

    if (VIDEO_EXTENSIONS.includes(ext)) {
      return this.extractVideoMetadata(
        filePath,
        originalName,
        mimeType,
        fileStats,
      );
    }

    return this.fallbackMetadata(filePath, originalName, mimeType, fileStats);
  }
}
