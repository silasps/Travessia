import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Plus } from "lucide-react";
import { MOCK_OCORRENCIAS, MOCK_RESIDENTES } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Ocorrências" };

const GRAVIDADE_CONFIG = {
  leve:       { label: "Leve",       className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  moderada:   { label: "Moderada",   className: "bg-orange-100 text-orange-800 border-orange-200" },
  grave:      { label: "Grave",      className: "bg-red-100 text-red-800 border-red-200" },
  gravissima: { label: "Gravíssima", className: "bg-red-200 text-red-900 border-red-300 font-bold" },
};

const STATUS_CONFIG = {
  aberta:       { label: "Aberta",       dot: "bg-blue-500" },
  em_avaliacao: { label: "Em avaliação", dot: "bg-amber-500" },
  confirmada:   { label: "Confirmada",   dot: "bg-gray-400" },
  improcedente: { label: "Improcedente", dot: "bg-green-500" },
};

export default async function OcorrenciasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; gravidade?: string }>;
}) {
  const params = await searchParams;
  const filtroStatus = params.status ?? "";
  const filtroGravidade = params.gravidade ?? "";

  let ocorrencias = [...MOCK_OCORRENCIAS];

  if (filtroStatus) {
    ocorrencias = ocorrencias.filter((o) => o.status === filtroStatus);
  }
  if (filtroGravidade) {
    ocorrencias = ocorrencias.filter((o) => o.gravidade === filtroGravidade);
  }

  // Ordenar: abertas primeiro, depois por data desc
  ocorrencias.sort((a, b) => {
    const order = { aberta: 0, em_avaliacao: 1, confirmada: 2, improcedente: 3 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return new Date(b.data_ocorrencia).getTime() - new Date(a.data_ocorrencia).getTime();
  });

  const abertas = MOCK_OCORRENCIAS.filter((o) => o.status === "aberta" || o.status === "em_avaliacao").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Ocorrências</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {abertas} ocorrência{abertas !== 1 ? "s" : ""} pendente{abertas !== 1 ? "s" : ""} de avaliação
          </p>
        </div>
        <Link
          href="/painel/ocorrencias/nova"
          className="inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-sm font-medium text-white hover:bg-destructive/90 transition-colors min-h-[44px]"
        >
          <Plus className="size-4" />
          Nova Ocorrência
        </Link>
      </div>

      {/* Filtros */}
      <form method="GET" className="flex flex-wrap gap-2">
        <select
          name="status"
          defaultValue={filtroStatus}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todos status</option>
          <option value="aberta">Abertas</option>
          <option value="em_avaliacao">Em avaliação</option>
          <option value="confirmada">Confirmadas</option>
          <option value="improcedente">Improcedentes</option>
        </select>
        <select
          name="gravidade"
          defaultValue={filtroGravidade}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todas gravidades</option>
          <option value="leve">Leve</option>
          <option value="moderada">Moderada</option>
          <option value="grave">Grave</option>
          <option value="gravissima">Gravíssima</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-xl border border-input bg-muted px-4 text-sm font-medium hover:bg-muted/80 transition-colors"
        >
          Filtrar
        </button>
      </form>

      {/* Contagem */}
      <p className="text-sm text-muted-foreground">{ocorrencias.length} ocorrência{ocorrencias.length !== 1 ? "s" : ""}</p>

      {/* Lista */}
      {ocorrencias.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <AlertTriangle className="size-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhuma ocorrência encontrada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ocorrencias.map((oc) => {
            const residente = MOCK_RESIDENTES.find((r) => r.id === oc.residente_id);
            const gravCfg = GRAVIDADE_CONFIG[oc.gravidade];
            const statusCfg = STATUS_CONFIG[oc.status];

            return (
              <Link
                key={oc.id}
                href={`/painel/ocorrencias/${oc.id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-4 hover:border-blue-200 hover:bg-blue-50/20 transition-colors"
              >
                {/* Header da ocorrência */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-xs text-muted-foreground">{oc.numero}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${gravCfg.className}`}>
                    {gravCfg.label}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={`size-1.5 rounded-full ${statusCfg.dot}`} />
                    {statusCfg.label}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">{formatDate(oc.data_ocorrencia)}</span>
                </div>

                {/* Acolhido */}
                {residente && (
                  <p className="text-xs font-medium text-blue-700 mb-1.5">
                    {residente.nome_social ?? residente.nome_completo} · {residente.numero_prontuario}
                  </p>
                )}

                {/* Descrição */}
                <p className="text-sm text-gray-800 line-clamp-2">{oc.descricao}</p>

                {/* Local */}
                {oc.local && (
                  <p className="text-xs text-muted-foreground mt-1.5">📍 {oc.local}</p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
