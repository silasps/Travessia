import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus, Users, Search, X, ClipboardList } from "lucide-react";
import { getMockResidentes, MOCK_STATS, MOCK_PIAS } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import type { Residente, ResidenteStatus } from "@/types/database";
import { StatusBadge, FaseBadge } from "@/components/residentes/status-badge";
import { formatDate, formatTempoNoPrograma, maskCPF } from "@/lib/utils/format";
import { ResidenteRow } from "@/components/residentes/residente-row";
import { AutoSubmitSelect } from "@/components/residentes/auto-submit-select";

export const metadata: Metadata = { title: "Acolhidos" };

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

export default async function ResidentesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; fase?: string; q?: string; pia?: string }>;
}) {
  const params = await searchParams;
  const filtroStatus = params.status ?? "ativo";
  const filtroFase = params.fase ?? "";
  const busca = params.q?.toLowerCase() ?? "";
  const filtroPia = params.pia ?? "";

  let residentes: Residente[];
  let totalAtivos: number;
  let capacidade = 50;

  if (DEV_MODE) {
    residentes = getMockResidentes(filtroStatus === "todos" ? undefined : filtroStatus);

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

    if (filtroPia === "pendente") {
      residentes = residentes.filter((r) => {
        const pia = MOCK_PIAS[r.id];
        return pia !== undefined && (pia.status === "rascunho" || pia.status === "revisao");
      });
    }

    totalAtivos = MOCK_STATS.totalAtivos;
  } else {
    const supabase = await createClient();

    let query = supabase.from("residentes").select("*").is("deleted_at", null);
    if (filtroStatus !== "todos") query = query.eq("status", filtroStatus as ResidenteStatus);
    if (filtroFase) query = query.eq("fase_atual", Number(filtroFase));
    if (busca) {
      const termo = busca.replace(/[,%]/g, " ");
      query = query.or(
        `nome_completo.ilike.%${termo}%,nome_social.ilike.%${termo}%,numero_prontuario.ilike.%${termo}%`
      );
    }
    query = query.order("nome_completo");

    if (filtroPia === "pendente") {
      const { data: piasAbertos } = await supabase
        .from("pia")
        .select("residente_id")
        .in("status", ["rascunho", "revisao"]);
      const idsComPiaPendente = (piasAbertos ?? []).map((p) => p.residente_id);
      const { data } = idsComPiaPendente.length > 0
        ? await query.in("id", idsComPiaPendente)
        : { data: [] };
      residentes = data ?? [];
    } else {
      const { data } = await query;
      residentes = data ?? [];
    }

    const { count } = await supabase
      .from("residentes")
      .select("*", { count: "exact", head: true })
      .eq("status", "ativo")
      .is("deleted_at", null);
    totalAtivos = count ?? 0;

    const { data: configuracoes } = await supabase
      .from("configuracoes_sistema")
      .select("chave, valor")
      .in("chave", ["capacidade_total"]);
    capacidade = parseInt(
      configuracoes?.find((c) => c.chave === "capacidade_total")?.valor ?? "50"
    );
  }

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

      {/* Chip filtro PIA ativo */}
      {filtroPia === "pendente" && (
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 border border-purple-200 px-3 py-1 text-xs font-medium text-purple-700">
            <ClipboardList className="size-3.5" />
            PIAs pendentes
            <Link
              href="/painel/residentes"
              className="ml-1 hover:text-purple-900 transition-colors"
              title="Remover filtro"
            >
              <X className="size-3.5" />
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">Mostrando residentes com PIA em rascunho ou revisão</p>
        </div>
      )}

      {/* Filtros */}
      <form method="GET" className="flex flex-col sm:flex-row gap-2">
        {filtroPia && <input type="hidden" name="pia" value={filtroPia} />}
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
        <AutoSubmitSelect
          name="status"
          defaultValue={filtroStatus}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[130px]"
        >
          <option value="todos">Todos status</option>
          <option value="ativo">Ativos</option>
          <option value="desligado">Desligados</option>
          <option value="evadido">Evadidos</option>
          <option value="transferido">Transferidos</option>
        </AutoSubmitSelect>
        {/* Fase */}
        <AutoSubmitSelect
          name="fase"
          defaultValue={filtroFase}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[130px]"
        >
          <option value="">Todas as fases</option>
          <option value="1">Fase 1 — Acolhimento</option>
          <option value="2">Fase 2 — Reorganização</option>
          <option value="3">Fase 3 — Autonomia</option>
          <option value="4">Fase 4 — Preparação</option>
        </AutoSubmitSelect>
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
                  <ResidenteRow key={r.id} href={`/painel/residentes/${r.id}`}>
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">
                      {r.numero_prontuario}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                        {r.nome_social ?? r.nome_completo}
                      </p>
                      {r.nome_social && (
                        <p className="text-xs text-muted-foreground">{r.nome_completo}</p>
                      )}
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
                  </ResidenteRow>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
