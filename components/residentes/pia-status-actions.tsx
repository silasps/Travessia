"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Clock, FileText, AlertCircle, Plus, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { alterarStatusPIA, registrarRevisaoPIA } from "@/lib/actions/prontuario";
import type { PiaStatus } from "@/types/database";

const STATUS_OPTIONS: { value: PiaStatus; label: string; icon: React.ElementType; color: string }[] = [
  { value: "rascunho", label: "Rascunho", icon: FileText, color: "text-gray-500" },
  { value: "em_elaboracao", label: "Em elaboração", icon: Clock, color: "text-amber-600" },
  { value: "concluido", label: "Concluído", icon: CheckCircle2, color: "text-green-600" },
  { value: "revisao", label: "Em revisão", icon: AlertCircle, color: "text-blue-600" },
  { value: "desatualizado", label: "Desatualizado", icon: AlertCircle, color: "text-red-600" },
];

export function AlterarStatusPIA({
  residenteId,
  statusAtual,
}: {
  residenteId: string;
  statusAtual: PiaStatus;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function alterar(novoStatus: PiaStatus) {
    if (novoStatus === statusAtual) return;
    setLoading(true);
    const res = await alterarStatusPIA({ residenteId, novoStatus });
    setLoading(false);
    if ("error" in res) { toast.error(res.error); return; }
    toast.success(`Status do PIA alterado para "${STATUS_OPTIONS.find(s => s.value === novoStatus)?.label}".`);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-1.5 text-xs" />}>
        Alterar status
      </DialogTrigger>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-sm">Alterar status do PIA</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          {STATUS_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isAtual = opt.value === statusAtual;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={loading || isAtual}
                onClick={() => alterar(opt.value)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border-2 text-sm transition-colors ${
                  isAtual
                    ? "border-blue-500 bg-blue-50 font-medium"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                } disabled:opacity-60`}
              >
                <Icon className={`size-4 ${opt.color}`} />
                <span className="flex-1 text-left">{opt.label}</span>
                {isAtual && <span className="text-xs text-blue-600">atual</span>}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function RegistrarRevisaoPIA({ residenteId }: { residenteId: string }) {
  const [open, setOpen] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (descricao.trim().length < 5) {
      toast.error("Descreva a revisão com ao menos 5 caracteres.");
      return;
    }
    setLoading(true);
    const res = await registrarRevisaoPIA({ residenteId, descricao });
    setLoading(false);
    if ("error" in res) { toast.error(res.error); return; }
    toast.success("Revisão registrada.");
    setDescricao("");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-1.5 text-xs" />}>
        <Plus className="size-3" />
        Registrar revisão
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <StickyNote className="size-4 text-blue-500" />
            Registrar Revisão do PIA
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rev_desc">Observações da revisão *</Label>
            <Textarea
              id="rev_desc"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o que foi revisado, ajustes nos objetivos, progresso observado..."
              rows={4}
              required
              className="rounded-xl resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
