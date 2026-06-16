"use client";

import { useState } from "react";
import { Plus, CheckCircle2, X } from "lucide-react";

export function RegistrarContatoForm({ residenteId }: { residenteId: string }) {
  const [aberto, setAberto] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("Visita presencial");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);

  function handleSalvar() {
    if (!descricao.trim()) return;
    void residenteId;
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
        Contato registrado! (conecte o banco para persistir)
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
        Registrar contato familiar
      </button>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-blue-900">Novo contato com familiar</p>
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
          <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de contato</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}
            className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option>Visita presencial</option>
            <option>Ligação telefônica</option>
            <option>Mensagem / WhatsApp</option>
            <option>Carta</option>
            <option>Contato negado</option>
            <option>Tentativa sem resposta</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Relato do contato <span className="text-red-500">*</span></label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={4}
          placeholder="Descreva o que foi discutido, quem participou e os encaminhamentos…"
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={handleSalvar} disabled={!descricao.trim()}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed">
          Salvar contato
        </button>
        <button type="button" onClick={() => setAberto(false)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors min-h-[44px]">
          Cancelar
        </button>
      </div>
    </div>
  );
}
