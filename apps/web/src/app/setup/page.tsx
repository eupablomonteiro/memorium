"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import type { DiskInfo } from "@memorium/config";
import Link from "next/link";
import { formatBytes } from "@/utils/formatBytes";

export default function SetupPage() {
  const [disks, setDisks] = useState<DiskInfo[]>([]);
  const [selectedDisk, setSelectedDisk] = useState("");
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
        
        if (configData.storagePath) {
          const baseDisk = configData.storagePath.charAt(0);
          setSelectedDisk(baseDisk);
          setCustomPath(configData.storagePath);
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Erro ao carregar", "error");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [showToast]);

  const handleDiskSelect = (diskPath: string) => {
    setSelectedDisk(diskPath);
    setCustomPath(diskPath + ":\\Memorium");
  };

  const handleCustomPathChange = (value: string) => {
    setCustomPath(value);
    setSelectedDisk("");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.config.save({ storagePath: customPath });
      showToast("Configuração salva!", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Erro ao salvar", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  const isDiskSelected = (diskPath: string) => selectedDisk === diskPath;

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-500 mt-1">Escolha onde salvar suas memórias</p>
        </div>

        {/* Custom Path Input - Show first */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Caminho de armazenamento</label>
          <input
            type="text"
            value={customPath}
            onChange={(e) => handleCustomPathChange(e.target.value)}
            placeholder="F:\Memorium"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
          />
        </div>

        {/* Disks List */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ou selecione um disco</h2>
          {disks.map((disk) => {
            const diskLetter = disk.name.charAt(0);
            const isSelected = isDiskSelected(diskLetter);
            
            return (
              <button
                key={disk.path}
                onClick={() => handleDiskSelect(diskLetter)}
                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${isSelected ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                      <span className="text-2xl">💾</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{disk.name}</p>
                      <p className="text-xs text-gray-500">{formatBytes(disk.available)} livre</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center">✓</div>
                  )}
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-gray-200">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${disk.usagePercent}%` }} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Save Button */}
        <button 
          onClick={handleSave} 
          disabled={isSaving || !customPath} 
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-xl transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>💾</span>
          )}
          {isSaving ? "Salvando..." : "Salvar Configuração"}
        </button>

        {/* Back Button */}
        <Link href="/" className="w-full py-2 border-2 border-indigo-500 text-indigo-500 font-semibold rounded-xl transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          Voltar
        </Link>

        {/* Info Card */}
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div className="text-sm">
              <p className="font-medium text-indigo-900 mb-1">Dica</p>
              <p className="text-indigo-700">Digite o caminho ou selecione um disco. Por padrão, usa a pasta "Memorium".</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}