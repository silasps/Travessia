import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Plus } from "lucide-react";
import { MOCK_OCORRENCIAS, MOCK_RESIDENTES } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { AutoSubmitSelect } from "@/components/residentes/auto-submit-select";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Ocorrências" };

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

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

type OcRow = { id: string; numero: string; residente_id: string; data_ocorrencia: string; gravidade: string; status: string; descricao: string; local: string | null };
type ResMap = Map<string, { nome: string; prontuario: string }>;

export default async function OcorrenciasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; gravidade?: string }>;
}) {
  const params = await searchParams;
  const filtroStatus = params.status ?? "";
  const filtroGravidade = params.gravidade ?? "";

  let ocorrencias: OcRow[];
  let resMap: ResMap;
  let totalAbertas: number;

  if (DEV_MODE) {
    let mocks = [...MOCK_OCORRENCIAS] as OcRow[];
    if (filtroStatus) mocks = mocks.filter((o) => o.status === filtroStatus);
    if (filtroGravidade) mocks = mocks.filter((o) => o.gravidade === filtroGravidade);
    ocorrencias = mocks;
    totalAbertas = MOCK_OCORRENCIAS.filter((o) => o.status === "aberta" || o.status === "em_avaliacao").length;
    resMap = new Map(MOCK_RESIDENTES.map((r) => [r.id, { nome: r.nome_social ?? r.nome_completo, prontuario: r.numero_prontuario }]));
  } else {
    const supabase = await createClient();
    let query = supabase
      .from("ocorrencias")
      .select("id, numero, residente_id, data_ocorrencia, gravidade, status, descricao, local")
      .order("data_ocorrencia", { ascending: false });

    if (filtroStatus) query = query.eq("status", filtroStatus as "aberta" | "em_avaliacao" | "confirmada" | "improcedente");
    if (filtroGravidade) query = query.eq("gravidade", filtroGravidade as "leve" | "moderada" | "grave" | "gravissima");

    const [{ data: ocData }, { count: abertasCount }, { data: resData }] = await Promise.all([
      query,
      supabase.from("ocorrencias").select("*", { count: "exact", head: true }).in("status", ["aberta", "em_avaliacao"]),
      supabase.from("residentes").select("id, nome_completo, nome_social, numero_prontuario"),
    ]);

    ocorrencias = (ocData ?? []) as OcRow[];
    totalAbertas = abertasCount ?? 0;
    resMap = new Map((resData ?? []).map((r) => [r.id, { nome: r.nome_social ?? r.nome_completo, prontuario: r.numero_prontuario }]));
  }

  // Ordenar: abertas primeiro
  const statusOrder: Record<string, number> = { aberta: 0, em_avaliacao: 1, confirmada: 2, improcedente: 3 };
  ocorrencias.sort((a, b) => {
    if ((statusOrder[a.status] ?? 9) !== (statusOrder[b.status] ?? 9))
      return (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
    return new Date(b.data_ocorrencia).getTime() - new Date(a.data_ocorrencia).getTime();
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Ocorrências</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalAbertas} ocorrência{totalAbertas !== 1 ? "s" : ""} pendente{totalAbertas !== 1 ? "s" : ""} de avaliação
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
        <AutoSubmitSelect
          name="status"
          defaultValue={filtroStatus}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[150px]"
        >
          <option value="">Todos status</option>
          <option value="aberta">Abertas</option>
          <option value="em_avaliacao">Em avaliação</option>
          <option value="confirmada">Confirmadas</option>
          <option value="improcedente">Improcedentes</option>
        </AutoSubmitSelect>
        <AutoSubmitSelect
          name="gravidade"
          defaultValue={filtroGravidade}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[160px]"
        >
          <option value="">Todas gravidades</option>
          <option value="leve">Leve</option>
          <option value="moderada">Moderada</option>
          <option value="grave">Grave</option>
          <option value="gravissima">Gravíssima</option>
        </AutoSubmitSelect>
      </form>

      <p className="text-sm text-muted-foreground">{ocorrencias.length} ocorrência{ocorrencias.length !== 1 ? "s" : ""}</p>

      {ocorrencias.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <AlertTriangle className="size-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhuma ocorrência encontrada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ocorrencias.map((oc) => {
            const res = resMap.get(oc.residente_id);
            const gravCfg = GRAVIDADE_CONFIG[oc.gravidade as keyof typeof GRAVIDADE_CONFIG] ?? GRAVIDADE_CONFIG.moderada;
            const statusCfg = STATUS_CONFIG[oc.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.aberta;

            return (
              <Link
                key={oc.id}
                href={`/painel/ocorrencias/${oc.id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-4 hover:border-blue-200 hover:bg-blue-50/20 transition-colors"
              >
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

                {res && (
                  <p className="text-xs font-medium text-blue-700 mb-1.5">
                    {res.nome} · {res.prontuario}
                  </p>
                )}

                <p className="text-sm text-gray-800 line-clamp-2">{oc.descricao}</p>

                {oc.local && (
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                    <span>📍</span> {oc.local}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
