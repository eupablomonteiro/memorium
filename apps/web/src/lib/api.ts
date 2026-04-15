import type { ApiResponse, DiskInfo, UploadResult, AppConfig } from "@memorium/config";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  config: {
    get: () => fetchApi<AppConfig>("/config"),
    save: (data: Partial<AppConfig>) =>
      fetchApi<ApiResponse<AppConfig>>("/config", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  system: {
    disks: () => fetchApi<DiskInfo[]>("/system/disks"),
  },

  upload: {
    async uploadFiles(files: File[]): Promise<UploadResult> {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
  },
};

export const API_BASE_URL = API_BASE;