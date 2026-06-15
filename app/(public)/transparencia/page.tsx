import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FileText, Download, Calendar, FolderOpen } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import type { DocumentoPublico } from "@/types/database";

export const metadata: Metadata = {
  title: "Portal da Transparência — Projeto Travessia",
  description:
    "Documentos públicos do Projeto Travessia: estatutos, atas, contratos, balancetes e prestações de contas.",
};

export const revalidate = 3600;

const CATEGORIA_CONFIG: Record<string, { label: string; order: number }> = {
  estatuto:             { label: "Estatuto e Regimento",        order: 1 },
  regimento:            { label: "Estatuto e Regimento",        order: 1 },
  ata:                  { label: "Atas",                        order: 2 },
  contrato_parceria:    { label: "Termos de Colaboração e Convênios", order: 3 },
  plano_trabalho:       { label: "Planos de Trabalho",          order: 4 },
  relatorio_atividades: { label: "Relatórios de Atividades",   order: 5 },
  prestacao_contas:     { label: "Prestação de Contas",         order: 6 },
  balancete:            { label: "Balancetes e Demonstrativos", order: 7 },
  outros:               { label: "Outros Documentos",           order: 8 },
};

function categoriaLabel(cat: string) {
  return CATEGORIA_CONFIG[cat]?.label ?? "Outros Documentos";
}

function categoriaOrder(cat: string) {
  return CATEGORIA_CONFIG[cat]?.order ?? 99;
}

function formatBytes(kb: number | null) {
  if (!kb) return null;
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default async function TransparenciaPage() {
  const supabase = await createClient();

  const { data: docs, error } = await supabase
    .from("documentos_publicos")
    .select("*")
    .eq("publicado", true)
    .order("publicado_em", { ascending: false });

  const documentos: DocumentoPublico[] = docs ?? [];

  // Agrupa por label de categoria (algumas categorias compartilham label)
  const grupos = new Map<string, { order: number; docs: DocumentoPublico[] }>();
  for (const doc of documentos) {
    const label = categoriaLabel(doc.categoria);
    const order = categoriaOrder(doc.categoria);
    if (!grupos.has(label)) grupos.set(label, { order, docs: [] });
    grupos.get(label)!.docs.push(doc);
  }

  const gruposOrdenados = [...grupos.entries()].sort(
    (a, b) => a[1].order - b[1].order
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Portal da Transparência
        </h1>
        <p className="text-gray-600 max-w-2xl leading-relaxed">
          Documentos públicos do Projeto Travessia, disponibilizados em cumprimento
          às exigências da Prefeitura de Ribeirão Preto, da SEDS-SP e da Lei de Acesso
          à Informação (Lei 12.527/2011).
        </p>
        <p className="text-xs text-gray-400">
          Última atualização: {documentos.length > 0 ? formatDate(documentos[0].publicado_em ?? documentos[0].created_at) : "—"}
        </p>
      </div>

      {/* Conteúdo */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-2">
          <p className="font-medium text-red-800">Não foi possível carregar os documentos.</p>
          <p className="text-sm text-red-600">Tente novamente em alguns instantes.</p>
        </div>
      ) : gruposOrdenados.length === 0 ? (
        <div className="bg-slate-50 border border-gray-200 rounded-2xl p-10 text-center space-y-3">
          <FolderOpen className="size-10 text-gray-300 mx-auto" />
          <p className="font-medium text-gray-700">Nenhum documento publicado ainda.</p>
          <p className="text-sm text-gray-500">
            Os documentos serão disponibilizados em breve pela equipe de coordenação.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {gruposOrdenados.map(([label, { docs: grupoDocs }]) => (
            <section key={label} className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-gray-900">{label}</h2>
                <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">
                  {grupoDocs.length} {grupoDocs.length === 1 ? "documento" : "documentos"}
                </span>
              </div>

              <div className="space-y-2">
                {grupoDocs.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.arquivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 bg-white rounded-2xl border border-gray-100 p-4 hover:border-blue-200 hover:shadow-sm transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                      <FileText className="size-5 text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
                        {doc.titulo}
                      </p>
                      {doc.descricao && (
                        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                          {doc.descricao}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400">
                        {doc.competencia && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {doc.competencia}
                          </span>
                        )}
                        {doc.publicado_em && (
                          <span>Publicado em {formatDate(doc.publicado_em)}</span>
                        )}
                        {doc.tamanho_kb && (
                          <span>{formatBytes(doc.tamanho_kb)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Download className="size-4 text-blue-600" />
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Rodapé legal */}
      <div className="border-t border-gray-100 pt-6 space-y-1 text-xs text-gray-400">
        <p>
          Em caso de dúvidas sobre os documentos, entre em contato com nosso Encarregado
          de Dados (DPO):{" "}
          <a href="mailto:dpo@projetotravessia.org.br" className="underline hover:text-gray-600">
            dpo@projetotravessia.org.br
          </a>
        </p>
        <p>
          Solicitações de acesso à informação podem ser feitas através do{" "}
          <a href="https://www.prefeitura.sp.gov.br/cidade/secretarias/governo/transparencia/" className="underline hover:text-gray-600">
            sistema e-SIC do município
          </a>
          .
        </p>
      </div>
    </div>
  );
}
