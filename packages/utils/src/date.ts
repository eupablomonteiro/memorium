export class DateHelper {
  /**
   * Gera o caminho de pastas no formato YYYY/MM/DD.
   * DateHelper.toFolderPath(new Date("2026-04-13")) // "2026/04/13"
   */
  static toFolderPath(date: Date): string {
    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  }

  /**
   * Gera o prefixo de nome de arquivo no formato YYYY-MM-DD_HH-mm-ss.
   * DateHelper.toFilePrefix(new Date()) // "2026-04-13_14-32-10"
   */
  static toFilePrefix(date: Date): string {
    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  }

  /**
   * Tenta converter um valor (string, number, Date) em um objeto Date válido.
   * Retorna null se o valor for inválido.
   */
  static parse(value: string | number | Date | undefined | null): Date | null {
    if (value == null) return null;

    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
}
