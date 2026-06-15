import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Projeto Travessia",
    template: "%s | Projeto Travessia",
  },
  description:
    "Sistema de gestão do Projeto Travessia — abrigo institucional para homens em situação de rua em Ribeirão Preto/SP.",
  keywords: ["abrigo", "acolhimento", "OSC", "Ribeirão Preto", "Projeto Travessia"],
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#1e40af",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full`}>
      <body className="min-h-full antialiased bg-background text-foreground">
        <TooltipProvider delay={300}>
          {children}
          <Toaster position="top-center" richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
