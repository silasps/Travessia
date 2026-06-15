import type { Metadata } from "next";
import Link from "next/link";
import {
  Users, FileText, Shield, Plus, CheckCircle2, XCircle,
  Eye, Download, Trash2, Settings, UserCog,
} from "lucide-react";
import { MOCK_STAFF, MOCK_CONFIGURACOES } from "@/lib/mock-data";
import { DevAlertButton } from "@/components/shared/dev-alert-button";
import type { StaffRole, DocumentoPublico, AuditLog, LgpdConsentimento } from "@/types/database";
import { formatDate, formatDateTime } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Configurações" };

// ─── Mock data local (transparência e LGPD) ──────────────────────────────────

const MOCK_DOCS_PUBLICOS: DocumentoPublico[] = [
  { id: "dp01", titulo: "Estatuto Social do Projeto Travessia", descricao: null, categoria: "estatuto", arquivo_url: "#", competencia: null, publicado: true, publicado_em: "2024-01-10", tamanho_kb: 420, criado_por: "s2", created_at: "2024-01-10T10:00:00Z", updated_at: "2024-01-10T10:00:00Z" },
  { id: "dp02", titulo: "Contrato de Parceria — Prefeitura de Ribeirão Preto 2024", descricao: null, categoria: "contrato_parceria", arquivo_url: "#", competencia: "2024", publicado: true, publicado_em: "2024-02-01", tamanho_kb: 1240, criado_por: "s2", created_at: "2024-02-01T10:00:00Z", updated_at: "2024-02-01T10:00:00Z" },
  { id: "dp03", titulo: "Relatório de Atividades 2025", descricao: "Síntese das atividades realizadas em 2025", categoria: "relatorio_atividades", arquivo_url: "#", competencia: "2025", publicado: true, publicado_em: "2026-03-15", tamanho_kb: 2100, criado_por: "s1", created_at: "2026-03-15T10:00:00Z", updated_at: "2026-03-15T10:00:00Z" },
  { id: "dp04", titulo: "Prestação de Contas — 4º Trimestre 2025", descricao: null, categoria: "prestacao_contas", arquivo_url: "#", competencia: "Out-Dez/2025", publicado: true, publicado_em: "2026-01-20", tamanho_kb: 980, criado_por: "s2", created_at: "2026-01-20T10:00:00Z", updated_at: "2026-01-20T10:00:00Z" },
  { id: "dp05", titulo: "Balancete de Janeiro/2026", descricao: null, categoria: "balancete", arquivo_url: "#", competencia: "Jan/2026", publicado: false, publicado_em: null, tamanho_kb: 340, criado_por: "s2", created_at: "2026-02-05T10:00:00Z", updated_at: "2026-02-05T10:00:00Z" },
  { id: "dp06", titulo: "Plano de Trabalho 2026", descricao: null, categoria: "plano_trabalho", arquivo_url: "#", competencia: "2026", publicado: true, publicado_em: "2026-01-05", tamanho_kb: 760, criado_por: "s1", created_at: "2026-01-05T10:00:00Z", updated_at: "2026-01-05T10:00:00Z" },
];

const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: "al01", user_id: "u1", user_role: "tecnico", action: "view_prontuario", entity: "residentes", entity_id: "r01", entity_name: "José Carlos Ferreira", details: null, ip_address: "192.168.1.10", user_agent: null, created_at: "2026-06-14T09:30:00Z" },
  { id: "al02", user_id: "u3", user_role: "tecnico", action: "export_pdf_prontuario", entity: "residentes", entity_id: "r02", entity_name: "Antônio Marcos Costa", details: null, ip_address: "192.168.1.12", user_agent: null, created_at: "2026-06-14T08:15:00Z" },
  { id: "al03", user_id: "u2", user_role: "coordenacao", action: "update_pia", entity: "pia", entity_id: "pia01", entity_name: "PIA de José Carlos Ferreira", details: null, ip_address: "192.168.1.5", user_agent: null, created_at: "2026-06-13T16:00:00Z" },
  { id: "al04", user_id: "u1", user_role: "tecnico", action: "view_prontuario", entity: "residentes", entity_id: "r04", entity_name: "Francisco Alves Neto", details: null, ip_address: "192.168.1.10", user_agent: null, created_at: "2026-06-13T14:20:00Z" },
  { id: "al05", user_id: "u4", user_role: "cuidador", action: "create_ocorrencia", entity: "ocorrencias", entity_id: "oc01", entity_name: "OC-2026-001", details: null, ip_address: "192.168.1.20", user_agent: null, created_at: "2026-06-12T21:30:00Z" },
  { id: "al06", user_id: "u2", user_role: "coordenacao", action: "update_role", entity: "staff_profiles", entity_id: "s4", entity_name: "Carlos Eduardo Lima", details: { de: "cuidador", para: "tecnico" }, ip_address: "192.168.1.5", user_agent: null, created_at: "2026-06-10T11:00:00Z" },
];

