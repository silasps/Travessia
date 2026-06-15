import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus, Users, Search } from "lucide-react";
import { getMockResidentes, MOCK_STATS } from "@/lib/mock-data";
import { StatusBadge, FaseBadge } from "@/components/residentes/status-badge";
import { formatDate, formatTempoNoPrograma, maskCPF } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Acolhidos" };

export default async function ResidentesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; fase?: string; q?: string }>;
}) {
  const params = await searchParams;
  const filtroStatus = params.status ?? "ativo";
  const filtroFase = params.fase ?? "";
  const busca = params.q?.toLowerCase() ?? "";

  let residentes = getMockResidentes(filtroStatus === "todos" ? undefined : filtroStatus);

  if (filtroFase) {
    residentes = residentes.filter((r) => String(r.fase_atual) === filtroFase);
  }

  if (busca) {
    residentes = residentes.filter(
      (r) =>
        r.nome_completo.toLowerCase().includes(busca) ||
        (r.nome_social?.toLowerCase().includes(busca) ?? false) ||
        r.numero_prontuario.toLowerCase().includes(busca)
    );
  }

  const totalAtivos = MOCK_STATS.totalAtivos;
  const capacidade = 50;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Acolhidos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalAtivos} acolhidos ativos de {capacidade} vagas disponíveis
          </p>
        </div>
        <Link
          href="/painel/residentes/novo"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 transition-colors min-h-[44px]"
        >
          <UserPlus className="size-4" />
          Novo Acolhido
        </Link>
      </div>

      {/* Filtros */}
      <form method="GET" className="flex flex-col sm:flex-row gap-2">
        {/* Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            name="q"
            defaultValue={busca}
            placeholder="Buscar por nome ou prontuário..."
            className="w-full pl-9 pr-3 h-10 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {/* Status */}
        <select
          name="status"
          defaultValue={filtroStatus}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[130px]"
        >
          <option value="todos">Todos status</option>
          <option value="ativo">Ativos</option>
          <option value="desligado">Desligados</option>
          <option value="evadido">Evadidos</option>
          <option value="transferido">Transferidos</option>
        </select>
        {/* Fase */}
        <select
          name="fase"
          defaultValue={filtroFase}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[130px]"
        >
          <option value="">Todas as fases</option>
          <option value="1">Fase 1 — Acolhimento</option>
          <option value="2">Fase 2 — Reorganização</option>
          <option value="3">Fase 3 — Autonomia</option>
          <option value="4">Fase 4 — Preparação</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-xl border border-input bg-muted px-4 text-sm font-medium hover:bg-muted/80 transition-colors min-w-[80px]"
        >
          Filtrar
        </button>
      </form>

      {/* Contagem */}
      <p className="text-sm text-muted-foreground">
        {residentes.length} resultado{residentes.length !== 1 ? "s" : ""}
      </p>

      {/* Lista — Cards no mobile, tabela no desktop */}
      {residentes.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Users className="size-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhum acolhido encontrado</p>
          <p className="text-sm mt-1">Tente ajustar os filtros</p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="flex flex-col gap-3 lg:hidden">
            {residentes.map((r) => (
              <Link
                key={r.id}
                href={`/painel/residentes/${r.id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-4 hover:border-blue-200 hover:bg-blue-50/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">
                      {r.nome_social ?? r.nome_completo}
                    </p>
                    {r.nome_social && (
                      <p className="text-xs text-muted-foreground truncate">{r.nome_completo}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">{r.numero_prontuario}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <FaseBadge fase={r.fase_atual} compact />
                  <span className="text-xs text-gray-500">
                    Entrada: {formatDate(r.data_entrada)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTempoNoPrograma(r.data_entrada)}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop: tabela */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Prontuário</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">CPF</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fase</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Entrada</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tempo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {residentes.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/painel/residentes/${r.id}`}
                        className="font-mono text-xs text-blue-700 hover:underline"
                      >
                        {r.numero_prontuario}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/painel/residentes/${r.id}`} className="hover:text-blue-700">
                        <p className="font-medium text-gray-900">
                          {r.nome_social ?? r.nome_completo}
                        </p>
                        {r.nome_social && (
                          <p className="text-xs text-muted-foreground">{r.nome_completo}</p>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                      {r.cpf ? maskCPF(r.cpf) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <FaseBadge fase={r.fase_atual} compact />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(r.data_entrada)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatTempoNoPrograma(r.data_entrada)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
