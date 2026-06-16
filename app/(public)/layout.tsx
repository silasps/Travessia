import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header público */}
      <header className="bg-sky-600 text-white sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">PT</span>
            </div>
            <span className="font-semibold text-sm sm:text-base">
              Projeto Travessia
            </span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-5 text-sm">
            <Link href="/#sobre" className="hidden sm:block text-sky-100 hover:text-white transition-colors">
              Sobre
            </Link>
            <Link href="/transparencia" className="text-sky-100 hover:text-white transition-colors">
              Transparência
            </Link>
            <Link href="/#contato" className="hidden sm:block text-sky-100 hover:text-white transition-colors">
              Contato
            </Link>
            <Link
              href="/login"
              className="bg-white text-sky-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-sky-50 transition-colors"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1">{children}</main>

      {/* Rodapé */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-semibold text-white">Projeto Travessia</p>
            <p className="text-xs">Abrigo Institucional — Ribeirão Preto/SP</p>
          </div>
          <div className="space-y-1 text-xs text-right">
            <p>
              DPO:{" "}
              <a href="mailto:dpo@projetotravessia.org.br" className="underline hover:text-white">
                dpo@projetotravessia.org.br
              </a>
            </p>
            <p className="text-gray-600">
              Apenas cookies essenciais de sessão. Nenhum dado compartilhado para fins publicitários.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
