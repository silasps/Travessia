import type { Metadata } from "next";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { User, TrendingUp, FileText, Calendar, AlertOctagon } from "lucide-react";
import Link from "next/link";
import { formatDate, formatTempoNoPrograma } from "@/lib/utils/format";
import { getMockResidente } from "@/lib/mock-data";
import { resolveResidenteAcesso } from "@/lib/residente-preview";

export const metadata: Metadata = { title: "Meu Espaço" };

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

const FASE_LABELS: Record<number, string> = {
  1: "Fase 1 — Acolhimento",
  2: "Fase 2 — Reorganização",
  3: "Fase 3 — Autonomia",
  4: "Fase 4 — Preparação",
};

const FASE_CORES: Record<number, string> = {
  1: "bg-blue-100 text-blue-800",
  2: "bg-amber-100 text-amber-800",
  3: "bg-green-100 text-green-800",
  4: "bg-purple-100 text-purple-800",
};

export default async function MeuEspacoPage() {
  let nomeExibido: string;
  let primeiroNome: string;
  let numeroProntuario: string;
  let faseAtual: number;
  let dataEntrada: string;
  let fotoUrl: string | null;

  if (DEV_MODE) {
    const r = getMockResidente("r01")!;
    nomeExibido = r.nome_social ?? r.nome_completo;
    primeiroNome = nomeExibido.split(" ")[0];
    numeroProntuario = r.numero_prontuario;
    faseAtual = r.fase_atual;
    dataEntrada = r.data_entrada;
    fotoUrl = r.foto_url ?? null;
  } else {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const acesso = await resolveResidenteAcesso(supabase, user.id);
    if (!acesso) redirect("/login");

    if (!acesso.residenteId) {
      // Membro da equipe em preview, sem acolhido escolhido → dados fictícios
      const r = getMockResidente("r01")!;
      nomeExibido = r.nome_social ?? r.nome_completo;
      primeiroNome = nomeExibido.split(" ")[0];
      numeroProntuario = r.numero_prontuario;
      faseAtual = r.fase_atual;
      dataEntrada = r.data_entrada;
      fotoUrl = r.foto_url ?? null;
    } else {
      const { data: residente } = await supabase
        .from("residentes")
        .select("nome_completo, nome_social, fase_atual, data_entrada, foto_url, numero_prontuario")
        .eq("id", acesso.residenteId)
        .single();
      if (!residente) redirect("/login");

      nomeExibido = residente.nome_social ?? residente.nome_completo;
      primeiroNome = nomeExibido.split(" ")[0];
      numeroProntuario = residente.numero_prontuario;
      faseAtual = residente.fase_atual;
      dataEntrada = residente.data_entrada;
      fotoUrl = residente.foto_url ?? null;
    }
  }

  return (
    <div className="space-y-6">
      {DEV_MODE && (
        <div className="bg-amber-100 border border-amber-300 rounded-xl px-3 py-2 text-xs text-amber-800 font-medium">
          DEV — exibindo dados de José Carlos (r01)
        </div>
      )}

      {/* Boas-vindas */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Olá,</p>
        <h1 className="text-2xl font-bold text-gray-900">{primeiroNome}!</h1>
      </div>

      {/* Card principal */}
      <Card className="border-2 border-blue-100 bg-blue-50">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
              {fotoUrl ? (
                <Image
                  src={fotoUrl}
                  alt={nomeExibido}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <User className="size-7 text-blue-600" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{nomeExibido}</p>
              <p className="text-xs text-muted-foreground">Prontuário {numeroProntuario}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sua fase atual</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${FASE_CORES[faseAtual]}`}>
                {FASE_LABELS[faseAtual]}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-1.5">
                <Calendar className="size-4" />
                No programa há
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {formatTempoNoPrograma(dataEntrada)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Entrada em</span>
              <span className="text-sm text-gray-700">{formatDate(dataEntrada)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links de navegação */}
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-gray-800">O que você quer ver?</h2>
        <div className="grid grid-cols-1 gap-3">
          <Link
            href="/meu-espaco/minha-evolucao"
            className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
          >
            <TrendingUp className="size-8 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900 text-base">Minha Evolução</p>
              <p className="text-sm text-muted-foreground">Veja suas conquistas e próximos passos</p>
            </div>
          </Link>

          <Link
            href="/meu-espaco/meus-documentos"
            className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
          >
            <FileText className="size-8 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900 text-base">Meus Documentos</p>
              <p className="text-sm text-muted-foreground">Veja o status dos seus documentos</p>
            </div>
          </Link>

          <Link
            href="/meu-espaco/meu-perfil"
            className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
          >
            <User className="size-8 text-purple-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900 text-base">Meu Perfil</p>
              <p className="text-sm text-muted-foreground">Seus dados pessoais</p>
            </div>
          </Link>

          <Link
            href="/meu-espaco/minhas-advertencias"
            className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-colors"
          >
            <AlertOctagon className="size-8 text-orange-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900 text-base">Minhas Advertências</p>
              <p className="text-sm text-muted-foreground">Veja advertências registradas</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
