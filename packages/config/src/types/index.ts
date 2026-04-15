export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/** Informações de um disco do sistema */
export interface DiskInfo {
  name: string;
  path: string;
  size: number;
  used: number;
  available: number;
  usagePercent: number;
}

/** Resultado de um upload completo (batch) */
export interface UploadResult {
  total: number;
  success: number;
  failed: number;
  items: UploadResultItem[];
}

/** Resultado individual de cada arquivo enviado */
export interface UploadResultItem {
  originalName: string;
  savedAs: string;
  savedPath: string;
  status: "success" | "error";
  error?: string;
}
