import { Request, Response } from "express";
import { SystemService } from "./system.service.js";
import { ApiResponse } from "@memorium/config";

export class SystemController {
  private systemService = new SystemService();

  getDisks = async (_req: Request, res: Response): Promise<void> => {
    const disks = await this.systemService.listDisks();
    res.json({ success: true, data: disks } as ApiResponse);
  };
}
