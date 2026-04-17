import { describe, it, expect, vi, beforeEach } from "vitest";
import { SystemService } from "../../../src/modules/system/system.service";
import si from "systeminformation";

interface FsSizeData {
  fs: string;
  mount: string;
  type: string;
  size: number;
  used: number;
  available: number;
  use: number;
  rw: boolean;
}

vi.mock(
  "systeminformation",
  () =>
    ({
      default: {
        fsSize: vi.fn().mockResolvedValue([] as any[]),
      },
    }) as any,
);

describe("SystemService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listDisks()", () => {
    it("deve retornar lista de discos formatada", async () => {
      const mockDisks: FsSizeData[] = [
        {
          fs: "C:",
          mount: "C:",
          type: "NTFS",
          size: 500000000000,
          used: 250000000000,
          available: 250000000000,
          use: 50,
          rw: true,
        },
        {
          fs: "D:",
          mount: "D:",
          type: "NTFS",
          size: 1000000000000,
          used: 750000000000,
          available: 250000000000,
          use: 75,
          rw: true,
        },
      ];

      vi.mocked(si.fsSize).mockResolvedValue(mockDisks);

      const service = new SystemService();
      const disks = await service.listDisks();

      expect(disks).toHaveLength(2);
      expect(disks[0]).toEqual({
        name: "C:",
        path: "C:",
        size: 500000000000,
        used: 250000000000,
        available: 250000000000,
        usagePercent: 50,
      });
      expect(disks[1]).toEqual({
        name: "D:",
        path: "D:",
        size: 1000000000000,
        used: 750000000000,
        available: 250000000000,
        usagePercent: 75,
      });
    });

    it("deve retornar array vazio em caso de erro", async () => {
      vi.mocked(si.fsSize).mockRejectedValue(new Error("Failed to get disks"));

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const service = new SystemService();
      const disks = await service.listDisks();

      expect(disks).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Erro ao listar discos:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("deve retornar array vazio quando não há discos", async () => {
      vi.mocked(si.fsSize).mockResolvedValue([]);

      const service = new SystemService();
      const disks = await service.listDisks();

      expect(disks).toEqual([]);
    });
  });
});
