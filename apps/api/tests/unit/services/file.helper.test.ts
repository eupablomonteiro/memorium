import { describe, it, expect } from "vitest";
import { FileHelper } from "../../../src/modules/upload/storage/file.helper";

describe("FileHelper", () => {
  describe("generateFilename", () => {
    it("deve gerar nome no formato YYYY-MM-DD_HH-mm-ss-nomeOriginal.ext", () => {
      const date = new Date(2026, 3, 17, 14, 30, 45);
      const result = FileHelper.generateFilename(date, "foto.jpg");

      expect(result).toMatch(/^2026-04-17_14-30-45-foto\.jpg$/);
    });

    it("deve incluir nome original sanitizado quando fornecido", () => {
      const date = new Date(2026, 3, 17, 14, 30, 45);
      const result = FileHelper.generateFilename(date, "minha foto.jpg");

      expect(result).toMatch(/^2026-04-17_14-30-45-minha_foto\.jpg$/);
    });

    it("deve usar apenas data com nome quando original não tem extensão", () => {
      const date = new Date(2026, 3, 17, 14, 30, 45);
      const result = FileHelper.generateFilename(date, "foto");

      expect(result).toMatch(/^2026-04-17_14-30-45-foto$/);
    });

    it("deve lidar com caracteres especiais no nome", () => {
      const date = new Date(2026, 3, 17, 14, 30, 45);
      const result = FileHelper.generateFilename(date, "foto<inválido>.jpg");

      expect(result).not.toContain("<");
      expect(result).not.toContain(">");
      expect(result).not.toContain(":");
    });

    it("deve converter espaços para underscores", () => {
      const date = new Date(2026, 3, 17, 14, 30, 45);
      const result = FileHelper.generateFilename(date, "minha foto legal.jpg");

      expect(result).toContain("_");
      expect(result).not.toContain(" ");
    });

    it("deve truncar nomes muito longos", () => {
      const date = new Date(2026, 3, 17, 14, 30, 45);
      const longName = "a".repeat(100) + ".jpg";
      const result = FileHelper.generateFilename(date, longName);

      expect(result.length).toBeLessThan(80);
    });

    it("deve preservar extensão em maiúsculas", () => {
      const date = new Date(2026, 3, 17, 14, 30, 45);
      const result = FileHelper.generateFilename(date, " foto .JPG");

      expect(result).toMatch(/\.jpg$/i);
    });

    it("deve handles zeros à esquerda para mês e dia", () => {
      const date = new Date(2026, 0, 5, 9, 5, 5);
      const result = FileHelper.generateFilename(date, "foto.jpg");

      expect(result).toMatch(/^2026-01-05_09-05-05-foto\.jpg$/);
    });
  });

  describe("sanitizeFilename", () => {
    it("deve remover caracteres inválidos", () => {
      const result = FileHelper.sanitizeFilename("arquivo<>:\"/\\|?*inválido");
      expect(result).not.toContain("<");
      expect(result).not.toContain(">");
      expect(result).not.toContain(":");
      expect(result).not.toContain("\"");
      expect(result).not.toContain("/");
      expect(result).not.toContain("\\");
      expect(result).not.toContain("|");
      expect(result).not.toContain("?");
      expect(result).not.toContain("*");
    });

    it("deve converter espaços para underscores", () => {
      const result = FileHelper.sanitizeFilename("meu arquivo legal");
      expect(result).toBe("meu_arquivo_legal");
    });

    it("deve trimming espaços em branco", () => {
      const result = FileHelper.sanitizeFilename("  arquivo  ");
      expect(result).toBe("_arquivo_");
    });

    it("deve truncar para máximo 50 caracteres", () => {
      const longName = "a".repeat(100);
      const result = FileHelper.sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(50);
    });
  });
});