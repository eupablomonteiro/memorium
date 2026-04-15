import Link from "next/link";
import { api, API_BASE_URL } from "@/lib/api";

async function getConfig() {
  try {
    const config = await api.config.get();
    return config;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const config = await getConfig();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-8 text-center">
        <div className="flex items-center gap-3">
          <span className="text-5xl">📦</span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Memorium
          </h1>
        </div>

        <p className="max-w-md text-lg text-gray-600">
          Guardar momentos de forma simples e segura.
        </p>

        <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          Servidor conectado em {API_BASE_URL}
        </div>

        {config?.storagePath && (
          <p className="text-sm text-gray-500">
            💾 Salvando em: {config.storagePath}
          </p>
        )}

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link
            href="/upload"
            className="rounded-xl bg-blue-500 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-600 hover:scale-[1.02]"
          >
            📤 Enviar Memórias
          </Link>

          <Link
            href="/setup"
            className="rounded-xl border-2 border-gray-200 py-4 text-lg font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            ⚙️ Configurações
          </Link>
        </div>
      </div>
    </main>
  );
}