import path from "path";
import { MetadataService } from "./metadata/metadata.service.js";
import { FileHelper } from "./storage/file.helper.js";
import { StorageService } from "./storage/storage.service.js";
import { ConfigService } from "../config/config.service.js";
import { FileMetadata } from "./metadata/types.js";

export interface UploadedFile {
  originalName: string;
  savedPath: string;
  fileName: string;
  metadata: FileMetadata;
}

export class UploadService {
  private metadataService: MetadataService;

  constructor() {
    this.metadataService = new MetadataService();
  }

  private getStorageService(): StorageService {
    const config = ConfigService.getInstance().load();
    return new StorageService(config.storagePath);
  }

  async processFile(filePath: string, originalName: string, mimeType: string): Promise<UploadedFile> {
    const metadata = await this.metadataService.extractMetadata(filePath, originalName, mimeType);
    const detectedDate = metadata.detectedDate || new Date();

    const fileName = FileHelper.generateFilename(detectedDate, originalName);
    const storageService = this.getStorageService();
    const directory = storageService.getDirectoryForDate(detectedDate);
    const destinationPath = path.join(directory, fileName);

    const savedPath = await storageService.moveFile(filePath, destinationPath);

    return {
      originalName,
      savedPath,
      fileName,
      metadata,
    };
  }

  getStoragePath(): string {
    const config = ConfigService.getInstance().load();
    return config.storagePath;
  }
}