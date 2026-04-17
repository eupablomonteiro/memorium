import { describe, it, expect } from "vitest";
import { appConfigSchema } from "@memorium/config";

describe("appConfigSchema", () => {
  describe("validação de storagePath", () => {
    it("deve aceitar storagePath válido", () => {
      const result = appConfigSchema.safeParse({
        storagePath: "D:\\Memorium",
        port: 3001,
      });
      expect(result.success).toBe(true);
    });

    it("deve rejeitar storagePath vazio", () => {
      const result = appConfigSchema.safeParse({
        storagePath: "",
        port: 3001,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "O caminho de armazenamento é obrigatório",
        );
      }
    });

    it("deve rejeitar storagePath com apenas espaços", () => {
      const result = appConfigSchema.safeParse({
        storagePath: "   ",
        port: 3001,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "O caminho de armazenamento é obrigatório",
        );
      }
    });
  });

  describe("validação de port", () => {
    it("deve aceitar porta válida no range permitido", () => {
      const validPorts = [1024, 3000, 3001, 8080, 65535];
      validPorts.forEach((port) => {
        const result = appConfigSchema.safeParse({
          storagePath: "D:\\Memorium",
          port,
        });
        expect(result.success).toBe(true);
      });
    });

    it("deve rejeitar porta menor que 1024", () => {
      const result = appConfigSchema.safeParse({
        storagePath: "D:\\Memorium",
        port: 1023,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "A porta deve ser maior que 1023",
        );
      }
    });

    it("deve rejeitar porta maior que 65535", () => {
      const result = appConfigSchema.safeParse({
        storagePath: "D:\\Memorium",
        port: 65536,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "A porta deve ser menor que 65536",
        );
      }
    });

    it("deve rejeitar porta que não seja inteiro", () => {
      const result = appConfigSchema.safeParse({
        storagePath: "D:\\Memorium",
        port: 3001.5,
      });
      expect(result.success).toBe(false);
    });

    it("deve usar valor padrão quando port não fornecida", () => {
      const result = appConfigSchema.safeParse({
        storagePath: "D:\\Memorium",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.port).toBe(3001);
      }
    });
  });

  describe("validação completa", () => {
    it("deve aceitar objeto de configuração completo válido", () => {
      const config = {
        storagePath: "D:\\Memorium",
        port: 3001,
      };
      const result = appConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(config);
      }
    });

    it("deve rejeitar objeto com propriedades inválidas", () => {
      const result = appConfigSchema.safeParse({
        storagePath: "D:\\Memorium",
        port: 3001,
        invalidProp: "test",
      });
      expect(result.success).toBe(false);
    });
  });
});
