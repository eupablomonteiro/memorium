import { describe, it, expect } from "vitest";
import {
  uploadFileSchema,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
} from "@memorium/config";

describe("uploadFileSchema", () => {
  describe("validação de mimetype", () => {
    it("deve aceitar MIME type de imagem válido", () => {
      const validImageTypes = ["image/jpeg", "image/png", "image/webp"];
      validImageTypes.forEach((mimetype) => {
        const result = uploadFileSchema.safeParse({
          originalname: "test.jpg",
          mimetype,
          size: 1024,
          path: "/uploads/test.jpg",
        });
        expect(result.success).toBe(true);
      });
    });

    it("deve aceitar MIME type de vídeo válido", () => {
      const validVideoTypes = ["video/mp4", "video/quicktime"];
      validVideoTypes.forEach((mimetype) => {
        const result = uploadFileSchema.safeParse({
          originalname: "test.mp4",
          mimetype,
          size: 1024,
          path: "/uploads/test.mp4",
        });
        expect(result.success).toBe(true);
      });
    });

    it("deve rejeitar MIME type não permitido", () => {
      const result = uploadFileSchema.safeParse({
        originalname: "test.exe",
        mimetype: "application/octet-stream",
        size: 1024,
        path: "/uploads/test.exe",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("validação de tamanho", () => {
    it("deve aceitar arquivo dentro do limite de 2GB", () => {
      const sizes = [1024, 1024 * 1024, 1024 * 1024 * 100];
      sizes.forEach((size) => {
        const result = uploadFileSchema.safeParse({
          originalname: "test.jpg",
          mimetype: "image/jpeg",
          size,
          path: "/uploads/test.jpg",
        });
        expect(result.success).toBe(true);
      });
    });

    it("deve aceitar arquivo exatamente no limite de 2GB", () => {
      const result = uploadFileSchema.safeParse({
        originalname: "test.jpg",
        mimetype: "image/jpeg",
        size: MAX_FILE_SIZE,
        path: "/uploads/test.jpg",
      });
      expect(result.success).toBe(true);
    });

    it("deve rejeitar arquivo maior que 2GB", () => {
      const result = uploadFileSchema.safeParse({
        originalname: "test.jpg",
        mimetype: "image/jpeg",
        size: MAX_FILE_SIZE + 1,
        path: "/uploads/test.jpg",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Arquivo excede o tamanho máximo de 2GB",
        );
      }
    });
  });

  describe("constantes", () => {
    it("deve ter os MIME types corretos", () => {
      expect(ALLOWED_MIME_TYPES).toContain("image/jpeg");
      expect(ALLOWED_MIME_TYPES).toContain("image/png");
      expect(ALLOWED_MIME_TYPES).toContain("video/mp4");
    });

    it("deve ter as extensões corretas", () => {
      expect(ALLOWED_EXTENSIONS).toContain(".jpg");
      expect(ALLOWED_EXTENSIONS).toContain(".mp4");
    });

    it("deve ter o tamanho máximo correto de 2GB", () => {
      expect(MAX_FILE_SIZE).toBe(2 * 1024 * 1024 * 1024);
    });
  });
});
