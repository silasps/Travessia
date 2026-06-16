"use client";

import { useState, useTransition } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { atualizarMetadata } from "@/lib/actions/documentos-publicos";
import { useDocumentoEdit } from "@/components/transparencia/documento-titulo-provider";
import { StopPropagation } from "@/components/transparencia/documento-viewer-modal";

export function TituloDocumento({ id, titulo }: { id: string; titulo: string }) {
  const { editando, setEditando } = useDocumentoEdit();
  const [valor, setValor] = useState(titulo);
  const [isPending, startTransition] = useTransition();

  function cancelar() {
    setEditando(false);
    setValor(titulo);
  }

  function salvar() {
    const novoTitulo = valor.trim();
    if (!novoTitulo || novoTitulo === titulo) {
      cancelar();
      return;
    }
    startTransition(async () => {
      await atualizarMetadata(id, { titulo: novoTitulo });
      setEditando(false);
    });
  }

  if (!editando) {
    return <p className="font-medium text-gray-900 leading-tight">{titulo}</p>;
  }

  return (
    <StopPropagation className="inline-flex items-center gap-1 min-w-0 flex-1">
      <input
        autoFocus
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") salvar();
          if (e.key === "Escape") cancelar();
        }}
        disabled={isPending}
        className="h-7 min-w-0 flex-1 rounded-lg border border-input bg-background px-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      />
      {isPending ? (
        <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
      ) : (
        <>
          <button
            type="button"
            onClick={salvar}
            className="shrink-0 text-green-600 hover:text-green-700"
            title="Salvar"
          >
            <Check className="size-4" />
          </button>
          <button
            type="button"
            onClick={cancelar}
            className="shrink-0 text-gray-400 hover:text-gray-600"
            title="Cancelar"
          >
            <X className="size-4" />
          </button>
        </>
      )}
    </StopPropagation>
  );
}
