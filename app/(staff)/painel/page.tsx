import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { VagasCard } from "@/components/dashboard/vagas-card";
import { OcorrenciasAbertas } from "@/components/dashboard/ocorrencias-abertas";
import { PiasPendentes } from "@/components/dashboard/pias-pendentes";
import { ResumoResidentes } from "@/components/dashboard/resumo-residentes";
import { MOCK_STATS, MOCK_CONFIGURACOES } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Painel" };

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

export default async function PainelPage() {
  if (DEV_MODE) {
    return <PainelContent
      totalAtivos={MOCK_STATS.totalAtivos}
      ocorrenciasAbertas={MOCK_STATS.ocorrenciasAbertas}
      piasPendentes={MOCK_STATS.piasPendentes}
      capacidade={50}
    />;
  }

  const supabase = await createClient();

  const { count: totalAtivos } = await supabase
    .from("residentes")
    .select("*", { count: "exact", head: true })
    .eq("status", "ativo")
    .is("deleted_at", null);

  const { count: ocorrenciasAbertas } = await supabase
    .from("ocorrencias")
    .select("*", { count: "exact", head: true })
    .in("status", ["aberta", "em_avaliacao"]);

  const { count: piasPendentes } = await supabase
    .from("pia")
    .select("*", { count: "exact", head: true })
    .in("status", ["rascunho", "revisao"]);

  const { data: configuracoes } = await supabase
    .from("configuracoes_sistema")
    .select("chave, valor")
    .in("chave", ["capacidade_total"]);

  const capacidadeTotal = parseInt(
    configuracoes?.find((c) => c.chave === "capacidade_total")?.valor ?? "50"
  );

  return <PainelContent
    totalAtivos={totalAtivos ?? 0}
    ocorrenciasAbertas={ocorrenciasAbertas ?? 0}
    piasPendentes={piasPendentes ?? 0}
    capacidade={capacidadeTotal}
  />;
}

function PainelContent({
  totalAtivos, ocorrenciasAbertas, piasPendentes, capacidade,
}: {
  totalAtivos: number; ocorrenciasAbertas: number;
  piasPendentes: number; capacidade: number;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Painel</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Visão geral do abrigo</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <VagasCard ocupadas={totalAtivos} capacidade={capacidade} />
        <ResumoResidentes total={totalAtivos} />
        <OcorrenciasAbertas count={ocorrenciasAbertas} />
        <PiasPendentes count={piasPendentes} />
      </div>
    </div>
  );
}
