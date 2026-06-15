"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { getMockResidentes } from "@/lib/mock-data";

const GRAVIDADES = [
  { value: "leve",       label: "Leve",       desc: "Situação de baixo impacto, sem risco à integridade" },
  { value: "moderada",   label: "Moderada",   desc: "Situação que requer atenção e registro formal" },
  { value: "grave",      label: "Grave",       desc: "Situação de risco ou violação de normas sérias" },
  { value: "gravissima", label: "Gravíssima", desc: "Risco à vida, violência física ou ameaça grave" },
];

export default function NovaOcorrenciaPage() {
  const residentes = getMockResidentes("ativo");
  const [gravidade, setGravidade] = useState("moderada");
  const [enviado, setEnviado] = useState(false);

  if (enviado) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <Send className="size-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Ocorrência registrada</h2>
        <p className="text-sm text-gray-600">
          A coordenação foi notificada. A ocorrência aparece na lista para avaliação.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link
            href="/painel/ocorrencias"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-muted px-5 py-2.5 text-sm font-medium hover:bg-muted/80 transition-colors min-h-[44px]"
          >
            Ver ocorrências
          </Link>
          <button
            onClick={() => setEnviado(false)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-sm font-medium text-white hover:bg-destructive/90 transition-colors min-h-[44px]"
          >
            Registrar outra
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Voltar */}
      <Link
        href="/painel/ocorrencias"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Ocorrências
      </Link>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Nova Ocorrência</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Preencha com cuidado — registro com validade no prontuário
        </p>
      </div>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          // Em dev: apenas simula o envio
          setEnviado(true);
        }}
      >
        {/* Acolhido */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
          <h2 className="font-semibold text-gray-900">Acolhido envolvido</h2>
          <div>
            <label htmlFor="residente_id" className="block text-sm font-medium text-gray-700 mb-1.5">
              Acolhido <span className="text-red-500">*</span>
            </label>
            <select
              id="residente_id"
              name="residente_id"
              required
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Selecionar acolhido…</option>
              {residentes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nome_social ?? r.nome_completo} — {r.numero_prontuario}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dados da ocorrência */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
          <h2 className="font-semibold text-gray-900">Dados da ocorrência</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="data_ocorrencia" className="block text-sm font-medium text-gray-700 mb-1.5">
                Data e hora <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="data_ocorrencia"
                name="data_ocorrencia"
                required
                defaultValue={new Date().toISOString().slice(0, 16)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="local" className="block text-sm font-medium text-gray-700 mb-1.5">
                Local
              </label>
              <input
                type="text"
                id="local"
                name="local"
                placeholder="Ex: Refeitório, Dormitório 2..."
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Gravidade */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Gravidade <span className="text-red-500">*</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GRAVIDADES.map((g) => (
                <label
                  key={g.value}
                  className={`flex flex-col gap-1 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    gravidade === g.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="gravidade"
                    value={g.value}
                    checked={gravidade === g.value}
                    onChange={() => setGravidade(g.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-semibold text-gray-900">{g.label}</span>
                  <span className="text-xs text-muted-foreground leading-tight">{g.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Testemunhas */}
          <div>
            <label htmlFor="testemunhas" className="block text-sm font-medium text-gray-700 mb-1.5">
              Testemunhas
            </label>
            <input
              type="text"
              id="testemunhas"
              name="testemunhas"
              placeholder="Nomes das pessoas presentes..."
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1.5">
              Descrição da ocorrência <span className="text-red-500">*</span>
            </label>
            <textarea
              id="descricao"
              name="descricao"
              required
              rows={5}
              placeholder="Descreva o que aconteceu, quando, e as circunstâncias..."
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Providências */}
          <div>
            <label htmlFor="providencias" className="block text-sm font-medium text-gray-700 mb-1.5">
              Providências já tomadas
            </label>
            <textarea
              id="providencias"
              name="providencias"
              rows={3}
              placeholder="Medidas adotadas imediatamente pelo cuidador/técnico..."
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </div>

        {/* Nota de gravíssima */}
        {gravidade === "gravissima" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-sm font-semibold text-red-800 mb-1">
              Ocorrência gravíssima — ação imediata requerida
            </p>
            <p className="text-sm text-red-700">
              Ao salvar, a coordenação será notificada imediatamente. Se houver risco de vida, acione o SAMU (192) ou Polícia (190) antes de registrar.
            </p>
          </div>
        )}

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-destructive px-6 py-3 text-sm font-semibold text-white hover:bg-destructive/90 transition-colors min-h-[48px]"
          >
            <Send className="size-4" />
            Registrar ocorrência
          </button>
          <Link
            href="/painel/ocorrencias"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[48px]"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
