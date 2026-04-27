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
    uploadFiles(
      files: File[],
      sessionId: string,
      onUploadProgress?: (percent: number) => void
    ): Promise<UploadResult> {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        formData.append("sessionId", sessionId);

        const xhr = new XMLHttpRequest();

        // Upload progress (bytes sent)
        if (onUploadProgress && xhr.upload) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && event.total > 0) {
              const percent = Math.round((event.loaded / event.total) * 100);
              onUploadProgress(percent);
              console.log(`[Upload] Enviando: ${percent}%`);
            }
          };
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              reject(new Error("Erro ao parsear resposta"));
            }
          } else {
            reject(new Error(`Erro ${xhr.status}: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error("Erro na requisição"));
        xhr.ontimeout = () => reject(new Error("Timeout na requisição"));

        xhr.open("POST", `${API_BASE}/upload`);
        xhr.send(formData);
      });
    },

     connectToProgress(
       sessionId: string,
       onProgress: (data: {
         processed: number;
         total: number;
         percentage: number;
       }) => void,
       onDone: () => void,
     ): { close: () => void; connected: Promise<void> } {
       // Determina o base URL para WebSocket (sem /api, pois WS é servido em /ws)
       let wsBase: string;
       if (API_BASE) {
         // Remove /api do final para WebSocket (servido em /ws)
         const baseWithoutApi = API_BASE.replace(/\/api$/, '');
         // Converte http:// ou https:// para ws:// ou wss://
         wsBase = baseWithoutApi.replace(/^http/, "ws");
       } else {
         // Fallback para o host atual (funciona para IP e localhost)
         const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
         wsBase = `${protocol}//${window.location.hostname}:3001`;
       }
       const wsUrl = `${wsBase}/ws?sessionId=${sessionId}`;
       console.log("[WS] Conectando:", wsUrl);

       const ws = new WebSocket(wsUrl);
       let isDone = false;
       let connectedResolve: (() => void) | null = null;
       const connectedPromise = new Promise<void>((resolve) => {
         connectedResolve = resolve;
       });

       ws.onopen = () => {
         console.log("[WS] Conexão estabelecida");
         if (connectedResolve) {
           connectedResolve();
           connectedResolve = null;
         }
       };

       ws.onmessage = (event) => {
         try {
           const message = JSON.parse(event.data as string);
           console.log("[WS] Mensagem recebida:", message);

           if (message.type === "connected") {
             console.log("[WS] Conexão confirmada para sessão:", message.sessionId);
           } else if (message.type === "progress" && message.data) {
             onProgress(message.data);
           } else if (message.type === "done") {
             if (!isDone) {
               isDone = true;
               console.log("[WS] Upload concluído");
               onDone();
               ws.close();
             }
           }
         } catch (error) {
           console.error("[WS] Erro ao processar mensagem:", error);
         }
       };

       ws.onerror = (error) => {
         console.error("[WS] Erro na conexão:", error);
       };

       ws.onclose = () => {
         console.log("[WS] Conexão fechada");
       };

       return {
         close: () => {
           console.log("[WS] Fechando conexão manualmente");
           isDone = true;
           ws.close();
         },
         connected: connectedPromise,
       };
     },
  },
};

export const API_BASE_URL =
  typeof window !== "undefined" ? window.location.origin + API_BASE : "/api";
