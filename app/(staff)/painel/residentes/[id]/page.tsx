import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, FileText, Calendar, MapPin, User,
  Phone, Folder, AlertTriangle, TrendingUp, Users, Edit,
  StickyNote, ExternalLink, AlertOctagon, CheckCircle2, Clock,
} from "lucide-react";
import {
  getMockResidente, getMockDocumentos, getMockMarcos,
  getMockContatosFamiliares, getMockHistoricoContatos,
  getMockOcorrencias, getMockPia, MOCK_FASES,
  getMockAdvertencias, getMockAnotacoes, getMockEncaminhamentos,
  MOCK_STAFF,
} from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import type { Residente } from "@/types/database";
import { StatusBadge, FaseBadge } from "@/components/residentes/status-badge";
import { RegistrarMarcoForm } from "@/components/residentes/registrar-marco-form";
import { RegistrarContatoForm } from "@/components/residentes/registrar-contato-form";
import { MudarFaseBtn } from "@/components/residentes/mudar-fase-btn";
import { DocumentoItemModal } from "@/components/residentes/documento-item-modal";
import { OcorrenciaDetalheModal } from "@/components/residentes/ocorrencia-detalhe-modal";
import { RegistrarAdvertenciaForm } from "@/components/residentes/registrar-advertencia-form";
import { RegistrarAnotacaoForm } from "@/components/residentes/registrar-anotacao-form";
import { RegistrarEncaminhamentoForm } from "@/components/residentes/registrar-encaminhamento-form";
import { SERVICO_LABELS } from "@/components/residentes/registrar-encaminhamento-form";
import { NovaOcorrenciaModal } from "@/components/ocorrencias/nova-ocorrencia-modal";
import { AlterarStatusPIA, RegistrarRevisaoPIA } from "@/components/residentes/pia-status-actions";
import { formatDate, formatDateTime, formatTempoNoPrograma, maskCPF } from "@/lib/utils/format";

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

async function getResidente(id: string): Promise<Residente | undefined> {
  if (DEV_MODE) return getMockResidente(id);
  const supabase = await createClient();
  const { data } = await supabase
    .from("residentes")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  return data ?? undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const r = await getResidente(id);
  return { title: r ? `${r.nome_social ?? r.nome_completo} — Prontuário` : "Acolhido" };
}

const TABS = [
  { id: "dados",            label: "Dados",           icon: User },
  { id: "documentos",       label: "Documentos",      icon: Folder },
  { id: "evolucao",         label: "Evolução",        icon: TrendingUp },
  { id: "familia",          label: "Família",         icon: Users },
  { id: "pia",              label: "PIA",             icon: FileText },
  { id: "ocorrencias",      label: "Ocorrências",     icon: AlertTriangle },
  { id: "advertencias",     label: "Advertências",    icon: AlertOctagon },
  { id: "anotacoes",        label: "Anotações",       icon: StickyNote },
  { id: "encaminhamentos",  label: "Encaminhamentos", icon: ExternalLink },
];

const ADVERTENCIA_TIPO_CONFIG = {
  verbal:    { label: "Verbal",    className: "bg-yellow-100 text-yellow-800 border border-yellow-200" },
  escrita:   { label: "Escrita",   className: "bg-orange-100 text-orange-800 border border-orange-200" },
  suspensao: { label: "Suspensão", className: "bg-red-100 text-red-900 border border-red-200 font-bold" },
};

const ENCAMINHAMENTO_STATUS_CONFIG = {
  pendente:     { label: "Pendente",     dot: "bg-amber-500",  badge: "bg-amber-100 text-amber-800" },
  realizado:    { label: "Realizado",    dot: "bg-green-500",  badge: "bg-green-100 text-green-800" },
  sem_retorno:  { label: "Sem retorno",  dot: "bg-gray-400",   badge: "bg-gray-100 text-gray-700" },
  cancelado:    { label: "Cancelado",    dot: "bg-red-400",    badge: "bg-red-100 text-red-700" },
};

