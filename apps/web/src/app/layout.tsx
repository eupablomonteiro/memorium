import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "../components/Toast";
import FooterNav from "@/components/FooterNav";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Memorium — Organize suas memórias",
  description: "Upload e organização automática de fotos e vídeos em rede local.",
  manifest: "/manifest.json",
  icons: [
    { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6366F1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-linear-to-b from-gray-50 to-gray-100 min-h-screen font-inter">
        <ToastProvider> 
          <main className="pt-14 pb-16">{children}</main>
          <FooterNav />
        </ToastProvider>
      </body>
    </html>
  );
}