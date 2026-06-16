"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { getMockResidente } from "@/lib/mock-data";

export default function EditarResidentePage() {
  const { id } = useParams<{ id: string }>();
  const r = getMockResidente(id);
  const [salvo, setSalvo] = useState(false);

  if (!r) return <p className="text-muted-foreground p-4">Acolhido não encontrado.</p>;

  const nomeExibido = r.nome_social ?? r.nome_completo;

  if (salvo) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="size-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Dados atualizados</h2>
        <p className="text-sm text-gray-600">As alterações foram salvas no prontuário.</p>
        <Link
          href={`/painel/residentes/${id}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 transition-colors min-h-[44px] mt-4"
        >
          Voltar ao prontuário
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Voltar */}
      <Link
        href={`/painel/residentes/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Prontuário
      </Link>

      <div>
        <p className="text-xs text-muted-foreground">Editando</p>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{nomeExibido}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{r.numero_prontuario}</p>
      </div>

      <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setSalvo(true); }}>
        {/* Identificação */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
          <h2 className="font-semibold text-gray-900">Identificação</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo</label>
            <input type="text" defaultValue={r.nome_completo} required
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome social <span className="text-xs text-muted-foreground">(opcional)</span>
            </label>
            <input type="text" defaultValue={r.nome_social ?? ""}
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Data de nascimento</label>
              <input type="date" defaultValue={r.data_nascimento ?? ""}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">CPF</label>
              <input type="text" defaultValue={r.cpf ?? ""} placeholder="000.000.000-00" maxLength={14}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">RG</label>
              <input type="text" defaultValue={r.rg ?? ""}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">NIS / CadÚnico</label>
              <input type="text" defaultValue={r.nis ?? ""}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Naturalidade</label>
            <input type="text" defaultValue={r.naturalidade ?? ""} placeholder="Cidade/UF"
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        {/* Situação no programa */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
          <h2 className="font-semibold text-gray-900">Situação no programa</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Fase atual</label>
              <select defaultValue={String(r.fase_atual)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="1">Fase 1 — Acolhimento</option>
                <option value="2">Fase 2 — Reorganização</option>
                <option value="3">Fase 3 — Autonomia</option>
                <option value="4">Fase 4 — Preparação</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select defaultValue={r.status}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="ativo">Ativo</option>
                <option value="desligado">Desligado</option>
                <option value="evadido">Evadido</option>
                <option value="transferido">Transferido</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Data de entrada</label>
            <input type="date" defaultValue={r.data_entrada}
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {(r.status === "desligado" || r.status === "evadido" || r.status === "transferido") && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Data de saída</label>
                <input type="date" defaultValue={r.data_saida ?? ""}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Motivo da saída</label>
                <textarea defaultValue={r.motivo_saida ?? ""} rows={2}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
            </>
          )}
        </div>

        {/* Situação de rua */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
          <h2 className="font-semibold text-gray-900">Situação de rua</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tempo em situação de rua <span className="text-xs text-muted-foreground">(ex: &quot;8 meses&quot;, &quot;2 anos&quot;)</span>
            </label>
            <input type="text" defaultValue={r.tempo_situacao_rua ?? ""}
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Último endereço conhecido</label>
            <input type="text" defaultValue={r.ultimo_endereco ?? ""}
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors min-h-[48px]"
          >
            <Save className="size-4" />
            Salvar alterações
          </button>
          <Link
            href={`/painel/residentes/${id}`}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[48px]"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
