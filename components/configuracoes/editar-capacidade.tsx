"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Pencil, X } from "lucide-react";
import { atualizarConfiguracao } from "@/lib/actions/configuracoes";

export function EditarCapacidade({ valorAtual }: { valorAtual: string }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(valorAtual);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function salvar() {
    const num = parseInt(valor);
    if (isNaN(num) || num < 1 || num > 999) {
      toast.error("Informe um número entre 1 e 999.");
      return;
    }
    startTransition(async () => {
      const res = await atualizarConfiguracao("capacidade_total", String(num));
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success(`Capacidade atualizada para ${num} vagas.`);
      setEditando(false);
      router.refresh();
    });
  }

  if (!editando) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-xs font-medium text-muted-foreground mb-1">Capacidade total (vagas)</p>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-gray-900">{valorAtual} <span className="text-base font-normal text-muted-foreground">vagas</span></p>
          <button
            type="button"
            onClick={() => { setValor(valorAtual); setEditando(true); }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Pencil className="size-3" />
            Alterar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-200 p-4 space-y-3">
      <p className="text-xs font-medium text-blue-700">Alterar capacidade total</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={999}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="w-24 h-10 rounded-xl border border-input bg-background px-3 text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <span className="text-sm text-muted-foreground">vagas</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={salvar}
          disabled={isPending || valor === valorAtual}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors disabled:opacity-50 min-h-[36px]"
        >
          <Save className="size-3.5" />
          {isPending ? "Salvando…" : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => setEditando(false)}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-xl border border-input px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[36px]"
        >
          <X className="size-3.5" />
          Cancelar
        </button>
      </div>
    </div>
  );
}
