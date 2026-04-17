import { Request, Response } from "express";
import { UploadService } from "./upload.service.js";

export class UploadController {
  private uploadService: UploadService;

  constructor() {
    this.uploadService = new UploadService();
  }

  async upload(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ error: "Nenhum arquivo enviado" });
        return;
      }

      const results = await Promise.all(
        files.map(async (file) => {
          return this.uploadService.processFile(file.path, file.originalname, file.mimetype);
        })
      );

      const storagePath = this.uploadService.getStoragePath();

      res.json({
        success: true,
        count: results.length,
        storagePath,
        files: results.map((r) => ({
          originalName: r.originalName,
          fileName: r.fileName,
          savedPath: r.savedPath,
          metadata: {
            detectedDate: r.metadata.detectedDate,
            dateSource: r.metadata.dateSource,
            mimeType: r.metadata.mimeType,
            fileSize: r.metadata.fileSize,
          },
        })),
      });
    } catch (error) {
      console.error("[UploadController] Erro ao processar upload:", error);
      res.status(500).json({ error: "Erro ao processar upload" });
    }
  }
}