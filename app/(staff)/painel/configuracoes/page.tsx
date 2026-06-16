import type { Metadata } from "next";
import { Shield, CheckCircle2, Settings } from "lucide-react";
import { MOCK_STAFF, MOCK_CONFIGURACOES } from "@/lib/mock-data";
import type { AuditLog, LgpdConsentimento } from "@/types/database";
import { formatDate, formatDateTime } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Configurações — LGPD / Auditoria" };

// ─── Mock data local (LGPD / Audit) ──────────────────────────────────────────

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

const ACTION_LABELS: Record<string, string> = {
  view_prontuario: "Visualizou prontuário",
  export_pdf_prontuario: "Exportou PDF do prontuário",
  update_pia: "Atualizou PIA",
  create_ocorrencia: "Registrou ocorrência",
  update_role: "Alterou papel de funcionário",
  create_residente: "Cadastrou acolhido",
  delete_residente: "Encerrou vínculo (desligamento)",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ConfiguracoesPage() {
  const dpo = MOCK_CONFIGURACOES.find((c) => c.chave === "dpo_email")?.valor ?? "dpo@projetotravessia.org.br";
  const nomeSistema = MOCK_CONFIGURACOES.find((c) => c.chave === "nome_organizacao")?.valor ?? "Projeto Travessia";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="size-6 text-gray-400" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{nomeSistema} — LGPD / Auditoria</p>
        </div>
      </div>

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
    </div>
  );
}
