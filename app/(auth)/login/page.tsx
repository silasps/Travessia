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
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 to-blue-800 px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-blue-900 text-2xl font-bold">PT</span>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Projeto Travessia</h1>
          <p className="text-blue-200 text-sm">Sistema de Gestão do Abrigo</p>
        </div>

        {DEV_MODE ? (
          /* ── Modo dev: atalhos sem autenticação ── */
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <p className="text-xs font-semibold text-amber-800">Modo demonstração</p>
              <p className="text-xs text-amber-700 mt-0.5">Banco de dados não conectado</p>
            </div>

            <p className="text-sm text-center text-gray-700 font-medium">Acessar como:</p>

            <div className="space-y-2">
              <Link
                href="/painel"
                className="flex items-center gap-3 w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors min-h-[48px]"
              >
                <span className="size-8 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">SA</span>
                <div className="text-left">
                  <p>Super Admin</p>
                  <p className="text-xs font-normal text-blue-200">Acesso total · Painel da equipe</p>
                </div>
              </Link>

              <Link
                href="/painel"
                className="flex items-center gap-3 w-full rounded-xl bg-purple-700 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-800 transition-colors min-h-[48px]"
              >
                <span className="size-8 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">CO</span>
                <div className="text-left">
                  <p>Coordenação</p>
                  <p className="text-xs font-normal text-purple-200">Avalia ocorrências e relatórios</p>
                </div>
              </Link>

              <Link
                href="/painel"
                className="flex items-center gap-3 w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 transition-colors min-h-[48px]"
              >
                <span className="size-8 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">TC</span>
                <div className="text-left">
                  <p>Técnico (Psicólogo / Assist. Social)</p>
                  <p className="text-xs font-normal text-teal-200">PIA, evolução, prontuário completo</p>
                </div>
              </Link>

              <Link
                href="/painel"
                className="flex items-center gap-3 w-full rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800 transition-colors min-h-[48px]"
              >
                <span className="size-8 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">CU</span>
                <div className="text-left">
                  <p>Cuidador</p>
                  <p className="text-xs font-normal text-green-200">Registra ocorrências e visualiza dados</p>
                </div>
              </Link>

              <Link
                href="/meu-espaco"
                className="flex items-center gap-3 w-full rounded-xl bg-gray-700 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors min-h-[48px]"
              >
                <span className="size-8 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">JC</span>
                <div className="text-left">
                  <p>José Carlos (Acolhido)</p>
                  <p className="text-xs font-normal text-gray-300">Portal do acolhido</p>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          /* ── Produção: formulário real ── */
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-gray-900 text-lg font-semibold mb-6">Entrar na plataforma</h2>
            <LoginForm />
          </div>
        )}

        <p className="text-blue-300 text-xs text-center">
          Acesso restrito à equipe e acolhidos do Projeto Travessia.
        </p>
      </div>
    </main>
  );
}
