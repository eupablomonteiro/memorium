import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ConfigService } from "../../../src/modules/config/config.service";
import fs from "fs";
import path from "path";

const TEST_CONFIG_PATH = path.resolve(
  process.cwd(),
  "test-memorium.config.json",
);

const TEST_PROD_CONFIG_PATH = path.resolve(
  process.cwd(),
  "memorium.config.json",
);

describe("ConfigService", () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_CONFIG_PATH)) {
      fs.unlinkSync(TEST_CONFIG_PATH);
    }
    if (fs.existsSync(TEST_PROD_CONFIG_PATH)) {
      fs.unlinkSync(TEST_PROD_CONFIG_PATH);
    }
    ConfigService.getInstance().load();
    vi.spyOn(process, "cwd").mockReturnValue(process.cwd());
  });

  afterEach(() => {
    if (fs.existsSync(TEST_CONFIG_PATH)) {
      fs.unlinkSync(TEST_CONFIG_PATH);
    }
    if (fs.existsSync(TEST_PROD_CONFIG_PATH)) {
      fs.unlinkSync(TEST_PROD_CONFIG_PATH);
    }
    vi.restoreAllMocks();
  });

  describe("getInstance (Singleton)", () => {
    it("deve retornar a mesma instância", () => {
      const instance1 = ConfigService.getInstance();
      const instance2 = ConfigService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("load()", () => {
    it("deve carregar configuração padrão quando arquivo não existe", () => {
      if (fs.existsSync(TEST_PROD_CONFIG_PATH)) {
        fs.unlinkSync(TEST_PROD_CONFIG_PATH);
      }
      const service = ConfigService.getInstance();
      service.load();
      const config = service.get();

      expect(config.storagePath).toBe("D:\\Memorium");
      expect(config.port).toBe(3001);
    });

    it("deve carregar configuração do arquivo quando existe", () => {
      if (fs.existsSync(TEST_PROD_CONFIG_PATH)) {
        fs.unlinkSync(TEST_PROD_CONFIG_PATH);
      }
      const customConfig = {
        storagePath: "D:\\CustomPath",
        port: 4000,
      };
      fs.writeFileSync(TEST_PROD_CONFIG_PATH, JSON.stringify(customConfig), "utf-8");

      const service = ConfigService.getInstance();
      service.load();
      const config = service.get();

      expect(config.storagePath).toBe("D:\\CustomPath");
      expect(config.port).toBe(4000);
    });

    it("deve mesclar configuração do arquivo com padrão", () => {
      if (fs.existsSync(TEST_PROD_CONFIG_PATH)) {
        fs.unlinkSync(TEST_PROD_CONFIG_PATH);
      }
      const partialConfig = { port: 5000 };
      fs.writeFileSync(
        TEST_PROD_CONFIG_PATH,
        JSON.stringify(partialConfig),
        "utf-8",
      );

      const service = ConfigService.getInstance();
      service.load();
      const config = service.get();

      expect(config.storagePath).toBe("D:\\Memorium");
      expect(config.port).toBe(5000);
    });

    it("deve usar padrão quando arquivo contém dados inválidos", () => {
      if (fs.existsSync(TEST_PROD_CONFIG_PATH)) {
        fs.unlinkSync(TEST_PROD_CONFIG_PATH);
      }
      fs.writeFileSync(TEST_PROD_CONFIG_PATH, "invalid json", "utf-8");

      const service = ConfigService.getInstance();
      service.load();
      const config = service.get();

      expect(config.storagePath).toBe("D:\\Memorium");
      expect(config.port).toBe(3001);
    });
  });

  describe("save()", () => {
    it("deve salvar configuração no arquivo", () => {
      if (fs.existsSync(TEST_PROD_CONFIG_PATH)) {
        fs.unlinkSync(TEST_PROD_CONFIG_PATH);
      }
      const service = ConfigService.getInstance();
      service.load();
      const newConfig = {
        storagePath: "E:\\NewPath",
        port: 5000,
      };

      const saved = service.save(newConfig);

      expect(saved).toEqual(newConfig);
      expect(fs.existsSync(TEST_PROD_CONFIG_PATH)).toBe(true);

      const fileContent = fs.readFileSync(TEST_PROD_CONFIG_PATH, "utf-8");
      expect(JSON.parse(fileContent)).toEqual(newConfig);
    });

    it("deve atualizar a configuração interna após salvar", () => {
      const service = ConfigService.getInstance();
      const newConfig = {
        storagePath: "F:\\AnotherPath",
        port: 6000,
      };

      service.save(newConfig);
      const currentConfig = service.get();

      expect(currentConfig).toEqual(newConfig);
    });
  });

  describe("get()", () => {
    it("deve retornar a configuração atual", () => {
      const service = ConfigService.getInstance();
      const config = service.get();

      expect(config).toHaveProperty("storagePath");
      expect(config).toHaveProperty("port");
    });
  });
});
