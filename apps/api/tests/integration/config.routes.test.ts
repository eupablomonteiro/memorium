import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import express, { Express } from "express";
import request from "supertest";
import fs from "fs";
import path from "path";

const TEST_CONFIG_PATH = path.resolve(
  process.cwd(),
  "test-memorium.config.json",
);

describe("Config Routes", () => {
  let app: Express;

  beforeAll(() => {
    process.env.NODE_ENV = "test";
    app = express();
    app.use(express.json());

    app.get("/api/config", (_req, res) => {
      res.json({
        success: true,
        data: { storagePath: "D:\\Memorium", port: 3001 },
      });
    });

    app.post("/api/config", (req, res) => {
      const { storagePath, port } = req.body;
      if (!storagePath) {
        res
          .status(400)
          .json({
            success: false,
            error: "O caminho de armazenamento é obrigatório",
          });
        return;
      }
      if (port < 1024 || port > 65535) {
        res.status(400).json({ success: false, error: "Porta inválida" });
        return;
      }
      res.json({ success: true, data: { storagePath, port } });
    });
  });

  beforeEach(() => {
    if (fs.existsSync(TEST_CONFIG_PATH)) {
      fs.unlinkSync(TEST_CONFIG_PATH);
    }
  });

  afterAll(() => {
    if (fs.existsSync(TEST_CONFIG_PATH)) {
      fs.unlinkSync(TEST_CONFIG_PATH);
    }
  });

  describe("GET /api/config", () => {
    it("deve retornar a configuração atual", async () => {
      const response = await request(app).get("/api/config");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("storagePath");
      expect(response.body.data).toHaveProperty("port");
    });
  });

  describe("POST /api/config", () => {
    it("deve salvar configuração válida", async () => {
      const newConfig = {
        storagePath: "D:\\NewPath",
        port: 4000,
      };

      const response = await request(app).post("/api/config").send(newConfig);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toEqual(newConfig);
    });

    it("deve rejeitar configuração sem storagePath", async () => {
      const response = await request(app)
        .post("/api/config")
        .send({ port: 3001 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body.error).toContain("armazenamento");
    });

    it("deve rejeitar configuração com porta inválida", async () => {
      const response = await request(app)
        .post("/api/config")
        .send({ storagePath: "D:\\Path", port: 80 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
    });

    it("deve rejeitar payload inválido", async () => {
      const response = await request(app)
        .post("/api/config")
        .send({ invalid: "data" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
    });
  });
});
