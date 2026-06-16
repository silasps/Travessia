import type { Metadata } from "next";
import Link from "next/link";
import { Users, ArrowRightLeft, FileText, FileDown, TrendingUp, LayoutDashboard } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { ExportButton } from "@/components/relatorios/export-button";
import { PeriodoSeletor } from "@/components/relatorios/periodo-seletor";
import { DistribuicaoFaseChart, type FaseDatum } from "@/components/relatorios/distribuicao-fase-chart";
import { MovimentosResumoChart, type ResumoDatum } from "@/components/relatorios/movimentos-resumo-chart";
import { getDefaultPeriodo, getRelatorioData, getRelatorioMensalInfo } from "@/lib/relatorios/data";

export const metadata: Metadata = { title: "Relatórios" };

const FASE_LABELS = ["", "Acolhimento", "Reorganização", "Autonomia", "Preparação"];
const FASE_COLORS = ["", "#3b82f6", "#f59e0b", "#22c55e", "#a855f7"];

const TABS = [
  { id: "visao-geral", label: "Visão geral", icon: LayoutDashboard },
  { id: "movimentos", label: "Movimentos", icon: ArrowRightLeft },
  { id: "exportar", label: "Exportar", icon: FileDown, badge: 4 },
] as const;

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string; ate?: string; aba?: string }>;
}) {
  const params = await searchParams;
  const aba = TABS.some((t) => t.id === params.aba) ? params.aba! : "visao-geral";

  const { dataInicio, dataFim } = getDefaultPeriodo(params);
  const { residentes, movimentos: movimentosFiltrados } = await getRelatorioData({ dataInicio, dataFim });

  const entradas = movimentosFiltrados.filter((m) => m.tipo === "entrada");
  const saidasDefinitivas = movimentosFiltrados.filter((m) => m.tipo === "saida_definitiva");
  const saidasTemporarias = movimentosFiltrados.filter((m) => m.tipo === "saida_temporaria");
  const retornos = movimentosFiltrados.filter((m) => m.tipo === "retorno");
  const saidas = [...saidasDefinitivas, ...saidasTemporarias];

  // Stats gerais (usam todos os dados, não só o período)
  const ativos = residentes.filter((r) => r.status === "ativo");
  const distribuicaoFases: FaseDatum[] = [1, 2, 3, 4].map((fase) => ({
    fase,
    label: FASE_LABELS[fase],
    color: FASE_COLORS[fase],
    count: ativos.filter((r) => r.fase_atual === fase).length,
  }));

  const resumoMovimentos: ResumoDatum[] = [
    { label: "Entradas", count: entradas.length, color: "#22c55e" },
    { label: "Saídas def.", count: saidasDefinitivas.length, color: "#ef4444" },
    { label: "Saídas temp.", count: saidasTemporarias.length, color: "#60a5fa" },
    { label: "Retornos", count: retornos.length, color: "#c084fc" },
  ];

  const mensalInfo = getRelatorioMensalInfo(dataInicio, dataFim);
  const mensalPeriodoCompleto =
    mensalInfo.tipo === "periodico"
      ? mensalInfo.periodoLabel
      : `${mensalInfo.periodoLabel} (${formatDate(dataInicio)} – ${formatDate(dataFim)})`;

  const tabHref = (id: string) => `/painel/relatorios?de=${dataInicio}&ate=${dataFim}&aba=${id}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatDate(dataInicio)} – {formatDate(dataFim)}
          </p>
        </div>
        <PeriodoSeletor dataInicio={dataInicio} dataFim={dataFim} basePath="/painel/relatorios" aba={aba} />
      </div>

      {/* Tabs — sticky, scroll horizontal mobile */}
      <div className="sticky top-14 z-10 bg-background -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-border">
        <div className="flex overflow-x-auto gap-0 scrollbar-none">
          {TABS.map((tab) => (
            <Link
              key={tab.id}
              href={tabHref(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                aba === tab.id
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="size-4" />
              {tab.label}
              {"badge" in tab && (
                <span className="inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full bg-gray-100 text-[10px] font-semibold text-gray-600">
                  {tab.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* ── ABA: Visão geral ── */}
      {aba === "visao-geral" && (
        <div className="pt-1 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Acolhidos ativos" value={ativos.length} icon={<Users className="size-5" />} tint="blue" />
            <StatCard label="Vagas livres" value={50 - ativos.length} icon={<TrendingUp className="size-5" />} tint="green" />
            <StatCard label="Entradas no período" value={entradas.length} icon={<ArrowRightLeft className="size-5" />} tint="amber" />
            <StatCard label="Saídas no período" value={saidas.length} icon={<ArrowRightLeft className="size-5" />} tint="red" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="size-4 text-purple-500" />
              Distribuição por fase
            </h2>
            <DistribuicaoFaseChart data={distribuicaoFases} total={ativos.length} />
          </div>

          <Link
            href={tabHref("exportar")}
            className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 hover:border-blue-200 hover:bg-blue-50/20 transition-colors group"
          >
            <span className="flex items-center justify-center size-9 rounded-xl bg-gray-50 text-gray-500 group-hover:text-blue-600 transition-colors shrink-0">
              <FileDown className="size-4.5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                4 relatórios disponíveis para exportação
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Movimentos, acolhidos ativos, mensal e ocorrências</p>
            </div>
            <span className="text-xs font-medium text-blue-700 shrink-0">Ver tudo →</span>
          </Link>
        </div>
      )}

      {/* ── ABA: Movimentos ── */}
      {aba === "movimentos" && (
        <div className="pt-1 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <ArrowRightLeft className="size-4 text-blue-500" />
              Resumo no período
            </h2>
            <MovimentosResumoChart data={resumoMovimentos} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ArrowRightLeft className="size-4 text-blue-500" />
              Movimentos no período
            </h2>

            {movimentosFiltrados.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum movimento registrado neste período.
              </p>
            ) : (
              <div className="space-y-1">
                {movimentosFiltrados.map((m) => {
                  const r = residentes.find((x) => x.id === m.residente_id);
                  const isEntrada = m.tipo === "entrada";
                  return (
                    <Link
                      key={m.id}
                      href={r ? `/painel/residentes/${r.id}` : "#"}
                      className="flex items-start gap-3 py-2.5 px-2 -mx-2 rounded-xl border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-colors group"
                    >
                      <span className={`mt-1.5 size-2 rounded-full shrink-0 ${isEntrada ? "bg-green-500" : "bg-red-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
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
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ABA: Exportar ── */}
      {aba === "exportar" && (
        <div className="pt-1">
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
                desc={`${ativos.length} acolhidos · situação atual, não depende do período`}
                icon={<Users className="size-4" />}
                href={`/painel/relatorios/exportar/acolhidos-ativos?de=${dataInicio}&ate=${dataFim}`}
                periodoLabel={`Situação atual (hoje) · ${ativos.length} acolhidos ativos`}
              />
              <ExportButton
                label={mensalInfo.titulo}
                desc={
                  <>
                    {mensalInfo.periodoLabel} · Formato exigido pela prefeitura
                    {mensalInfo.aviso && (
                      <span className="block text-amber-600 mt-0.5">{mensalInfo.aviso}</span>
                    )}
                  </>
                }
                icon={<FileText className="size-4" />}
                href={`/painel/relatorios/exportar/mensal?de=${dataInicio}&ate=${dataFim}`}
                periodoLabel={mensalPeriodoCompleto}
              />
              <ExportButton
                label="Histórico de ocorrências"
                desc={`Ocorrências de ${formatDate(dataInicio)} a ${formatDate(dataFim)}`}
                icon={<FileText className="size-4" />}
                href={`/painel/relatorios/exportar/ocorrencias?de=${dataInicio}&ate=${dataFim}`}
                periodoLabel={`${formatDate(dataInicio)} – ${formatDate(dataFim)}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TINT_CLASSES = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-500",
} as const;

function StatCard({
  label,
  value,
  icon,
  tint,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tint: keyof typeof TINT_CLASSES;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className={`inline-flex items-center justify-center size-9 rounded-xl ${TINT_CLASSES[tint]}`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900 mt-3">{value}</p>
      <p className="text-xs text-muted-foreground mt-1 leading-tight">{label}</p>
    </div>
  );
}