const MOCK_CONSENTIMENTOS: LgpdConsentimento[] = [
  { id: "lc01", sujeito_tipo: "residente", sujeito_id: "r01", finalidade: "Acolhimento institucional e acompanhamento social", aceito: true, metodo: "verbal_registrado", coletado_por: "s1", ip: null, revogado_em: null, created_at: "2024-01-15T09:30:00Z" },
  { id: "lc02", sujeito_tipo: "residente", sujeito_id: "r02", finalidade: "Acolhimento institucional e acompanhamento social", aceito: true, metodo: "verbal_registrado", coletado_por: "s1", ip: null, revogado_em: null, created_at: "2024-02-01T10:30:00Z" },
  { id: "lc03", sujeito_tipo: "residente", sujeito_id: "r04", finalidade: "Acolhimento institucional e acompanhamento social", aceito: true, metodo: "escrito", coletado_por: "s1", ip: null, revogado_em: null, created_at: "2024-01-20T09:30:00Z" },
  { id: "lc04", sujeito_tipo: "staff", sujeito_id: "s1", finalidade: "Uso de dados funcionais para gestão do sistema", aceito: true, metodo: "digital", coletado_por: null, ip: "192.168.0.1", revogado_em: null, created_at: "2024-01-01T08:00:00Z" },
  { id: "lc05", sujeito_tipo: "staff", sujeito_id: "s2", finalidade: "Uso de dados funcionais para gestão do sistema", aceito: true, metodo: "digital", coletado_por: null, ip: "192.168.0.2", revogado_em: null, created_at: "2024-01-01T08:05:00Z" },
];

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<StaffRole, { label: string; className: string; nivel: number }> = {
  super_admin:  { label: "Super Admin",   className: "bg-red-100 text-red-800",    nivel: 100 },
  coordenacao:  { label: "Coordenação",   className: "bg-purple-100 text-purple-800", nivel: 70 },
  tecnico:      { label: "Técnico",       className: "bg-blue-100 text-blue-800",  nivel: 50 },
  cuidador:     { label: "Cuidador",      className: "bg-green-100 text-green-800", nivel: 20 },
};

const ACTION_LABELS: Record<string, string> = {
  view_prontuario: "Visualizou prontuário",
  export_pdf_prontuario: "Exportou PDF do prontuário",
  update_pia: "Atualizou PIA",
  create_ocorrencia: "Registrou ocorrência",
  update_role: "Alterou papel de funcionário",
  create_residente: "Cadastrou acolhido",
  delete_residente: "Encerrou vínculo (desligamento)",
};

