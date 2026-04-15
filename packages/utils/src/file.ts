import path from "node:path";
import { ALLOWED_EXTENSIONS } from "@memorium/config";

/**
 * Helper para manipulação de nomes e extensões de arquivos.
 *
 * Gera nomes padronizados conforme o padrão do Memorium:
 * YYYY-MM-DD_HH-mm-ss[-nomeOriginal].ext
 */
export class FileHelper {
  /**
   * Extrai a extensão do arquivo em lowercase.
   * FileHelper.getExtension("foto.JPG") // ".jpg"
   */
  static getExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  /**
   * Extrai o nome do arquivo sem extensão.
   * FileHelper.getBaseName("foto-familia.jpg") // "foto-familia"
   */
  static getBaseName(filename: string): string {
    return path.basename(filename, path.extname(filename));
  }

  /**
   * Gera o nome final do arquivo no padrão do Memorium.
   * Formato: YYYY-MM-DD_HH-mm-ss[-nomeOriginal].ext
   *
   * FileHelper.buildFileName("2026-04-13_14-32-10", "aniversario.jpg")
   * // "2026-04-13_14-32-10-aniversario.jpg"
   */
  static buildFileName(datePrefix: string, originalName: string): string {
    const baseName = FileHelper.getBaseName(originalName);
    const extension = FileHelper.getExtension(originalName);

    // Sanitiza o nome original (remove caracteres especiais)
    const sanitized = baseName
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");

    const suffix = sanitized ? `-${sanitized}` : "";
    return `${datePrefix}${suffix}${extension}`;
  }

  /**
   * Verifica se a extensão do arquivo é permitida.
   */
  static isAllowedExtension(filename: string): boolean {
    const ext = FileHelper.getExtension(filename);
    return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
  }
}
