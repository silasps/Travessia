"use client";

import { useState, useTransition } from "react";
import { MoreVertical, Pencil, Check, X, Loader2 } from "lucide-react";
import { renomearCategoria } from "@/lib/actions/documentos-publicos";
import type { DocumentoCategoria } from "@/types/database";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { StopPropagation } from "@/components/transparencia/documento-viewer-modal";

export function EditarPastaNome({
  categoria,
  nome,
}: {
  categoria: DocumentoCategoria;
  nome: string;
}) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(nome);
  const [isPending, startTransition] = useTransition();

  function cancelar() {
    setEditando(false);
    setValor(nome);
  }

  function salvar() {
    const novoNome = valor.trim();
    if (!novoNome || novoNome === nome) {
      cancelar();
      return;
    }
    startTransition(async () => {
      await renomearCategoria(categoria, novoNome);
      setEditando(false);
    });
  }

  if (editando) {
    return (
      <StopPropagation className="inline-flex items-center gap-1">
        <input
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") salvar();
            if (e.key === "Escape") cancelar();
          }}
          disabled={isPending}
          className="h-7 rounded-lg border border-input bg-background px-2 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        {isPending ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <>
            <button type="button" onClick={salvar} className="text-green-600 hover:text-green-700" title="Salvar">
              <Check className="size-4" />
            </button>
            <button type="button" onClick={cancelar} className="text-gray-400 hover:text-gray-600" title="Cancelar">
              <X className="size-4" />
            </button>
          </>
        )}
      </StopPropagation>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-bold text-sm text-gray-800">{nome}</span>
      <StopPropagation>
        <DropdownMenu>
          <DropdownMenuTrigger
            title="Mais ações"
            className="inline-flex items-center justify-center size-6 rounded-lg text-gray-400 hover:bg-muted hover:text-gray-700 transition-colors"
          >
            <MoreVertical className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setEditando(true)}>
              <Pencil className="size-4" />
              Renomear pasta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </StopPropagation>
    </span>
  );
}
