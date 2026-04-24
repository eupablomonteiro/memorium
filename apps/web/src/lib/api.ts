import type {
  ApiResponse,
  DiskInfo,
  UploadResult,
  AppConfig,
} from "@memorium/config";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
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

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.success && response.data !== undefined) {
    return response.data as T;
  }
  throw new Error("Resposta inválida da API");
}

export const api = {
  config: {
    get: async () => {
      const response = await fetchApi<ApiResponse<AppConfig>>("/config");
      return unwrapResponse(response);
    },
    save: (data: Partial<AppConfig>) =>
      fetchApi<ApiResponse<AppConfig>>("/config", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  system: {
    disks: async () => {
      const response = await fetchApi<ApiResponse<DiskInfo[]>>("/system/disks");
      return unwrapResponse(response);
    },
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

export const API_BASE_URL =
  typeof window !== "undefined" ? window.location.origin + API_BASE : "/api";
