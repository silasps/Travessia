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
      <header className="bg-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-900 text-xs font-bold">PT</span>
            </div>
            <span className="font-semibold text-sm sm:text-base">
              Projeto Travessia
            </span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-5 text-sm">
            <Link href="/#sobre" className="hidden sm:block text-blue-200 hover:text-white transition-colors">
              Sobre
            </Link>
            <Link href="/transparencia" className="text-blue-200 hover:text-white transition-colors">
              Transparência
            </Link>
            <Link href="/#contato" className="hidden sm:block text-blue-200 hover:text-white transition-colors">
              Contato
            </Link>
            <Link
              href="/login"
              className="bg-white text-blue-900 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-colors"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-3 text-sm">
          <p className="font-semibold text-white">Projeto Travessia</p>
          <p>Abrigo Institucional — Ribeirão Preto/SP</p>
          <p className="text-xs">
            Encarregado de Dados (DPO):{" "}
            <a
              href="mailto:dpo@projetotravessia.org.br"
              className="underline hover:text-white"
            >
              dpo@projetotravessia.org.br
            </a>
          </p>
          <p className="text-xs text-slate-500">
            Este site armazena apenas cookies essenciais de sessão. Nenhum dado
            é compartilhado com terceiros para fins publicitários.
          </p>
        </div>
      </footer>
    </div>
  );
}
