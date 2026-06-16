"use client";

import { useState, useTransition } from "react";
import { MoreVertical, Pencil, FolderInput, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import { atualizarMetadata, togglePublicado, excluirDocumento } from "@/lib/actions/documentos-publicos";
import type { DocumentoCategoria } from "@/types/database";
import { useDocumentoEdit } from "@/components/transparencia/documento-titulo-provider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

export function DocumentoAcoesMenu({
  id,
  publicado,
  categoriaAtual,
  categorias,
}: {
  id: string;
  publicado: boolean;
  categoriaAtual: DocumentoCategoria;
  categorias: { categoria: DocumentoCategoria; nome: string }[];
}) {
  const { setEditando } = useDocumentoEdit();
  const [isPending, startTransition] = useTransition();
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  function moverPara(categoria: DocumentoCategoria) {
    if (categoria === categoriaAtual) return;
    startTransition(async () => {
      await atualizarMetadata(id, { categoria });
    });
  }

  function handleTogglePublicado() {
    startTransition(async () => {
      await togglePublicado(id, !publicado);
    });
  }

  function handleExcluir() {
    if (!confirmandoExclusao) {
      setConfirmandoExclusao(true);
      setTimeout(() => setConfirmandoExclusao(false), 3000);
      return;
    }
    startTransition(async () => {
      await excluirDocumento(id);
    });
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) setConfirmandoExclusao(false);
      }}
    >
      <DropdownMenuTrigger
        disabled={isPending}
        title="Mais ações"
        className="inline-flex items-center justify-center size-7 rounded-lg border border-input bg-background hover:bg-muted disabled:opacity-50 transition-colors"
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
        ) : (
          <MoreVertical className="size-3.5 text-gray-500" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setEditando(true)}>
          <Pencil className="size-4" />
          Renomear
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FolderInput className="size-4" />
            Mover para pasta
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={categoriaAtual}
              onValueChange={(value) => moverPara(value as DocumentoCategoria)}
            >
              {categorias.map((c) => (
                <DropdownMenuRadioItem key={c.categoria} value={c.categoria}>
                  {c.nome}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem onClick={handleTogglePublicado}>
          {publicado ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          {publicado ? "Despublicar" : "Publicar"}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" closeOnClick={false} onClick={handleExcluir}>
          <Trash2 className="size-4" />
          {confirmandoExclusao ? "Confirmar exclusão?" : "Excluir"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
