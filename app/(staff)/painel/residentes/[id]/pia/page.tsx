"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Save, FileText, Plus, Trash2,
  CheckCircle2, ClipboardList, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { getMockResidente, getMockPia } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { salvarPIA } from "@/lib/actions/prontuario";

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

// ─── Types ────────────────────────────────────────────────────────────────────

type Etapa = "etapa1" | "etapa6";
type SecaoEtapa1 =
  | "identificacao"
  | "procedencia"
  | "rede_familiar"
  | "programas_sociais"
  | "rede_servicos"
  | "situacoes";

interface MembroFamilia {
  nome: string;
  vinculo: string;
  idade: string;
  orientacao_sexual: string;
  deficiente: string;
  endereco: string;
  telefone: string;
}

interface SituacaoItem {
  quem: string;
  situacao: string;
  localidade: string;
}

interface RegistroAcompanhamento {
  data: string;
  descricao: string;
  tecnico: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SECOES_ETAPA1: { id: SecaoEtapa1; label: string; numero: string }[] = [
  { id: "identificacao",     label: "Dados de Identificação",               numero: "1" },
  { id: "procedencia",       label: "Procedência",                           numero: "2" },
  { id: "rede_familiar",     label: "Rede Familiar e/ou Apoio",             numero: "3" },
  { id: "programas_sociais", label: "Programas Sociais",                    numero: "4" },
  { id: "rede_servicos",     label: "Rede de Serviços Socioassistenciais",  numero: "5" },
  { id: "situacoes",         label: "Situações Específicas",                numero: "6" },
];

const FORMAS_ACESSO = [
  "Procura Espontânea", "Busca Ativa", "CRAS", "CREAS",
  "Abordagem Social", "Casa de Convivência", "Conselho de Direitos",
  "Casa de Passagem", "Defensoria Pública", "Ministério Público",
  "Saúde", "Centro POP", "Entidades da rede Socioassistencial",
];

const DOCS_ENCAMINHAMENTO = [
  "Relatório Informativo", "Nenhum", "Boletim de Ocorrência", "PAF", "PDI", "PIA",
];

const BENEFICIOS_RENDA = [
  { id: "bolsa_familia", label: "Bolsa Família" },
  { id: "renda_cidada",  label: "Renda Cidadã" },
  { id: "renda_minima",  label: "Renda Mínima" },
  { id: "bpc",           label: "BPC Idoso/Deficiente" },
];

const BENEFICIOS_EVENTUAIS = [
  "Cesta Básica", "Cesta Verde", "Aluguel Social",
  "Vale-transporte para tratamento da Saúde", "Auxílio Emergencial",
];

const SERVICOS_BASICA = [
  "PAIF",
  "Convivência e Fortalecimento de Vínculos",
  "No domicílio para pessoas com deficiência e/ou idosa",
];

const SERVICOS_MEDIA = [
  "PAEFI",
  "Abordagem Social",
  "Para Idosos, Pessoas com Deficiência e suas famílias",
];

const SERVICOS_ALTA = [
  "Acolhimento Institucional",
  "Casa Lar",
  "Proteção em situação de Calamidades Públicas e de Emergência",
  "Centro acolhida",
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputCls =
  "w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const selectCls =
  "w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none";
const textareaCls =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none";
const inputSmCls =
  "h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

// ─── Small components ─────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
    </label>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3">
      {children}
    </p>
  );
}

