import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, FileText, Calendar, MapPin, User,
  Phone, CheckCircle2, Clock, XCircle, Folder,
  AlertTriangle, TrendingUp, Users, Edit
} from "lucide-react";
import {
  getMockResidente, getMockDocumentos, getMockMarcos,
  getMockContatosFamiliares, getMockHistoricoContatos,
  getMockOcorrencias, getMockPia, MOCK_FASES,
} from "@/lib/mock-data";
import { StatusBadge, FaseBadge } from "@/components/residentes/status-badge";
import { RegistrarMarcoForm } from "@/components/residentes/registrar-marco-form";
import { RegistrarContatoForm } from "@/components/residentes/registrar-contato-form";
import { MudarFaseBtn } from "@/components/residentes/mudar-fase-btn";
import { formatDate, formatDateTime, formatTempoNoPrograma, maskCPF } from "@/lib/utils/format";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const r = getMockResidente(id);
  return { title: r ? `${r.nome_social ?? r.nome_completo} — Prontuário` : "Acolhido" };
}

const TABS = [
  { id: "dados", label: "Dados", icon: User },
  { id: "documentos", label: "Documentos", icon: Folder },
  { id: "evolucao", label: "Evolução", icon: TrendingUp },
  { id: "familia", label: "Família", icon: Users },
  { id: "pia", label: "PIA", icon: FileText },
  { id: "ocorrencias", label: "Ocorrências", icon: AlertTriangle },
];

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

const DOC_STATUS_CONFIG = {
  nao_possui:         { label: "Não possui",         icon: XCircle,       className: "text-gray-400" },
  em_processo:        { label: "Em processo",        icon: Clock,         className: "text-amber-500" },
  obtido:             { label: "Obtido",             icon: CheckCircle2,  className: "text-green-600" },
  entregue_residente: { label: "Entregue",           icon: CheckCircle2,  className: "text-blue-600" },
};

const DOC_TIPO_LABELS: Record<string, string> = {
  rg: "RG", cpf: "CPF", certidao_nascimento: "Certidão de Nascimento",
  carteira_trabalho: "Carteira de Trabalho", titulo_eleitor: "Título de Eleitor",
  nis_cadastro_unico: "NIS / CadÚnico", cartao_sus: "Cartão SUS", foto_3x4: "Foto 3x4",
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

  const residente = getMockResidente(id);
  if (!residente) notFound();

  const documentos = getMockDocumentos(id);
  const marcos = getMockMarcos(id);
  const contatos = getMockContatosFamiliares(id);
  const historicoContatos = getMockHistoricoContatos(id);
  const ocorrencias = getMockOcorrencias(id);
  const pia = getMockPia(id);

  const nomeExibido = residente.nome_social ?? residente.nome_completo;

  return (
    <div className="space-y-0">
      {/* Breadcrumb + back */}
      <div className="mb-4">
        <Link href="/painel/residentes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          Acolhidos
        </Link>
      </div>

      {/* Header do prontuário */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Avatar placeholder */}
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <User className="size-8 text-blue-600" />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-start gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{nomeExibido}</h1>
              <StatusBadge status={residente.status} />
            </div>
            {residente.nome_social && (
              <p className="text-sm text-muted-foreground">{residente.nome_completo}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                {residente.numero_prontuario}
              </span>
              <FaseBadge fase={residente.fase_atual} />
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                Entrada: {formatDate(residente.data_entrada)}
              </span>
              <span>{formatTempoNoPrograma(residente.data_entrada)}</span>
            </div>
          </div>

          <Link
            href={`/painel/residentes/${id}/editar`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors min-h-[36px] self-start"
          >
            <Edit className="size-3.5" />
            Editar
          </Link>
        </div>
      </div>

      {/* Tabs — scroll horizontal mobile */}
      <div className="sticky top-14 z-10 bg-background -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-border mb-0">
        <div className="flex overflow-x-auto gap-0 scrollbar-none">
          {TABS.map((tab) => (
            <Link
              key={tab.id}
              href={`/painel/residentes/${id}?aba=${tab.id}`}
              className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                aba === tab.id
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Conteúdo da aba */}
      <div className="pt-5 space-y-4">

        {/* ── ABA: Dados ── */}
        {aba === "dados" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              Checklist de documentos do acolhido. Atualize conforme obtidos.
            </p>
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
              {documentos.map((doc) => {
                const cfg = DOC_STATUS_CONFIG[doc.status];
                const StatusIcon = cfg.icon;
                return (
                  <div key={doc.id} className="flex items-center gap-4 px-4 py-3.5">
                    <StatusIcon className={`size-5 flex-shrink-0 ${cfg.className}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {DOC_TIPO_LABELS[doc.tipo] ?? doc.tipo}
                      </p>
                      {doc.numero && (
                        <p className="text-xs text-muted-foreground">{doc.numero}</p>
                      )}
                      {doc.data_obtido && (
                        <p className="text-xs text-muted-foreground">
                          Obtido em {formatDate(doc.data_obtido)}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${doc.status === "obtido" ? "bg-green-100 text-green-700" : doc.status === "em_processo" ? "bg-amber-100 text-amber-700" : doc.status === "entregue_residente" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
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
                {MOCK_FASES.map((f) => (
                  <span key={f.numero} className={`text-[10px] ${f.numero <= residente.fase_atual ? "text-blue-700 font-medium" : "text-gray-400"}`}>
                    F{f.numero}
                  </span>
                ))}
              </div>
            </div>

            {/* Fase atual — objetivos */}
            {MOCK_FASES.find((f) => f.numero === residente.fase_atual) && (() => {
              const fase = MOCK_FASES.find((f) => f.numero === residente.fase_atual)!;
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
                <p className="text-sm text-muted-foreground bg-white rounded-2xl border p-4">
                  Nenhum marco registrado ainda.
                </p>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
                  <div className="space-y-4">
                    {[...marcos].reverse().map((marco) => {
                      const faseInfo = MOCK_FASES.find((f) => f.numero === marco.fase);
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
                <div className="bg-white rounded-2xl border border-gray-100 p-4 text-sm text-muted-foreground">
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
                {/* Status do PIA */}
                <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Status do PIA</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Início: {formatDate(pia.data_inicio)}
                      {pia.data_revisao ? ` · Revisão: ${formatDate(pia.data_revisao)}` : ""}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PIA_STATUS_CONFIG[pia.status]?.className ?? "bg-gray-100 text-gray-700"}`}>
                    {PIA_STATUS_CONFIG[pia.status]?.label ?? pia.status}
                  </span>
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
                  const section = pia[key as keyof typeof pia] as Record<string, unknown>;
                  return (
                    <div key={key} className="bg-white rounded-xl border border-gray-100 p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">{label}</h3>
                      <div className="space-y-2">
                        {Object.entries(section).map(([k, v]) => (
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
                        ))}
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
              <Link
                href={`/painel/ocorrencias/nova?residente=${id}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-3 py-2 text-xs font-medium text-white hover:bg-destructive/90 transition-colors"
              >
                <AlertTriangle className="size-3.5" />
                Nova ocorrência
              </Link>
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
                    <Link
                      key={oc.id}
                      href={`/painel/ocorrencias/${oc.id}`}
                      className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
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
                      </div>
                    </Link>
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
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="text-xs text-muted-foreground flex-shrink-0 min-w-[120px]">{label}</span>
      <span className={`text-sm text-gray-900 text-right ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}
