import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { StorageService } from "../../../src/modules/upload/storage/storage.service";

const TEST_ROOT = path.resolve(process.cwd(), "test-storage-service");

describe("StorageService", () => {
  let service: StorageService;

  beforeEach(() => {
    if (!fs.existsSync(TEST_ROOT)) {
      fs.mkdirSync(TEST_ROOT, { recursive: true });
    }
    service = new StorageService(TEST_ROOT);
  });

  afterEach(() => {
    if (fs.existsSync(TEST_ROOT)) {
      fs.rmSync(TEST_ROOT, { recursive: true, force: true });
    }
  });

  describe("getDirectoryForDate", () => {
    it("deve retornar caminho no formato YYYY/MM/DD", () => {
      const date = new Date(2026, 3, 17);
      const result = service.getDirectoryForDate(date);

      expect(result).toBe(path.join(TEST_ROOT, "2026", "04", "17"));
    });

    it("deve handles janeiro corretamente", () => {
      const date = new Date(2026, 0, 15);
      const result = service.getDirectoryForDate(date);

      expect(result).toContain("01");
      expect(result).toContain("15");
    });

    it("deve padded month e day com zeros", () => {
      const date = new Date(2026, 0, 5);
      const result = service.getDirectoryForDate(date);

      expect(result).toMatch(/2026.*01.*05/);
    });
  });

  describe("ensureDirectory", () => {
    it("deve criar diretório quando não existe", async () => {
      const testDir = path.join(TEST_ROOT, "new-nested-dir", "subdir");

      await service.ensureDirectory(testDir);

      expect(fs.existsSync(testDir)).toBe(true);
    });

    it("deve não falhar quando diretório já existe", async () => {
      const testDir = path.join(TEST_ROOT, "existing");
      fs.mkdirSync(testDir, { recursive: true });

      await service.ensureDirectory(testDir);

      expect(fs.existsSync(testDir)).toBe(true);
    });
  });

  describe("moveFile", () => {
    it("deve mover arquivo para destino", async () => {
      const sourcePath = path.join(TEST_ROOT, "source.jpg");
      const destPath = path.join(TEST_ROOT, "2026", "04", "17", "dest.jpg");

      fs.writeFileSync(sourcePath, Buffer.from("test content"));

      const result = await service.moveFile(sourcePath, destPath);

      expect(fs.existsSync(result)).toBe(true);
      expect(fs.existsSync(sourcePath)).toBe(false);
    });

    it("deve criar diretórios pais automaticamente", async () => {
      const sourcePath = path.join(TEST_ROOT, "source.jpg");
      const destPath = path.join(TEST_ROOT, "2026", "05", "01", "dest.jpg");

      fs.writeFileSync(sourcePath, Buffer.from("test content"));

      await service.moveFile(sourcePath, destPath);

      expect(fs.existsSync(destPath)).toBe(true);
    });

    it("deve adicionar sufixo quando destino existe", async () => {
      const source1 = path.join(TEST_ROOT, "source1.jpg");
      const source2 = path.join(TEST_ROOT, "source2.jpg");
      const destDir = path.join(TEST_ROOT, "dest");
      const destPath = path.join(destDir, "2026-01-01_10-00-00.jpg");

      fs.mkdirSync(destDir, { recursive: true });
      fs.writeFileSync(source1, Buffer.from("content1"));
      fs.writeFileSync(source2, Buffer.from("content2"));
      fs.writeFileSync(destPath, Buffer.from("existing"));

      const result = await service.moveFile(source2, destPath);

      expect(result).not.toBe(destPath);
      expect(result).toContain("_1.jpg");
    });

    it("deve retornar novo caminho quando adicione sufixo", async () => {
      const source1 = path.join(TEST_ROOT, "source1.jpg");
      const source2 = path.join(TEST_ROOT, "source2.jpg");
      const destDir = path.join(TEST_ROOT, "dest");
      const destPath = path.join(destDir, "2026-01-01_10-00-00.jpg");

      fs.mkdirSync(destDir, { recursive: true });
      fs.writeFileSync(source1, Buffer.from("content1"));
      fs.writeFileSync(source2, Buffer.from("content2"));
      fs.writeFileSync(destPath, Buffer.from("existing"));

      const result = await service.moveFile(source1, destPath);

      expect(result).toContain("_1");
    });
  });

  describe("getStoragePath / setStoragePath", () => {
    it("deve retornar storagePath configurado", () => {
      expect(service.getStoragePath()).toBe(TEST_ROOT);
    });

    it("deve atualizar storagePath", () => {
      const newPath = path.join(TEST_ROOT, "new-path");
      service.setStoragePath(newPath);

      expect(service.getStoragePath()).toBe(newPath);
    });
  });
});