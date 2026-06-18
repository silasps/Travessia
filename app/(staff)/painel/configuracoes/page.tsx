import type { Metadata } from "next";
import {
  Shield, CheckCircle2, Settings, ScrollText, FileCheck, Info,
  Eye, UserPlus, AlertTriangle, CircleAlert, StickyNote, Star,
  ExternalLink, Users, ClipboardList, KeyRound, TrendingUp, FileText, LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MOCK_STAFF, MOCK_CONFIGURACOES } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import type { AuditLog, LgpdConsentimento } from "@/types/database";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import Link from "next/link";
import { BuscaInput } from "@/components/residentes/busca-input";
import { EditarCapacidade } from "@/components/configuracoes/editar-capacidade";

export const metadata: Metadata = { title: "Configurações — LGPD / Auditoria" };

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

// ─── Mock data (DEV_MODE / apresentação) ─────────────────────────────────────

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

// ─── Labels ──────────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  view_prontuario: "Visualizou prontuário",
  export_pdf_prontuario: "Exportou PDF do prontuário",
  update_pia: "Atualizou PIA",
  save_pia: "Salvou PIA",
  create_ocorrencia: "Registrou ocorrência",
  update_role: "Alterou papel de funcionário",
  create_residente: "Cadastrou acolhido",
  delete_residente: "Encerrou vínculo (desligamento)",
  create_advertencia: "Registrou advertência",
  create_anotacao: "Registrou anotação técnica",
  create_marco: "Registrou marco de evolução",
  create_encaminhamento: "Registrou encaminhamento",
  create_contato_familiar: "Registrou contato familiar",
  update_fase: "Alterou fase do acolhido",
};

const ACTION_ICONS: Record<string, { icon: LucideIcon; bg: string; color: string }> = {
  view_prontuario:       { icon: Eye,             bg: "bg-sky-100",    color: "text-sky-600" },
  create_residente:      { icon: UserPlus,        bg: "bg-green-100",  color: "text-green-600" },
  create_ocorrencia:     { icon: AlertTriangle,   bg: "bg-red-100",    color: "text-red-600" },
  create_advertencia:    { icon: CircleAlert,     bg: "bg-amber-100",  color: "text-amber-600" },
  create_anotacao:       { icon: StickyNote,      bg: "bg-blue-100",   color: "text-blue-600" },
  create_marco:          { icon: Star,            bg: "bg-amber-100",  color: "text-amber-600" },
  create_encaminhamento: { icon: ExternalLink,    bg: "bg-teal-100",   color: "text-teal-600" },
  create_contato_familiar: { icon: Users,         bg: "bg-purple-100", color: "text-purple-600" },
  save_pia:              { icon: ClipboardList,   bg: "bg-indigo-100", color: "text-indigo-600" },
  update_pia:            { icon: ClipboardList,   bg: "bg-indigo-100", color: "text-indigo-600" },
  update_role:           { icon: KeyRound,        bg: "bg-orange-100", color: "text-orange-600" },
  update_fase:           { icon: TrendingUp,      bg: "bg-purple-100", color: "text-purple-600" },
  export_pdf_prontuario: { icon: FileText,        bg: "bg-gray-100",   color: "text-gray-600" },
  delete_residente:      { icon: LogOut,          bg: "bg-red-100",    color: "text-red-600" },
};

const METODO_LABELS: Record<string, string> = {
  verbal_registrado: "Verbal com testemunha",
  escrito: "Assinado em papel",
  digital: "Digital",
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  coordenacao: "Coordenação",
  tecnico: "Técnico",
  cuidador: "Cuidador",
};

const TABS = [
  { id: "auditoria", label: "Log de Auditoria", icon: ScrollText },
  { id: "lgpd", label: "Consentimentos LGPD", icon: FileCheck },
  { id: "sistema", label: "Sistema", icon: Info },
] as const;

