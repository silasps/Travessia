import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false },
};

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Painel de marca (desktop) ── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] bg-gradient-to-br from-sky-500 to-sky-600 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Decoração de fundo */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white" />
          <div className="absolute -bottom-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-white" />
        </div>

        {/* Conteúdo */}
        <div className="relative">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <span className="text-white text-lg font-bold tracking-tight">PT</span>
          </div>
        </div>

        <div className="relative space-y-6 max-w-xs">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight leading-snug">
              Projeto<br />Travessia
            </h1>
            <p className="text-sky-100 text-[15px] leading-relaxed">
              Cuidado, dignidade e acompanhamento para cada pessoa em jornada de transformação.
            </p>
          </div>
          <div className="w-10 h-1 bg-white/40 rounded-full" />
          <p className="text-sky-200 text-sm">
            Abrigo institucional · Ribeirão Preto/SP
          </p>
        </div>

        <p className="relative text-sky-200/60 text-xs">
          Sistema de Gestão do Abrigo
        </p>
      </div>

      {/* ── Painel do formulário ── */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen lg:min-h-0 bg-white px-6 py-12">
        <div className="w-full max-w-sm space-y-8">

          {/* Logo mobile */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center shadow-sm">
              <span className="text-white text-lg font-bold">PT</span>
            </div>
            <p className="text-gray-900 font-semibold text-base">Projeto Travessia</p>
          </div>

          {DEV_MODE ? (
            /* ── Modo dev: atalhos sem autenticação ── */
            <div className="space-y-5">
              <div>
                <h2 className="text-gray-900 text-xl font-bold">Modo demonstração</h2>
                <p className="text-muted-foreground text-sm mt-1">Banco não conectado — escolha um perfil para explorar.</p>
              </div>

              <div className="space-y-2">
                <Link
                  href="/painel"
                  className="flex items-center gap-3 w-full rounded-xl border border-gray-100 bg-gray-50 hover:bg-sky-50 hover:border-sky-200 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors group min-h-[52px]"
                >
                  <span className="size-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold shrink-0">SA</span>
                  <div className="text-left">
                    <p className="text-gray-900">Super Admin</p>
                    <p className="text-xs font-normal text-muted-foreground">Acesso total · Painel da equipe</p>
                  </div>
                </Link>

                <Link
                  href="/painel"
                  className="flex items-center gap-3 w-full rounded-xl border border-gray-100 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors group min-h-[52px]"
                >
                  <span className="size-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">CO</span>
                  <div className="text-left">
                    <p className="text-gray-900">Coordenação</p>
                    <p className="text-xs font-normal text-muted-foreground">Avalia ocorrências e relatórios</p>
                  </div>
                </Link>

                <Link
                  href="/painel"
                  className="flex items-center gap-3 w-full rounded-xl border border-gray-100 bg-gray-50 hover:bg-teal-50 hover:border-teal-200 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors group min-h-[52px]"
                >
                  <span className="size-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">TC</span>
                  <div className="text-left">
                    <p className="text-gray-900">Técnico</p>
                    <p className="text-xs font-normal text-muted-foreground">PIA, evolução, prontuário completo</p>
                  </div>
                </Link>

                <Link
                  href="/painel"
                  className="flex items-center gap-3 w-full rounded-xl border border-gray-100 bg-gray-50 hover:bg-green-50 hover:border-green-200 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors group min-h-[52px]"
                >
                  <span className="size-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">CU</span>
                  <div className="text-left">
                    <p className="text-gray-900">Cuidador</p>
                    <p className="text-xs font-normal text-muted-foreground">Registra ocorrências e visualiza dados</p>
                  </div>
                </Link>

                <Link
                  href="/meu-espaco"
                  className="flex items-center gap-3 w-full rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors group min-h-[52px]"
                >
                  <span className="size-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold shrink-0">JC</span>
                  <div className="text-left">
                    <p className="text-gray-900">José Carlos</p>
                    <p className="text-xs font-normal text-muted-foreground">Portal do acolhido</p>
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            /* ── Produção: formulário real ── */
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-gray-900 text-2xl font-bold">Entrar</h2>
                <p className="text-muted-foreground text-sm">
                  Acesse o sistema de gestão do abrigo.
                </p>
              </div>

              <LoginForm />
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Acesso restrito à equipe e acolhidos<br className="sm:hidden" /> do Projeto Travessia.
          </p>
        </div>
      </div>
    </div>
  );
}
