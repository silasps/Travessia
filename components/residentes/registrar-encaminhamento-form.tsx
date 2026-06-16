"use client";

import { useState } from "react";
import { ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export const SERVICO_LABELS: Record<string, string> = {
  cras:                   "CRAS — Centro de Referência de Assistência Social",
  creas:                  "CREAS — Centro Especializado",
  caps:                   "CAPS — Centro de Atenção Psicossocial",
  saude:                  "Unidade de Saúde / UBS",
  emprego_sine:           "SINE / Emprego",
  curso_profissionalizante: "Curso Profissionalizante",
  beneficio_social:       "Benefício Social (BPC, CadÚnico)",
  juridico:               "Assistência Jurídica",
  moradia:                "Habitação / Moradia",
  outros:                 "Outros",
};

export function RegistrarEncaminhamentoForm({ residenteId }: { residenteId: string }) {
  const [open, setOpen] = useState(false);
  const [servico, setServico] = useState("");
  const [descricao, setDescricao] = useState("");
  const [retornoPrevisto, setRetornoPrevisto] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!servico) { toast.error("Selecione o serviço de encaminhamento."); return; }

    setLoading(true);
    // TODO: substituir por server action quando o banco estiver conectado
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setOpen(false);
    setServico("");
    setDescricao("");
    setRetornoPrevisto("");
    toast.success("Encaminhamento registrado.");
    console.log("registrar encaminhamento", { residenteId, servico, descricao, retornoPrevisto });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
        <Plus className="size-3.5" />
        Novo Encaminhamento
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="size-4 text-green-600" />
            Registrar Encaminhamento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Serviço */}
          <div className="space-y-1.5">
            <Label htmlFor="servico">Serviço *</Label>
            <select
              id="servico"
              value={servico}
              onChange={(e) => setServico(e.target.value)}
              required
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Selecione o serviço...</option>
              {Object.entries(SERVICO_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o objetivo do encaminhamento e orientações dadas ao acolhido..."
              rows={3}
              required
              className="rounded-xl resize-none"
            />
          </div>

          {/* Retorno previsto */}
          <div className="space-y-1.5">
            <Label htmlFor="retorno">Data de retorno previsto</Label>
            <Input
              id="retorno"
              type="date"
              value={retornoPrevisto}
              onChange={(e) => setRetornoPrevisto(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-700 hover:bg-green-800 text-white">
              {loading ? "Registrando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
