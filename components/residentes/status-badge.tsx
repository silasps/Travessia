import { cn } from "@/lib/utils";
import type { ResidenteStatus } from "@/types/database";

const STATUS_CONFIG: Record<ResidenteStatus, { label: string; className: string }> = {
  ativo:       { label: "Ativo",        className: "bg-green-100 text-green-800" },
  desligado:   { label: "Desligado",    className: "bg-gray-100 text-gray-700" },
  evadido:     { label: "Evadido",      className: "bg-orange-100 text-orange-800" },
  transferido: { label: "Transferido",  className: "bg-blue-100 text-blue-800" },
  obito:       { label: "Óbito",        className: "bg-red-100 text-red-800" },
};

export function StatusBadge({ status }: { status: ResidenteStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: "bg-gray-100 text-gray-700" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.className)}>
      {cfg.label}
    </span>
  );
}

const FASE_CONFIG: Record<number, { label: string; className: string }> = {
  1: { label: "Fase 1 — Acolhimento",    className: "bg-blue-100 text-blue-800" },
  2: { label: "Fase 2 — Reorganização",  className: "bg-amber-100 text-amber-800" },
  3: { label: "Fase 3 — Autonomia",      className: "bg-green-100 text-green-800" },
  4: { label: "Fase 4 — Preparação",     className: "bg-purple-100 text-purple-800" },
};

export function FaseBadge({ fase, compact }: { fase: number; compact?: boolean }) {
  const cfg = FASE_CONFIG[fase] ?? { label: `Fase ${fase}`, className: "bg-gray-100 text-gray-700" };
  const label = compact ? `F${fase}` : cfg.label;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.className)}>
      {label}
    </span>
  );
}
