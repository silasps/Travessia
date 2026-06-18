"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StickyNote, Plus } from "lucide-react";
import { toast } from "sonner";
import { registrarAnotacao } from "@/lib/actions/prontuario";
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

export function RegistrarAnotacaoForm({ residenteId }: { residenteId: string }) {
  const [open, setOpen] = useState(false);
  const [conteudo, setConteudo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (conteudo.trim().length < 10) {
      toast.error("A anotação precisa ter ao menos 10 caracteres.");
      return;
    }

    setLoading(true);
    const res = await registrarAnotacao({ residenteId, conteudo });
    setLoading(false);
    if ("error" in res) { toast.error(res.error); return; }
    setOpen(false);
    setConteudo("");
    toast.success("Anotação técnica registrada.");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
        <Plus className="size-3.5" />
        Nova Anotação
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="size-4 text-blue-500" />
            Nova Anotação Técnica
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="conteudo">Conteúdo *</Label>
            <Textarea
              id="conteudo"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Descreva a observação técnica, atendimento realizado, comportamento observado ou encaminhamento informal..."
              rows={6}
              className="rounded-xl resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              Registro imutável — não pode ser editado após salvar. Visível apenas para a equipe técnica.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Anotação"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
