import { endOfMonth, format, isSameDay, startOfMonth, subDays, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  MOCK_CONFIGURACOES,
  MOCK_MOVIMENTOS,
  MOCK_OCORRENCIAS,
  MOCK_RESIDENTES,
} from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/format";
import type {
  ConfiguracaoSistema,
  MovimentoResidente,
  MovimentoTipo,
  Ocorrencia,
  Residente,
} from "@/types/database";

const DEV_MODE =
  process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co" ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL;

export interface RelatorioFiltros {
  dataInicio: string;
  dataFim: string;
  tipo?: string;
}

export interface RelatorioData {
  residentes: Residente[];
  movimentos: MovimentoResidente[];
  ocorrencias: Ocorrencia[];
  configuracoes: ConfiguracaoSistema[];
}

// Formata pelo calendário local (não UTC) — `toISOString()` despenca para o dia
// seguinte perto da meia-noite em fusos a leste de UTC (ex.: 31/05 23:59 BRT
// vira 01/06 em UTC), o que deslocava "Mês passado" em 1 dia.
function toISODate(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export function getDefaultPeriodo(searchParams: { de?: string; ate?: string }) {
  const hoje = new Date();
  const primeiroDiaMes = startOfMonth(hoje);

  return {
    dataInicio: searchParams.de ?? toISODate(primeiroDiaMes),
    dataFim: searchParams.ate ?? toISODate(hoje),
  };
}

export interface PeriodoPreset {
  id: string;
  label: string;
  de: string;
  ate: string;
}

export function getPeriodoPresets(): PeriodoPreset[] {
  const hoje = new Date();
  const hojeISO = toISODate(hoje);
  const mesPassado = subMonths(hoje, 1);

  return [
    { id: "7d", label: "7 dias", de: toISODate(subDays(hoje, 6)), ate: hojeISO },
    { id: "30d", label: "30 dias", de: toISODate(subDays(hoje, 29)), ate: hojeISO },
    { id: "mes", label: "Este mês", de: toISODate(startOfMonth(hoje)), ate: hojeISO },
    {
      id: "mes_passado",
      label: "Mês passado",
      de: toISODate(startOfMonth(mesPassado)),
      ate: toISODate(endOfMonth(mesPassado)),
    },
  ];
}

export interface RelatorioMensalInfo {
  tipo: "mensal_completo" | "mensal_parcial" | "periodico";
  titulo: string;
  periodoLabel: string;
  aviso?: string;
}

/**
 * Classifica o período como mês fechado, mês em andamento (dados parciais) ou
 * período arbitrário — para nomear o relatório "mensal" de forma honesta em vez
 * de chamar qualquer intervalo de "mensal completo".
 */
export function getRelatorioMensalInfo(
  dataInicio: string,
  dataFim: string,
  hoje: Date = new Date()
): RelatorioMensalInfo {
  const inicio = new Date(`${dataInicio}T00:00:00`);
  const fim = new Date(`${dataFim}T00:00:00`);
  const inicioDoMes = startOfMonth(inicio);
  const fimDoMes = endOfMonth(inicio);
  const mesmoMes = inicio.getFullYear() === fim.getFullYear() && inicio.getMonth() === fim.getMonth();
  const comecaNoDia1 = isSameDay(inicio, inicioDoMes);
  const nomeMes = capitalize(format(inicio, "MMMM 'de' yyyy", { locale: ptBR }));

  if (comecaNoDia1 && mesmoMes) {
    if (isSameDay(fim, fimDoMes)) {
      return { tipo: "mensal_completo", titulo: "Relatório mensal completo", periodoLabel: nomeMes };
    }

    const mesEhOAtual = inicio.getFullYear() === hoje.getFullYear() && inicio.getMonth() === hoje.getMonth();
    if (mesEhOAtual) {
      return {
        tipo: "mensal_parcial",
        titulo: "Relatório mensal (parcial)",
        periodoLabel: nomeMes,
        aviso: `O mês de ${nomeMes} ainda não terminou — dados disponíveis até ${formatDate(dataFim)}.`,
      };
    }
  }

  return {
    tipo: "periodico",
    titulo: "Relatório periódico",
    periodoLabel: `${formatDate(dataInicio)} – ${formatDate(dataFim)}`,
  };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function isMovimentoTipo(value: string): value is MovimentoTipo {
  return ["entrada", "saida_temporaria", "retorno", "saida_definitiva"].includes(value);
}

export function filtrarMovimentos(
  movimentos: MovimentoResidente[],
  { dataInicio, dataFim, tipo }: RelatorioFiltros
) {
  return movimentos
    .filter((m) => {
      const data = m.data_hora.split("T")[0];
      return data >= dataInicio && data <= dataFim;
    })
    .filter((m) => !tipo || m.tipo === tipo)
    .sort((a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime());
}

export function filtrarOcorrencias(
  ocorrencias: Ocorrencia[],
  { dataInicio, dataFim }: RelatorioFiltros
) {
  return ocorrencias
    .filter((o) => o.data_ocorrencia >= dataInicio && o.data_ocorrencia <= dataFim)
    .sort((a, b) => new Date(b.data_ocorrencia).getTime() - new Date(a.data_ocorrencia).getTime());
}

export function getConfig(configuracoes: ConfiguracaoSistema[], chave: string, fallback: string) {
  return configuracoes.find((c) => c.chave === chave)?.valor ?? fallback;
}

export async function getRelatorioData(filtros: RelatorioFiltros): Promise<RelatorioData> {
  if (DEV_MODE) {
    return {
      residentes: MOCK_RESIDENTES,
      movimentos: filtrarMovimentos(MOCK_MOVIMENTOS, filtros),
      ocorrencias: filtrarOcorrencias(MOCK_OCORRENCIAS, filtros),
      configuracoes: MOCK_CONFIGURACOES,
    };
  }

  const supabase = await createClient();

  const movimentosQuery = supabase
    .from("movimentos_residentes")
    .select("*")
    .gte("data_hora", `${filtros.dataInicio}T00:00:00`)
    .lte("data_hora", `${filtros.dataFim}T23:59:59`)
    .order("data_hora", { ascending: false });

  if (filtros.tipo && isMovimentoTipo(filtros.tipo)) {
    movimentosQuery.eq("tipo", filtros.tipo);
  }

  const [residentesResult, movimentosResult, ocorrenciasResult, configuracoesResult] =
    await Promise.all([
      supabase.from("residentes").select("*").is("deleted_at", null).order("nome_completo"),
      movimentosQuery,
      supabase
        .from("ocorrencias")
        .select("*")
        .gte("data_ocorrencia", filtros.dataInicio)
        .lte("data_ocorrencia", filtros.dataFim)
        .order("data_ocorrencia", { ascending: false }),
      supabase.from("configuracoes_sistema").select("*"),
    ]);

  return {
    residentes: residentesResult.data ?? [],
    movimentos: movimentosResult.data ?? [],
    ocorrencias: ocorrenciasResult.data ?? [],
    configuracoes: configuracoesResult.data ?? [],
  };
}
