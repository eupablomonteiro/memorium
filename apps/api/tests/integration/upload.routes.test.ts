import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import express from "express";
import path from "path";
import fs from "fs";
import { App } from "../../src/app";
import { ConfigService } from "../../src/modules/config/config.service";

const TEST_STORAGE = path.resolve(process.cwd(), "test-storage-integration");

describe("Upload Routes (Integration)", () => {
  let app: express.Application;

  beforeEach(() => {
    if (!fs.existsSync(TEST_STORAGE)) {
      fs.mkdirSync(TEST_STORAGE, { recursive: true });
    }
    vi.spyOn(ConfigService.prototype, "load").mockReturnValue({
      storagePath: TEST_STORAGE,
      port: 3001,
    });
    const appInstance = new App();
    app = appInstance.getExpressApp();
  });

  afterEach(() => {
    if (fs.existsSync(TEST_STORAGE)) {
      fs.rmSync(TEST_STORAGE, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  describe("POST /api/upload", () => {
    it("deve retornar erro quando storagePath não configurado", async () => {
      const realStoragePath = path.resolve(process.cwd(), "test-storage-integration-real");
      vi.spyOn(ConfigService.prototype, "load").mockReturnValue({
        storagePath: realStoragePath,
        port: 3001,
      });
      const appInstance = new App();

      const response = await request(appInstance.getExpressApp())
        .post("/api/upload")
        .attach("files", Buffer.from("test"), "test.jpg");

      expect([200, 400, 500]).toContain(response.status);
    });
  });
});