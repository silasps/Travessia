"use client";

import { useState, useTransition } from "react";
import { togglePublicado, excluirDocumento } from "@/lib/actions/documentos-publicos";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Trash2, Loader2 } from "lucide-react";

export function PublicarBtn({
  id,
  publicado,
}: {
  id: string;
  publicado: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await togglePublicado(id, !publicado);
    });
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleClick}
      disabled={isPending}
      className={
        publicado
          ? "text-amber-700 border-amber-200 hover:bg-amber-50"
          : "text-green-700 border-green-200 hover:bg-green-50"
      }
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : publicado ? (
        <>
          <EyeOff className="size-3.5 mr-1" />
          Despublicar
        </>
      ) : (
        <>
          <Eye className="size-3.5 mr-1" />
          Publicar
        </>
      )}
    </Button>
  );
}

export function ExcluirDocBtn({ id, titulo }: { id: string; titulo: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirmando, setConfirmando] = useState(false);

  function handleClick() {
    if (!confirmando) {
      setConfirmando(true);
      setTimeout(() => setConfirmando(false), 3000);
      return;
    }
    startTransition(async () => {
      await excluirDocumento(id);
    });
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleClick}
      disabled={isPending}
      title={confirmando ? "Clique novamente para confirmar exclusão" : `Excluir "${titulo}"`}
      className={
        confirmando
          ? "text-red-700 border-red-400 bg-red-50 hover:bg-red-100"
          : "text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700"
      }
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <>
          <Trash2 className="size-3.5 mr-1" />
          {confirmando ? "Confirmar?" : "Excluir"}
        </>
      )}
    </Button>
  );
}
