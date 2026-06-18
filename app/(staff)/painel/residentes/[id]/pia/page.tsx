"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Save, FileText, Heart, Target, Users, Activity,
  BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { getMockResidente, getMockPia } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { salvarPIA } from "@/lib/actions/prontuario";

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

type Secao = "identificacao" | "historico" | "saude" | "objetivos" | "plano" | "rede";

const SECOES: { id: Secao; label: string; shortLabel: string; icon: typeof FileText }[] = [
  { id: "identificacao", label: "Identificação complementar", shortLabel: "Identificação", icon: FileText },
  { id: "historico",     label: "Histórico de vida",          shortLabel: "Histórico",      icon: BookOpen },
  { id: "saude",         label: "Saúde",                      shortLabel: "Saúde",           icon: Heart },
  { id: "objetivos",     label: "Objetivos e metas",          shortLabel: "Objetivos",       icon: Target },
  { id: "plano",         label: "Plano de ação",              shortLabel: "Plano",           icon: Activity },
  { id: "rede",          label: "Rede de apoio",              shortLabel: "Rede",            icon: Users },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PiaData = any;

const inputCls = "w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-shadow";
const textareaCls = "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none transition-shadow";
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";
const hintCls = "text-xs text-muted-foreground mt-1";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {hint && <p className={hintCls}>{hint}</p>}
    </div>
  );
}

