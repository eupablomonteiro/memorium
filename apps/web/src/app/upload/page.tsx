"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { FilePicker, type SelectedFile } from "@/components/FilePicker";
import { FilePreviewList } from "@/components/FilePreviewList";
import { useToast } from "@/components/Toast";
import { formatBytes } from "@/utils/formatBytes";

export default function UploadPage() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

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
    try {
      const fileObjects = files.map((f) => f.file);
      const result = await api.upload.uploadFiles(fileObjects);

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
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>🚀</span>
          )}
          {isUploading
            ? "Enviando..."
            : `Enviar ${files.length} arquivo${files.length !== 1 ? "s" : ""}`}
        </button>

        {/* Summary & Upload Button */}
        {files.length > 0 && (
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
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: isUploading ? "100%" : "0%" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
