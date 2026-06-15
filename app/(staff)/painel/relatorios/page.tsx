import type { Metadata } from "next";
import Link from "next/link";
import { Users, ArrowRightLeft, FileText, TrendingUp } from "lucide-react";
import { MOCK_RESIDENTES, MOCK_MOVIMENTOS, MOCK_STATS } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils/format";
import { ExportButton } from "@/components/relatorios/export-button";

export const metadata: Metadata = { title: "Relatórios" };

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string; ate?: string }>;
}) {
  const params = await searchParams;

  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const dataInicio = params.de ?? primeiroDiaMes.toISOString().split("T")[0];
  const dataFim = params.ate ?? hoje.toISOString().split("T")[0];

  // Filtra movimentos no período
  const movimentosFiltrados = MOCK_MOVIMENTOS.filter((m) => {
    const data = m.data_hora.split("T")[0];
    return data >= dataInicio && data <= dataFim;
  });

  const entradas = movimentosFiltrados.filter((m) => m.tipo === "entrada");
  const saidas = movimentosFiltrados.filter(
    (m) => m.tipo === "saida_definitiva" || m.tipo === "saida_temporaria"
  );

  // Stats gerais (usam todos os dados, não só o período)
  const ativos = MOCK_RESIDENTES.filter((r) => r.status === "ativo");
  const desligados = MOCK_RESIDENTES.filter((r) => r.status === "desligado");
  const evadidos = MOCK_RESIDENTES.filter((r) => r.status === "evadido");

  const distribuicaoFases = [1, 2, 3, 4].map((f) => ({
    fase: f,
    count: ativos.filter((r) => r.fase_atual === f).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Dados e exportações do Projeto Travessia
        </p>
      </div>

      {/* Filtro de período */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <ArrowRightLeft className="size-4 text-blue-500" />
          Período do relatório de movimentos
        </h2>
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">De</label>
            <input
              type="date"
              name="de"
              defaultValue={dataInicio}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Até</label>
            <input
              type="date"
              name="ate"
              defaultValue={dataFim}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="h-10 rounded-xl border border-input bg-muted px-4 text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            Filtrar
          </button>
        </form>
      </div>

      {/* Grid de cards de stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Ativos" value={ativos.length} icon={<Users className="size-5 text-blue-500" />} />
        <StatCard label="Vagas livres" value={50 - ativos.length} icon={<TrendingUp className="size-5 text-green-500" />} />
        <StatCard label={`Entradas (${formatDate(dataInicio)} – ${formatDate(dataFim)})`} value={entradas.length} icon={<ArrowRightLeft className="size-5 text-amber-500" />} />
        <StatCard label={`Saídas (${formatDate(dataInicio)} – ${formatDate(dataFim)})`} value={saidas.length} icon={<ArrowRightLeft className="size-5 text-red-400" />} />
      </div>

      {/* Distribuição por fase */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="size-4 text-purple-500" />
          Distribuição por fase
        </h2>
        <div className="space-y-3">
          {distribuicaoFases.map(({ fase, count }) => {
            const pct = ativos.length > 0 ? Math.round((count / ativos.length) * 100) : 0;
            const LABELS = ["", "Acolhimento", "Reorganização", "Autonomia", "Preparação"];
            const COLORS = ["", "bg-blue-500", "bg-amber-500", "bg-green-500", "bg-purple-500"];
            return (
              <div key={fase} className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-600 w-28 shrink-0">
                  F{fase} {LABELS[fase]}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${COLORS[fase]} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-gray-600 w-12 text-right shrink-0">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Movimentos no período */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ArrowRightLeft className="size-4 text-blue-500" />
          Movimentos no período ({formatDate(dataInicio)} – {formatDate(dataFim)})
        </h2>

        {movimentosFiltrados.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum movimento registrado neste período.
          </p>
        ) : (
          <div className="space-y-2">
            {movimentosFiltrados.map((m) => {
              const r = MOCK_RESIDENTES.find((x) => x.id === m.residente_id);
              const isEntrada = m.tipo === "entrada";
              return (
                <div key={m.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className={`mt-0.5 size-2 rounded-full shrink-0 ${isEntrada ? "bg-green-500" : "bg-red-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {r?.nome_social ?? r?.nome_completo ?? m.residente_id}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.motivo}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isEntrada ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {isEntrada ? "Entrada" : "Saída"}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(m.data_hora)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Exportações */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="size-4 text-gray-500" />
          Exportar relatórios
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href={`/painel/relatorios/entradas-saidas?de=${dataInicio}&ate=${dataFim}`}
            className="flex items-start gap-3 w-full p-3 rounded-xl border border-gray-200 text-left hover:border-blue-200 hover:bg-blue-50/20 transition-colors group"
          >
            <ArrowRightLeft className="size-4 text-muted-foreground group-hover:text-blue-600 mt-0.5 transition-colors shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Relatório de entradas e saídas</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatDate(dataInicio)} – {formatDate(dataFim)}</p>
            </div>
          </Link>
          <ExportButton
            label="Lista de acolhidos ativos"
            desc={`${ativos.length} acolhidos`}
            icon={<Users className="size-4" />}
          />
          <ExportButton
            label="Relatório mensal completo"
            desc="Formato exigido pela prefeitura"
            icon={<FileText className="size-4" />}
          />
          <ExportButton
            label="Histórico de ocorrências"
            desc="Todas as ocorrências registradas"
            icon={<FileText className="size-4" />}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          A geração de PDF estará disponível após a conexão com o banco de dados.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>{icon}</div>
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-2 leading-tight">{label}</p>
    </div>
  );
}

