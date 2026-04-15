import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "../components/Toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Memorium — Organize suas memórias",
  description:
    "Upload e organização automática de fotos e vídeos em rede local. Simples, seguro e offline.",
  keywords: ["fotos", "vídeos", "upload", "organização", "memórias", "local"],
  manifest: "/manifest.json",
  icons: [
    {
      url: "/icon-192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      url: "/icon-512.png",
      sizes: "512x512",
      type: "image/png",
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3B82F6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