export default function PiaPage() {
  const { id } = useParams<{ id: string }>();
  const [nomeExibido, setNomeExibido] = useState<string | null>(null);
  const [prontuario, setProntuario] = useState("");
  const [pia, setPia] = useState<PiaData>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [secaoAtiva, setSecaoAtiva] = useState<Secao>("identificacao");
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (DEV_MODE) {
      const r = getMockResidente(id);
      setNomeExibido(r ? (r.nome_social ?? r.nome_completo) : null);
      setProntuario(r?.numero_prontuario ?? "");
      setPia(getMockPia(id));
      setLoaded(true);
      return;
    }
    const supabase = createClient();
    Promise.all([
      supabase.from("residentes").select("nome_completo, nome_social, numero_prontuario").eq("id", id).maybeSingle(),
      supabase.from("pia").select("*").eq("residente_id", id).maybeSingle(),
    ]).then(([{ data: r }, { data: p }]) => {
      setNomeExibido(r ? (r.nome_social ?? r.nome_completo) : null);
      setProntuario(r?.numero_prontuario ?? "");
      setPia(p ?? undefined);
      setLoaded(true);
    });
  }, [id]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Carregando PIA...</span>
      </div>
    );
  }
  if (!nomeExibido) return <p className="text-muted-foreground p-4">Acolhido não encontrado.</p>;

  const secaoIdx = SECOES.findIndex((s) => s.id === secaoAtiva);
  const isUltima = secaoIdx === SECOES.length - 1;
  const isPrimeira = secaoIdx === 0;

  async function handleSalvar() {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const g = (k: string) => (fd.get(k) as string) ?? "";
    const lines = (k: string) => g(k).split("\n").map((l) => l.trim()).filter(Boolean);

    if (DEV_MODE) { setSalvo(true); return; }

    setSalvando(true);
    const res = await salvarPIA({
      residenteId: id,
      secaoIdentificacao: { naturalidade: g("id_naturalidade"), situacao_civil: g("id_situacao_civil"), escolaridade: g("id_escolaridade"), profissao_anterior: g("id_profissao") },
      secaoHistorico: { historico_rua: g("hist_rua"), situacoes_vulnerabilidade: g("hist_vulnerabilidade"), historico_violencia: g("hist_violencia") },
      secaoSaude: { condicoes_cronicas: g("saude_cronicas"), medicamentos: g("saude_medicamentos"), tratamento_saude_mental: g("saude_mental"), uso_substancias: g("saude_substancias") },
      secaoObjetivos: { objetivo_principal: g("obj_principal"), metas_curto_prazo: lines("obj_curto"), metas_medio_prazo: lines("obj_medio"), metas_longo_prazo: lines("obj_longo") },
      secaoPlano: { acoes: lines("plano_acoes") },
      secaoRede: { rede_familiar: g("rede_familiar"), rede_institucional: g("rede_institucional"), rede_comunitaria: g("rede_comunitaria") },
      observacoesGerais: g("obs_gerais"),
    });
    setSalvando(false);
    if ("error" in res) { toast.error(res.error); return; }
    toast.success("PIA salvo com sucesso!");
    setSalvo(true);
    router.refresh();
  }

  if (salvo) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="size-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">PIA salvo</h2>
        <p className="text-sm text-gray-600">O Plano Individual de Atendimento foi registrado com sucesso.</p>
        <Link
          href={`/painel/residentes/${id}?aba=pia`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 transition-colors min-h-[44px] mt-4"
        >
          Ver PIA no prontuário
        </Link>
      </div>
    );
  }

  const SecaoIcon = SECOES[secaoIdx].icon;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <Link
            href={`/painel/residentes/${id}?aba=pia`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeft className="size-4" />
            Prontuário
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{nomeExibido}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground font-mono">{prontuario}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pia ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
              {pia ? "Editando PIA" : "Novo PIA"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSalvar}
          disabled={salvando}
          className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 transition-colors min-h-[44px] disabled:opacity-50 shrink-0"
        >
          {salvando ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {salvando ? "Salvando…" : "Salvar PIA"}
        </button>
      </div>

      {/* Navegação de seções — horizontal com scroll */}
      <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex gap-1 overflow-x-auto scrollbar-none">
        {SECOES.map((s, i) => {
          const Icon = s.icon;
          const isActive = s.id === secaoAtiva;
          const isPast = i < secaoIdx;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSecaoAtiva(s.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors min-w-0 ${
                isActive
                  ? "bg-blue-700 text-white shadow-sm"
                  : isPast
                  ? "text-blue-700 bg-blue-50 hover:bg-blue-100"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              <span className="hidden sm:inline">{s.shortLabel}</span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Cabeçalho da seção atual */}
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <SecaoIcon className="size-5 text-blue-700" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900">{SECOES[secaoIdx].label}</p>
          <p className="text-xs text-muted-foreground">Seção {secaoIdx + 1} de {SECOES.length}</p>
        </div>
      </div>

      {/* ─── FORMULÁRIO ─── */}
      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">

          {secaoAtiva === "identificacao" && (
            <>
              <Field label="Naturalidade">
                <input type="text" name="id_naturalidade" defaultValue={pia?.secao_identificacao?.naturalidade as string ?? ""}
                  placeholder="Cidade/UF" className={inputCls} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Situação civil">
                  <select name="id_situacao_civil" defaultValue={pia?.secao_identificacao?.situacao_civil as string ?? ""} className={inputCls}>
                    <option value="">Selecionar…</option>
                    <option value="solteiro">Solteiro(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viuvo">Viúvo(a)</option>
                    <option value="uniao_estavel">União estável</option>
                  </select>
                </Field>
                <Field label="Escolaridade">
                  <select name="id_escolaridade" defaultValue={pia?.secao_identificacao?.escolaridade as string ?? ""} className={inputCls}>
                    <option value="">Selecionar…</option>
                    <option value="Sem escolaridade">Sem escolaridade</option>
                    <option value="Ensino Fundamental Incompleto">Fund. incompleto</option>
                    <option value="Ensino Fundamental Completo">Fund. completo</option>
                    <option value="Ensino Médio Incompleto">Médio incompleto</option>
                    <option value="Ensino Médio Completo">Médio completo</option>
                    <option value="Ensino Superior Incompleto">Superior incompleto</option>
                    <option value="Ensino Superior Completo">Superior completo</option>
                  </select>
                </Field>
              </div>
              <Field label="Profissão / ocupação anterior" hint="Última ocupação antes da situação de rua">
                <input type="text" name="id_profissao" defaultValue={pia?.secao_identificacao?.profissao_anterior as string ?? ""}
                  placeholder="Ex: Pedreiro, Auxiliar de cozinha..." className={inputCls} />
              </Field>
            </>
          )}

          {secaoAtiva === "historico" && (
            <>
              <Field label="Histórico da situação de rua" hint="Trajetória, eventos relevantes, como chegou à situação atual">
                <textarea name="hist_rua" rows={4} defaultValue={pia?.secao_historico_vida?.historico_rua as string ?? ""}
                  placeholder="Descreva a trajetória do acolhido…" className={textareaCls} />
              </Field>
              <Field label="Situações de vulnerabilidade identificadas" hint="Separe por vírgula ou escreva livremente">
                <textarea name="hist_vulnerabilidade" rows={3} defaultValue={(pia?.secao_historico_vida?.situacoes_vulnerabilidade as string[])?.join(", ") ?? ""}
                  placeholder="Ex: dependência química, desemprego prolongado, rompimento familiar…" className={textareaCls} />
              </Field>
              <Field label="Histórico de violência" hint="Registrar apenas com consentimento do acolhido">
                <textarea name="hist_violencia" rows={2} defaultValue={pia?.secao_historico_vida?.historico_violencia as string ?? ""}
                  placeholder="Vitimização, violência sofrida ou praticada…" className={textareaCls} />
              </Field>
            </>
          )}

          {secaoAtiva === "saude" && (
            <>
              <Field label="Condições de saúde crônicas">
                <input type="text" name="saude_cronicas" defaultValue={pia?.secao_saude?.condicoes_cronicas as string ?? ""}
                  placeholder="Hipertensão, diabetes, epilepsia, etc." className={inputCls} />
              </Field>
              <Field label="Medicamentos em uso" hint="Nome, dose e frequência">
                <input type="text" name="saude_medicamentos" defaultValue={pia?.secao_saude?.medicamentos as string ?? ""}
                  placeholder="Ex: Losartana 50mg 1x/dia" className={inputCls} />
              </Field>
              <Field label="Tratamento de saúde mental">
                <input type="text" name="saude_mental" defaultValue={pia?.secao_saude?.tratamento_saude_mental as string ?? ""}
                  placeholder="CAPS, psiquiatra, psicólogo, etc." className={inputCls} />
              </Field>
              <Field label="Uso de substâncias psicoativas">
                <input type="text" name="saude_substancias" defaultValue={pia?.secao_saude?.uso_substancias as string ?? ""}
                  placeholder="Álcool, crack, múltiplas, em remissão, etc." className={inputCls} />
              </Field>
            </>
          )}

          {secaoAtiva === "objetivos" && (
            <>
              <Field label="Objetivo principal do acolhimento" hint="O que o acolhido quer alcançar ao final do programa">
                <input type="text" name="obj_principal" defaultValue={pia?.secao_objetivos?.objetivo_principal as string ?? ""}
                  placeholder="Ex: Conseguir emprego e moradia própria" className={inputCls} />
              </Field>
              <Field label="Metas de curto prazo (até 3 meses)" hint="Uma meta por linha">
                <textarea name="obj_curto" rows={3} defaultValue={(pia?.secao_objetivos?.metas_curto_prazo as string[])?.join("\n") ?? ""}
                  placeholder="Regularizar documentos&#10;Iniciar tratamento no CAPS&#10;Participar de oficinas" className={textareaCls} />
              </Field>
              <Field label="Metas de médio prazo (3–6 meses)" hint="Uma meta por linha">
                <textarea name="obj_medio" rows={3} defaultValue={(pia?.secao_objetivos?.metas_medio_prazo as string[])?.join("\n") ?? ""}
                  placeholder="Concluir curso profissionalizante&#10;Reaproximação familiar" className={textareaCls} />
              </Field>
              <Field label="Metas de longo prazo (6+ meses)" hint="Uma meta por linha">
                <textarea name="obj_longo" rows={3} defaultValue={(pia?.secao_objetivos?.metas_longo_prazo as string[])?.join("\n") ?? ""}
                  placeholder="Emprego formal&#10;Moradia independente" className={textareaCls} />
              </Field>
            </>
          )}

          {secaoAtiva === "plano" && (
            <Field label="Ações previstas no plano de atendimento" hint="Uma ação por linha. Inclua responsável e prazo quando possível.">
              <textarea name="plano_acoes" rows={8} defaultValue={(pia?.secao_plano_acao?.acoes as string[])?.join("\n") ?? ""}
                placeholder="Acompanhamento semanal no CAPS&#10;Busca de emprego via SINE — responsável: técnico&#10;Curso de informática básica — início em 2 semanas&#10;Visita familiar mensal supervisionada" className={textareaCls} />
            </Field>
          )}

          {secaoAtiva === "rede" && (
            <>
              <Field label="Rede familiar" hint="Vínculos ativos, situação do relacionamento">
                <textarea name="rede_familiar" rows={2} defaultValue={pia?.secao_rede_apoio?.rede_familiar as string ?? ""}
                  placeholder="Mãe em Ribeirão Preto, contato esporádico…" className={textareaCls} />
              </Field>
              <Field label="Rede institucional" hint="Serviços públicos e organizações que acompanham">
                <textarea name="rede_institucional" rows={2} defaultValue={pia?.secao_rede_apoio?.rede_institucional as string ?? ""}
                  placeholder="CAPS III Centro, CRAS Norte, UBS Vila…" className={textareaCls} />
              </Field>
              <Field label="Rede comunitária">
                <textarea name="rede_comunitaria" rows={2} defaultValue={pia?.secao_rede_apoio?.rede_comunitaria as string ?? ""}
                  placeholder="Igreja, grupo de apoio, vizinhança…" className={textareaCls} />
              </Field>
              <div className="border-t border-gray-100 pt-4">
                <Field label="Observações gerais" hint="Impressões da equipe, pontos de atenção, prognóstico">
                  <textarea name="obs_gerais" rows={3} defaultValue={pia?.observacoes_gerais ?? ""}
                    placeholder="Evolução observada, riscos identificados, próximos passos…" className={textareaCls} />
                </Field>
              </div>
            </>
          )}
        </div>
      </form>

      {/* Navegação inferior */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => !isPrimeira && setSecaoAtiva(SECOES[secaoIdx - 1].id)}
          disabled={isPrimeira}
          className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-background px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[48px] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="size-4" />
          Anterior
        </button>

        <div className="flex-1 flex justify-center gap-1.5">
          {SECOES.map((s, i) => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-colors ${
                i < secaoIdx ? "w-6 bg-blue-500" :
                i === secaoIdx ? "w-8 bg-blue-700" : "w-6 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {!isUltima ? (
          <button
            type="button"
            onClick={() => setSecaoAtiva(SECOES[secaoIdx + 1].id)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors min-h-[48px]"
          >
            Próxima
            <ChevronRight className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSalvar}
            disabled={salvando}
            className="inline-flex items-center gap-1.5 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800 transition-colors min-h-[48px] disabled:opacity-50"
          >
            {salvando ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {salvando ? "Salvando…" : "Salvar PIA"}
          </button>
        )}
      </div>
    </div>
  );
}
