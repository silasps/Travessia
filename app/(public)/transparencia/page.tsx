import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FileText, Download, Calendar, Folder, FolderOpen } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import type { DocumentoPublico } from "@/types/database";
import { DocumentoViewerModal } from "@/components/transparencia/documento-viewer-modal";

export const metadata: Metadata = {
  title: "Portal da Transparência — Projeto Travessia",
  description:
    "Documentos públicos do Projeto Travessia: estatutos, atas, contratos, balancetes e prestações de contas.",
};

export const revalidate = 3600;

function formatBytes(kb: number | null) {
  if (!kb) return null;
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function getFileExtension(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split(".").pop()?.toUpperCase();
    return ext && ext.length <= 4 ? ext : null;
  } catch {
    return null;
  }
}

function ExtBadge({ url }: { url: string }) {
  const ext = getFileExtension(url);
  if (!ext) return null;
  const colors: Record<string, string> = {
    PDF: "bg-red-50 text-red-600",
    DOC: "bg-blue-50 text-blue-600",
    DOCX: "bg-blue-50 text-blue-600",
    XLS: "bg-green-50 text-green-600",
    XLSX: "bg-green-50 text-green-600",
  };
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors[ext] ?? "bg-gray-100 text-gray-500"}`}>
      {ext}
    </span>
  );
}

export default async function TransparenciaPage() {
  const supabase = await createClient();

  const [{ data: docs, error }, { data: categoriasData }] = await Promise.all([
    supabase
      .from("documentos_publicos")
      .select("*")
      .eq("publicado", true)
      .order("competencia", { ascending: false }),
    supabase.from("categorias_documentos_publicos").select("categoria, nome, ordem").order("ordem"),
  ]);

  const documentos: DocumentoPublico[] = docs ?? [];
  const cfgPorCategoria = new Map((categoriasData ?? []).map((c) => [c.categoria, c]));

  const grupos = new Map<string, { order: number; label: string; docs: DocumentoPublico[] }>();
  for (const doc of documentos) {
    const cfg = cfgPorCategoria.get(doc.categoria);
    if (!grupos.has(doc.categoria)) {
      grupos.set(doc.categoria, { order: cfg?.ordem ?? 99, label: cfg?.nome ?? "Outros Documentos", docs: [] });
    }
    grupos.get(doc.categoria)!.docs.push(doc);
  }
  const gruposOrdenados = [...grupos.entries()].sort((a, b) => a[1].order - b[1].order);

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
          Última atualização:{" "}
          {documentos.length > 0
            ? formatDate(documentos[0].publicado_em ?? documentos[0].created_at)
            : "—"}
        </p>
      </div>

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
        /* Estrutura de pastas */
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
          {/* Cabeçalho estilo explorador */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <Folder className="size-3.5" />
            <span>Pasta</span>
            <span className="ml-auto">Arquivos</span>
          </div>

          <div className="divide-y divide-gray-100">
            {gruposOrdenados.map(([cat, { label, docs: grupoDocs }]) => (
              <details key={cat} className="group">
                {/* Cabeçalho da pasta */}
                <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors list-none select-none">
                  <span className="transition-transform group-open:rotate-90 text-gray-400 text-xs">▶</span>
                  <Folder className="size-4 text-blue-500 group-open:hidden flex-shrink-0" />
                  <FolderOpen className="size-4 text-blue-500 hidden group-open:block flex-shrink-0" />
                  <span className="flex-1 font-semibold text-sm text-gray-800">{label}</span>
                  <span className="text-xs text-gray-400 tabular-nums">
                    {grupoDocs.length} {grupoDocs.length === 1 ? "arquivo" : "arquivos"}
                  </span>
                </summary>

                {/* Arquivos dentro da pasta */}
                <div className="bg-gray-50/50 border-t border-gray-100">
                  {grupoDocs.map((doc, docIdx) => (
                    <DocumentoViewerModal
                      key={doc.id}
                      titulo={doc.titulo}
                      url={doc.arquivo_url}
                      className={`flex items-center gap-3 pl-10 pr-4 py-3 hover:bg-blue-50 transition-colors group/item w-full text-left ${
                        docIdx < grupoDocs.length - 1 ? "border-b border-gray-100" : ""
                      }`}
                    >
                      <FileText className="size-4 text-gray-400 group-hover/item:text-blue-500 flex-shrink-0 transition-colors" />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 group-hover/item:text-blue-700 transition-colors leading-snug">
                          {doc.titulo}
                        </p>
                        {doc.descricao && (
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-1">
                            {doc.descricao}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-400">
                          {doc.competencia && (
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3" />
                              {doc.competencia}
                            </span>
                          )}
                          {doc.publicado_em && (
                            <span>Publicado em {formatDate(doc.publicado_em)}</span>
                          )}
                          {doc.tamanho_kb && <span>{formatBytes(doc.tamanho_kb)}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <ExtBadge url={doc.arquivo_url} />
                        <Download className="size-4 text-gray-300 group-hover/item:text-blue-500 transition-colors" />
                      </div>
                    </DocumentoViewerModal>
                  ))}
                </div>
              </details>
            ))}
          </div>
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
          Solicitações de acesso à informação podem ser feitas diretamente à nossa equipe
          de coordenação.
        </p>
      </div>
    </div>
  );
}
