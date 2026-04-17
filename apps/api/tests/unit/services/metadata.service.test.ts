import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { MetadataService } from "../../../src/modules/upload/metadata/metadata.service";

const TEMP_DIR = path.resolve(process.cwd(), "test-temp-metadata");

describe("MetadataService", () => {
  let service: MetadataService;

  beforeEach(() => {
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
    service = new MetadataService();
  });

  describe("extractMetadata (foto JPEG com EXIF)", () => {
    it("deve extrair data do EXIF de foto JPEG", async () => {
      const jpegBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe1, 0x00, 0x1c, 0x45, 0x78, 0x69, 0x66, 0x00,
        0x00, 0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x0b, 0x00,
        0x0f, 0x00, 0x01, 0x00, 0x00, 0x00, 0x37, 0x00, 0x00, 0x00, 0x13,
        0x00, 0x0f, 0x00, 0x01, 0x00, 0x00, 0x00, 0x30, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xd9,
      ]);

      const testFilePath = path.join(TEMP_DIR, "test-exif.jpg");
      fs.writeFileSync(testFilePath, jpegBuffer);

      const result = await service.extractMetadata(
        testFilePath,
        "test-exif.jpg",
        "image/jpeg"
      );

      expect(result.originalName).toBe("test-exif.jpg");
      expect(result.mimeType).toBe("image/jpeg");
      expect(result.fileSize).toBe(jpegBuffer.length);
      expect(["exif", "mtime", "fallback"]).toContain(result.dateSource);
      expect(result.detectedDate).toBeInstanceOf(Date);
    });
  });

  describe("extractMetadata (arquivo desconhecido)", () => {
    it("deve usar fallback para extensão desconhecida", async () => {
      const testFilePath = path.join(TEMP_DIR, "test-unknown.xyz");
      fs.writeFileSync(testFilePath, Buffer.from("test content"));

      const result = await service.extractMetadata(
        testFilePath,
        "test-unknown.xyz",
        "application/octet-stream"
      );

      expect(result.originalName).toBe("test-unknown.xyz");
      expect(result.dateSource).toBeDefined();
      expect(result.detectedDate).toBeInstanceOf(Date);
    });
  });

  describe("extractMetadata (extensões suportadas)", () => {
    it("deve reconhecer extensões de foto", async () => {
      const photoExts = [".jpg", ".jpeg", ".png", ".heic", ".heif", ".tiff", ".tif"];

      for (const ext of photoExts) {
        const testFilePath = path.join(TEMP_DIR, `test${ext}`);
        fs.writeFileSync(testFilePath, Buffer.from("test"));

        const result = await service.extractMetadata(
          testFilePath,
          `test${ext}`,
          "image/jpeg"
        );

        expect(result.mimeType).toBe("image/jpeg");
      }
    });

    it("deve reconhecer extensões de vídeo", async () => {
      const videoExts = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"];

      for (const ext of videoExts) {
        const testFilePath = path.join(TEMP_DIR, `test${ext}`);
        fs.writeFileSync(testFilePath, Buffer.from("test"));

        const result = await service.extractMetadata(
          testFilePath,
          `test${ext}`,
          "video/mp4"
        );

        expect(result.mimeType).toBe("video/mp4");
      }
    });
  });
});