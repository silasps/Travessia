"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserCog } from "lucide-react";
import { alterarPapelStaff } from "@/lib/actions/staff";
import { ROLE_LABELS } from "@/lib/rbac";
import type { StaffRole } from "@/lib/rbac";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PAPEIS_ATRIBUIVEIS: StaffRole[] = ["coordenacao", "tecnico", "cuidador"];

export function AlterarPapelMenu({
  userId,
  nomeCompleto,
  papelAtual,
}: {
  userId: string;
  nomeCompleto: string;
  papelAtual: StaffRole;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function selecionar(papel: StaffRole) {
    if (papel === papelAtual) return;
    startTransition(async () => {
      const res = await alterarPapelStaff(userId, papel);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`${nomeCompleto} agora é ${ROLE_LABELS[papel]}.`);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-xl border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-gray-900 hover:border-gray-300 transition-colors min-h-[36px] disabled:opacity-50"
      >
        <UserCog className="size-3.5" />
        Alterar papel
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {PAPEIS_ATRIBUIVEIS.map((papel) => (
          <DropdownMenuItem
            key={papel}
            onClick={() => selecionar(papel)}
            className={`text-sm cursor-pointer ${papel === papelAtual ? "font-semibold text-blue-700 bg-blue-50" : ""}`}
          >
            {ROLE_LABELS[papel]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
