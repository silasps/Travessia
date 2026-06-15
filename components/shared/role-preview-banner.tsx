"use client";

import { useTransition } from "react";
import { clearPreviewRole } from "@/lib/actions/preview-role";
import { X } from "lucide-react";
import type { StaffRole } from "@/lib/rbac";
import { ROLE_LABELS } from "@/lib/rbac";

export function RolePreviewBanner({ previewRole }: { previewRole: StaffRole }) {
  const [isPending, startTransition] = useTransition();

  function handleClear() {
    startTransition(async () => {
      await clearPreviewRole();
    });
  }

  return (
    <div className="sticky top-14 z-30 flex items-center justify-between gap-3 bg-amber-400 px-4 py-2 text-amber-950 text-sm font-medium">
      <span>
        Modo de visualização —{" "}
        <strong>{ROLE_LABELS[previewRole]}</strong>
      </span>
      <button
        onClick={handleClear}
        disabled={isPending}
        className="flex items-center gap-1 text-xs font-semibold hover:underline opacity-80 hover:opacity-100 transition-opacity"
      >
        <X className="size-3.5" />
        Sair do preview
      </button>
    </div>
  );
}
