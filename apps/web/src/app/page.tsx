import Link from "next/link";
import { api } from "@/lib/api";
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let config = null;
  try {
    const response = await api.config.get();
    config = response;
  } catch (e) {
    console.error("Fetch config error:", e);
    config = null;
  }
  const hasStorage = config?.storagePath;

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-900">Memorium</h1>
          <p className="text-gray-500 mt-2">Guarde seus momentos de forma simples e segura.</p>
        </div>

        {/* Status Card */}
        <div className="card p-5 animate-fade-in-up delay-75">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-gray-700">Conectado</span>
            </div>
          </div>
          {hasStorage ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>📁</span>
              <span className="truncate">{config?.storagePath}</span>
            </div>
          ) : (
            <p className="text-sm text-amber-600 flex items-center gap-2">
              <span>⚠️</span>
              Configure o local primeiro
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 animate-fade-in-up delay-150">
          <Link href="/upload" className="btn-primary">📤 Enviar Memórias</Link>
          <Link href="/setup" className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2">⚙️ Configurações</Link>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 animate-fade-in-up delay-225">
          <p>Feito para preservar memórias</p>
          <p>100% local • Privacidade garantida</p>
        </div>
      </div>
    </div>
  );
}