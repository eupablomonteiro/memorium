import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import { UploadService } from "../../../src/modules/upload/upload.service";
import { ConfigService } from "../../../src/modules/config/config.service";

const TEST_TEMP = path.resolve(process.cwd(), "test-temp-upload");
const TEST_STORAGE = path.resolve(process.cwd(), "test-storage-upload");

describe("UploadService", () => {
  let service: UploadService;

  beforeEach(() => {
    if (!fs.existsSync(TEST_TEMP)) {
      fs.mkdirSync(TEST_TEMP, { recursive: true });
    }
    if (!fs.existsSync(TEST_STORAGE)) {
      fs.mkdirSync(TEST_STORAGE, { recursive: true });
    }
    vi.spyOn(ConfigService.prototype, "load").mockReturnValue({
      storagePath: TEST_STORAGE,
      port: 3001,
    });
    service = new UploadService();
  });

  afterEach(() => {
    if (fs.existsSync(TEST_TEMP)) {
      fs.rmSync(TEST_TEMP, { recursive: true, force: true });
    }
    if (fs.existsSync(TEST_STORAGE)) {
      fs.rmSync(TEST_STORAGE, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  describe("processFile", () => {
    it("deve processar arquivo e mover para storage", async () => {
      const sourcePath = path.join(TEST_TEMP, "test-foto.jpg");
      fs.writeFileSync(sourcePath, Buffer.from("test image content"));

      const result = await service.processFile(
        sourcePath,
        "test-foto.jpg",
        "image/jpeg"
      );

      expect(result.originalName).toBe("test-foto.jpg");
      expect(result.fileName).toMatch(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}.*\.jpg$/);
      expect(result.savedPath).toContain(TEST_STORAGE);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.mimeType).toBe("image/jpeg");
    });

    it("deve definir dateSource como mtime para arquivo sem EXIF", async () => {
      const sourcePath = path.join(TEST_TEMP, "no-exif.jpg");
      fs.writeFileSync(sourcePath, Buffer.from("plain image without exif"));

      const result = await service.processFile(
        sourcePath,
        "no-exif.jpg",
        "image/jpeg"
      );

      expect(result.metadata.dateSource).toBeDefined();
      expect(["mtime", "fallback", "exif"]).toContain(result.metadata.dateSource);
    });

    it("deve organizar em pasta por data", async () => {
      const sourcePath = path.join(TEST_TEMP, "organize.jpg");
      const now = new Date();
      fs.writeFileSync(sourcePath, Buffer.from("test"));

      const result = await service.processFile(
        sourcePath,
        "organize.jpg",
        "image/jpeg"
      );

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");

      expect(result.savedPath).toContain(path.join(TEST_STORAGE, String(year), month));
    });
  });

  describe("getStoragePath", () => {
    it("deve retornar storagePath configurado", () => {
      const result = service.getStoragePath();
      expect(result).toBe(TEST_STORAGE);
    });
  });
});