const GRAVIDADE_CONFIG = {
  leve:       { label: "Leve",       className: "bg-yellow-100 text-yellow-800" },
  moderada:   { label: "Moderada",   className: "bg-orange-100 text-orange-800" },
  grave:      { label: "Grave",      className: "bg-red-100 text-red-800" },
  gravissima: { label: "Gravíssima", className: "bg-red-200 text-red-900 font-bold" },
};

const STATUS_OC_CONFIG = {
  aberta:       { label: "Aberta",       className: "bg-blue-100 text-blue-800" },
  em_avaliacao: { label: "Em avaliação", className: "bg-amber-100 text-amber-800" },
  confirmada:   { label: "Confirmada",   className: "bg-gray-100 text-gray-700" },
  improcedente: { label: "Improcedente", className: "bg-green-100 text-green-800" },
};


const PIA_STATUS_CONFIG = {
  rascunho:       { label: "Rascunho",         className: "bg-gray-100 text-gray-700" },
  em_elaboracao:  { label: "Em elaboração",    className: "bg-amber-100 text-amber-800" },
  concluido:      { label: "Concluído",        className: "bg-green-100 text-green-800" },
  revisao:        { label: "Em revisão",       className: "bg-blue-100 text-blue-800" },
  desatualizado:  { label: "Desatualizado",    className: "bg-red-100 text-red-800" },
};

