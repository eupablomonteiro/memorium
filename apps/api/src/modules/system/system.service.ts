import si from "systeminformation";
import { DiskInfo } from "@memorium/config";

export class SystemService {
  async listDisks(): Promise<DiskInfo[]> {
    try {
      const disks = await si.fsSize();
      return disks.map((disk) => ({
        name: disk.mount,
        path: disk.mount,
        size: disk.size,
        used: disk.used,
        available: disk.available,
        usagePercent: disk.use,
      }));
    } catch (error) {
      console.error("Erro ao listar discos:", error);
      return [];
    }
  }
}
