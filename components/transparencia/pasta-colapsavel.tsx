"use client";

import { useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PastaColapsavel({
  header,
  children,
  defaultOpen = false,
}: {
  header: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        title={open ? "Fechar pasta" : "Abrir pasta"}
        className="-mx-1 flex cursor-pointer items-center gap-2 rounded-lg px-1 py-0.5 transition-colors hover:bg-gray-50"
      >
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-gray-400 transition-transform",
            open && "rotate-90"
          )}
        />
        {header}
      </div>
      {open && children}
    </section>
  );
}
