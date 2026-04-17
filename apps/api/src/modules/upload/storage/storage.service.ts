import fs from "fs";
import path from "path";

export class StorageService {
  constructor(private storagePath: string) {}

  getDirectoryForDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return path.join(this.storagePath, String(year), month, day);
  }

  async ensureDirectory(dirPath: string): Promise<void> {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  async moveFile(sourcePath: string, destinationPath: string): Promise<string> {
    await this.ensureDirectory(path.dirname(destinationPath));

    let finalDest = destinationPath;

    if (fs.existsSync(destinationPath)) {
      const ext = path.extname(destinationPath);
      const base = path.basename(destinationPath, ext);
      const dir = path.dirname(destinationPath);
      let counter = 1;
      let newPath = destinationPath;

      while (fs.existsSync(newPath)) {
        newPath = path.join(dir, `${base}_${counter}${ext}`);
        counter++;
      }

      finalDest = newPath;
    }

    try {
      fs.renameSync(sourcePath, finalDest);
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === "EXDEV") {
        fs.copyFileSync(sourcePath, finalDest);
        fs.unlinkSync(sourcePath);
      } else {
        throw error;
      }
    }

    return finalDest;
  }

  getStoragePath(): string {
    return this.storagePath;
  }

  setStoragePath(newPath: string): void {
    this.storagePath = newPath;
  }
}