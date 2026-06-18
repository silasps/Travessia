"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, FileText, Heart, Target, Users, Activity, BookOpen, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getMockResidente, getMockPia } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { salvarPIA } from "@/lib/actions/prontuario";

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

type Secao = "identificacao" | "historico" | "saude" | "objetivos" | "plano" | "rede";

const SECOES: { id: Secao; label: string; icon: React.ReactNode }[] = [
  { id: "identificacao", label: "Identificação complementar", icon: <FileText className="size-4" /> },
  { id: "historico",     label: "Histórico de vida",          icon: <BookOpen className="size-4" /> },
  { id: "saude",         label: "Saúde",                     icon: <Heart className="size-4" /> },
  { id: "objetivos",     label: "Objetivos",                  icon: <Target className="size-4" /> },
  { id: "plano",         label: "Plano de ação",              icon: <Activity className="size-4" /> },
  { id: "rede",          label: "Rede de apoio",              icon: <Users className="size-4" /> },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PiaData = any;

export default function PiaPage() {
  const { id } = useParams<{ id: string }>();
  const [nomeExibido, setNomeExibido] = useState<string | null>(null);
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
      setPia(getMockPia(id));
      setLoaded(true);
      return;
    }
    const supabase = createClient();
    Promise.all([
      supabase.from("residentes").select("nome_completo, nome_social").eq("id", id).maybeSingle(),
      supabase.from("pia").select("*").eq("residente_id", id).maybeSingle(),
    ]).then(([{ data: r }, { data: p }]) => {
      setNomeExibido(r ? (r.nome_social ?? r.nome_completo) : null);
      setPia(p ?? undefined);
      setLoaded(true);
    });
  }, [id]);

  if (!loaded) return <p className="text-muted-foreground p-4">Carregando PIA...</p>;
  if (!nomeExibido) return <p className="text-muted-foreground p-4">Acolhido não encontrado.</p>;

  const secaoIdx = SECOES.findIndex((s) => s.id === secaoAtiva);
  const isUltima = secaoIdx === SECOES.length - 1;
  const isPrimeira = secaoIdx === 0;

  function avancar() {
    if (!isUltima) setSecaoAtiva(SECOES[secaoIdx + 1].id);
  }
  function voltar() {
    if (!isPrimeira) setSecaoAtiva(SECOES[secaoIdx - 1].id);
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

  return (
    <div className="max-w-2xl space-y-5">
      {/* Voltar */}
      <Link
        href={`/painel/residentes/${id}?aba=pia`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Prontuário
      </Link>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">PIA — Plano Individual de Atendimento</p>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{nomeExibido}</h1>
        {pia && (
          <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
            Editando PIA existente
          </span>
        )}
      </div>

      {/* Progresso das seções */}
      <div className="flex gap-1">
        {SECOES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSecaoAtiva(s.id)}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              i < secaoIdx ? "bg-blue-500" :
              i === secaoIdx ? "bg-blue-700" : "bg-gray-200"
            }`}
            title={s.label}
          />
        ))}
      </div>

      {/* Header da seção */}
      <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
        {SECOES[secaoIdx].icon}
        <span>Seção {secaoIdx + 1} de {SECOES.length} — {SECOES[secaoIdx].label}</span>
      </div>

      {/* ─── SEÇÕES ─── */}
      <form ref={formRef} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4" onSubmit={(e) => e.preventDefault()}>

        {/* Identificação complementar */}
        {secaoAtiva === "identificacao" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Naturalidade</label>
              <input type="text" name="id_naturalidade" defaultValue={pia?.secao_identificacao?.naturalidade as string ?? ""}
                placeholder="Cidade/UF"
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Situação civil</label>
                <select name="id_situacao_civil" defaultValue={pia?.secao_identificacao?.situacao_civil as string ?? ""}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Selecionar…</option>
                  <option value="solteiro">Solteiro(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="divorciado">Divorciado(a)</option>
                  <option value="viuvo">Viúvo(a)</option>
                  <option value="uniao_estavel">União estável</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Escolaridade</label>
                <select name="id_escolaridade" defaultValue={pia?.secao_identificacao?.escolaridade as string ?? ""}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Selecionar…</option>
                  <option value="Sem escolaridade">Sem escolaridade</option>
                  <option value="Ensino Fundamental Incompleto">Fund. incompleto</option>
                  <option value="Ensino Fundamental Completo">Fund. completo</option>
                  <option value="Ensino Médio Incompleto">Médio incompleto</option>
                  <option value="Ensino Médio Completo">Médio completo</option>
                  <option value="Ensino Superior Incompleto">Superior incompleto</option>
                  <option value="Ensino Superior Completo">Superior completo</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Profissão / ocupação anterior</label>
              <input type="text" name="id_profissao" defaultValue={pia?.secao_identificacao?.profissao_anterior as string ?? ""}
                placeholder="Última ocupação antes da situação de rua"
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </>
        )}

        {/* Histórico de vida */}
        {secaoAtiva === "historico" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Histórico da situação de rua</label>
              <textarea name="hist_rua" rows={4} defaultValue={pia?.secao_historico_vida?.historico_rua as string ?? ""}
                placeholder="Como chegou à situação de rua, trajetória, eventos relevantes…"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Situações de vulnerabilidade identificadas</label>
              <textarea name="hist_vulnerabilidade" rows={3} defaultValue={(pia?.secao_historico_vida?.situacoes_vulnerabilidade as string[])?.join(", ") ?? ""}
                placeholder="Ex: dependência química, desemprego prolongado, violência doméstica…"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Histórico de violência</label>
              <textarea name="hist_violencia" rows={2} defaultValue={pia?.secao_historico_vida?.historico_violencia as string ?? ""}
                placeholder="Vitimização, violência sofrida ou praticada (se relevante e com consentimento)…"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
          </>
        )}

        {/* Saúde */}
        {secaoAtiva === "saude" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Condições de saúde crônicas</label>
              <input type="text" name="saude_cronicas" defaultValue={pia?.secao_saude?.condicoes_cronicas as string ?? ""}
                placeholder="Hipertensão, diabetes, epilepsia, etc."
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Medicamentos em uso</label>
              <input type="text" name="saude_medicamentos" defaultValue={pia?.secao_saude?.medicamentos as string ?? ""}
                placeholder="Nome, dose e frequência"
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tratamento de saúde mental</label>
              <input type="text" name="saude_mental" defaultValue={pia?.secao_saude?.tratamento_saude_mental as string ?? ""}
                placeholder="CAPS, psiquiatra, psicólogo, etc."
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Uso de substâncias psicoativas</label>
              <input type="text" name="saude_substancias" defaultValue={pia?.secao_saude?.uso_substancias as string ?? ""}
                placeholder="Álcool, crack, múltiplas, em remissão, etc."
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </>
        )}

        {/* Objetivos */}
        {secaoAtiva === "objetivos" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Objetivo principal do acolhimento</label>
              <input type="text" name="obj_principal" defaultValue={pia?.secao_objetivos?.objetivo_principal as string ?? ""}
                placeholder="O que o acolhido quer alcançar ao final do programa"
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Metas de curto prazo (até 3 meses)</label>
              <textarea name="obj_curto" rows={3} defaultValue={(pia?.secao_objetivos?.metas_curto_prazo as string[])?.join("\n") ?? ""}
                placeholder="Uma meta por linha"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Metas de médio prazo (3-6 meses)</label>
              <textarea name="obj_medio" rows={3} defaultValue={(pia?.secao_objetivos?.metas_medio_prazo as string[])?.join("\n") ?? ""}
                placeholder="Uma meta por linha"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Metas de longo prazo (6+ meses)</label>
              <textarea name="obj_longo" rows={3} defaultValue={(pia?.secao_objetivos?.metas_longo_prazo as string[])?.join("\n") ?? ""}
                placeholder="Uma meta por linha"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
          </>
        )}

        {/* Plano de ação */}
        {secaoAtiva === "plano" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ações previstas no plano de atendimento</label>
              <textarea name="plano_acoes" rows={6} defaultValue={(pia?.secao_plano_acao?.acoes as string[])?.join("\n") ?? ""}
                placeholder="Uma ação por linha. Ex: Acompanhamento semanal no CAPS; Busca de emprego via SINE…"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
          </>
        )}

        {/* Rede de apoio */}
        {secaoAtiva === "rede" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rede familiar</label>
              <textarea name="rede_familiar" rows={2} defaultValue={pia?.secao_rede_apoio?.rede_familiar as string ?? ""}
                placeholder="Vínculos familiares ativos e situação do relacionamento"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rede institucional</label>
              <textarea name="rede_institucional" rows={2} defaultValue={pia?.secao_rede_apoio?.rede_institucional as string ?? ""}
                placeholder="CAPS, CRAS, CREAS, serviços de saúde, assistência social…"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rede comunitária</label>
              <textarea name="rede_comunitaria" rows={2} defaultValue={pia?.secao_rede_apoio?.rede_comunitaria as string ?? ""}
                placeholder="Igrejas, grupos de apoio, vizinhança, etc."
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Observações gerais</label>
              <textarea name="obs_gerais" rows={3} defaultValue={pia?.observacoes_gerais ?? ""}
                placeholder="Impressões da equipe, pontos de atenção, evolução observada…"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
          </>
        )}
      </form>

      {/* Navegação entre seções */}
      <div className="flex gap-3">
        {!isPrimeira && (
          <button
            type="button"
            onClick={voltar}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[48px]"
          >
            Anterior
          </button>
        )}

        {!isUltima ? (
          <button
            type="button"
            onClick={avancar}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors min-h-[48px]"
          >
            Próxima seção
          </button>
        ) : (
          <button
            type="button"
            disabled={salvando}
            onClick={async () => {
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
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 transition-colors min-h-[48px] disabled:opacity-50"
          >
            <Save className="size-4" />
            {salvando ? "Salvando…" : "Salvar PIA"}
          </button>
        )}
      </div>
    </div>
  );
}
