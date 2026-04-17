import path from "path";

export class FileHelper {
  static generateFilename(date: Date, originalName: string): string {
    const ext = path.extname(originalName).toLowerCase();
    const nameWithoutExt = path.basename(originalName, ext);
    const sanitizedName = this.sanitizeFilename(nameWithoutExt);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const baseName = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
    const finalName = sanitizedName ? `${baseName}-${sanitizedName}${ext}` : `${baseName}${ext}`;

    return finalName;
  }

  static sanitizeFilename(name: string): string {
    const invalidChars = /[<>:"/\\|?*]/g;
    const sanitized = name.replace(invalidChars, "_").replace(/\s+/g, "_").trim();
    return sanitized.substring(0, 50);
  }
}