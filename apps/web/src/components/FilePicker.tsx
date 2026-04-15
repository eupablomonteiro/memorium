"use client";

import { useRef, useState } from "react";

export interface SelectedFile {
  file: File;
  preview?: string;
}

interface FilePickerProps {
  onFilesSelected: (files: SelectedFile[]) => void;
  maxFiles?: number;
}

export function FilePicker({ onFilesSelected, maxFiles = 50 }: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const files = Array.from(fileList).slice(0, maxFiles);
    const selected: SelectedFile[] = files.map((file) => ({
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }));

    onFilesSelected(selected);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all
        ${
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-4">
        <div className="text-5xl">📁</div>
        <div>
          <p className="text-lg font-medium text-gray-700">
            Selecionar fotos e vídeos
          </p>
          <p className="text-sm text-gray-500">
            Arraste arquivos aqui ou clique para buscar
          </p>
        </div>
        <p className="text-xs text-gray-400">Máximo {maxFiles} arquivos</p>
      </div>
    </div>
  );
}