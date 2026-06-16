"use client";

import { useState } from "react";
import { AlertTriangle, MapPin, Calendar, User, ClipboardCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, formatDateTime } from "@/lib/utils/format";

type Gravidade = "leve" | "moderada" | "grave" | "gravissima";
type StatusOc = "aberta" | "em_avaliacao" | "confirmada" | "improcedente";

const GRAVIDADE_CONFIG: Record<Gravidade, { label: string; className: string }> = {
  leve:       { label: "Leve",       className: "bg-yellow-100 text-yellow-800 border border-yellow-200" },
  moderada:   { label: "Moderada",   className: "bg-orange-100 text-orange-800 border border-orange-200" },
  grave:      { label: "Grave",      className: "bg-red-100 text-red-800 border border-red-200" },
  gravissima: { label: "Gravíssima", className: "bg-red-200 text-red-900 border border-red-300 font-bold" },
};

const STATUS_CONFIG: Record<StatusOc, { label: string; dot: string }> = {
  aberta:       { label: "Aberta",       dot: "bg-blue-500" },
  em_avaliacao: { label: "Em avaliação", dot: "bg-amber-500" },
  confirmada:   { label: "Confirmada",   dot: "bg-gray-500" },
  improcedente: { label: "Improcedente", dot: "bg-green-500" },
};

export type OcorrenciaParaModal = {
  id: string;
  numero: string;
  gravidade: Gravidade;
  status: StatusOc;
  data_ocorrencia: string;
  created_at: string;
  local?: string | null;
  testemunhas?: string | null;
  descricao: string;
  providencias?: string | null;
  parecer?: string | null;
  data_avaliacao?: string | null;
  aberto_por_nome?: string | null;
  avaliado_por_nome?: string | null;
};

function InfoRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-3 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-medium text-muted-foreground sm:w-32 shrink-0">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}

export function OcorrenciaDetalheModal({
  oc,
  children,
}: {
  oc: OcorrenciaParaModal;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const gravCfg = GRAVIDADE_CONFIG[oc.gravidade];
  const statusCfg = STATUS_CONFIG[oc.status];

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-xs text-muted-foreground">{oc.numero}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${gravCfg.className}`}>
                {gravCfg.label}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                <span className={`size-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
            </div>
            <DialogTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-orange-500 shrink-0" />
              Ocorrência
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Detalhes */}
            <div className="space-y-0">
              <InfoRow
                label={<span className="flex items-center gap-1"><Calendar className="size-3" /> Data / Hora</span>}
                value={formatDateTime(oc.data_ocorrencia)}
              />
              {oc.local && (
                <InfoRow
                  label={<span className="flex items-center gap-1"><MapPin className="size-3" /> Local</span>}
                  value={oc.local}
                />
              )}
              {oc.testemunhas && (
                <InfoRow label="Testemunhas" value={oc.testemunhas} />
              )}
              {oc.aberto_por_nome && (
                <InfoRow
                  label={<span className="flex items-center gap-1"><User className="size-3" /> Registrado por</span>}
                  value={oc.aberto_por_nome}
                />
              )}
              <InfoRow label="Data do registro" value={formatDateTime(oc.created_at)} />
            </div>

            {/* Descrição */}
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Descrição</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{oc.descricao}</p>
            </div>

            {/* Providências */}
            {oc.providencias && (
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs font-medium text-blue-700 mb-1.5">Providências tomadas</p>
                <p className="text-sm text-blue-900 whitespace-pre-wrap">{oc.providencias}</p>
              </div>
            )}

            {/* Avaliação (se concluída) */}
            {(oc.status === "confirmada" || oc.status === "improcedente") && (
              <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-2">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <ClipboardCheck className="size-4 text-green-600" />
                  Avaliação da Coordenação
                </p>
                {oc.avaliado_por_nome && (
                  <InfoRow label="Avaliado por" value={oc.avaliado_por_nome} />
                )}
                {oc.data_avaliacao && (
                  <InfoRow label="Data" value={formatDate(oc.data_avaliacao)} />
                )}
                {oc.parecer && (
                  <div className="pt-2 border-t border-gray-50">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Parecer</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{oc.parecer}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
