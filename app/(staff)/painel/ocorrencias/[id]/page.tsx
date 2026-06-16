import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, MapPin, ClipboardCheck, AlertTriangle } from "lucide-react";
import { MOCK_OCORRENCIAS, MOCK_RESIDENTES, MOCK_STAFF } from "@/lib/mock-data";
import { AvaliacaoForm } from "@/components/ocorrencias/avaliacao-form";
import { formatDate, formatDateTime } from "@/lib/utils/format";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const oc = MOCK_OCORRENCIAS.find((o) => o.id === id);
  return { title: oc ? `Ocorrência ${oc.numero}` : "Ocorrência" };
}

const GRAVIDADE_CONFIG = {
  leve:       { label: "Leve",       className: "bg-yellow-100 text-yellow-800 border border-yellow-200" },
  moderada:   { label: "Moderada",   className: "bg-orange-100 text-orange-800 border border-orange-200" },
  grave:      { label: "Grave",      className: "bg-red-100 text-red-800 border border-red-200" },
  gravissima: { label: "Gravíssima", className: "bg-red-200 text-red-900 border border-red-300 font-bold" },
};

const STATUS_CONFIG = {
  aberta:       { label: "Aberta",       dot: "bg-blue-500" },
  em_avaliacao: { label: "Em avaliação", dot: "bg-amber-500" },
  confirmada:   { label: "Confirmada",   dot: "bg-gray-500" },
  improcedente: { label: "Improcedente", dot: "bg-green-500" },
};

export default async function OcorrenciaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const oc = MOCK_OCORRENCIAS.find((o) => o.id === id);
  if (!oc) notFound();

  const residente = MOCK_RESIDENTES.find((r) => r.id === oc.residente_id);
  const abertoPorStaff = MOCK_STAFF.find((s) => s.id === oc.aberto_por);
  const avaliadoPorStaff = oc.avaliado_por ? MOCK_STAFF.find((s) => s.id === oc.avaliado_por) : null;

  const gravCfg = GRAVIDADE_CONFIG[oc.gravidade];
  const statusCfg = STATUS_CONFIG[oc.status];
  const podeAvaliar = oc.status === "aberta" || oc.status === "em_avaliacao";

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Voltar */}
      <Link
        href="/painel/ocorrencias"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Ocorrências
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-muted-foreground">{oc.numero}</p>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">Ocorrência</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${gravCfg.className}`}>
            {gravCfg.label}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
            <span className={`size-2 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Card: Acolhido */}
      {residente && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Acolhido envolvido</span>
          </div>
          <Link
            href={`/painel/residentes/${residente.id}`}
            className="font-semibold text-blue-700 hover:underline"
          >
            {residente.nome_social ?? residente.nome_completo}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">{residente.numero_prontuario}</p>
        </div>
      )}

      {/* Card: Detalhes da ocorrência */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="size-4 text-orange-500" />
          Relato da Ocorrência
        </h2>

        <InfoRow label="Data / Hora" value={formatDateTime(oc.data_ocorrencia)} />
        {oc.local && (
          <InfoRow
            label={<span className="flex items-center gap-1"><MapPin className="size-3.5" /> Local</span>}
            value={oc.local}
          />
        )}
        {oc.testemunhas && <InfoRow label="Testemunhas" value={oc.testemunhas} />}
        <InfoRow label="Registrado por" value={abertoPorStaff?.full_name ?? oc.aberto_por} />
        <InfoRow label="Data do registro" value={formatDateTime(oc.created_at)} />

        <div className="pt-2 border-t border-gray-50">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Descrição</p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{oc.descricao}</p>
        </div>

        {oc.providencias && (
          <div className="pt-2 border-t border-gray-50">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Providências tomadas</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{oc.providencias}</p>
          </div>
        )}
      </div>

      {/* Card: Avaliação — se já houver */}
      {oc.status === "confirmada" || oc.status === "improcedente" ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="size-4 text-green-600" />
            Avaliação da Coordenação
          </h2>
          <InfoRow label="Avaliado por" value={avaliadoPorStaff?.full_name ?? oc.avaliado_por ?? "—"} />
          <InfoRow label="Data da avaliação" value={oc.data_avaliacao ? formatDate(oc.data_avaliacao) : "—"} />
          <InfoRow
            label="Decisão"
            value={
              <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${statusCfg.dot.replace("bg-", "text-white bg-")}`}>
                {statusCfg.label}
              </span>
            }
          />
          {oc.parecer && (
            <div className="pt-2 border-t border-gray-50">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Parecer</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{oc.parecer}</p>
            </div>
          )}
        </div>
      ) : null}

      {/* Formulário de avaliação — apenas para pendentes */}
      {podeAvaliar && <AvaliacaoForm />}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-4">
      <span className="text-xs font-medium text-muted-foreground sm:w-36 shrink-0">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}
