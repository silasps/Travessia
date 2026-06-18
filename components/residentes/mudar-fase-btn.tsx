"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { mudarFase } from "@/lib/actions/prontuario";

const FASES = [
  { num: 1, label: "Fase 1 — Acolhimento" },
  { num: 2, label: "Fase 2 — Reorganização" },
  { num: 3, label: "Fase 3 — Autonomia" },
  { num: 4, label: "Fase 4 — Preparação" },
];

interface Props {
  residenteId: string;
  faseAtual: number;
}

export function MudarFaseBtn({ residenteId, faseAtual }: Props) {
  const [aberto, setAberto] = useState(false);
  const [faseSelecionada, setFaseSelecionada] = useState(faseAtual);
  const [justificativa, setJustificativa] = useState("");
  const [salvo, setSalvo] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSalvar() {
    if (faseSelecionada === faseAtual || !justificativa.trim()) return;
    setLoading(true);
    const res = await mudarFase({ residenteId, novaFase: faseSelecionada, justificativa });
    setLoading(false);
    if ("error" in res) { toast.error(res.error); return; }
    setSalvo(true);
    router.refresh();
    setTimeout(() => { setSalvo(false); setAberto(false); setJustificativa(""); }, 1500);
  }

  if (salvo) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <CheckCircle2 className="size-4 shrink-0" />
        Fase atualizada para {FASES[faseSelecionada - 1].label}!
      </div>
    );
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-dashed border-purple-300 bg-purple-50 px-4 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-100 hover:border-purple-400 transition-colors min-h-[44px]"
      >
        <TrendingUp className="size-4" />
        Mudar fase
      </button>
    );
  }

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 space-y-3">
      <p className="text-sm font-semibold text-purple-900 flex items-center gap-2">
        <TrendingUp className="size-4" />
        Alterar fase do acolhido
      </p>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Nova fase</label>
        <div className="grid grid-cols-2 gap-2">
          {FASES.map((f) => (
            <label key={f.num}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-colors text-sm ${
                faseSelecionada === f.num
                  ? "border-purple-500 bg-purple-100"
                  : f.num === faseAtual
                  ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-60"
                  : "border-gray-200 bg-white hover:border-purple-300"
              }`}
            >
              <input
                type="radio"
                name="nova_fase"
                value={f.num}
                disabled={f.num === faseAtual}
                checked={faseSelecionada === f.num}
                onChange={() => setFaseSelecionada(f.num)}
                className="sr-only"
              />
              <span className="font-semibold">F{f.num}</span>
              <span className="text-xs text-muted-foreground leading-tight">{f.label.split(" — ")[1]}</span>
              {f.num === faseAtual && <span className="ml-auto text-xs text-gray-400">atual</span>}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Justificativa <span className="text-red-500">*</span>
        </label>
        <textarea
          value={justificativa}
          onChange={(e) => setJustificativa(e.target.value)}
          rows={3}
          placeholder="Descreva os critérios que justificam a mudança de fase…"
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSalvar}
          disabled={faseSelecionada === faseAtual || !justificativa.trim()}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-800 transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirmar mudança de fase
        </button>
        <button type="button" onClick={() => setAberto(false)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors min-h-[44px]">
          Cancelar
        </button>
      </div>
    </div>
  );
}
