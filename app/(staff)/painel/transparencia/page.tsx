import type { Metadata } from "next";
import { listarTodosDocumentos } from "@/lib/actions/documentos-publicos";
import { UploadForm } from "@/components/transparencia/upload-form";
import { PublicarBtn, ExcluirDocBtn } from "@/components/transparencia/documento-actions";
import { FileText, FolderOpen, ExternalLink, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Transparência — Gestão de Documentos" };

const CATEGORIA_CONFIG: Record<string, { label: string; order: number }> = {
  estatuto:             { label: "Estatuto Social",                  order: 1 },
  regimento:            { label: "Regimentos e Regulamentos",         order: 2 },
  ata:                  { label: "Atas",                              order: 3 },
  contrato_parceria:    { label: "Termos de Colaboração e Convênios", order: 4 },
  plano_trabalho:       { label: "Planos de Trabalho",                order: 5 },
  relatorio_atividades: { label: "Relatórios de Atividades",         order: 6 },
  prestacao_contas:     { label: "Prestação de Contas",               order: 7 },
  balancete:            { label: "Balancetes e Demonstrativos",       order: 8 },
  outros:               { label: "Outros Documentos",                 order: 9 },
};

function formatKb(kb: number | null) {
  if (!kb) return null;
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default async function TransparenciaAdminPage() {
  const documentos = await listarTodosDocumentos();

  const grupos = new Map<string, { order: number; docs: typeof documentos }>();
  for (const doc of documentos) {
    const cfg = CATEGORIA_CONFIG[doc.categoria] ?? { label: "Outros", order: 99 };
    if (!grupos.has(doc.categoria)) grupos.set(doc.categoria, { order: cfg.order, docs: [] });
    grupos.get(doc.categoria)!.docs.push(doc);
  }
  const gruposOrdenados = [...grupos.entries()].sort((a, b) => a[1].order - b[1].order);

  const totalPublicados = documentos.filter((d) => d.publicado).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Transparência</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {documentos.length} documento{documentos.length !== 1 ? "s" : ""} —{" "}
            {totalPublicados} publicado{totalPublicados !== 1 ? "s" : ""}
          </p>
        </div>
        <UploadForm />
      </div>

      {/* Aviso storage */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
        <strong>Atenção:</strong> O bucket <code className="font-mono text-xs bg-amber-100 px-1 rounded">documentos-publicos</code> precisa estar criado no Supabase Storage.
        Execute <code className="font-mono text-xs bg-amber-100 px-1 rounded">010_storage_documentos.sql</code> no SQL Editor do Supabase antes de fazer uploads.
      </div>

      {documentos.length === 0 ? (
        <div className="bg-slate-50 border border-gray-200 rounded-2xl p-10 text-center space-y-3">
          <FolderOpen className="size-10 text-gray-300 mx-auto" />
          <p className="font-medium text-gray-700">Nenhum documento cadastrado ainda.</p>
          <p className="text-sm text-gray-500">Use o botão acima para adicionar o primeiro documento.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {gruposOrdenados.map(([cat, { docs }]) => {
            const cfg = CATEGORIA_CONFIG[cat] ?? { label: "Outros", order: 99 };
            const publicados = docs.filter((d) => d.publicado).length;
            return (
              <section key={cat} className="space-y-2">
                <div className="flex items-center gap-2">
                  <FolderOpen className="size-4 text-blue-500" />
                  <h2 className="text-sm font-bold text-gray-800">{cfg.label}</h2>
                  <span className="text-xs text-gray-400 font-medium">
                    {publicados}/{docs.length} publicado{publicados !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                  {docs.map((doc) => (
                    <div key={doc.id} className="flex items-start gap-3 p-4 flex-wrap sm:flex-nowrap">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="size-4 text-blue-600" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900 leading-tight">{doc.titulo}</p>
                          {doc.publicado ? (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                              Publicado
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              Rascunho
                            </span>
                          )}
                        </div>
                        {doc.descricao && (
                          <p className="text-xs text-gray-500 leading-relaxed">{doc.descricao}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          {doc.competencia && (
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3" />
                              {doc.competencia}
                            </span>
                          )}
                          {formatKb(doc.tamanho_kb) && <span>{formatKb(doc.tamanho_kb)}</span>}
                          <span>Adicionado em {formatDate(doc.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={doc.arquivo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline py-1.5"
                        >
                          <ExternalLink className="size-3" />
                          Ver
                        </a>
                        <PublicarBtn id={doc.id} publicado={doc.publicado} />
                        <ExcluirDocBtn id={doc.id} titulo={doc.titulo} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
