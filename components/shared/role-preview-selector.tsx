"use client";

import { useTransition } from "react";
import { setPreviewRole, clearPreviewRole } from "@/lib/actions/preview-role";
import { Eye, ChevronDown } from "lucide-react";
import type { StaffRole } from "@/lib/rbac";
import { ROLE_LABELS } from "@/lib/rbac";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const ROLES: StaffRole[] = ["coordenacao", "tecnico", "cuidador"];

export function RolePreviewSelector({
  currentPreview,
}: {
  currentPreview: StaffRole | null;
}) {
  const [isPending, startTransition] = useTransition();

  function select(role: StaffRole) {
    startTransition(async () => {
      await setPreviewRole(role);
    });
  }

  function clear() {
    startTransition(async () => {
      await clearPreviewRole();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs h-8 rounded-md px-3 border font-medium transition-colors",
          currentPreview
            ? "border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100"
            : "border-input bg-transparent text-gray-600 hover:bg-gray-50"
        )}
      >
        <Eye className="size-3.5" />
        {currentPreview ? `Como: ${ROLE_LABELS[currentPreview]}` : "Visualizar como"}
        <ChevronDown className="size-3" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-gray-500">Simular visão de:</DropdownMenuLabel>
        <DropdownMenuSeparator />
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
        {currentPreview && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={clear}
              className="text-sm text-amber-700 cursor-pointer"
            >
              Sair do preview
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
