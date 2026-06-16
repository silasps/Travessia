import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, XCircle, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { resolveResidenteAcesso } from "@/lib/residente-preview";
import { getMockDocumentos } from "@/lib/mock-data";
import type { DocumentoStatus } from "@/types/database";

export const metadata: Metadata = { title: "Meus Documentos" };

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

const STATUS_CONFIG: Record<DocumentoStatus, { label: string; icon: React.ElementType; className: string; bg: string }> = {
  entregue_residente: {
    label: "Entregue",
    icon: CheckCircle2,
    className: "text-green-600",
    bg: "bg-green-50 border-green-100",
  },
  obtido: {
    label: "Obtido",
    icon: CheckCircle2,
    className: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
  },
  em_processo: {
    label: "Em processo",
    icon: Clock,
    className: "text-amber-600",
    bg: "bg-amber-50 border-amber-100",
  },
  nao_possui: {
    label: "Não possui",
    icon: XCircle,
    className: "text-gray-400",
    bg: "bg-gray-50 border-gray-100",
  },
};

const TIPO_LABELS: Record<string, string> = {
  rg: "RG (Identidade)",
  cpf: "CPF",
  certidao_nascimento: "Certidão de Nascimento",
  carteira_trabalho: "Carteira de Trabalho (CTPS)",
  titulo_eleitor: "Título de Eleitor",
  nis_cadastro_unico: "NIS / Cadastro Único",
  cartao_sus: "Cartão do SUS",
  foto_3x4: "Foto 3×4",
  outros: "Outros documentos",
};

interface DocumentoView {
  id: string;
  tipo: string;
  status: DocumentoStatus;
  observacoes: string | null;
}

export default async function MeusDocumentosPage() {
  let documentos: DocumentoView[];

  if (DEV_MODE) {
    documentos = getMockDocumentos("r01");
  } else {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const acesso = await resolveResidenteAcesso(supabase, user.id);
    if (!acesso) redirect("/login");

    if (!acesso.residenteId) {
      documentos = getMockDocumentos("r01");
    } else {
      const { data } = await supabase
        .from("documentos_residente")
        .select("id, tipo, status, observacoes")
        .eq("residente_id", acesso.residenteId)
        .order("tipo");
      documentos = data ?? [];
    }
  }

  const entregues = documentos.filter((d) => d.status === "entregue_residente" || d.status === "obtido").length;
  const total = documentos.length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meus Documentos</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {entregues} de {total} documentos entregues
        </p>
      </div>

      {/* Barra de progresso */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Progresso da documentação</span>
          <span className="font-bold text-gray-900">{total > 0 ? Math.round((entregues / total) * 100) : 0}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all"
            style={{ width: `${total > 0 ? (entregues / total) * 100 : 0}%` }}
          />
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-green-500 inline-block" /> {entregues} obtidos</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-400 inline-block" /> {documentos.filter((d) => d.status === "em_processo").length} em processo</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-gray-300 inline-block" /> {documentos.filter((d) => d.status === "nao_possui").length} não possui</span>
        </div>
      </div>

      {/* Lista de documentos */}
      <div className="space-y-2">
        {documentos.map((doc) => {
          const cfg = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG.em_processo;
          const Icon = cfg.icon;
          const label = TIPO_LABELS[doc.tipo] ?? doc.tipo;

          return (
            <div
              key={doc.id}
              className={`flex items-center gap-3 p-4 rounded-2xl border ${cfg.bg}`}
            >
              <Icon className={`size-6 shrink-0 ${cfg.className}`} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-base">{label}</p>
                {doc.observacoes && (
                  <p className="text-sm text-gray-600 mt-0.5">{doc.observacoes}</p>
                )}
              </div>
              <span className={`text-xs font-medium shrink-0 ${cfg.className}`}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Aviso */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <FileText className="size-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">Precisa de ajuda com seus documentos?</p>
            <p className="text-sm text-blue-800 mt-0.5">
              Fale com a equipe técnica. Podemos ajudar você a solicitar segunda via de RG, CPF e outros documentos sem custo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
