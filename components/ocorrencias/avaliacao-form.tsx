"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ClipboardCheck, AlertOctagon, CheckCircle2, XCircle, Clock,
  Loader2, ShieldAlert,
} from "lucide-react";
import { avaliarOcorrencia } from "@/lib/actions/prontuario";

const DECISOES = [
  { value: "em_avaliacao", label: "Colocar em avaliação", desc: "Precisa de mais investigação antes de decidir", icon: Clock, color: "border-amber-400 bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  { value: "confirmada",  label: "Confirmar ocorrência", desc: "Fato confirmado — pode gerar consequências", icon: CheckCircle2, color: "border-green-400 bg-green-50 text-green-800", dot: "bg-green-500" },
  { value: "improcedente", label: "Marcar como improcedente", desc: "Relato não se confirmou ou não procede", icon: XCircle, color: "border-gray-400 bg-gray-50 text-gray-700", dot: "bg-gray-400" },
] as const;

const TIPOS_ADVERTENCIA = [
  { value: "verbal",    label: "Verbal",    desc: "Orientação verbal registrada" },
  { value: "escrita",   label: "Escrita",   desc: "Advertência formal por escrito" },
  { value: "suspensao", label: "Suspensão", desc: "Suspensão temporária de atividades" },
] as const;

const MOTIVOS_ADVERTENCIA = [
  "Descumprimento de horário",
  "Barulho excessivo no dormitório",
  "Uso de linguagem agressiva",
  "Desobediência às normas da casa",
  "Porte ou uso de substâncias proibidas",
  "Conflito com outro acolhido",
  "Dano ao patrimônio",
  "Ausência não justificada",
  "Outros",
];

export function AvaliacaoForm({ ocorrenciaId }: { ocorrenciaId: string }) {
  const [decisao, setDecisao] = useState<"em_avaliacao" | "confirmada" | "improcedente" | "">("");
  const [parecer, setParecer] = useState("");
  const [gerarAdv, setGerarAdv] = useState(false);
  const [tipoAdv, setTipoAdv] = useState<"verbal" | "escrita" | "suspensao">("verbal");
  const [motivoAdv, setMotivoAdv] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!decisao) { toast.error("Selecione a decisão."); return; }
    if (!parecer.trim()) { toast.error("Preencha o parecer da avaliação."); return; }
    if (gerarAdv && !motivoAdv) { toast.error("Selecione o motivo da advertência."); return; }

    setLoading(true);
    const res = await avaliarOcorrencia({
      ocorrenciaId,
      decisao,
      parecer,
      gerarAdvertencia: gerarAdv && decisao === "confirmada" ? { tipo: tipoAdv, motivo: motivoAdv } : undefined,
    });
    setLoading(false);

    if ("error" in res) { toast.error(res.error); return; }
    toast.success("Avaliação registrada com sucesso.");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-amber-200 overflow-hidden">
      {/* Header */}
      <div className="bg-amber-50 px-5 py-4 border-b border-amber-200">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <ClipboardCheck className="size-4.5 text-amber-700" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-amber-900">Avaliar esta ocorrência</h2>
            <p className="text-xs text-amber-700">Apenas coordenação ou superior pode avaliar</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        {/* Decisão */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Decisão <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {DECISOES.map((d) => {
              const Icon = d.icon;
              return (
                <label
                  key={d.value}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    decisao === d.value ? d.color : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    checked={decisao === d.value}
                    onChange={() => {
                      setDecisao(d.value);
                      if (d.value !== "confirmada") setGerarAdv(false);
                    }}
                    className="sr-only"
                  />
                  <div className={`size-3 rounded-full mt-1.5 shrink-0 ${decisao === d.value ? d.dot : "bg-gray-300"}`} />
                  <Icon className={`size-4 mt-0.5 shrink-0 ${decisao === d.value ? "" : "text-gray-400"}`} />
                  <div>
                    <p className="text-sm font-semibold">{d.label}</p>
                    <p className="text-xs mt-0.5 opacity-75">{d.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Parecer */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Parecer da coordenação <span className="text-red-500">*</span>
          </label>
          <textarea
            value={parecer}
            onChange={(e) => setParecer(e.target.value)}
            rows={4}
            required
            placeholder="Descreva a análise dos fatos, a decisão tomada e eventuais providências..."
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none transition-shadow"
          />
          <p className="text-xs text-muted-foreground">Este parecer ficará registrado permanentemente no prontuário do acolhido.</p>
        </div>

        {/* Gerar advertência — só aparece quando confirma */}
        {decisao === "confirmada" && (
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={gerarAdv}
                onChange={(e) => setGerarAdv(e.target.checked)}
                className="size-4 rounded border-gray-300 text-orange-600 mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                  <AlertOctagon className="size-4 text-orange-500" />
                  Gerar advertência vinculada a esta ocorrência
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Uma advertência será registrada automaticamente no prontuário do acolhido.
                </p>
              </div>
            </label>

            {gerarAdv && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="size-4 text-orange-600" />
                  <p className="text-sm font-semibold text-orange-900">Detalhes da advertência</p>
                </div>

                {/* Tipo */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Tipo de advertência</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIPOS_ADVERTENCIA.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setTipoAdv(t.value)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 text-center transition-colors ${
                          tipoAdv === t.value
                            ? t.value === "suspensao"
                              ? "border-red-400 bg-red-50 text-red-800"
                              : t.value === "escrita"
                              ? "border-orange-400 bg-orange-100 text-orange-800"
                              : "border-yellow-400 bg-yellow-50 text-yellow-800"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-xs font-semibold">{t.label}</span>
                        <span className="text-[10px] leading-tight opacity-75">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Motivo */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Motivo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={motivoAdv}
                    onChange={(e) => setMotivoAdv(e.target.value)}
                    required={gerarAdv}
                    className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Selecione o motivo...</option>
                    {MOTIVOS_ADVERTENCIA.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botão */}
        <button
          type="submit"
          disabled={loading || !decisao}
          className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-xl bg-amber-700 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-800 transition-colors min-h-[48px] disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <ClipboardCheck className="size-4" />}
          {loading ? "Salvando…" : "Registrar avaliação"}
        </button>
      </form>
    </div>
  );
}
