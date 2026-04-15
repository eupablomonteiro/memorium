"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import type { DiskInfo } from "@memorium/config";

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
}

export default function SetupPage() {
  const [disks, setDisks] = useState<DiskInfo[]>([]);
  const [selectedPath, setSelectedPath] = useState("");
  const [customPath, setCustomPath] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        const [diskList, configData] = await Promise.all([
          api.system.disks(),
          api.config.get(),
        ]);
        setDisks(diskList);
        setSelectedPath(configData.storagePath);
        setCustomPath(configData.storagePath);
      } catch (error) {
        showToast(
          error instanceof Error ? error.message : "Erro ao carregar dados",
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [showToast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const pathToSave = selectedPath || customPath;
      await api.config.save({ storagePath: pathToSave });
      showToast("Configuração salva com sucesso!", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao salvar",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="text-gray-600">Carregando...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-6">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <Link href="/" className="self-start">
          <span className="text-3xl">📦</span>
        </Link>

        <div className="w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800">Configuração</h1>
          <p className="text-sm text-gray-500">
            Escolha onde suas memórias serão salvas
          </p>
        </div>

        <div className="w-full space-y-3">
          <h2 className="font-medium text-gray-700">Discos disponíveis</h2>
          {disks.map((disk) => (
            <button
              key={disk.path}
              onClick={() => setSelectedPath(disk.path)}
              className={`
                w-full rounded-xl border-2 p-4 text-left transition-all
                ${
                  selectedPath === disk.path
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💾</span>
                  <div>
                    <p className="font-medium text-gray-800">{disk.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatBytes(disk.available)} livre de {formatBytes(disk.size)}
                    </p>
                  </div>
                </div>
                {selectedPath === disk.path && (
                  <span className="text-blue-500">✓</span>
                )}
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${disk.usagePercent}%` }}
                />
              </div>
            </button>
          ))}
        </div>

        <div className="w-full">
          <label className="font-medium text-gray-700">
            Ou digite um caminho personalizado
          </label>
          <input
            type="text"
            value={customPath}
            onChange={(e) => {
              setCustomPath(e.target.value);
              setSelectedPath("");
            }}
            placeholder="D:\MinhasFotos"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || (!selectedPath && !customPath)}
          className="w-full rounded-xl bg-blue-500 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Salvando...
            </span>
          ) : (
            "💾 Salvar Configuração"
          )}
        </button>

        <Link href="/upload" className="text-sm text-gray-400 hover:text-gray-600">
          ← Voltar para Upload
        </Link>
      </div>
    </main>
  );
}