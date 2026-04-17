import { describe, it, expect, beforeAll, vi } from "vitest";
import express, { Express } from "express";
import request from "supertest";
import si from "systeminformation";

vi.mock("systeminformation", () => ({
  default: {
    fsSize: vi.fn(),
  },
}));

describe("System Routes", () => {
  let app: Express;

  beforeAll(() => {
    process.env.NODE_ENV = "test";
    app = express();
    app.use(express.json());

    app.get("/api/system/disks", async (_req, res) => {
      try {
        const disks = await si.fsSize();
        const formatted = disks.map((disk: any) => ({
          name: disk.mount,
          path: disk.mount,
          size: disk.size,
          used: disk.used,
          available: disk.available,
          usagePercent: disk.use,
        }));
        res.json({ success: true, data: formatted });
      } catch (error) {
        res
          .status(500)
          .json({ success: false, error: "Erro ao buscar discos" });
      }
    });
  });

  describe("GET /api/system/disks", () => {
    it("deve retornar lista de discos", async () => {
      const mockDisks = [
        {
          fs: "C:",
          type: "NTFS",
          mount: "C:",
          size: 500000000000,
          used: 250000000000,
          available: 250000000000,
          use: 50,
          rw: true,
        },
      ];

      vi.mocked(si.fsSize).mockResolvedValue(mockDisks);

      const response = await request(app).get("/api/system/disks");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("deve retornar array vazio quando não há discos", async () => {
      vi.mocked(si.fsSize).mockResolvedValue([]);

      const response = await request(app).get("/api/system/disks");

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it("deve lidar com erro na listagem de discos", async () => {
      vi.mocked(si.fsSize).mockRejectedValue(new Error("System error"));

      const response = await request(app).get("/api/system/disks");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("success", false);
    });
  });
});
