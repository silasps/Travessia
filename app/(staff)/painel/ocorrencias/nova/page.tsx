"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Send, AlertTriangle, MapPin, Clock,
  Users as UsersIcon, FileText, Loader2, CheckCircle2, ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { criarOcorrencia } from "@/lib/actions/prontuario";
import { getMockResidentes } from "@/lib/mock-data";
import { SelecionarResidente } from "@/components/residentes/selecionar-residente";

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

const GRAVIDADES = [
  { value: "leve",       label: "Leve",       desc: "Baixo impacto, sem risco à integridade",           color: "border-yellow-400 bg-yellow-50 text-yellow-800",  dot: "bg-yellow-500" },
  { value: "moderada",   label: "Moderada",   desc: "Requer atenção e registro formal",                 color: "border-orange-400 bg-orange-50 text-orange-800",  dot: "bg-orange-500" },
  { value: "grave",      label: "Grave",      desc: "Risco ou violação de normas sérias",               color: "border-red-400 bg-red-50 text-red-800",            dot: "bg-red-500" },
  { value: "gravissima", label: "Gravíssima", desc: "Risco à vida, violência física ou ameaça grave",   color: "border-red-600 bg-red-100 text-red-900",           dot: "bg-red-700" },
];

type ResidenteOpt = { id: string; nome_completo: string; nome_social?: string | null; numero_prontuario: string };

const inputCls = "w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-shadow";
const textareaCls = "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none transition-shadow";
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";
const hintCls = "text-xs text-muted-foreground mt-1";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className={hintCls}>{hint}</p>}
    </div>
  );
}

