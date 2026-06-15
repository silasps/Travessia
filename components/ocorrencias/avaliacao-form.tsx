"use client";

import { ClipboardCheck, FileText } from "lucide-react";

export function AvaliacaoForm() {
  return (
    <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 space-y-4">
      <h2 className="font-semibold text-amber-900 flex items-center gap-2">
        <ClipboardCheck className="size-4" />
        Avaliar esta ocorrência
      </h2>
      <p className="text-sm text-amber-800">
        Apenas Coordenação ou acima pode avaliar ocorrências.
      </p>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Em desenvolvimento — conecte o banco para salvar avaliações."); }}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Decisão</label>
          <select
            name="decisao"
            className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Selecionar decisão…</option>
            <option value="em_avaliacao">Colocar em avaliação</option>
            <option value="confirmada">Confirmar ocorrência</option>
            <option value="improcedente">Marcar como improcedente</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Parecer da coordenação</label>
          <textarea
            name="parecer"
            rows={4}
            placeholder="Descreva a análise da ocorrência e a decisão tomada..."
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-xl bg-amber-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-800 transition-colors min-h-[44px]"
        >
          <FileText className="size-4" />
          Salvar avaliação
        </button>
      </form>
    </div>
  );
}