function CheckboxOption({
  label, checked, onChange,
}: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div className={`size-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        checked ? "bg-blue-700 border-blue-700" : "border-gray-300 group-hover:border-blue-400"
      }`}>
        {checked && (
          <svg className="size-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

function RadioOption({
  label, checked, onChange,
}: {
  label: string; checked: boolean; onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div className={`size-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        checked ? "border-blue-700" : "border-gray-300 group-hover:border-blue-400"
      }`}>
        {checked && <div className="size-2.5 rounded-full bg-blue-700" />}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

// ─── SituacaoBlock ────────────────────────────────────────────────────────────

function SituacaoBlock({
  titulo, nota, value, onChange, items, onUpdate, onAdd,
}: {
  titulo: string;
  nota: string;
  value: "" | "nao" | "sim";
  onChange: (v: "" | "nao" | "sim") => void;
  items: SituacaoItem[];
  onUpdate: (idx: number, field: keyof SituacaoItem, val: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-2.5 pb-5 border-b border-gray-100 last:border-0 last:pb-0">
      <p className="text-sm font-semibold text-gray-800">{titulo}</p>
      <div className="flex gap-6">
        <RadioOption label="Não" checked={value === "nao"} onChange={() => onChange("nao")} />
        <RadioOption label="Sim, indique abaixo:" checked={value === "sim"} onChange={() => onChange("sim")} />
      </div>
      {value === "sim" && (
        <div className="space-y-2 mt-2">
          <div className="grid grid-cols-3 gap-2 px-1">
            <span className="text-xs font-medium text-gray-400">Identifique quem</span>
            <span className="text-xs font-medium text-gray-400">Em qual situação</span>
            <span className="text-xs font-medium text-gray-400">Em qual localidade</span>
          </div>
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2">
              <input type="text" value={item.quem} onChange={e => onUpdate(idx, "quem", e.target.value)}
                placeholder="Nome / vínculo" className={inputSmCls} />
              <input type="text" value={item.situacao} onChange={e => onUpdate(idx, "situacao", e.target.value)}
                placeholder="Situação" className={inputSmCls} />
              <input type="text" value={item.localidade} onChange={e => onUpdate(idx, "localidade", e.target.value)}
                placeholder="Localidade" className={inputSmCls} />
            </div>
          ))}
          <button type="button" onClick={onAdd}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1">
            <Plus className="size-3" /> Adicionar linha
          </button>
          {nota && <p className="text-xs text-gray-400 italic pt-1">{nota}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PiaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [nomeExibido, setNomeExibido] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [piaExistente, setPiaExistente] = useState<any>(null);
  const [salvando, setSalvando] = useState(false);

  const [etapa, setEtapa] = useState<Etapa>("etapa1");
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoEtapa1>("identificacao");
  const [salvo, setSalvo] = useState(false);

  // Seção 1 — Identificação (controlled)
  const [idFields, setIdFields] = useState({
    nome_social: "", apelido: "", naturalidade: "",
    sexo: "", orientacao_sexual: "", cor_raca: "",
    situacao_civil: "", rg: "", cpf: "", nis: "",
    cpts: "", titulo_eleitor: "", hygia: "", cns: "",
    local_permanencia: "", local_pernoite: "",
    escolaridade: "", profissao_anterior: "",
  });
  const [motivoProcura, setMotivoProcura] = useState("");

  // Seção 2 — Procedência
  const [formasAcesso, setFormasAcesso] = useState<Set<string>>(new Set());
  const [outrasPolit, setOutrasPolit] = useState("");
  const [outrosAcesso, setOutrosAcesso] = useState("");
  const [docsEnc, setDocsEnc] = useState<Set<string>>(new Set());
  const [outrosDocs, setOutrosDocs] = useState("");

  // Seção 3 — Rede Familiar
  const [membros, setMembros] = useState<MembroFamilia[]>([
    { nome: "", vinculo: "", idade: "", orientacao_sexual: "", deficiente: "", endereco: "", telefone: "" },
  ]);

  // Seção 4 — Programas Sociais
  const [participaProg, setParticipaProg] = useState<"" | "nao" | "sim">("");
  const [beneficiosRenda, setBeneficiosRenda] = useState<Record<string, string>>({});
  const [outrosBenefNome, setOutrosBenefNome] = useState("");
  const [outrosBenefVal, setOutrosBenefVal] = useState("");
  const [participaEventuais, setParticipaEventuais] = useState<"" | "nao" | "sim">("");
  const [beneficiosEventuais, setBeneficiosEventuais] = useState<Set<string>>(new Set());
  const [cartaoTransporte, setCartaoTransporte] = useState<"" | "nao" | "sim">("");

  // Seção 5 — Rede de Serviços
  const [utilizaServicos, setUtilizaServicos] = useState<"" | "nao" | "sim">("");
  const [servicosBasica, setServicosBasica] = useState<Set<string>>(new Set());
  const [servicosMedia, setServicosMedia] = useState<Set<string>>(new Set());
  const [servicosAlta, setServicosAlta] = useState<Set<string>>(new Set());

  // Seção 6 — Situações Específicas
  const [privLib, setPrivLib] = useState<"" | "nao" | "sim">("");
  const [privLibItens, setPrivLibItens] = useState<SituacaoItem[]>([{ quem: "", situacao: "", localidade: "" }]);
  const [medSocio, setMedSocio] = useState<"" | "nao" | "sim">("");
  const [medSocioItens, setMedSocioItens] = useState<SituacaoItem[]>([{ quem: "", situacao: "", localidade: "" }]);
  const [acolhInst, setAcolhInst] = useState<"" | "nao" | "sim">("");
  const [acolhInstItens, setAcolhInstItens] = useState<SituacaoItem[]>([{ quem: "", situacao: "", localidade: "" }]);
  const [instInternado, setInstInternado] = useState<"" | "nao" | "sim">("");
  const [instInternadoItens, setInstInternadoItens] = useState<SituacaoItem[]>([{ quem: "", situacao: "", localidade: "" }]);

  // Etapa 6 — Acompanhamento
  const [registros, setRegistros] = useState<RegistroAcompanhamento[]>([]);
  const [novoReg, setNovoReg] = useState<RegistroAcompanhamento>({ data: "", descricao: "", tecnico: "" });

  useEffect(() => {
    function loadFromFicha(fi: Record<string, unknown>) {
      setIdFields({
        nome_social: (fi.nome_social as string) ?? "",
        apelido: (fi.apelido as string) ?? "",
        naturalidade: (fi.naturalidade as string) ?? "",
        sexo: (fi.sexo as string) ?? "",
        orientacao_sexual: (fi.orientacao_sexual as string) ?? "",
        cor_raca: (fi.cor_raca as string) ?? "",
        situacao_civil: (fi.situacao_civil as string) ?? "",
        rg: (fi.rg as string) ?? "",
        cpf: (fi.cpf as string) ?? "",
        nis: (fi.nis as string) ?? "",
        cpts: (fi.cpts as string) ?? "",
        titulo_eleitor: (fi.titulo_eleitor as string) ?? "",
        hygia: (fi.hygia as string) ?? "",
        cns: (fi.cns as string) ?? "",
        local_permanencia: (fi.local_permanencia as string) ?? "",
        local_pernoite: (fi.local_pernoite as string) ?? "",
        escolaridade: (fi.escolaridade as string) ?? "",
        profissao_anterior: (fi.profissao_anterior as string) ?? "",
      });
      if (fi.motivo_procura) setMotivoProcura(fi.motivo_procura as string);
      if (Array.isArray(fi.formas_acesso)) setFormasAcesso(new Set(fi.formas_acesso as string[]));
      if (fi.outras_politicas) setOutrasPolit(fi.outras_politicas as string);
      if (fi.outros_acesso) setOutrosAcesso(fi.outros_acesso as string);
      if (Array.isArray(fi.docs_encaminhamento)) setDocsEnc(new Set(fi.docs_encaminhamento as string[]));
      if (fi.outros_docs) setOutrosDocs(fi.outros_docs as string);
      if (Array.isArray(fi.membros_familia)) setMembros(fi.membros_familia as MembroFamilia[]);
      if (fi.participa_programas) setParticipaProg(fi.participa_programas as "" | "nao" | "sim");
      if (fi.beneficios_renda) setBeneficiosRenda(fi.beneficios_renda as Record<string, string>);
      if (fi.outros_beneficios_nome) setOutrosBenefNome(fi.outros_beneficios_nome as string);
      if (fi.outros_beneficios_valor) setOutrosBenefVal(fi.outros_beneficios_valor as string);
      if (Array.isArray(fi.beneficios_eventuais)) setBeneficiosEventuais(new Set(fi.beneficios_eventuais as string[]));
      if (fi.participa_eventuais) setParticipaEventuais(fi.participa_eventuais as "" | "nao" | "sim");
      if (fi.cartao_transporte) setCartaoTransporte(fi.cartao_transporte as "" | "nao" | "sim");
      if (fi.utiliza_servicos) setUtilizaServicos(fi.utiliza_servicos as "" | "nao" | "sim");
      if (Array.isArray(fi.servicos_basica)) setServicosBasica(new Set(fi.servicos_basica as string[]));
      if (Array.isArray(fi.servicos_media)) setServicosMedia(new Set(fi.servicos_media as string[]));
      if (Array.isArray(fi.servicos_alta)) setServicosAlta(new Set(fi.servicos_alta as string[]));
      if (fi.priv_liberdade) setPrivLib(fi.priv_liberdade as "" | "nao" | "sim");
      if (Array.isArray(fi.priv_liberdade_itens)) setPrivLibItens(fi.priv_liberdade_itens as SituacaoItem[]);
      if (fi.med_socioeducativa) setMedSocio(fi.med_socioeducativa as "" | "nao" | "sim");
      if (Array.isArray(fi.med_socioeducativa_itens)) setMedSocioItens(fi.med_socioeducativa_itens as SituacaoItem[]);
      if (fi.acolhimento_inst) setAcolhInst(fi.acolhimento_inst as "" | "nao" | "sim");
      if (Array.isArray(fi.acolhimento_inst_itens)) setAcolhInstItens(fi.acolhimento_inst_itens as SituacaoItem[]);
      if (fi.internado) setInstInternado(fi.internado as "" | "nao" | "sim");
      if (Array.isArray(fi.internado_itens)) setInstInternadoItens(fi.internado_itens as SituacaoItem[]);
    }

    if (DEV_MODE) {
      const r = getMockResidente(id);
      const p = getMockPia(id);
      setNomeExibido(r ? (r.nome_social ?? r.nome_completo) : null);
      setPiaExistente(p ?? null);
      if (p?.secao_identificacao) loadFromFicha(p.secao_identificacao as Record<string, unknown>);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pa = (p?.secao_plano_acao as any);
      if (pa?.registros) setRegistros(pa.registros as RegistroAcompanhamento[]);
      setLoaded(true);
      return;
    }

    const supabase = createClient();
    Promise.all([
      supabase.from("residentes").select("nome_completo, nome_social").eq("id", id).maybeSingle(),
      supabase.from("pia").select("*").eq("residente_id", id).maybeSingle(),
    ]).then(([{ data: r }, { data: p }]) => {
      setNomeExibido(r ? (r.nome_social ?? r.nome_completo) : null);
      setPiaExistente(p ?? null);
      if (p?.secao_identificacao) loadFromFicha(p.secao_identificacao as Record<string, unknown>);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pa = (p?.secao_plano_acao as any);
      if (pa?.registros) setRegistros(pa.registros as RegistroAcompanhamento[]);
      setLoaded(true);
    });
  }, [id]);

  if (!loaded) return <p className="text-muted-foreground p-4">Carregando PIA…</p>;
  if (!nomeExibido) return <p className="text-muted-foreground p-4">Acolhido não encontrado.</p>;

  const secaoIdx = SECOES_ETAPA1.findIndex((s) => s.id === secaoAtiva);
  const isUltima  = secaoIdx === SECOES_ETAPA1.length - 1;
  const isPrimeira = secaoIdx === 0;

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function toggleSet(set: Set<string>, value: string) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value); else next.add(value);
    return next;
  }

  function updateMembro(idx: number, field: keyof MembroFamilia, value: string) {
    setMembros(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  }

  function updateSituacao(
    items: SituacaoItem[],
    setter: (v: SituacaoItem[]) => void,
    idx: number,
    field: keyof SituacaoItem,
    val: string,
  ) {
    setter(items.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  }

  function addSituacao(items: SituacaoItem[], setter: (v: SituacaoItem[]) => void) {
    setter([...items, { quem: "", situacao: "", localidade: "" }]);
  }

  function handleAddRegistro() {
    if (!novoReg.data || !novoReg.descricao) return;
    setRegistros(prev => [...prev, novoReg]);
    setNovoReg({ data: "", descricao: "", tecnico: "" });
  }

  // ─── Save handlers ───────────────────────────────────────────────────────────

  async function handleSalvarEtapa1() {
    if (DEV_MODE) { setSalvo(true); return; }
    setSalvando(true);
    const res = await salvarPIA({
      residenteId: id,
      fichaIdentificacao: {
        ...idFields,
        motivo_procura: motivoProcura,
        formas_acesso: [...formasAcesso],
        outras_politicas: outrasPolit,
        outros_acesso: outrosAcesso,
        docs_encaminhamento: [...docsEnc],
        outros_docs: outrosDocs,
        membros_familia: membros,
        participa_programas: participaProg,
        beneficios_renda: beneficiosRenda,
        outros_beneficios_nome: outrosBenefNome,
        outros_beneficios_valor: outrosBenefVal,
        participa_eventuais: participaEventuais,
        beneficios_eventuais: [...beneficiosEventuais],
        cartao_transporte: cartaoTransporte,
        utiliza_servicos: utilizaServicos,
        servicos_basica: [...servicosBasica],
        servicos_media: [...servicosMedia],
        servicos_alta: [...servicosAlta],
        priv_liberdade: privLib,
        priv_liberdade_itens: privLibItens,
        med_socioeducativa: medSocio,
        med_socioeducativa_itens: medSocioItens,
        acolhimento_inst: acolhInst,
        acolhimento_inst_itens: acolhInstItens,
        internado: instInternado,
        internado_itens: instInternadoItens,
      },
    });
    setSalvando(false);
    if ("error" in res) { toast.error(res.error); return; }
    toast.success("Etapa 1 salva com sucesso!");
    setSalvo(true);
    router.refresh();
  }

  async function handleSalvarEtapa6() {
    if (DEV_MODE) { toast.success("Acompanhamento atualizado (DEV_MODE)"); return; }
    setSalvando(true);
    const res = await salvarPIA({
      residenteId: id,
      registrosAcompanhamento: registros,
    });
    setSalvando(false);
    if ("error" in res) { toast.error(res.error); return; }
    toast.success("Acompanhamento salvo com sucesso!");
    router.refresh();
  }

  // ─── Success screen ──────────────────────────────────────────────────────────

  if (salvo) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="size-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">PIA salvo com sucesso</h2>
        <p className="text-sm text-gray-600">A ficha de identificação do primeiro atendimento foi registrada.</p>
        <Link
          href={`/painel/residentes/${id}?aba=pia`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 transition-colors min-h-[44px] mt-4"
        >
          Ver PIA no prontuário
        </Link>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl space-y-5">
      {/* Back link */}
      <Link
        href={`/painel/residentes/${id}?aba=pia`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Prontuário
      </Link>

      {/* Header */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          PIA — Plano Individual de Atendimento
        </p>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{nomeExibido}</h1>
        {piaExistente && (
          <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
            Editando PIA existente
          </span>
        )}
      </div>

      {/* Etapa tabs */}
      <div className="flex gap-2">
        {[
          { id: "etapa1" as Etapa, icon: <FileText className="size-4" />, label: "Etapa 1 — Ficha de Identificação", short: "Ficha de Entrada" },
          { id: "etapa6" as Etapa, icon: <ClipboardList className="size-4" />, label: "Etapa 6 — Acompanhamento",         short: "Acompanhamento" },
        ].map((e) => (
          <button
            key={e.id}
            onClick={() => setEtapa(e.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              etapa === e.id
                ? "bg-blue-700 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {e.icon}
            <span className="hidden sm:inline">{e.label}</span>
            <span className="sm:hidden">{e.short}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ETAPA 1 — FICHA DE IDENTIFICAÇÃO DO PRIMEIRO ATENDIMENTO
      ═════════════════════════════════════════════════════════════════════ */}
      {etapa === "etapa1" && (
        <>
          {/* Step progress */}
          <div className="flex gap-1">
            {SECOES_ETAPA1.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setSecaoAtiva(s.id)}
                title={s.label}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  i < secaoIdx ? "bg-blue-400" :
                  i === secaoIdx ? "bg-blue-700" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Section header */}
          <div className="flex items-center gap-2.5">
            <span className="size-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {SECOES_ETAPA1[secaoIdx].numero}
            </span>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Seção {secaoIdx + 1} de {SECOES_ETAPA1.length}
              </p>
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {SECOES_ETAPA1[secaoIdx].label}
              </p>
            </div>
          </div>

          {/* ── Section content ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">

            {/* ─── 1. DADOS DE IDENTIFICAÇÃO ─── */}
            {secaoAtiva === "identificacao" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <FieldLabel>Nome Social</FieldLabel>
                    <input type="text" value={idFields.nome_social}
                      onChange={e => setIdFields(prev => ({ ...prev, nome_social: e.target.value }))}
                      placeholder="Nome social (se houver)" className={inputCls} />
                  </div>
                  <div>
                    <FieldLabel>Apelido</FieldLabel>
                    <input type="text" value={idFields.apelido}
                      onChange={e => setIdFields(prev => ({ ...prev, apelido: e.target.value }))}
                      placeholder="Apelido" className={inputCls} />
                  </div>
                  <div>
                    <FieldLabel>Naturalidade</FieldLabel>
                    <input type="text" value={idFields.naturalidade}
                      onChange={e => setIdFields(prev => ({ ...prev, naturalidade: e.target.value }))}
                      placeholder="Cidade/UF" className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <FieldLabel>Sexo</FieldLabel>
                    <select value={idFields.sexo}
                      onChange={e => setIdFields(prev => ({ ...prev, sexo: e.target.value }))}
                      className={selectCls}>
                      <option value="">Selecionar…</option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <FieldLabel>Orientação Sexual</FieldLabel>
                    <select value={idFields.orientacao_sexual}
                      onChange={e => setIdFields(prev => ({ ...prev, orientacao_sexual: e.target.value }))}
                      className={selectCls}>
                      <option value="">Selecionar…</option>
                      <option value="heterossexual">Heterossexual</option>
                      <option value="homossexual">Homossexual</option>
                      <option value="bissexual">Bissexual</option>
                      <option value="nao_informado">Não informado</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Cor / Raça</FieldLabel>
                    <select value={idFields.cor_raca}
                      onChange={e => setIdFields(prev => ({ ...prev, cor_raca: e.target.value }))}
                      className={selectCls}>
                      <option value="">Selecionar…</option>
                      <option value="branca">Branca</option>
                      <option value="preta">Preta</option>
                      <option value="parda">Parda</option>
                      <option value="amarela">Amarela</option>
                      <option value="indigena">Indígena</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Estado Civil</FieldLabel>
                    <select value={idFields.situacao_civil}
                      onChange={e => setIdFields(prev => ({ ...prev, situacao_civil: e.target.value }))}
                      className={selectCls}>
                      <option value="">Selecionar…</option>
                      <option value="solteiro">Solteiro(a)</option>
                      <option value="casado">Casado(a)</option>
                      <option value="divorciado">Divorciado(a)</option>
                      <option value="viuvo">Viúvo(a)</option>
                      <option value="uniao_estavel">União estável</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <FieldLabel>RG</FieldLabel>
                    <input type="text" value={idFields.rg}
                      onChange={e => setIdFields(prev => ({ ...prev, rg: e.target.value }))}
                      placeholder="Número do RG" className={inputCls} />
                  </div>
                  <div>
                    <FieldLabel>CPF</FieldLabel>
                    <input type="text" value={idFields.cpf}
                      onChange={e => setIdFields(prev => ({ ...prev, cpf: e.target.value }))}
                      placeholder="000.000.000-00" className={inputCls} />
                  </div>
                  <div>
                    <FieldLabel>NIS / PIS</FieldLabel>
                    <input type="text" value={idFields.nis}
                      onChange={e => setIdFields(prev => ({ ...prev, nis: e.target.value }))}
                      placeholder="Número NIS" className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>CPTS (Carteira de Trabalho)</FieldLabel>
                    <input type="text" value={idFields.cpts}
                      onChange={e => setIdFields(prev => ({ ...prev, cpts: e.target.value }))}
                      placeholder="Número" className={inputCls} />
                  </div>
                  <div>
                    <FieldLabel>Título de Eleitor</FieldLabel>
                    <input type="text" value={idFields.titulo_eleitor}
                      onChange={e => setIdFields(prev => ({ ...prev, titulo_eleitor: e.target.value }))}
                      placeholder="Número" className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Hygia (cartão municipal saúde)</FieldLabel>
                    <input type="text" value={idFields.hygia}
                      onChange={e => setIdFields(prev => ({ ...prev, hygia: e.target.value }))}
                      placeholder="Número Hygia" className={inputCls} />
                  </div>
                  <div>
                    <FieldLabel>Cartão SUS (CNS)</FieldLabel>
                    <input type="text" value={idFields.cns}
                      onChange={e => setIdFields(prev => ({ ...prev, cns: e.target.value }))}
                      placeholder="Número CNS" className={inputCls} />
                  </div>
                </div>

                <div>
                  <FieldLabel>Local de maior tempo de permanência</FieldLabel>
                  <input type="text" value={idFields.local_permanencia}
                    onChange={e => setIdFields(prev => ({ ...prev, local_permanencia: e.target.value }))}
                    placeholder="Ex: Praça Quinze, Centro…" className={inputCls} />
                </div>
                <div>
                  <FieldLabel>Local de pernoite</FieldLabel>
                  <input type="text" value={idFields.local_pernoite}
                    onChange={e => setIdFields(prev => ({ ...prev, local_pernoite: e.target.value }))}
                    placeholder="Onde dormia antes do acolhimento" className={inputCls} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Escolaridade</FieldLabel>
                    <select value={idFields.escolaridade}
                      onChange={e => setIdFields(prev => ({ ...prev, escolaridade: e.target.value }))}
                      className={selectCls}>
                      <option value="">Selecionar…</option>
                      <option value="sem_escolaridade">Sem escolaridade</option>
                      <option value="fund_incompleto">Fund. incompleto</option>
                      <option value="fund_completo">Fund. completo</option>
                      <option value="medio_incompleto">Médio incompleto</option>
                      <option value="medio_completo">Médio completo</option>
                      <option value="superior_incompleto">Superior incompleto</option>
                      <option value="superior_completo">Superior completo</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Profissão / ocupação anterior</FieldLabel>
                    <input type="text" value={idFields.profissao_anterior}
                      onChange={e => setIdFields(prev => ({ ...prev, profissao_anterior: e.target.value }))}
                      placeholder="Última ocupação" className={inputCls} />
                  </div>
                </div>
              </>
            )}

            {/* ─── 2. PROCEDÊNCIA ─── */}
            {secaoAtiva === "procedencia" && (
              <>
                <div>
                  <SectionLabel>2.1. Forma de acesso — como chegou ao serviço</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {FORMAS_ACESSO.map((fa) => (
                      <CheckboxOption
                        key={fa}
                        label={fa}
                        checked={formasAcesso.has(fa)}
                        onChange={() => setFormasAcesso(toggleSet(formasAcesso, fa))}
                      />
                    ))}
                  </div>
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1.5">Outras políticas públicas. Qual?</label>
                      <input type="text" value={outrasPolit} onChange={e => setOutrasPolit(e.target.value)}
                        placeholder="Especifique" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1.5">Outros. Qual?</label>
                      <input type="text" value={outrosAcesso} onChange={e => setOutrosAcesso(e.target.value)}
                        placeholder="Especifique" className={inputCls} />
                    </div>
                  </div>
                </div>

                <div>
                  <SectionLabel>2.2. Encaminhamento realizado com documentos abaixo</SectionLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {DOCS_ENCAMINHAMENTO.map((doc) => (
                      <CheckboxOption
                        key={doc}
                        label={doc}
                        checked={docsEnc.has(doc)}
                        onChange={() => setDocsEnc(toggleSet(docsEnc, doc))}
                      />
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm text-gray-600 mb-1.5">Outros documentos</label>
                    <input type="text" value={outrosDocs} onChange={e => setOutrosDocs(e.target.value)}
                      placeholder="Especifique" className={inputCls} />
                  </div>
                </div>

                <div>
                  <SectionLabel>2.3. Motivo de procura / encaminhamento</SectionLabel>
                  <textarea
                    rows={4}
                    value={motivoProcura}
                    onChange={e => setMotivoProcura(e.target.value)}
                    placeholder="Descreva o motivo principal que levou ao encaminhamento ou à procura espontânea…"
                    className={textareaCls}
                  />
                </div>
              </>
            )}

            {/* ─── 3. REDE FAMILIAR E/OU APOIO ─── */}
            {secaoAtiva === "rede_familiar" && (
              <>
                <p className="text-sm text-gray-500">
                  Liste os familiares e pessoas de referência do acolhido.
                </p>
                <div className="space-y-3">
                  {membros.map((membro, idx) => (
                    <div key={idx} className="rounded-xl border border-gray-200 bg-gray-50/40 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Familiar {idx + 1}
                        </span>
                        {membros.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setMembros(prev => prev.filter((_, i) => i !== idx))}
                            className="size-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <FieldLabel>Nome</FieldLabel>
                          <input type="text" value={membro.nome} onChange={e => updateMembro(idx, "nome", e.target.value)}
                            placeholder="Nome completo" className={inputCls} />
                        </div>
                        <div>
                          <FieldLabel>Vínculo / Parentesco</FieldLabel>
                          <input type="text" value={membro.vinculo} onChange={e => updateMembro(idx, "vinculo", e.target.value)}
                            placeholder="Mãe, irmão, amigo…" className={inputCls} />
                        </div>
                        <div>
                          <FieldLabel>Idade</FieldLabel>
                          <input type="text" value={membro.idade} onChange={e => updateMembro(idx, "idade", e.target.value)}
                            placeholder="Idade" className={inputCls} />
                        </div>
                        <div>
                          <FieldLabel>Orientação Sexual</FieldLabel>
                          <input type="text" value={membro.orientacao_sexual} onChange={e => updateMembro(idx, "orientacao_sexual", e.target.value)}
                            placeholder="Se informado" className={inputCls} />
                        </div>
                        <div>
                          <FieldLabel>Deficiência?</FieldLabel>
                          <select value={membro.deficiente} onChange={e => updateMembro(idx, "deficiente", e.target.value)} className={selectCls}>
                            <option value="">Selecionar…</option>
                            <option value="nao">Não</option>
                            <option value="sim">Sim</option>
                          </select>
                        </div>
                        <div>
                          <FieldLabel>Endereço</FieldLabel>
                          <input type="text" value={membro.endereco} onChange={e => updateMembro(idx, "endereco", e.target.value)}
                            placeholder="Endereço" className={inputCls} />
                        </div>
                        <div>
                          <FieldLabel>Telefone(s)</FieldLabel>
                          <input type="text" value={membro.telefone} onChange={e => updateMembro(idx, "telefone", e.target.value)}
                            placeholder="(16) 9…" className={inputCls} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setMembros(prev => [...prev, { nome: "", vinculo: "", idade: "", orientacao_sexual: "", deficiente: "", endereco: "", telefone: "" }])}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/30 transition-colors"
                  >
                    <Plus className="size-4" />
                    Adicionar familiar
                  </button>
                </div>
              </>
            )}

            {/* ─── 4. PROGRAMAS SOCIAIS ─── */}
            {secaoAtiva === "programas_sociais" && (
              <>
                <div>
                  <SectionLabel>4.1. Participa de programas sociais e/ou benefício de transferência de renda?</SectionLabel>
                  <div className="flex flex-col gap-2.5">
                    <RadioOption label="Não" checked={participaProg === "nao"} onChange={() => setParticipaProg("nao")} />
                    <RadioOption label="Sim, indique abaixo:" checked={participaProg === "sim"} onChange={() => setParticipaProg("sim")} />
                  </div>
                  {participaProg === "sim" && (
                    <div className="mt-4 space-y-3 pl-1">
                      {BENEFICIOS_RENDA.map((b) => (
                        <div key={b.id} className="flex items-center gap-3">
                          <CheckboxOption
                            label={b.label}
                            checked={b.id in beneficiosRenda}
                            onChange={(v) => {
                              setBeneficiosRenda(prev => {
                                const next = { ...prev };
                                if (v) next[b.id] = ""; else delete next[b.id];
                                return next;
                              });
                            }}
                          />
                          {b.id in beneficiosRenda && (
                            <div className="flex items-center gap-1.5 ml-auto">
                              <span className="text-sm text-gray-400">R$</span>
                              <input
                                type="text"
                                placeholder="Valor"
                                value={beneficiosRenda[b.id]}
                                onChange={e => setBeneficiosRenda(prev => ({ ...prev, [b.id]: e.target.value }))}
                                className={`w-28 ${inputSmCls}`}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm text-gray-600">Outros:</span>
                        <input type="text" value={outrosBenefNome} onChange={e => setOutrosBenefNome(e.target.value)}
                          placeholder="Qual?" className={`flex-1 min-w-[100px] ${inputSmCls}`} />
                        <span className="text-sm text-gray-400">R$</span>
                        <input type="text" value={outrosBenefVal} onChange={e => setOutrosBenefVal(e.target.value)}
                          placeholder="Valor" className={`w-24 ${inputSmCls}`} />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <SectionLabel>4.2. Recebe / recebeu benefício assistencial e/ou eventual?</SectionLabel>
                  <div className="flex flex-col gap-2.5">
                    <RadioOption label="Não" checked={participaEventuais === "nao"} onChange={() => setParticipaEventuais("nao")} />
                    <RadioOption label="Sim, especifique:" checked={participaEventuais === "sim"} onChange={() => setParticipaEventuais("sim")} />
                  </div>
                  {participaEventuais === "sim" && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-1">
                      {BENEFICIOS_EVENTUAIS.map((b) => (
                        <CheckboxOption
                          key={b}
                          label={b}
                          checked={beneficiosEventuais.has(b)}
                          onChange={() => setBeneficiosEventuais(toggleSet(beneficiosEventuais, b))}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <SectionLabel>4.3. Possui Carteira de Transporte Gratuito?</SectionLabel>
                  <div className="flex gap-6">
                    <RadioOption label="Não" checked={cartaoTransporte === "nao"} onChange={() => setCartaoTransporte("nao")} />
                    <RadioOption label="Sim" checked={cartaoTransporte === "sim"} onChange={() => setCartaoTransporte("sim")} />
                  </div>
                </div>
              </>
            )}

            {/* ─── 5. REDE DE SERVIÇOS SOCIOASSISTENCIAIS ─── */}
            {secaoAtiva === "rede_servicos" && (
              <>
                <div>
                  <SectionLabel>5.1. Utiliza os serviços da rede socioassistencial?</SectionLabel>
                  <div className="flex flex-col gap-2.5">
                    <RadioOption label="Não" checked={utilizaServicos === "nao"} onChange={() => setUtilizaServicos("nao")} />
                    <RadioOption label="Sim, indique abaixo:" checked={utilizaServicos === "sim"} onChange={() => setUtilizaServicos("sim")} />
                  </div>
                </div>

                {utilizaServicos === "sim" && (
                  <div className="space-y-5">
                    <div className="rounded-xl border border-gray-100 p-4 space-y-2.5">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Proteção Social Básica
                      </p>
                      {SERVICOS_BASICA.map((s) => (
                        <CheckboxOption key={s} label={s} checked={servicosBasica.has(s)}
                          onChange={() => setServicosBasica(toggleSet(servicosBasica, s))} />
                      ))}
                    </div>

                    <div className="rounded-xl border border-gray-100 p-4 space-y-2.5">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Proteção Social Especial — Média Complexidade
                      </p>
                      {SERVICOS_MEDIA.map((s) => (
                        <CheckboxOption key={s} label={s} checked={servicosMedia.has(s)}
                          onChange={() => setServicosMedia(toggleSet(servicosMedia, s))} />
                      ))}
                    </div>

                    <div className="rounded-xl border border-gray-100 p-4 space-y-2.5">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Proteção Social Especial — Alta Complexidade
                      </p>
                      {SERVICOS_ALTA.map((s) => (
                        <CheckboxOption key={s} label={s} checked={servicosAlta.has(s)}
                          onChange={() => setServicosAlta(toggleSet(servicosAlta, s))} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ─── 6. SITUAÇÕES ESPECÍFICAS ─── */}
            {secaoAtiva === "situacoes" && (
              <div className="space-y-5">
                <SituacaoBlock
                  titulo="6.1. Já esteve ou alguém da família está em privação de liberdade?"
                  nota="Regime fechado, semiaberto, aguardando julgamento, condenado"
                  value={privLib}
                  onChange={setPrivLib}
                  items={privLibItens}
                  onUpdate={(i, f, v) => updateSituacao(privLibItens, setPrivLibItens, i, f, v)}
                  onAdd={() => addSituacao(privLibItens, setPrivLibItens)}
                />
                <SituacaoBlock
                  titulo="6.2. Existem adolescentes na família em cumprimento de Medidas Socioeducativas?"
                  nota="Advertência, Prestação de Serviço à Comunidade, Liberdade Assistida, Semiliberdade ou Internação (ECA art. 112)"
                  value={medSocio}
                  onChange={setMedSocio}
                  items={medSocioItens}
                  onUpdate={(i, f, v) => updateSituacao(medSocioItens, setMedSocioItens, i, f, v)}
                  onAdd={() => addSituacao(medSocioItens, setMedSocioItens)}
                />
                <SituacaoBlock
                  titulo="6.3. Algum familiar encontra-se em Acolhimento Institucional?"
                  nota="ILP Idosos, Casa Lar, Acolhimento Institucional, Casa de Passagem, Residência Inclusiva"
                  value={acolhInst}
                  onChange={setAcolhInst}
                  items={acolhInstItens}
                  onUpdate={(i, f, v) => updateSituacao(acolhInstItens, setAcolhInstItens, i, f, v)}
                  onAdd={() => addSituacao(acolhInstItens, setAcolhInstItens)}
                />
                <SituacaoBlock
                  titulo="6.4. Algum familiar encontra-se institucionalizado / internado?"
                  nota="Hospital, Residência Terapêutica, Clínicas, entre outros"
                  value={instInternado}
                  onChange={setInstInternado}
                  items={instInternadoItens}
                  onUpdate={(i, f, v) => updateSituacao(instInternadoItens, setInstInternadoItens, i, f, v)}
                  onAdd={() => addSituacao(instInternadoItens, setInstInternadoItens)}
                />
              </div>
            )}
          </div>

          {/* Etapa 1 navigation */}
          <div className="flex gap-3">
            {!isPrimeira && (
              <button
                type="button"
                onClick={() => setSecaoAtiva(SECOES_ETAPA1[secaoIdx - 1].id)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[48px]"
              >
                Anterior
              </button>
            )}
            {!isUltima ? (
              <button
                type="button"
                onClick={() => setSecaoAtiva(SECOES_ETAPA1[secaoIdx + 1].id)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors min-h-[48px]"
              >
                Próxima seção
                <ChevronRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSalvarEtapa1}
                disabled={salvando}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 transition-colors min-h-[48px] disabled:opacity-50"
              >
                <Save className="size-4" />
                {salvando ? "Salvando…" : "Salvar Etapa 1"}
              </button>
            )}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ETAPA 6 — REGISTRO DO ACOMPANHAMENTO
      ═════════════════════════════════════════════════════════════════════ */}
      {etapa === "etapa6" && (
        <div className="space-y-4">
          {/* New entry form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <p className="text-sm font-semibold text-gray-800">Novo registro de atendimento</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel>Data do Atendimento</FieldLabel>
                <input type="date" value={novoReg.data}
                  onChange={e => setNovoReg(prev => ({ ...prev, data: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <FieldLabel>Nome do Técnico Responsável</FieldLabel>
                <input type="text" value={novoReg.tecnico}
                  onChange={e => setNovoReg(prev => ({ ...prev, tecnico: e.target.value }))}
                  placeholder="Nome do técnico" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Descrição Sumária</FieldLabel>
                <textarea
                  rows={3}
                  value={novoReg.descricao}
                  onChange={e => setNovoReg(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva o atendimento realizado…"
                  className={textareaCls}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddRegistro}
              disabled={!novoReg.data || !novoReg.descricao}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="size-4" />
              Adicionar registro
            </button>
          </div>

          {/* Registros list */}
          {registros.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Histórico de atendimentos — {registros.length}{" "}
                  {registros.length === 1 ? "entrada" : "entradas"}
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {registros.map((r, idx) => (
                  <div key={idx} className="px-5 py-4 flex items-start gap-4">
                    <span className="size-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 leading-snug">{r.descricao}</p>
                      {r.tecnico && (
                        <p className="text-xs text-muted-foreground mt-0.5">{r.tecnico}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {new Date(r.data + "T12:00:00").toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <ClipboardList className="size-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Nenhum registro de acompanhamento ainda.</p>
              <p className="text-xs text-gray-300 mt-1">Use o formulário acima para adicionar o primeiro atendimento.</p>
            </div>
          )}

          {/* Save Etapa 6 */}
          {registros.length > 0 && (
            <button
              type="button"
              onClick={handleSalvarEtapa6}
              disabled={salvando}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 transition-colors min-h-[48px] disabled:opacity-50"
            >
              <Save className="size-4" />
              {salvando ? "Salvando…" : "Salvar Acompanhamento"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
