"use client";

import { useRef, useState, useTransition } from "react";
import { uploadDocumento } from "@/lib/actions/documentos-publicos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Plus, Loader2 } from "lucide-react";

const CATEGORIAS = [
  { value: "estatuto",             label: "Estatuto Social" },
  { value: "regimento",            label: "Regimento / Regulamento" },
  { value: "ata",                  label: "Ata" },
  { value: "contrato_parceria",    label: "Termo de Colaboração / Convênio" },
  { value: "plano_trabalho",       label: "Plano de Trabalho" },
  { value: "relatorio_atividades", label: "Relatório de Atividades" },
  { value: "prestacao_contas",     label: "Prestação de Contas" },
  { value: "balancete",            label: "Balancete / Demonstrativo Contábil" },
  { value: "outros",               label: "Outros" },
];

export function UploadForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [categoria, setCategoria] = useState("");
  const [publicar, setPublicar] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);

    const fd = new FormData(e.currentTarget);
    fd.set("categoria", categoria);
    fd.set("publicar", publicar ? "true" : "false");

    startTransition(async () => {
      const res = await uploadDocumento(fd);
      if (res.error) {
        setErro(res.error);
      } else {
        setOpen(false);
        formRef.current?.reset();
        setCategoria("");
        setPublicar(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors min-h-[44px]">
        <Plus className="size-4" />
        Adicionar documento
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Adicionar documento</DialogTitle>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="arquivo">Arquivo</Label>
            <div className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors cursor-pointer">
              <Upload className="size-5 text-gray-400 flex-shrink-0" />
              <input
                id="arquivo"
                name="arquivo"
                type="file"
                required
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                className="flex-1 text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" name="titulo" required placeholder="Ex: Estatuto Social 2025" />
          </div>

          <div className="space-y-1.5">
            <Label>Pasta</Label>
            <Select value={categoria} onValueChange={(v) => setCategoria(v ?? "")} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="competencia">Competência / Período</Label>
            <Input id="competencia" name="competencia" placeholder="Ex: Jan/2025, 2024–2026" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              name="descricao"
              rows={2}
              placeholder="Breve descrição do documento..."
              className="resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={publicar}
              onChange={(e) => setPublicar(e.target.checked)}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700">Publicar imediatamente</span>
          </label>

          {erro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {erro}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-700 hover:bg-blue-800"
              disabled={isPending || !categoria}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Enviando…
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
