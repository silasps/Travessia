import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { VagasCard } from "@/components/dashboard/vagas-card";
import { OcorrenciasAbertas } from "@/components/dashboard/ocorrencias-abertas";
import { PiasPendentes } from "@/components/dashboard/pias-pendentes";
import { MOCK_STATS } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils/format";
import {
  UserPlus, AlertTriangle, ClipboardList, FileText,
  Users, TrendingUp, ArrowRight, Activity,
} from "lucide-react";

export const metadata: Metadata = { title: "Painel" };

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

const ACTION_LABELS: Record<string, { label: string; icon: typeof Activity; color: string }> = {
  create_residente:      { label: "Cadastrou acolhido",       icon: UserPlus,       color: "text-green-600" },
  create_ocorrencia:     { label: "Registrou ocorrência",     icon: AlertTriangle,  color: "text-red-600" },
  save_pia:              { label: "Salvou PIA",               icon: ClipboardList,  color: "text-indigo-600" },
  create_advertencia:    { label: "Registrou advertência",    icon: AlertTriangle,  color: "text-amber-600" },
  update_fase:           { label: "Alterou fase",             icon: TrendingUp,     color: "text-purple-600" },
  create_marco:          { label: "Registrou marco",          icon: TrendingUp,     color: "text-amber-600" },
  create_encaminhamento: { label: "Registrou encaminhamento", icon: ArrowRight,     color: "text-teal-600" },
  invite_staff:          { label: "Convidou funcionário",      icon: UserPlus,       color: "text-sky-600" },
};

type RecentLog = { id: string; action: string; entity_name: string | null; created_at: string; user_id: string | null };

export default async function PainelPage() {
  if (DEV_MODE) {
    return <PainelContent
      totalAtivos={MOCK_STATS.totalAtivos}
      ocorrenciasAbertas={MOCK_STATS.ocorrenciasAbertas}
      piasPendentes={MOCK_STATS.piasPendentes}
      capacidade={50}
      recentLogs={[]}
      staffLookup={() => "Equipe"}
      entradas7d={0}
    />;
  }

  const supabase = await createClient();

  const [
    { count: totalAtivos },
    { count: ocorrenciasAbertas },
    { count: piasPendentes },
    { data: configuracoes },
    { data: recentLogsData },
    { data: staffData },
    { count: entradas7d },
  ] = await Promise.all([
    supabase.from("residentes").select("*", { count: "exact", head: true }).eq("status", "ativo").is("deleted_at", null),
    supabase.from("ocorrencias").select("*", { count: "exact", head: true }).in("status", ["aberta", "em_avaliacao"]),
    supabase.from("pia").select("*", { count: "exact", head: true }).in("status", ["rascunho", "revisao"]),
    supabase.from("configuracoes_sistema").select("chave, valor").in("chave", ["capacidade_total"]),
    supabase.from("audit_logs").select("id, action, entity_name, created_at, user_id").order("created_at", { ascending: false }).limit(5),
    supabase.from("staff_profiles").select("user_id, full_name"),
    supabase.from("movimentos_residentes").select("*", { count: "exact", head: true }).eq("tipo", "entrada").gte("data_hora", new Date(Date.now() - 7 * 86400000).toISOString()),
  ]);

  const capacidadeTotal = parseInt(configuracoes?.find((c) => c.chave === "capacidade_total")?.valor ?? "50");
  const staffMap = new Map((staffData ?? []).map((s) => [s.user_id, s.full_name]));

  return <PainelContent
    totalAtivos={totalAtivos ?? 0}
    ocorrenciasAbertas={ocorrenciasAbertas ?? 0}
    piasPendentes={piasPendentes ?? 0}
    capacidade={capacidadeTotal}
    recentLogs={(recentLogsData ?? []) as RecentLog[]}
    staffLookup={(uid) => staffMap.get(uid) ?? "Equipe"}
    entradas7d={entradas7d ?? 0}
  />;
}

function PainelContent({
  totalAtivos, ocorrenciasAbertas, piasPendentes, capacidade, recentLogs, staffLookup, entradas7d,
}: {
  totalAtivos: number; ocorrenciasAbertas: number;
  piasPendentes: number; capacidade: number;
  recentLogs: RecentLog[];
  staffLookup: (uid: string) => string;
  entradas7d: number;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Painel</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Visão geral do abrigo</p>
        </div>
        <Link
          href="/painel/residentes/novo"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 transition-colors min-h-[44px]"
        >
          <UserPlus className="size-4" />
          Novo Acolhido
        </Link>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <VagasCard ocupadas={totalAtivos} capacidade={capacidade} />
        <OcorrenciasAbertas count={ocorrenciasAbertas} />
        <PiasPendentes count={piasPendentes} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Atividade recente */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="size-4 text-muted-foreground" />
            Atividade recente
          </h2>
          {recentLogs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <Activity className="size-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-muted-foreground">Nenhuma atividade registrada ainda.</p>
              <p className="text-xs text-muted-foreground mt-1">As ações da equipe aparecerão aqui automaticamente.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
              {recentLogs.map((log) => {
                const cfg = ACTION_LABELS[log.action];
                const Icon = cfg?.icon ?? Activity;
                return (
                  <div key={log.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${cfg ? "bg-gray-100" : "bg-gray-50"}`}>
                      <Icon className={`size-4 ${cfg?.color ?? "text-gray-500"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">
                        <span className="font-medium">{staffLookup(log.user_id ?? "")}</span>
                        {" "}{cfg?.label ?? log.action}
                        {log.entity_name && <span className="text-muted-foreground"> — {log.entity_name}</span>}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{formatDate(log.created_at)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ações rápidas + resumo */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Ações rápidas</h2>
          <div className="space-y-2">
            <QuickLink href="/painel/residentes/novo" icon={UserPlus} label="Cadastrar acolhido" color="bg-blue-100 text-blue-700" />
            <QuickLink href="/painel/ocorrencias/nova" icon={AlertTriangle} label="Registrar ocorrência" color="bg-red-100 text-red-700" />
            <QuickLink href="/painel/residentes" icon={Users} label="Ver acolhidos" color="bg-sky-100 text-sky-700" />
            <QuickLink href="/painel/relatorios" icon={FileText} label="Relatórios" color="bg-purple-100 text-purple-700" />
          </div>

          {entradas7d > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mt-3">
              <p className="text-xs font-medium text-green-700">Últimos 7 dias</p>
              <p className="text-lg font-bold text-green-900 mt-0.5">{entradas7d} {entradas7d === 1 ? "entrada" : "entradas"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label, color }: { href: string; icon: typeof Activity; label: string; color: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 hover:border-blue-200 hover:bg-blue-50/20 transition-colors group"
    >
      <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="size-4" />
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex-1">{label}</span>
      <ArrowRight className="size-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
    </Link>
  );
}
