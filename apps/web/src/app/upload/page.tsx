"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { FilePicker, type SelectedFile } from "@/components/FilePicker";
import { FilePreviewList } from "@/components/FilePreviewList";
import { useToast } from "@/components/Toast";
import Link from "next/link";

export default function UploadPage() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const handleFilesSelected = (newFiles: SelectedFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const fileObjects = files.map((f) => f.file);
      const result = await api.upload.uploadFiles(fileObjects);

      if (result.success > 0) {
        showToast(
          `${result.success} arquivo${result.success !== 1 ? "s" : ""} salvo${
            result.success !== 1 ? "s" : ""
          } com sucesso!`,
          "success"
        );
      }

      if (result.failed > 0) {
        showToast(
          `${result.failed} arquivo${result.failed !== 1 ? "s" : ""} falhou${
            result.failed !== 1 ? "s" : ""
          }`,
          "error"
        );
      }

      setFiles([]);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao enviar arquivos",
        "error"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-6">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <Link href="/" className="self-start">
          <span className="text-3xl">📦</span>
        </Link>

        <div className="w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800">Enviar Memórias</h1>
          <p className="text-sm text-gray-500">
            Organize suas fotos por data automaticamente
          </p>
        </div>

        <FilePicker onFilesSelected={handleFilesSelected} />

        <FilePreviewList files={files} onRemove={handleRemoveFile} />

        {files.length > 0 && (
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full rounded-xl bg-blue-500 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Enviando...
              </span>
            ) : (
              <span>🚀 Enviar {files.length} arquivo${files.length !== 1 ? "s" : ""}</span>
            )}
          </button>
        )}

        <Link
          href="/setup"
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ⚙️ Configurações
        </Link>
      </div>
    </main>
  );
}