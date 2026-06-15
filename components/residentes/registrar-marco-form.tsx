"use client";

import { useState } from "react";
import { Plus, CheckCircle2, X } from "lucide-react";

interface Props {
  residenteId: string;
  faseAtual: number;
}

export function RegistrarMarcoForm({ residenteId, faseAtual }: Props) {
  const [aberto, setAberto] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [fase, setFase] = useState(String(faseAtual));
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);

  function handleSalvar() {
    if (!descricao.trim()) return;
    // Em produção: chamar server action
    setSalvo(true);
    setTimeout(() => {
      setSalvo(false);
      setAberto(false);
      setDescricao("");
    }, 2000);
  }

  if (salvo) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <CheckCircle2 className="size-4 shrink-0" />
        Marco registrado! (conecte o banco para persistir)
      </div>
    );
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-colors min-h-[44px]"
      >
        <Plus className="size-4" />
        Registrar marco
      </button>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-blue-900">Novo marco de evolução</p>
        <button type="button" onClick={() => setAberto(false)} className="text-blue-400 hover:text-blue-700">
          <X className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Data</label>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)}
            className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Fase</label>
          <select value={fase} onChange={(e) => setFase(e.target.value)}
            className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="1">Fase 1 — Acolhimento</option>
            <option value="2">Fase 2 — Reorganização</option>
            <option value="3">Fase 3 — Autonomia</option>
            <option value="4">Fase 4 — Preparação</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Descrição do marco <span className="text-red-500">*</span></label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={3}
          placeholder="Descreva a conquista ou evento relevante para a evolução do acolhido…"
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={handleSalvar} disabled={!descricao.trim()}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed">
          Salvar marco
        </button>
        <button type="button" onClick={() => setAberto(false)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors min-h-[44px]">
          Cancelar
        </button>
      </div>
    </div>
  );
}
