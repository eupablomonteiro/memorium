"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { FilePicker, type SelectedFile } from "@/components/FilePicker";
import { FilePreviewList } from "@/components/FilePreviewList";
import { useToast } from "@/components/Toast";
import { formatBytes } from "@/utils/formatBytes";
import { generateSessionId } from "@/utils/session";

export default function UploadPage() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    processed: number;
    total: number;
    percentage: number;
  } | null>(null);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const { showToast } = useToast();
  const [wsClose, setWsClose] = useState<(() => void) | null>(null);

  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0);

  const handleFilesSelected = (newFiles: SelectedFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setUploadProgress(null);
    setUploadPercent(null);

    const sessionId = generateSessionId();

    // Conecta via WebSocket
    const { close, connected } = api.upload.connectToProgress(
      sessionId,
      (data) => {
        console.log("[Upload] Progresso:", data);
        setUploadProgress(data);
      },
      () => {
        console.log("[Upload] WebSocket concluído");
        setWsClose(null);
      },
    );
    setWsClose(() => close);

    // AGUARDA O WEBSOCKET ESTAR TOTALMENTE CONECTADO
    await connected;
    console.log("[Upload] WebSocket conectado, iniciando upload...");

    try {
      const fileObjects = files.map((f) => f.file);
      const result = await api.upload.uploadFiles(
        fileObjects,
        sessionId,
        (percent) => {
          console.log(`[Upload] Enviando: ${percent}%`);
          setUploadPercent(percent);
        }
      );

      setUploadPercent(null);

      if (result.success > 0) {
        showToast(
          `${result.success} arquivo${result.success !== 1 ? "s" : ""} salvo${result.success !== 1 ? "s" : ""} com sucesso!`,
          "success",
        );
      }
      if (result.failed > 0) {
        showToast(
          `${result.failed} arquivo${result.failed !== 1 ? "s" : ""} falhou${result.failed !== 1 ? "s" : ""}`,
          "error",
        );
      }
      setFiles([]);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao enviar",
        "error",
      );
    } finally {
      setIsUploading(false);
      wsClose?.();
      setWsClose(null);
      setUploadProgress(null);
      setUploadPercent(null);
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Enviar Memórias</h1>
          <p className="text-gray-500 mt-1">
            Suas fotos serão organizadas por data
          </p>
        </div>

        {/* File Picker */}
        <div className="animate-fade-in-up select-none">
          <FilePicker onFilesSelected={handleFilesSelected} maxFiles={100} />
        </div>

        {/* File Preview List */}
        {files.length > 0 && (
          <div className="animate-fade-in-up delay-75">
            <FilePreviewList files={files} onRemove={handleRemoveFile} />
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={isUploading}
          className={`btn-primary ${files.length > 0 ? "opacity-100" : "opacity-50"}`}
        >
          {isUploading && uploadPercent !== null ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isUploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>🚀</span>
          )}
          {isUploading && uploadPercent !== null
            ? `Enviando ${uploadPercent}%`
            : isUploading && uploadProgress
              ? `${uploadProgress.processed}/${uploadProgress.total} (${uploadProgress.percentage}%)`
              : isUploading
                ? "Enviando..."
                : `Enviar ${files.length} arquivo${files.length !== 1 ? "s" : ""}`}
        </button>

        {/* Card de Progresso em Tempo Real */}
        {isUploading && (
          <div className="card p-4 animate-fade-in-up border-blue-200 bg-blue-50">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-gray-700 font-medium">
                {uploadPercent !== null
                  ? `Enviando arquivos... ${uploadPercent}%`
                  : uploadProgress
                    ? "Processando arquivos..."
                    : "Preparando..."}
              </span>
              <span className="text-blue-600 font-bold text-lg">
                {uploadPercent !== null
                  ? `${uploadPercent}%`
                  : uploadProgress
                    ? `${uploadProgress.percentage}%`
                    : "..."}
              </span>
            </div>
            <div className="progress-bar h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="progress-fill bg-blue-500 h-full transition-all duration-300 ease-out"
                style={{
                  width: uploadPercent !== null
                    ? `${uploadPercent}%`
                    : uploadProgress
                      ? `${uploadProgress.percentage}%`
                      : "0%"
                }}
              />
            </div>
            {uploadPercent !== null ? (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Enviando arquivos para o servidor...
              </p>
            ) : uploadProgress ? (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {uploadProgress.processed} de {uploadProgress.total} arquivos processados
              </p>
            ) : null}
          </div>
        )}

        {/* Summary & Upload Button */}
        {files.length > 0 && !isUploading && (
          <div className="space-y-3 animate-fade-in-up delay-150">
            <div className="card p-4">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-600">
                  {files.length} arquivo{files.length !== 1 ? "s" : ""}{" "}
                  selecionado{files.length !== 1 ? "s" : ""}
                </span>
                <span className="font-medium text-gray-900">
                  {formatBytes(totalSize)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
