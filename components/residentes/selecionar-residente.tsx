"use client";

import { useState } from "react";
import { Search, User, X } from "lucide-react";
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

interface ResidenteOpt {
  id: string;
  nome_completo: string;
  nome_social?: string | null;
  numero_prontuario: string;
}

export function SelecionarResidente({
  residentes,
  defaultValue,
  name,
}: {
  residentes: ResidenteOpt[];
  defaultValue?: string;
  name: string;
}) {
  const inicial = defaultValue ? residentes.find((r) => r.id === defaultValue) : undefined;
  const [selecionado, setSelecionado] = useState<ResidenteOpt | undefined>(inicial);
  const [open, setOpen] = useState(false);

  const nomeExibido = selecionado
    ? (selecionado.nome_social ?? selecionado.nome_completo)
    : null;

  return (
    <>
      <input type="hidden" name={name} value={selecionado?.id ?? ""} />

      {selecionado ? (
        <div className="flex items-center gap-3 w-full h-11 rounded-xl border border-input bg-background px-3">
          <div className="size-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <User className="size-3.5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-900 truncate block">{nomeExibido}</span>
            <span className="text-xs text-muted-foreground">{selecionado.numero_prontuario}</span>
          </div>
          <button
            type="button"
            onClick={() => setSelecionado(undefined)}
            className="text-muted-foreground hover:text-gray-700 shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 w-full h-11 rounded-xl border border-input bg-background px-3 text-sm text-muted-foreground hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
        >
          <Search className="size-4 shrink-0" />
          Buscar acolhido por nome ou prontuário...
        </button>
      )}

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Selecionar Acolhido"
        description="Busque por nome ou número de prontuário"
      >
        <Command>
          <CommandInput placeholder="Buscar por nome ou prontuário..." />
          <CommandList>
            <CommandEmpty>Nenhum acolhido encontrado.</CommandEmpty>
            <CommandGroup heading={`${residentes.length} acolhidos ativos`}>
              {residentes.map((r) => (
                <CommandItem
                  key={r.id}
                  value={`${r.nome_social ?? r.nome_completo} ${r.nome_completo} ${r.numero_prontuario}`}
                  onSelect={() => {
                    setSelecionado(r);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 py-2.5"
                >
                  <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <User className="size-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block truncate">{r.nome_social ?? r.nome_completo}</span>
                    <span className="text-xs text-muted-foreground">{r.numero_prontuario}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