type Tab = (typeof TABS)[number]["id"];

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string; q?: string; de?: string; ate?: string }>;
}) {
  const params = await searchParams;
  const aba: Tab = TABS.some((t) => t.id === params.aba) ? (params.aba as Tab) : "auditoria";
  const busca = params.q?.toLowerCase().trim() ?? "";
  const filtroDe = params.de ?? "";
  const filtroAte = params.ate ?? "";

  let dpo: string;
  let nomeSistema: string;
  let capacidade: string;
  let auditLogs: AuditLog[];
  let consentimentos: LgpdConsentimento[];
  let staffLookup: (uid: string) => string;
  let residenteLookup: (rid: string) => string;

  if (DEV_MODE) {
    dpo = MOCK_CONFIGURACOES.find((c) => c.chave === "dpo_email")?.valor ?? "dpo@projetotravessia.org.br";
    nomeSistema = MOCK_CONFIGURACOES.find((c) => c.chave === "nome_organizacao")?.valor ?? "Projeto Travessia";
    capacidade = MOCK_CONFIGURACOES.find((c) => c.chave === "capacidade_total")?.valor ?? "50";
    auditLogs = MOCK_AUDIT_LOGS;
    consentimentos = MOCK_CONSENTIMENTOS;
    staffLookup = (uid) => MOCK_STAFF.find((s) => s.user_id === uid || s.id === uid)?.full_name ?? uid;
    residenteLookup = (rid) => `Acolhido (${rid})`;
  } else {
    const supabase = await createClient();
    const [
      { data: configData },
      { data: logsData },
      { data: consentData },
      { data: staffData },
      { data: residentesData },
    ] = await Promise.all([
      supabase.from("configuracoes_sistema").select("chave, valor"),
      supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("lgpd_consentimentos").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("staff_profiles").select("user_id, full_name"),
      supabase.from("residentes").select("id, nome_completo, nome_social, numero_prontuario"),
    ]);

    const configs = configData ?? [];
    dpo = configs.find((c) => c.chave === "dpo_email")?.valor ?? "dpo@projetotravessia.org.br";
    nomeSistema = configs.find((c) => c.chave === "nome_organizacao")?.valor ?? "Projeto Travessia";
    capacidade = configs.find((c) => c.chave === "capacidade_total")?.valor ?? "50";
    auditLogs = (logsData ?? []) as AuditLog[];
    consentimentos = (consentData ?? []) as LgpdConsentimento[];

    const staffMap = new Map((staffData ?? []).map((s) => [s.user_id, s.full_name]));
    staffLookup = (uid) => staffMap.get(uid) ?? uid;

    const resMap = new Map((residentesData ?? []).map((r) => [r.id, r.nome_social ?? r.nome_completo]));
    residenteLookup = (rid) => resMap.get(rid) ?? `Acolhido (${rid})`;
  }

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
        {TABS.map(({ id, label, icon: Icon }) => (
          <Link
            key={id}
            href={`/painel/configuracoes?aba=${id}`}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              aba === id
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-muted-foreground hover:text-gray-900"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </div>

      {/* ═══ ABA: LOG DE AUDITORIA ═══ */}
      {aba === "auditoria" && (() => {
        const logsFiltrados = auditLogs.filter((log) => {
          if (busca) {
            const nome = staffLookup(log.user_id ?? "").toLowerCase();
            const acao = (ACTION_LABELS[log.action] ?? log.action).toLowerCase();
            const entidade = (log.entity_name ?? "").toLowerCase();
            const role = (log.user_role ?? "").toLowerCase();
            if (![nome, acao, entidade, role].some((t) => t.includes(busca))) return false;
          }
          if (filtroDe) {
            const dataLog = log.created_at.split("T")[0];
            if (dataLog < filtroDe) return false;
          }
          if (filtroAte) {
            const dataLog = log.created_at.split("T")[0];
            if (dataLog > filtroAte) return false;
          }
          return true;
        });
        return (
        <div className="space-y-4">
          <form method="GET" className="flex flex-col sm:flex-row gap-2 items-end">
            <input type="hidden" name="aba" value="auditoria" />
            <BuscaInput defaultValue={params.q ?? ""} placeholder="Buscar por nome, ação ou entidade..." />
            <div className="flex gap-2 shrink-0">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">De</label>
                <input type="date" name="de" defaultValue={filtroDe}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Até</label>
                <input type="date" name="ate" defaultValue={filtroAte}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
          </form>

          <p className="text-sm text-muted-foreground">
            {logsFiltrados.length} de {auditLogs.length} ações
          </p>

          {logsFiltrados.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <ScrollText className="size-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-600">Nenhuma ação registrada no log</p>
              <p className="text-xs text-muted-foreground mt-1">As ações do sistema aparecerão aqui automaticamente.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-50">
                {logsFiltrados.map((log) => (
                  <div key={log.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50/50 transition-colors">
                    {(() => {
                      const cfg = ACTION_ICONS[log.action];
                      const IconComp = cfg?.icon ?? ScrollText;
                      return (
                        <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${cfg?.bg ?? "bg-gray-100"}`}>
                          <IconComp className={`size-4 ${cfg?.color ?? "text-gray-500"}`} />
                        </div>
                      );
                    })()}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-sm font-medium text-gray-900">
                          {staffLookup(log.user_id ?? "")}
                        </span>
                        {log.user_role && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                            {ROLE_LABELS[log.user_role] ?? log.user_role}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-0.5">
                        {ACTION_LABELS[log.action] ?? log.action}
                        {log.entity_name && (
                          <span className="text-muted-foreground"> — {log.entity_name}</span>
                        )}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 mt-0.5 whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Shield className="size-3.5" />
            Registros imutáveis — apenas INSERT é permitido na tabela <code className="font-mono bg-gray-100 px-1 rounded">audit_logs</code>.
          </p>
        </div>
        );
      })()}

      {/* ═══ ABA: CONSENTIMENTOS LGPD ═══ */}
      {aba === "lgpd" && (() => {
        const consFiltrados = consentimentos.filter((c) => {
          if (busca) {
            const nome = (c.sujeito_tipo === "staff" ? staffLookup(c.sujeito_id) : residenteLookup(c.sujeito_id)).toLowerCase();
            const finalidade = c.finalidade.toLowerCase();
            const metodo = (METODO_LABELS[c.metodo] ?? c.metodo).toLowerCase();
            if (![nome, finalidade, metodo].some((t) => t.includes(busca))) return false;
          }
          if (filtroDe) {
            const dataCons = c.created_at.split("T")[0];
            if (dataCons < filtroDe) return false;
          }
          if (filtroAte) {
            const dataCons = c.created_at.split("T")[0];
            if (dataCons > filtroAte) return false;
          }
          return true;
        });
        return (
        <div className="space-y-4">
          {/* DPO */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="size-5 text-blue-600" />
              <h2 className="font-semibold text-blue-900">Encarregado de Dados (DPO)</h2>
            </div>
            <p className="text-sm text-blue-800">
              Responsável LGPD:{" "}
              <a href={`mailto:${dpo}`} className="font-medium underline hover:no-underline">
                {dpo}
              </a>
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Contato exibido publicamente no Portal da Transparência e no portal dos acolhidos.
            </p>
          </div>

          <form method="GET" className="flex flex-col sm:flex-row gap-2 items-end">
            <input type="hidden" name="aba" value="lgpd" />
            <BuscaInput defaultValue={params.q ?? ""} placeholder="Buscar por nome ou método..." />
            <div className="flex gap-2 shrink-0">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">De</label>
                <input type="date" name="de" defaultValue={filtroDe}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Até</label>
                <input type="date" name="ate" defaultValue={filtroAte}
                  className="h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
          </form>

          <p className="text-sm text-muted-foreground">
            {consFiltrados.length} de {consentimentos.length} consentimentos
          </p>

          {consFiltrados.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <FileCheck className="size-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-600">Nenhum consentimento registrado</p>
              <p className="text-xs text-muted-foreground mt-1">Os consentimentos são registrados automaticamente ao cadastrar acolhidos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {consFiltrados.map((c) => {
                const nomeExibido = c.sujeito_tipo === "staff"
                  ? staffLookup(c.sujeito_id)
                  : residenteLookup(c.sujeito_id);
                const isStaff = c.sujeito_tipo === "staff";
                return (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3">
                    <div className={`size-9 rounded-full flex items-center justify-center shrink-0 ${isStaff ? "bg-blue-100" : "bg-green-100"}`}>
                      <CheckCircle2 className={`size-4.5 ${isStaff ? "text-blue-600" : "text-green-600"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{nomeExibido}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isStaff ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                          {isStaff ? "Funcionário" : "Acolhido"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{c.finalidade}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5 text-xs text-muted-foreground">
                        <span>Método: <strong className="text-gray-700">{METODO_LABELS[c.metodo] ?? c.metodo}</strong></span>
                        <span>{formatDate(c.created_at)}</span>
                        {c.coletado_por && <span>Coletado por: {staffLookup(c.coletado_por)}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Shield className="size-3.5" />
            Lei Geral de Proteção de Dados (LGPD) — Lei 13.709/2018. Registros imutáveis.
          </p>
        </div>
        );
      })()}

      {/* ═══ ABA: SISTEMA ═══ */}
      {aba === "sistema" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ConfigCard label="Nome da organização" value={nomeSistema} />
            {DEV_MODE ? (
              <ConfigCard label="Capacidade total (vagas)" value={`${capacidade} vagas`} />
            ) : (
              <EditarCapacidade valorAtual={capacidade} />
            )}
            <ConfigCard label="E-mail do DPO (LGPD)" value={dpo} />
            <ConfigCard label="Auditoria" value={`${auditLogs.length} ações registradas`} />
          </div>
        </div>
      )}
    </div>
  );
}

function ConfigCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <p className="text-base font-semibold text-gray-900">{value}</p>
    </div>
  );
}
