"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Plus } from "lucide-react";
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
import { criarOcorrencia } from "@/lib/actions/prontuario";

const GRAVIDADES = [
  { value: "leve",       label: "Leve",       desc: "Baixo impacto, sem risco" },
  { value: "moderada",   label: "Moderada",   desc: "Requer atenção e registro" },
  { value: "grave",      label: "Grave",       desc: "Risco ou violação séria" },
  { value: "gravissima", label: "Gravíssima", desc: "Risco à vida ou violência" },
];

export function NovaOcorrenciaModal({
  residenteId,
  residenteNome,
}: {
  residenteId: string;
  residenteNome: string;
}) {
  const [open, setOpen] = useState(false);
  const [gravidade, setGravidade] = useState("moderada");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    setLoading(true);
    const res = await criarOcorrencia({
      residenteId,
      dataOcorrencia: fd.get("data_ocorrencia") as string,
      gravidade: gravidade as "leve" | "moderada" | "grave" | "gravissima",
      descricao: fd.get("descricao") as string,
      local: (fd.get("local") as string) || undefined,
      testemunhas: (fd.get("testemunhas") as string) || undefined,
    });
    setLoading(false);

    if ("error" in res) {
      toast.error(res.error);
      return;
    }

    toast.success("Ocorrência registrada com sucesso.");
    setOpen(false);
    setGravidade("moderada");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm" className="gap-1.5" />
        }
      >
        <AlertTriangle className="size-3.5" />
        Nova ocorrência
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-red-500" />
            Nova Ocorrência
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mb-1">
          <span className="text-xs text-muted-foreground">Acolhido:</span>
          <span className="text-sm font-semibold text-blue-800">{residenteNome}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="oc_data">Data e hora *</Label>
              <Input
                id="oc_data"
                type="datetime-local"
                name="data_ocorrencia"
                required
                defaultValue={new Date().toISOString().slice(0, 16)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="oc_local">Local</Label>
              <Input
                id="oc_local"
                type="text"
                name="local"
                placeholder="Refeitório, Dormitório..."
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Gravidade */}
          <div className="space-y-1.5">
            <Label>Gravidade *</Label>
            <div className="grid grid-cols-2 gap-2">
              {GRAVIDADES.map((g) => (
                <label
                  key={g.value}
                  className={`flex flex-col gap-0.5 p-2.5 rounded-xl border-2 cursor-pointer transition-colors text-sm ${
                    gravidade === g.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value={g.value}
                    checked={gravidade === g.value}
                    onChange={() => setGravidade(g.value)}
                    className="sr-only"
                  />
                  <span className="font-semibold">{g.label}</span>
                  <span className="text-xs text-muted-foreground leading-tight">{g.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="oc_testemunhas">Testemunhas</Label>
            <Input
              id="oc_testemunhas"
              type="text"
              name="testemunhas"
              placeholder="Nomes das pessoas presentes..."
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="oc_descricao">Descrição *</Label>
            <Textarea
              id="oc_descricao"
              name="descricao"
              required
              rows={4}
              placeholder="Descreva o que aconteceu, quando, e as circunstâncias..."
              className="rounded-xl resize-none"
            />
          </div>

          {gravidade === "gravissima" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-red-800">
                Gravíssima — ação imediata requerida
              </p>
              <p className="text-xs text-red-700 mt-0.5">
                Se houver risco de vida, acione SAMU (192) ou Polícia (190) antes de registrar.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? "Registrando..." : "Registrar ocorrência"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
