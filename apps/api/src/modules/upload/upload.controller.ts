import { Request, Response } from "express";
import { UploadService } from "./upload.service.js";
import { wsManager } from "../../shared/websocket/wsManager.js";

export class UploadController {
  private uploadService: UploadService;

  constructor() {
    this.uploadService = new UploadService();
  }

  async upload(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      const sessionId = req.body.sessionId || (req.query.sessionId as string);

      if (!files || files.length === 0) {
        res.status(400).json({ error: "Nenhum arquivo enviado" });
        return;
      }

      if (!sessionId) {
        res
          .status(400)
          .json({ error: "sessionId é obrigatório para progresso." });
        return;
      }

      const totalFiles = files.length;
      let processedCount = 0;
      const results: any[] = [];
      const concurrencyLimit = 3; // Processa 3 arquivos simultâneos

      // Processa em lotes (batches) para melhor performance
      for (let i = 0; i < files.length; i += concurrencyLimit) {
        const batch = files.slice(i, i + concurrencyLimit);
        
        const batchResults = await Promise.all(
          batch.map(async (file) => {
            const result = await this.uploadService.processFile(
              file.path,
              file.originalname,
              file.mimetype,
            );
            
            // Atualiza contador e envia progresso (thread-safe pois está no Promise.all)
            processedCount++;
            wsManager.sendProgress(sessionId, {
              processed: processedCount,
              total: totalFiles,
              percentage: Math.round((processedCount / totalFiles) * 100),
            });
            
            return result;
          })
        );
        
        results.push(...batchResults);
      }

      wsManager.sendDone(sessionId);

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
