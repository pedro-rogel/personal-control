import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/providers";
import "@/styles.css";

export const metadata: Metadata = {
  title: "Personal Control",
  description: "Gestão de alunos, aulas, avaliações físicas e financeiro para personal trainers.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.png", apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Personal", statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = { themeColor: "#123d33", viewportFit: "cover" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap" />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
