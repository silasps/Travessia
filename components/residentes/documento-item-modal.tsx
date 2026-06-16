"use client";

import { useState } from "react";
import { CheckCircle2, Clock, XCircle, FileText, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils/format";

type DocStatus = "nao_possui" | "em_processo" | "obtido" | "entregue_residente";

const STATUS_CONFIG: Record<DocStatus, { label: string; icon: React.ElementType; className: string; badgeClass: string }> = {
  nao_possui:         { label: "Não possui",  icon: XCircle,      className: "text-gray-400",   badgeClass: "bg-gray-100 text-gray-500" },
  em_processo:        { label: "Em processo", icon: Clock,        className: "text-amber-500",  badgeClass: "bg-amber-100 text-amber-700" },
  obtido:             { label: "Obtido",      icon: CheckCircle2, className: "text-green-600",  badgeClass: "bg-green-100 text-green-700" },
  entregue_residente: { label: "Entregue",    icon: CheckCircle2, className: "text-blue-600",   badgeClass: "bg-blue-100 text-blue-700" },
};

const DOC_TIPO_LABELS: Record<string, string> = {
  rg: "RG",
  cpf: "CPF",
  certidao_nascimento: "Certidão de Nascimento",
  carteira_trabalho: "Carteira de Trabalho",
  titulo_eleitor: "Título de Eleitor",
  nis_cadastro_unico: "NIS / CadÚnico",
  cartao_sus: "Cartão SUS",
  foto_3x4: "Foto 3x4",
};

export type DocumentoParaModal = {
  id: string;
  tipo: string;
  status: DocStatus;
  numero?: string | null;
  data_obtido?: string | null;
  observacoes?: string | null;
};

export function DocumentoItemModal({ doc }: { doc: DocumentoParaModal }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[doc.status];
  const StatusIcon = cfg.icon;
  const titulo = DOC_TIPO_LABELS[doc.tipo] ?? doc.tipo;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-4 px-4 py-3.5 w-full text-left hover:bg-gray-50 transition-colors group"
      >
        <StatusIcon className={`size-5 flex-shrink-0 ${cfg.className}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
            {titulo}
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
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${cfg.badgeClass}`}>
          {cfg.label}
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <FileText className="size-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-base">{titulo}</DialogTitle>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${cfg.badgeClass}`}>
                  {cfg.label}
                </span>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            {doc.numero && (
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-xs text-muted-foreground">Número / Código</span>
                <span className="font-mono text-xs text-gray-800">{doc.numero}</span>
              </div>
            )}
            {doc.data_obtido && (
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3" /> Data de obtenção
                </span>
                <span className="text-xs text-gray-800">{formatDate(doc.data_obtido)}</span>
              </div>
            )}
            {doc.observacoes && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Observações</p>
                <p className="text-sm text-gray-800">{doc.observacoes}</p>
              </div>
            )}
            {!doc.numero && !doc.data_obtido && !doc.observacoes && (
              <p className="text-sm text-muted-foreground text-center py-2">
                Nenhum detalhe adicional registrado.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