export default function NovaOcorrenciaPage() {
  const [residentes, setResidentes] = useState<ResidenteOpt[]>(DEV_MODE ? getMockResidentes("ativo") : []);
  const [gravidade, setGravidade] = useState("moderada");
  const [enviado, setEnviado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (DEV_MODE) return;
    const supabase = createClient();
    supabase
      .from("residentes")
      .select("id, nome_completo, nome_social, numero_prontuario")
      .eq("status", "ativo")
      .order("nome_completo")
      .then(({ data }) => {
        if (data) setResidentes(data);
      });
  }, []);

  if (enviado) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="size-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Ocorrência registrada</h2>
        <p className="text-sm text-gray-600">
          A coordenação foi notificada. A ocorrência aparece na lista para avaliação.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link
            href="/painel/ocorrencias"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 transition-colors min-h-[44px]"
          >
            Ver ocorrências
          </Link>
          <button
            onClick={() => { setEnviado(false); setGravidade("moderada"); }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors min-h-[44px]"
          >
            Registrar outra
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const residenteId = fd.get("residente_id") as string;
    const dataOcorrencia = fd.get("data_ocorrencia") as string;
    const descricao = fd.get("descricao") as string;
    const local = (fd.get("local") as string) || undefined;
    const testemunhas = (fd.get("testemunhas") as string) || undefined;

    if (!residenteId) { toast.error("Selecione o acolhido envolvido."); return; }

    if (DEV_MODE) { setEnviado(true); return; }

    setSalvando(true);
    const res = await criarOcorrencia({
      residenteId,
      dataOcorrencia,
      gravidade: gravidade as "leve" | "moderada" | "grave" | "gravissima",
      descricao,
      local,
      testemunhas,
    });
    setSalvando(false);
    if ("error" in res) { toast.error(res.error); return; }
    toast.success("Ocorrência registrada com sucesso.");
    setEnviado(true);
    router.refresh();
  }

  const gravidadeSelecionada = GRAVIDADES.find((g) => g.value === gravidade)!;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <Link
            href="/painel/ocorrencias"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeft className="size-4" />
            Ocorrências
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Nova Ocorrência</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Preencha com cuidado — registro com validade no prontuário
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">

        {/* Seção 1: Acolhido */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <UsersIcon className="size-4.5 text-blue-700" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Acolhido envolvido</h2>
              <p className="text-xs text-muted-foreground">Selecione quem está envolvido na ocorrência</p>
            </div>
          </div>
          <SelecionarResidente residentes={residentes} name="residente_id" />
        </div>

        {/* Seção 2: Quando e onde */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
              <Clock className="size-4.5 text-sky-700" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Quando e onde</h2>
              <p className="text-xs text-muted-foreground">Registre data, hora e local da ocorrência</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Data e hora" required>
              <input
                type="datetime-local"
                name="data_ocorrencia"
                required
                defaultValue={new Date().toISOString().slice(0, 16)}
                className={inputCls}
              />
            </Field>
            <Field label="Local" hint="Onde a ocorrência aconteceu">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                <input
                  type="text"
                  name="local"
                  placeholder="Ex: Refeitório, Dormitório 2..."
                  className={`${inputCls} pl-9`}
                />
              </div>
            </Field>
          </div>
        </div>

        {/* Seção 3: Gravidade */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-4.5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Nível de gravidade</h2>
              <p className="text-xs text-muted-foreground">Classifique a gravidade da ocorrência</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {GRAVIDADES.map((g) => (
              <label
                key={g.value}
                className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  gravidade === g.value
                    ? g.color
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="_gravidade"
                  value={g.value}
                  checked={gravidade === g.value}
                  onChange={() => setGravidade(g.value)}
                  className="sr-only"
                />
                <div className={`size-3 rounded-full mt-1 shrink-0 ${gravidade === g.value ? g.dot : "bg-gray-300"}`} />
                <div>
                  <p className="text-sm font-semibold">{g.label}</p>
                  <p className="text-xs leading-relaxed mt-0.5 opacity-80">{g.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Alerta gravíssima */}
        {gravidade === "gravissima" && (
          <div className="flex items-start gap-3 bg-red-50 border-2 border-red-300 rounded-2xl p-4">
            <ShieldAlert className="size-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                Ação imediata requerida
              </p>
              <p className="text-sm text-red-700 mt-0.5">
                Se houver risco de vida, acione o <strong>SAMU (192)</strong> ou <strong>Polícia (190)</strong> antes de registrar no sistema.
              </p>
            </div>
          </div>
        )}

        {/* Seção 4: Relato */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <FileText className="size-4.5 text-purple-700" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Relato da ocorrência</h2>
              <p className="text-xs text-muted-foreground">Descreva os fatos com o máximo de detalhes</p>
            </div>
          </div>

          <Field label="Testemunhas" hint="Nomes de quem presenciou ou pode corroborar o relato">
            <input
              type="text"
              name="testemunhas"
              placeholder="Ex: João (cuidador noturno), Carlos (acolhido Q3)"
              className={inputCls}
            />
          </Field>

          <Field label="Descrição da ocorrência" required hint="Relate o que aconteceu, como e em que circunstâncias">
            <textarea
              name="descricao"
              required
              rows={5}
              placeholder="Descreva cronologicamente o que aconteceu, incluindo o contexto, as pessoas envolvidas e as ações tomadas..."
              className={textareaCls}
            />
          </Field>

          <Field label="Providências já tomadas" hint="Medidas adotadas imediatamente após a ocorrência">
            <textarea
              name="providencias"
              rows={3}
              placeholder="Ex: Acolhido orientado sobre as normas; situação mediada pelo cuidador; acionado técnico de plantão..."
              className={textareaCls}
            />
          </Field>
        </div>

        {/* Botões */}
        <div className="flex items-center gap-3">
          <Link
            href="/painel/ocorrencias"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[48px]"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={salvando}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white hover:bg-red-800 transition-colors min-h-[48px] disabled:opacity-50"
          >
            {salvando ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {salvando ? "Registrando…" : "Registrar ocorrência"}
          </button>
        </div>
      </form>
    </div>
  );
}