const CATEGORIA_LABELS: Record<string, string> = {
  ata: "Ata",
  relatorio_atividades: "Relatório de Atividades",
  prestacao_contas: "Prestação de Contas",
  balancete: "Balancete",
  estatuto: "Estatuto",
  regimento: "Regimento",
  plano_trabalho: "Plano de Trabalho",
  contrato_parceria: "Contrato/Parceria",
  outros: "Outros",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>;
}) {
  const params = await searchParams;
  const aba = params.aba ?? "usuarios";

  const dpo = MOCK_CONFIGURACOES.find((c) => c.chave === "dpo_email")?.valor ?? "dpo@projetotravessia.org.br";
  const nomeSistema = MOCK_CONFIGURACOES.find((c) => c.chave === "nome_organizacao")?.valor ?? "Projeto Travessia";

  // Mock: para esta demonstração, super_admin é o usuário atual
  const papelAtual: StaffRole = "super_admin";
  const nivelAtual = ROLE_CONFIG[papelAtual].nivel;

  const tabs: { key: string; label: string; icon: React.ReactNode }[] = [
    { key: "usuarios",            label: "Usuários",            icon: <Users className="size-4" /> },
    { key: "documentos_publicos", label: "Portal Transparência", icon: <FileText className="size-4" /> },
    { key: "lgpd",                label: "LGPD / Audit",        icon: <Shield className="size-4" /> },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="size-6 text-gray-400" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{nomeSistema}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/painel/configuracoes?aba=${t.key}`}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
              aba === t.key
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-muted-foreground hover:text-gray-900"
            }`}
          >
            {t.icon}
            {t.label}
          </Link>
        ))}
      </div>

      {/* ── ABA USUÁRIOS ── */}
      {aba === "usuarios" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{MOCK_STAFF.length} funcionários cadastrados</p>
            <DevAlertButton
              message="Convidar funcionário: disponível após conexão com banco."
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 transition-colors min-h-[44px]"
            >
              <Plus className="size-4" />
              Convidar funcionário
            </DevAlertButton>
          </div>

          <div className="space-y-2">
            {MOCK_STAFF.map((s) => {
              // Mock: associar papel ao staff
              const papelMock: StaffRole =
                s.id === "s2" ? "coordenacao" :
                s.id === "s3" ? "tecnico" :
                s.id === "s4" ? "cuidador" :
                "super_admin";
              const roleCfg = ROLE_CONFIG[papelMock];
              const podeMudar = nivelAtual > roleCfg.nivel || s.id === "s1"; // s1 = super_admin

              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-gray-600">
                        {s.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{s.full_name}</p>
                      <p className="text-xs text-muted-foreground">{s.cargo ?? "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleCfg.className}`}>
                      {roleCfg.label}
                    </span>
                    {podeMudar && (
                      <DevAlertButton
                        message={`Alterar papel de ${s.full_name}: disponível após conexão com banco.`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-gray-900 hover:border-gray-300 transition-colors min-h-[36px]"
                      >
                        <UserCog className="size-3.5" />
                        Alterar papel
                      </DevAlertButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-3 text-sm">Níveis de acesso</h2>
            <div className="space-y-2">
              {(Object.entries(ROLE_CONFIG) as [StaffRole, typeof ROLE_CONFIG[StaffRole]][])
                .sort((a, b) => b[1].nivel - a[1].nivel)
                .map(([role, cfg]) => (
                  <div key={role} className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.className} shrink-0`}>
                      {cfg.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {role === "super_admin" && "Acesso total ao sistema"}
                      {role === "coordenacao" && "Avalia ocorrências, gerencia usuários, emite relatórios"}
                      {role === "tecnico" && "Gerencia prontuários, PIA, evolução e família"}
                      {role === "cuidador" && "Registra ocorrências, vê dados básicos dos acolhidos"}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ABA DOCUMENTOS PÚBLICOS ── */}
      {aba === "documentos_publicos" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {MOCK_DOCS_PUBLICOS.filter((d) => d.publicado).length} publicados ·{" "}
                {MOCK_DOCS_PUBLICOS.filter((d) => !d.publicado).length} não publicados
              </p>
            </div>
            <Link
              href="/transparencia"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-gray-900 transition-colors min-h-[44px]"
            >
              <Eye className="size-4" />
              Ver portal público
            </Link>
            <DevAlertButton
              message="Upload de documento: disponível após conexão com banco + Storage."
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 transition-colors min-h-[44px]"
            >
              <Plus className="size-4" />
              Novo documento
            </DevAlertButton>
          </div>

          <div className="space-y-2">
            {MOCK_DOCS_PUBLICOS.map((doc) => (
              <div
                key={doc.id}
                className={`bg-white rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${
                  doc.publicado ? "border-gray-100" : "border-dashed border-gray-300 opacity-70"
                }`}
              >
                <FileText className={`size-8 shrink-0 ${doc.publicado ? "text-blue-600" : "text-gray-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{doc.titulo}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    <span className="text-xs text-muted-foreground">{CATEGORIA_LABELS[doc.categoria] ?? doc.categoria}</span>
                    {doc.competencia && <span className="text-xs text-muted-foreground">{doc.competencia}</span>}
                    {doc.tamanho_kb && (
                      <span className="text-xs text-muted-foreground">
                        {doc.tamanho_kb > 1024 ? `${(doc.tamanho_kb / 1024).toFixed(1)} MB` : `${doc.tamanho_kb} KB`}
                      </span>
                    )}
                    {doc.publicado && doc.publicado_em && (
                      <span className="text-xs text-green-700">Publicado em {formatDate(doc.publicado_em)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {doc.publicado ? (
                    <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
                      <CheckCircle2 className="size-3.5" />
                      Publicado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                      <XCircle className="size-3.5" />
                      Rascunho
                    </span>
                  )}
                  <DevAlertButton
                    message="Disponível após conexão com banco."
                    className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    title="Download"
                  >
                    <Download className="size-4" />
                  </DevAlertButton>
                  <DevAlertButton
                    message="Disponível após conexão com banco."
                    className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="size-4" />
                  </DevAlertButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ABA LGPD / AUDIT ── */}
      {aba === "lgpd" && (
        <div className="space-y-6">
          {/* DPO Info */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-blue-600" />
              <h2 className="font-semibold text-blue-900">Encarregado de Dados (DPO)</h2>
            </div>
            <p className="text-sm text-blue-800">
              Responsável LGPD:{" "}
              <a href={`mailto:${dpo}`} className="font-medium underline hover:no-underline">
                {dpo}
              </a>
            </p>
            <p className="text-xs text-blue-700">
              Este contato é exibido publicamente no Portal da Transparência e no portal dos acolhidos.
            </p>
          </div>

          {/* Consentimentos */}
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="size-5 text-green-600" />
              Consentimentos registrados
            </h2>
            <div className="space-y-2">
              {MOCK_CONSENTIMENTOS.map((c) => {
                const staff = MOCK_STAFF.find((s) => s.id === c.sujeito_id || s.user_id === c.sujeito_id);
                const nomeExibido = c.sujeito_tipo === "staff"
                  ? (staff?.full_name ?? c.sujeito_id)
                  : `Acolhido (${c.sujeito_id})`;
                return (
                  <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-start gap-3">
                    <CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{nomeExibido}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.sujeito_tipo === "staff" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                          {c.sujeito_tipo === "staff" ? "Funcionário" : "Acolhido"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.finalidade}</p>
                      <p className="text-xs text-muted-foreground">
                        Método: {c.metodo === "verbal_registrado" ? "Verbal com testemunha" : c.metodo === "escrito" ? "Assinado em papel" : "Digital"} ·{" "}
                        {formatDate(c.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit log */}
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="size-5 text-purple-600" />
              Log de auditoria recente
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-50">
                {MOCK_AUDIT_LOGS.map((log) => {
                  const staffUser = MOCK_STAFF.find((s) => s.user_id === log.user_id);
                  return (
                    <div key={log.id} className="p-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {staffUser?.full_name ?? log.user_id ?? "Sistema"}
                          </span>
                          {log.user_role && (
                            <span className="text-xs text-muted-foreground">{log.user_role}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">
                          {ACTION_LABELS[log.action] ?? log.action}
                          {log.entity_name && (
                            <span className="text-muted-foreground"> — {log.entity_name}</span>
                          )}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        {formatDateTime(log.created_at)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Logs de auditoria são registros imutáveis. Apenas INSERT é permitido na tabela{" "}
              <code className="font-mono bg-gray-100 px-1 rounded">audit_logs</code>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
