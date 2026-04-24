import { Request, Response } from "express";
import { ConfigService } from "./config.service.js";
import { appConfigSchema } from "@memorium/config";
import { ApiResponse } from "@memorium/config";

export class ConfigController {
  private configService = ConfigService.getInstance();

  getConfig = (_req: Request, res: Response): void => {
    const config = this.configService.load();
    res.json({ success: true, data: config } as ApiResponse);
  };

  setConfig = (req: Request, res: Response): void => {
    const result = appConfigSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error.issues.map((i) => i.message).join(", "),
      } as ApiResponse);
      return;
    }

    const saved = this.configService.save(result.data);
    res.json({ success: true, data: saved } as ApiResponse);
  };
}