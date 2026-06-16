"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExportButtonProps {
  label: string;
  desc: React.ReactNode;
  icon: React.ReactNode;
  href: string;
  periodoLabel: string;
}

export function ExportButton({ label, desc, icon, href, periodoLabel }: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-start gap-3 w-full p-3 rounded-xl border border-gray-200 text-left hover:border-blue-200 hover:bg-blue-50/20 transition-colors group cursor-pointer"
      >
        <span className="text-muted-foreground group-hover:text-blue-600 mt-0.5 transition-colors">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
        <FileDown className="size-4 text-muted-foreground shrink-0 mt-0.5" />
      </button>

      <Dialog open={open} onOpenChange={(next) => setOpen(next)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Baixar {label.charAt(0).toLowerCase() + label.slice(1)}</DialogTitle>
            <DialogDescription>
              Período selecionado: <strong className="text-foreground">{periodoLabel}</strong>.
              Confira antes de continuar — para ajustar, cancele e mude o período no topo da página.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-9 rounded-lg border border-input bg-background px-4 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <a
              href={href}
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-blue-700 text-white px-4 text-sm font-medium hover:bg-blue-800 transition-colors cursor-pointer"
            >
              <FileDown className="size-4" />
              Baixar PDF
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
