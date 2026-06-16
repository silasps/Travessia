import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
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
    <html lang="pt-BR" className={`${inter.variable} h-full scroll-smooth`}>
      <body className="min-h-full antialiased bg-background text-foreground">
        <TooltipProvider delay={300}>
          {children}
          <Toaster position="top-center" richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
