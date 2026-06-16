import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRightLeft, Download } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { getDefaultPeriodo, getRelatorioData, isMovimentoTipo } from "@/lib/relatorios/data";

export const metadata: Metadata = { title: "Relatório Entradas e Saídas" };

const TIPO_CONFIG = {
  entrada:          { label: "Entrada",          className: "bg-green-100 text-green-800",  dot: "bg-green-500" },
  saida_temporaria: { label: "Saída temporária", className: "bg-blue-100 text-blue-800",    dot: "bg-blue-400" },
  retorno:          { label: "Retorno",          className: "bg-purple-100 text-purple-800", dot: "bg-purple-400" },
  saida_definitiva: { label: "Saída definitiva", className: "bg-red-100 text-red-800",      dot: "bg-red-500" },
} as const;

export default async function EntradasSaidasPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string; ate?: string; tipo?: string }>;
}) {
  const params = await searchParams;
  const { dataInicio, dataFim } = getDefaultPeriodo(params);
  const filtroTipo = params.tipo && isMovimentoTipo(params.tipo) ? params.tipo : "";
  const { residentes, movimentos } = await getRelatorioData({ dataInicio, dataFim, tipo: filtroTipo });

  const entradas = movimentos.filter((m) => m.tipo === "entrada");
  const saidas = movimentos.filter((m) => m.tipo === "saida_definitiva");
  const temporarias = movimentos.filter((m) => m.tipo === "saida_temporaria" || m.tipo === "retorno");

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Voltar */}
      <Link
        href="/painel/relatorios"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Relatórios
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Entradas e Saídas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatDate(dataInicio)} – {formatDate(dataFim)}
          </p>
        </div>
        <Link
          href={`/painel/relatorios/exportar/entradas-saidas?de=${dataInicio}&ate=${dataFim}${filtroTipo ? `&tipo=${filtroTipo}` : ""}`}
          className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
        >
          <Download className="size-4" />
          Exportar PDF
        </Link>
      </div>

      {/* Filtros */}
      <form method="GET" className="flex flex-wrap items-end gap-3 bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex-1 min-w-[130px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">De</label>
          <input type="date" name="de" defaultValue={dataInicio}
            className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex-1 min-w-[130px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">Até</label>
          <input type="date" name="ate" defaultValue={dataFim}
            className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
          <select name="tipo" defaultValue={filtroTipo}
            className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">Todos</option>
            <option value="entrada">Entradas</option>
            <option value="saida_definitiva">Saídas definitivas</option>
            <option value="saida_temporaria">Saídas temporárias</option>
            <option value="retorno">Retornos</option>
          </select>
        </div>
        <button type="submit"
          className="h-10 rounded-xl border border-input bg-muted px-4 text-sm font-medium hover:bg-muted/80 transition-colors">
          Filtrar
        </button>
      </form>

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{entradas.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Entradas</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{saidas.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Saídas definitivas</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{temporarias.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Saídas temporárias</p>
        </div>
      </div>

      {/* Tabela de movimentos */}
      {movimentos.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <ArrowRightLeft className="size-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhum movimento no período</p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="flex flex-col gap-2 lg:hidden">
            {movimentos.map((m) => {
              const r = residentes.find((x) => x.id === m.residente_id);
              const cfg = TIPO_CONFIG[m.tipo];
              return (
                <div key={m.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {r?.nome_social ?? r?.nome_completo ?? m.residente_id}
                      </p>
                      {r && (
                        <Link href={`/painel/residentes/${r.id}`}
                          className="text-xs text-blue-700 hover:underline">
                          {r.numero_prontuario}
                        </Link>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${cfg.className}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">{formatDateTime(m.data_hora)}</p>
                    {m.motivo && <p className="text-xs text-gray-600">{m.motivo}</p>}
                    {m.destino && <p className="text-xs text-gray-500">Destino: {m.destino}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: tabela */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Data/Hora</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Acolhido</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Motivo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Destino</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {movimentos.map((m) => {
                  const r = residentes.find((x) => x.id === m.residente_id);
                  const cfg = TIPO_CONFIG[m.tipo];
                  return (
                    <tr key={m.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {formatDateTime(m.data_hora)}
                      </td>
                      <td className="px-4 py-3">
                        {r ? (
                          <Link href={`/painel/residentes/${r.id}`} className="hover:text-blue-700">
                            <p className="font-medium text-gray-900">{r.nome_social ?? r.nome_completo}</p>
                            <p className="text-xs text-muted-foreground">{r.numero_prontuario}</p>
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">{m.residente_id}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{m.motivo ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{m.destino ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
