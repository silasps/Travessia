"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertOctagon, Plus } from "lucide-react";
import { toast } from "sonner";
import { registrarAdvertencia } from "@/lib/actions/prontuario";
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

const TIPO_CONFIG = {
  verbal:    { label: "Advertência Verbal",    className: "border-yellow-300 bg-yellow-50 text-yellow-800" },
  escrita:   { label: "Advertência Escrita",   className: "border-orange-300 bg-orange-50 text-orange-800" },
  suspensao: { label: "Suspensão Temporária",  className: "border-red-300 bg-red-50 text-red-800" },
};

const MOTIVOS = [
  "Descumprimento de horário",
  "Barulho excessivo no dormitório",
  "Uso de linguagem agressiva",
  "Desobediência às normas da casa",
  "Porte ou uso de substâncias proibidas",
  "Conflito com outro acolhido",
  "Dano ao patrimônio",
  "Ausência não justificada",
  "Outros",
];

export function RegistrarAdvertenciaForm({ residenteId }: { residenteId: string }) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<"verbal" | "escrita" | "suspensao">("verbal");
  const [motivo, setMotivo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!motivo) { toast.error("Selecione o motivo da advertência."); return; }

    setLoading(true);
    const res = await registrarAdvertencia({ residenteId, tipo, motivo, descricao: descricao || undefined });
    setLoading(false);
    if ("error" in res) { toast.error(res.error); return; }
    setOpen(false);
    setMotivo("");
    setDescricao("");
    setTipo("verbal");
    toast.success(`${TIPO_CONFIG[tipo].label} registrada com sucesso.`);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2 text-orange-700 border-orange-200 hover:bg-orange-50" />
        }
      >
        <Plus className="size-3.5" />
        Registrar Advertência
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertOctagon className="size-4 text-orange-500" />
            Registrar Advertência
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo */}
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["verbal", "escrita", "suspensao"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`text-xs font-medium px-2 py-2 rounded-xl border-2 transition-all text-center ${
                    tipo === t ? TIPO_CONFIG[t].className + " border-current" : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {TIPO_CONFIG[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Motivo */}
          <div className="space-y-1.5">
            <Label htmlFor="motivo">Motivo *</Label>
            <select
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Selecione o motivo...</option>
              {MOTIVOS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição detalhada</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o ocorrido com detalhes relevantes..."
              rows={3}
              className="rounded-xl resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white">
              {loading ? "Registrando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
