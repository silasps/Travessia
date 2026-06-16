import { NextRequest } from "next/server";
import {
  getDefaultPeriodo,
  getRelatorioData,
  isMovimentoTipo,
} from "@/lib/relatorios/data";
import {
  renderAtivosPdf,
  renderEntradasSaidasPdf,
  renderMensalPdf,
  renderOcorrenciasPdf,
} from "@/lib/relatorios/pdf";

export const runtime = "nodejs";

const RELATORIOS = ["entradas-saidas", "acolhidos-ativos", "mensal", "ocorrencias"] as const;
type RelatorioSlug = (typeof RELATORIOS)[number];

function isRelatorioSlug(value: string): value is RelatorioSlug {
  return RELATORIOS.includes(value as RelatorioSlug);
}

function pdfResponse(buffer: Buffer, filename: string) {
  const body = new Blob([new Uint8Array(buffer)], { type: "application/pdf" });

  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ relatorio: string }> }
) {
  const { relatorio } = await params;

  if (!isRelatorioSlug(relatorio)) {
    return new Response("Relatorio nao encontrado", { status: 404 });
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const { dataInicio, dataFim } = getDefaultPeriodo({
    de: searchParams.de,
    ate: searchParams.ate,
  });
  const tipo = searchParams.tipo && isMovimentoTipo(searchParams.tipo) ? searchParams.tipo : undefined;
  const data = await getRelatorioData({ dataInicio, dataFim, tipo });

  if (relatorio === "entradas-saidas") {
    const buffer = await renderEntradasSaidasPdf({ dataInicio, dataFim, ...data });
    return pdfResponse(buffer, `relatorio-entradas-saidas-${dataInicio}-${dataFim}.pdf`);
  }

  if (relatorio === "acolhidos-ativos") {
    const buffer = await renderAtivosPdf(data);
    return pdfResponse(buffer, `lista-acolhidos-ativos-${dataFim}.pdf`);
  }

  if (relatorio === "ocorrencias") {
    const buffer = await renderOcorrenciasPdf({ dataInicio, dataFim, ...data });
    return pdfResponse(buffer, `historico-ocorrencias-${dataInicio}-${dataFim}.pdf`);
  }

  const buffer = await renderMensalPdf({ dataInicio, dataFim, ...data });
  return pdfResponse(buffer, `relatorio-mensal-${dataInicio}-${dataFim}.pdf`);
}