export default async function ResidenteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aba?: string }>;
}) {
  const { id } = await params;
  const { aba = "dados" } = await searchParams;

  const residente = await getResidente(id);
  if (!residente) notFound();

  let documentos: ReturnType<typeof getMockDocumentos>;
  let marcos: ReturnType<typeof getMockMarcos>;
  let contatos: ReturnType<typeof getMockContatosFamiliares>;
  let historicoContatos: ReturnType<typeof getMockHistoricoContatos>;
  let ocorrencias: ReturnType<typeof getMockOcorrencias>;
  let pia: ReturnType<typeof getMockPia>;
  let advertencias: ReturnType<typeof getMockAdvertencias>;
  let anotacoes: ReturnType<typeof getMockAnotacoes>;
  let encaminhamentos: ReturnType<typeof getMockEncaminhamentos>;
  let piaRegistros: { id: string; tecnico_id: string; descricao: string; data_registro: string; created_at: string }[];

  type FaseInfo = { numero: number; nome: string; descricao: string | null; objetivos: string[] };
  type StaffInfo = { full_name: string; cargo: string | null };

  let fases: FaseInfo[];
  let staffLookup: (uid: string) => StaffInfo | undefined;

  if (DEV_MODE) {
    documentos = getMockDocumentos(id);
    marcos = getMockMarcos(id);
    contatos = getMockContatosFamiliares(id);
    historicoContatos = getMockHistoricoContatos(id);
    ocorrencias = getMockOcorrencias(id);
    pia = getMockPia(id);
    advertencias = getMockAdvertencias(id);
    anotacoes = getMockAnotacoes(id);
    encaminhamentos = getMockEncaminhamentos(id);
    piaRegistros = [];
    fases = MOCK_FASES;
    staffLookup = (uid) => MOCK_STAFF.find((s) => s.id === uid) ?? undefined;
  } else {
    const supabase = await createClient();
    const [
      { data: docsData },
      { data: marcosData },
      { data: contatosData },
      { data: historicoData },
      { data: ocorrenciasData },
      { data: piaData },
      { data: advertenciasData },
      { data: anotacoesData },
      { data: encaminhamentosData },
      { data: fasesData },
      { data: staffData },
      { data: piaRegistrosData },
    ] = await Promise.all([
      supabase.from("documentos_residente").select("*").eq("residente_id", id).order("tipo"),
      supabase.from("marcos_evolucao").select("*").eq("residente_id", id).order("data_marco", { ascending: true }),
      supabase.from("contatos_familiares").select("*").eq("residente_id", id).order("nome"),
      supabase.from("historico_contatos_familia").select("*").eq("residente_id", id).order("data_contato", { ascending: false }),
      supabase.from("ocorrencias").select("*").eq("residente_id", id).order("data_ocorrencia", { ascending: false }),
      supabase.from("pia").select("*").eq("residente_id", id).maybeSingle(),
      supabase.from("advertencias").select("*").eq("residente_id", id).order("created_at", { ascending: false }),
      supabase.from("anotacoes_tecnicas").select("*").eq("residente_id", id).order("created_at", { ascending: false }),
      supabase.from("encaminhamentos").select("*").eq("residente_id", id).order("data_encaminhamento", { ascending: false }),
      supabase.from("fases_evolucao").select("numero, nome, descricao, objetivos").order("numero"),
      supabase.from("staff_profiles").select("user_id, full_name, cargo"),
      supabase.from("pia_registros").select("*").order("data_registro", { ascending: false }),
    ]);
    documentos = docsData ?? [];
    marcos = marcosData ?? [];
    contatos = contatosData ?? [];
    historicoContatos = historicoData ?? [];
    ocorrencias = ocorrenciasData ?? [];
    pia = piaData ?? undefined;
    advertencias = advertenciasData ?? [];
    anotacoes = anotacoesData ?? [];
    encaminhamentos = encaminhamentosData ?? [];
    // pia_registros precisa filtrar pelo pia do residente
    const piaId = piaData?.id;
    piaRegistros = piaId
      ? (piaRegistrosData ?? []).filter((r) => r.pia_id === piaId)
      : [];
    fases = (fasesData ?? []) as FaseInfo[];
    const staffMap = new Map((staffData ?? []).map((s) => [s.user_id, { full_name: s.full_name, cargo: s.cargo }]));
    staffLookup = (uid) => staffMap.get(uid);
  }

  const nomeExibido = residente.nome_social ?? residente.nome_completo;

  return (
    <div className="min-w-0 space-y-0">
      {/* Breadcrumb + back */}
      <div className="mb-4">
        <Link href="/painel/residentes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          Acolhidos
        </Link>
      </div>

      {/* Header do prontuário */}
      <div className="mb-4 min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
        <div className="flex min-w-0 items-start gap-3">
          {/* Avatar placeholder */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <User className="size-6 sm:size-8 text-blue-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex min-w-0 items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h1 className="min-w-0 break-words text-base font-bold leading-tight text-gray-900 sm:text-xl">{nomeExibido}</h1>
                  <StatusBadge status={residente.status} />
                </div>
                {residente.nome_social && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{residente.nome_completo}</p>
                )}
              </div>
              <Link
                href={`/painel/residentes/${id}/editar`}
                className="inline-flex items-center gap-1 rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors flex-shrink-0"
              >
                <Edit className="size-3.5" />
                <span className="hidden sm:inline">Editar</span>
              </Link>
            </div>

            <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-gray-600">
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded shrink-0">
                {residente.numero_prontuario}
              </span>
              <FaseBadge fase={residente.fase_atual} />
              <span className="flex min-w-0 items-center gap-1 text-muted-foreground">
                <Calendar className="size-3" />
                {formatDate(residente.data_entrada)}
                <span className="text-gray-300 mx-0.5">·</span>
                {formatTempoNoPrograma(residente.data_entrada)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs — scroll horizontal mobile */}
      <div className="sticky top-14 z-10 mb-0 w-full max-w-full overflow-hidden border-b border-border bg-background">
        <div className="grid grid-cols-3 gap-1 py-2 sm:flex sm:gap-0 sm:overflow-x-auto sm:py-0">
          {TABS.map((tab) => (
            <Link
              key={tab.id}
              href={`/painel/residentes/${id}?aba=${tab.id}`}
              title={tab.label}
              className={`flex min-w-0 items-center justify-center gap-1 rounded-lg border px-2 py-2 text-center transition-colors sm:shrink-0 sm:justify-start sm:whitespace-nowrap sm:rounded-none sm:border-x-0 sm:border-t-0 sm:border-b-2 sm:px-3 sm:py-3 ${
                aba === tab.id
                  ? "border-blue-100 bg-blue-50 text-blue-700 sm:border-blue-600 sm:bg-transparent"
                  : "border-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground sm:hover:bg-transparent"
              }`}
            >
              <tab.icon className="size-3.5 sm:size-4 flex-shrink-0" />
              <span className="min-w-0 truncate text-[10px] font-medium sm:text-sm">{tab.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Conteúdo da aba */}
      <div className="pt-5 space-y-4">

        {/* ── ABA: Dados ── */}
        {aba === "dados" && (
          <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
            <Section title="Identificação">
              <InfoRow label="Nome completo" value={residente.nome_completo} />
              {residente.nome_social && <InfoRow label="Nome social" value={residente.nome_social} />}
              <InfoRow label="CPF" value={residente.cpf ? maskCPF(residente.cpf) : "—"} />
              <InfoRow label="RG" value={residente.rg ? `${residente.rg} ${residente.rg_orgao_emissor ?? ""} ${residente.rg_uf ?? ""}`.trim() : "—"} />
              <InfoRow label="NIS" value={residente.nis ?? "—"} />
              <InfoRow label="Data de nascimento" value={residente.data_nascimento ? formatDate(residente.data_nascimento) : "—"} />
              <InfoRow label="Naturalidade" value={residente.naturalidade ?? "—"} />
              <InfoRow label="Nacionalidade" value={residente.nacionalidade} />
            </Section>

            <Section title="Situação no abrigo">
              <InfoRow label="Prontuário" value={residente.numero_prontuario} mono />
              <InfoRow label="Fase atual" value={<FaseBadge fase={residente.fase_atual} />} />
              <InfoRow label="Status" value={<StatusBadge status={residente.status} />} />
              <InfoRow label="Data de entrada" value={formatDate(residente.data_entrada)} />
              <InfoRow label="Tempo no programa" value={formatTempoNoPrograma(residente.data_entrada)} />
              {residente.data_saida && <InfoRow label="Data de saída" value={formatDate(residente.data_saida)} />}
              {residente.motivo_saida && <InfoRow label="Motivo da saída" value={residente.motivo_saida} />}
              {residente.observacoes_saida && (
                <div className="col-span-2 mt-1">
                  <p className="text-xs text-muted-foreground">Observações da saída</p>
                  <p className="text-sm text-gray-800 mt-0.5">{residente.observacoes_saida}</p>
                </div>
              )}
            </Section>

            <Section title="Situação de rua">
              <InfoRow label="Último endereço" value={residente.ultimo_endereco ?? "Não informado"} />
              <InfoRow label="Tempo em situação de rua" value={residente.tempo_situacao_rua ?? "—"} />
            </Section>

            <Section title="LGPD — Consentimento">
              <InfoRow label="Data do consentimento" value={residente.lgpd_consent_at ? formatDateTime(residente.lgpd_consent_at) : "—"} />
              <InfoRow label="Método" value={residente.lgpd_consent_method ?? "—"} />
              <InfoRow label="Coletado por" value={residente.lgpd_consent_by ?? "—"} />
            </Section>
          </div>
        )}

        {/* ── ABA: Documentos ── */}
        {aba === "documentos" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Clique em um documento para ver os detalhes.
            </p>
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
              {documentos.map((doc) => (
                <DocumentoItemModal key={doc.id} doc={doc} />
              ))}
            </div>
          </div>
        )}

        {/* ── ABA: Evolução ── */}
        {aba === "evolucao" && (
          <div className="space-y-6">
            {/* Progresso de fases */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Progresso no programa</h3>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((f) => (
                  <div key={f} className={`flex-1 h-2 rounded-full ${f <= residente.fase_atual ? "bg-blue-600" : "bg-gray-200"}`} />
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                {fases.map((f) => (
                  <span key={f.numero} className={`text-[10px] ${f.numero <= residente.fase_atual ? "text-blue-700 font-medium" : "text-gray-400"}`}>
                    F{f.numero}
                  </span>
                ))}
              </div>
            </div>

            {/* Fase atual — objetivos */}
            {fases.find((f) => f.numero === residente.fase_atual) && (() => {
              const fase = fases.find((f) => f.numero === residente.fase_atual)!;
              return (
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Objetivos da fase atual — {fase.nome}
                  </h3>
                  <ul className="space-y-1.5">
                    {fase.objetivos.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">
                          {i + 1}
                        </span>
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}

            {/* Ações de técnico — registrar marco e mudar fase */}
            <div className="flex flex-wrap gap-2">
              <RegistrarMarcoForm residenteId={id} faseAtual={residente.fase_atual} />
              <MudarFaseBtn residenteId={id} faseAtual={residente.fase_atual} />
            </div>

            {/* Timeline de marcos */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Histórico de marcos ({marcos.length})
              </h3>
              {marcos.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-muted-foreground">
                  <TrendingUp className="size-10 mx-auto mb-2 opacity-20" />
                  Nenhum marco registrado ainda.
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
                  <div className="space-y-4">
                    {[...marcos].reverse().map((marco) => {
                      const faseInfo = fases.find((f) => f.numero === marco.fase);
                      return (
                        <div key={marco.id} className="flex gap-4">
                          <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center">
                            <span className="text-[10px] font-bold text-blue-700">F{marco.fase}</span>
                          </div>
                          <div className="flex-1 bg-white rounded-xl border border-gray-100 p-3 -mt-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm text-gray-800">{marco.descricao}</p>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="size-3" />
                                {formatDate(marco.data_marco)}
                              </span>
                              {faseInfo && (
                                <FaseBadge fase={marco.fase} compact />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ABA: Família ── */}
        {aba === "familia" && (
          <div className="space-y-5">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Contatos familiares ({contatos.length})</h3>
              {contatos.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-muted-foreground">
                  <Users className="size-10 mx-auto mb-2 opacity-20" />
                  Nenhum contato familiar cadastrado.
                </div>
              ) : (
                <div className="space-y-2">
                  {contatos.map((c) => (
                    <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4">
                      <div className="flex items-start gap-3">
                        <Users className="size-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-gray-900">{c.nome}</p>
                            {c.parentesco && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {c.parentesco}
                              </span>
                            )}
                          </div>
                          {c.telefone && (
                            <p className="text-sm text-gray-600 mt-0.5 flex items-center gap-1">
                              <Phone className="size-3.5" />
                              {c.telefone}
                            </p>
                          )}
                          {c.endereco && (
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                              <MapPin className="size-3.5" />
                              {c.endereco}
                            </p>
                          )}
                          {c.observacoes && (
                            <p className="text-sm text-muted-foreground mt-1.5 italic">{c.observacoes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Registrar novo contato */}
            <RegistrarContatoForm residenteId={id} />

            {/* Histórico de contatos */}
            {historicoContatos.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Histórico de contatos ({historicoContatos.length})
                </h3>
                <div className="space-y-2">
                  {historicoContatos.map((h) => (
                    <div key={h.id} className="bg-white rounded-xl border border-gray-100 p-4">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          {h.tipo_contato}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatDate(h.data_contato)}</span>
                      </div>
                      <p className="text-sm text-gray-800">{h.descricao}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ABA: PIA ── */}
        {aba === "pia" && (
          <div className="space-y-4">
            {!pia ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center space-y-3">
                <FileText className="size-10 text-muted-foreground mx-auto opacity-40" />
                <p className="font-medium text-gray-900">PIA não elaborado</p>
                <p className="text-sm text-muted-foreground">
                  O Plano Individual de Atendimento ainda não foi iniciado para este acolhido.
                </p>
                <Link
                  href={`/painel/residentes/${id}/pia`}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors"
                >
                  Iniciar PIA
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header do PIA — status + técnico + ações */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">Plano Individual de Atendimento</p>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${PIA_STATUS_CONFIG[pia.status]?.className ?? "bg-gray-100 text-gray-700"}`}>
                          {PIA_STATUS_CONFIG[pia.status]?.label ?? pia.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-xs text-muted-foreground">
                        <span>Início: {formatDate(pia.data_inicio)}</span>
                        {pia.data_revisao && <span>Última revisão: {formatDate(pia.data_revisao)}</span>}
                        {pia.tecnico_id && staffLookup(pia.tecnico_id) && (
                          <span>Técnico: <strong className="text-gray-700">{staffLookup(pia.tecnico_id)!.full_name}</strong></span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/painel/residentes/${id}/pia`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 transition-colors"
                    >
                      <Edit className="size-3" />
                      Editar PIA
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                    <AlterarStatusPIA residenteId={id} statusAtual={pia.status} />
                    <RegistrarRevisaoPIA residenteId={id} />
                  </div>
                </div>

                {/* Seções do PIA */}
                {[
                  { key: "secao_identificacao", label: "Identificação" },
                  { key: "secao_historico_vida", label: "Histórico de vida" },
                  { key: "secao_saude", label: "Saúde" },
                  { key: "secao_objetivos", label: "Objetivos" },
                  { key: "secao_plano_acao", label: "Plano de ação" },
                  { key: "secao_rede_apoio", label: "Rede de apoio" },
                ].map(({ key, label }) => {
                  const section = pia[key as keyof typeof pia] as Record<string, unknown> | null;
                  if (!section || Object.keys(section).length === 0) return null;
                  return (
                    <div key={key} className="bg-white rounded-xl border border-gray-100 p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">{label}</h3>
                      <div className="space-y-2">
                        {Object.entries(section).map(([k, v]) => {
                          if (!v || (typeof v === "string" && !v.trim()) || (Array.isArray(v) && v.length === 0)) return null;
                          return (
                            <div key={k}>
                              <p className="text-xs text-muted-foreground capitalize">
                                {k.replace(/_/g, " ")}
                              </p>
                              {Array.isArray(v) ? (
                                <ul className="mt-0.5 space-y-0.5">
                                  {v.map((item: unknown, i) => (
                                    <li key={i} className="text-sm text-gray-800 flex items-start gap-1.5">
                                      <span className="text-blue-600 mt-0.5">•</span>
                                      {String(item)}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-800 mt-0.5">{String(v)}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {pia.observacoes_gerais && (
                  <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
                    <p className="text-xs font-medium text-blue-700 mb-1">Observações gerais</p>
                    <p className="text-sm text-blue-900">{pia.observacoes_gerais}</p>
                  </div>
                )}

                {/* Histórico de revisões */}
                {piaRegistros.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Histórico de revisões ({piaRegistros.length})
                    </h3>
                    {piaRegistros.map((reg) => {
                      const tecnico = staffLookup(reg.tecnico_id);
                      return (
                        <div key={reg.id} className="bg-white rounded-xl border border-gray-100 p-4">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-medium text-blue-700">
                              {tecnico?.full_name ?? "Equipe técnica"}
                              {tecnico?.cargo ? ` — ${tecnico.cargo}` : ""}
                            </span>
                            <span className="text-xs text-muted-foreground">{formatDate(reg.data_registro)}</span>
                          </div>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{reg.descricao}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── ABA: Ocorrências ── */}
        {aba === "ocorrencias" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Ocorrências ({ocorrencias.length})
              </h3>
              <NovaOcorrenciaModal residenteId={id} residenteNome={nomeExibido} />
            </div>

            {ocorrencias.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-muted-foreground">
                Nenhuma ocorrência registrada para este acolhido.
              </div>
            ) : (
              <div className="space-y-2">
                {ocorrencias.map((oc) => {
                  const gravCfg = GRAVIDADE_CONFIG[oc.gravidade];
                  const statusCfg = STATUS_OC_CONFIG[oc.status];
                  return (
                    <OcorrenciaDetalheModal key={oc.id} oc={oc}>
                      <div className="bg-white rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:bg-blue-50/20 transition-colors">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="font-mono text-xs text-gray-500">{oc.numero}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${gravCfg.className}`}>
                            {gravCfg.label}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusCfg.className}`}>
                            {statusCfg.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 line-clamp-2">{oc.descricao}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(oc.data_ocorrencia)} · {oc.local ?? "Local não informado"}
                        </p>
                      </div>
                    </OcorrenciaDetalheModal>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ABA: Advertências ── */}
        {aba === "advertencias" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Advertências ({advertencias.length})
              </h3>
              <RegistrarAdvertenciaForm residenteId={id} />
            </div>

            {advertencias.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-muted-foreground">
                <AlertOctagon className="size-10 mx-auto mb-2 opacity-20" />
                Nenhuma advertência registrada para este acolhido.
              </div>
            ) : (
              <div className="space-y-2">
                {advertencias.map((adv) => {
                  const cfg = ADVERTENCIA_TIPO_CONFIG[adv.tipo];
                  const aplicadoPor = staffLookup(adv.aplicado_por);
                  return (
                    <div key={adv.id} className="bg-white rounded-xl border border-gray-100 p-4">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${cfg.className}`}>
                          {cfg.label}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{adv.motivo}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{formatDate(adv.data_aplicacao)}</span>
                      </div>
                      {adv.descricao && (
                        <p className="text-sm text-gray-700 mb-2">{adv.descricao}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Aplicada por: {aplicadoPor?.full_name ?? adv.aplicado_por}</span>
                        {adv.reconhecido_em ? (
                          <span className="flex items-center gap-1 text-green-700">
                            <CheckCircle2 className="size-3" />
                            Reconhecida pelo acolhido
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-700">
                            <Clock className="size-3" />
                            Aguardando reconhecimento
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ABA: Anotações Técnicas ── */}
        {aba === "anotacoes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Anotações Técnicas ({anotacoes.length})
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Visível apenas para a equipe técnica — não aparece no portal do acolhido.
                </p>
              </div>
              <RegistrarAnotacaoForm residenteId={id} />
            </div>

            {anotacoes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-muted-foreground">
                <StickyNote className="size-10 mx-auto mb-2 opacity-20" />
                Nenhuma anotação técnica registrada.
              </div>
            ) : (
              <div className="space-y-3">
                {[...anotacoes].reverse().map((anot) => {
                  const autor = staffLookup(anot.autor_id);
                  return (
                    <div key={anot.id} className="bg-white rounded-xl border border-gray-100 p-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-medium text-blue-700">
                          {autor?.full_name ?? "Equipe técnica"}
                          {autor?.cargo ? ` — ${autor.cargo}` : ""}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(anot.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{anot.conteudo}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ABA: Encaminhamentos ── */}
        {aba === "encaminhamentos" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Encaminhamentos ({encaminhamentos.length})
              </h3>
              <RegistrarEncaminhamentoForm residenteId={id} />
            </div>

            {encaminhamentos.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-muted-foreground">
                <ExternalLink className="size-10 mx-auto mb-2 opacity-20" />
                Nenhum encaminhamento registrado para este acolhido.
              </div>
            ) : (
              <div className="space-y-2">
                {encaminhamentos.map((enc) => {
                  const statusCfg = ENCAMINHAMENTO_STATUS_CONFIG[enc.status];
                  const responsavel = staffLookup(enc.responsavel_id);
                  return (
                    <div key={enc.id} className="bg-white rounded-xl border border-gray-100 p-4">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusCfg.badge}`}>
                          {statusCfg.label}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {SERVICO_LABELS[enc.servico] ?? enc.servico}
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground">{formatDate(enc.data_encaminhamento)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{enc.descricao}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span>Responsável: {responsavel?.full_name ?? enc.responsavel_id}</span>
                        {enc.retorno_previsto && (
                          <span>Retorno previsto: {formatDate(enc.retorno_previsto)}</span>
                        )}
                      </div>
                      {enc.observacoes_retorno && (
                        <div className="mt-2 bg-gray-50 rounded-lg p-2.5">
                          <p className="text-xs font-medium text-gray-600 mb-0.5">Observações do retorno</p>
                          <p className="text-sm text-gray-700">{enc.observacoes_retorno}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
      <div className="divide-y divide-gray-50">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="py-1.5 sm:flex sm:items-start sm:justify-between sm:gap-4">
      <span className="block text-[11px] text-muted-foreground sm:flex-shrink-0 sm:min-w-[120px]">{label}</span>
      <span className={`block text-sm text-gray-900 mt-0.5 sm:mt-0 sm:text-right break-words min-w-0 ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}
