"use client";

import { FileDown } from "lucide-react";

interface ExportButtonProps {
  label: string;
  desc: string;
  icon: React.ReactNode;
}

export function ExportButton({ label, desc, icon }: ExportButtonProps) {
  return (
    <button
      type="button"
      onClick={() => alert("Geração de PDF disponível após conexão com banco.")}
      className="flex items-start gap-3 w-full p-3 rounded-xl border border-gray-200 text-left hover:border-blue-200 hover:bg-blue-50/20 transition-colors group"
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
  );
}
