"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setPreviewRole, clearPreviewRole, setPreviewResidente, clearPreviewResidente } from "@/lib/actions/preview-role";
import { Eye, ChevronDown } from "lucide-react";
import type { StaffRole } from "@/lib/rbac";
import { ROLE_LABELS } from "@/lib/rbac";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const ROLES: StaffRole[] = ["coordenacao", "tecnico", "cuidador"];

const STATUS_LABELS: Record<string, string> = {
  ativo: "Ativo",
  desligado: "Desligado",
  evadido: "Evadido",
  transferido: "Transferido",
  obito: "Óbito",
};

interface ResidenteOption {
  id: string;
  nome: string;
  numeroProntuario: string;
  status: string;
}

export function RolePreviewSelector({
  currentPreview,
  residentes,
  currentPreviewResidente,
}: {
  currentPreview: StaffRole | null;
  residentes: ResidenteOption[];
  currentPreviewResidente: { id: string; nome: string } | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [pickerOpen, setPickerOpen] = useState(false);
  const router = useRouter();

  function select(role: StaffRole) {
    startTransition(async () => {
      await setPreviewRole(role);
      router.refresh();
    });
  }

  function clear() {
    startTransition(async () => {
      await clearPreviewRole();
      await clearPreviewResidente();
      router.refresh();
    });
  }

  function selecionarResidente(id: string) {
    setPickerOpen(false);
    startTransition(async () => {
      await setPreviewResidente(id);
      router.push("/meu-espaco");
      router.refresh();
    });
  }

  const label = currentPreviewResidente
    ? `Como: Acolhido (${currentPreviewResidente.nome})`
    : currentPreview
    ? `Como: ${ROLE_LABELS[currentPreview]}`
    : "Visualizar como";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isPending}
          className={cn(
            "inline-flex items-center gap-1.5 text-xs h-8 rounded-md px-3 border font-medium transition-colors max-w-64",
            currentPreview || currentPreviewResidente
              ? "border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100"
              : "border-input bg-transparent text-gray-600 hover:bg-gray-50"
          )}
        >
          <Eye className="size-3.5 shrink-0" />
          <span className="truncate">{label}</span>
          <ChevronDown className="size-3 shrink-0" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-gray-500">Simular visão de:</DropdownMenuLabel>
            {ROLES.map((role) => (
              <DropdownMenuItem
                key={role}
                onClick={() => select(role)}
                className={`text-sm cursor-pointer ${
                  currentPreview === role ? "font-semibold text-blue-700 bg-blue-50" : ""
                }`}
              >
                {ROLE_LABELS[role]}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              onClick={() => setPickerOpen(true)}
              className={`text-sm cursor-pointer ${currentPreviewResidente ? "font-semibold text-blue-700 bg-blue-50" : "text-gray-700"}`}
            >
              Acolhido...
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {(currentPreview || currentPreviewResidente) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={clear}
                  className="text-sm text-amber-700 cursor-pointer"
                >
                  Sair do preview
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CommandDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title="Visualizar como Acolhido"
        description="Escolha de qual acolhido você quer ver o portal"
      >
        <Command>
          <CommandInput placeholder="Buscar por nome ou prontuário..." />
          <CommandList>
            <CommandEmpty>Nenhum acolhido encontrado.</CommandEmpty>
            <CommandGroup heading={`${residentes.length} acolhidos`}>
              {residentes.map((r) => (
                <CommandItem
                  key={r.id}
                  value={`${r.nome} ${r.numeroProntuario}`}
                  onSelect={() => selecionarResidente(r.id)}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="flex flex-col">
                    <span className="font-medium">{r.nome}</span>
                    <span className="text-xs text-muted-foreground">{r.numeroProntuario}</span>
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {STATUS_LABELS[r.status] ?? r.status}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
