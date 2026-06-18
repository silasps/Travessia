"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, XCircle, FileText, Calendar, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils/format";
import { atualizarDocumento } from "@/lib/actions/documentos-residente";

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
  certidao_casamento: "Certidão de Casamento",
  carteira_trabalho: "Carteira de Trabalho",
  titulo_eleitor: "Título de Eleitor",
  nis_cadastro_unico: "NIS / CadÚnico",
  cartao_sus: "Cartão SUS",
  comprovante_residencia: "Comprovante de Residência",
  foto_3x4: "Foto 3x4",
  outros: "Outros",
};

export type DocumentoParaModal = {
  id: string;
  residente_id: string;
  tipo: string;
  status: DocStatus;
  numero?: string | null;
  data_obtido?: string | null;
  observacoes?: string | null;
};

export function DocumentoItemModal({ doc }: { doc: DocumentoParaModal }) {
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState(false);
  const [status, setStatus] = useState<DocStatus>(doc.status);
  const [numero, setNumero] = useState(doc.numero ?? "");
  const [dataObtido, setDataObtido] = useState(doc.data_obtido ?? "");
  const [observacoes, setObservacoes] = useState(doc.observacoes ?? "");
  const [salvando, setSalvando] = useState(false);
  const router = useRouter();

  const cfg = STATUS_CONFIG[doc.status];
  const StatusIcon = cfg.icon;
  const titulo = DOC_TIPO_LABELS[doc.tipo] ?? doc.tipo;

  function iniciarEdicao() {
    setStatus(doc.status);
    setNumero(doc.numero ?? "");
    setDataObtido(doc.data_obtido ?? "");
    setObservacoes(doc.observacoes ?? "");
    setEditando(true);
  }

  async function salvar() {
    setSalvando(true);
    const res = await atualizarDocumento({
      documentoId: doc.id,
      residenteId: doc.residente_id,
      status,
      numero: numero || undefined,
      dataObtido: dataObtido || undefined,
      observacoes: observacoes || undefined,
    });
    setSalvando(false);

    if ("error" in res) { toast.error(res.error); return; }
    toast.success(`${titulo} atualizado.`);
    setEditando(false);
    setOpen(false);
    router.refresh();
  }

  const cfgAtual = STATUS_CONFIG[status];

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

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditando(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <FileText className="size-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-base">{titulo}</DialogTitle>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${editando ? cfgAtual.badgeClass : cfg.badgeClass}`}>
                  {editando ? cfgAtual.label : cfg.label}
                </span>
              </div>
              {!editando && (
                <button
                  type="button"
                  onClick={iniciarEdicao}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
                >
                  <Pencil className="size-3" />
                  Editar
                </button>
              )}
            </div>
          </DialogHeader>

          {editando ? (
            <div className="space-y-4">
              {/* Status */}
              <div className="space-y-1.5">
                <Label>Status</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.entries(STATUS_CONFIG) as [DocStatus, typeof cfg][]).map(([key, c]) => {
                    const Icon = c.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setStatus(key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-medium transition-colors ${
                          status === key
                            ? "border-blue-500 bg-blue-50 text-blue-800"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <Icon className={`size-3.5 ${status === key ? c.className : "text-gray-400"}`} />
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Número */}
              <div className="space-y-1.5">
                <Label htmlFor="doc_numero">Número do documento</Label>
                <Input
                  id="doc_numero"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Opcional"
                  className="rounded-xl"
                />
              </div>

              {/* Data obtido */}
              <div className="space-y-1.5">
                <Label htmlFor="doc_data">Data de obtenção</Label>
                <Input
                  id="doc_data"
                  type="date"
                  value={dataObtido}
                  onChange={(e) => setDataObtido(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              {/* Observações */}
              <div className="space-y-1.5">
                <Label htmlFor="doc_obs">Observações</Label>
                <Textarea
                  id="doc_obs"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: 2ª via solicitada no Poupatempo..."
                  rows={3}
                  className="rounded-xl resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={salvar} disabled={salvando} className="flex-1 gap-1.5">
                  <Save className="size-3.5" />
                  {salvando ? "Salvando..." : "Salvar"}
                </Button>
                <Button variant="outline" onClick={() => setEditando(false)} disabled={salvando}>
                  <X className="size-3.5" />
                </Button>
              </div>
            </div>
          ) : (
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
                  Nenhum detalhe registrado. Clique em &quot;Editar&quot; para atualizar.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
