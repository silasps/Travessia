import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, MapPin, ClipboardCheck, AlertTriangle } from "lucide-react";
import { MOCK_OCORRENCIAS, MOCK_RESIDENTES, MOCK_STAFF } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { AvaliacaoForm } from "@/components/ocorrencias/avaliacao-form";
import { formatDate, formatDateTime } from "@/lib/utils/format";

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (DEV_MODE) {
    const oc = MOCK_OCORRENCIAS.find((o) => o.id === id);
    return { title: oc ? `Ocorrência ${oc.numero}` : "Ocorrência" };
  }
  const supabase = await createClient();
  const { data } = await supabase.from("ocorrencias").select("numero").eq("id", id).maybeSingle();
  return { title: data ? `Ocorrência ${data.numero}` : "Ocorrência" };
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OcData = any;

export default async function OcorrenciaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let oc: OcData;
  let residenteNome: string | null = null;
  let residenteProntuario: string | null = null;
  let residenteId: string | null = null;
  let abertoPorNome: string | null = null;
  let avaliadoPorNome: string | null = null;

  if (DEV_MODE) {
    oc = MOCK_OCORRENCIAS.find((o) => o.id === id);
    if (!oc) notFound();
    const residente = MOCK_RESIDENTES.find((r) => r.id === oc.residente_id);
    residenteNome = residente ? (residente.nome_social ?? residente.nome_completo) : null;
    residenteProntuario = residente?.numero_prontuario ?? null;
    residenteId = oc.residente_id;
    abertoPorNome = MOCK_STAFF.find((s) => s.id === oc.aberto_por)?.full_name ?? null;
    avaliadoPorNome = oc.avaliado_por ? (MOCK_STAFF.find((s) => s.id === oc.avaliado_por)?.full_name ?? null) : null;
  } else {
    const supabase = await createClient();
    const { data } = await supabase.from("ocorrencias").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    oc = data;
    residenteId = oc.residente_id;

    const [{ data: resData }, { data: staffData }] = await Promise.all([
      supabase.from("residentes").select("nome_completo, nome_social, numero_prontuario").eq("id", oc.residente_id).maybeSingle(),
      supabase.from("staff_profiles").select("user_id, full_name"),
    ]);

    if (resData) {
      residenteNome = resData.nome_social ?? resData.nome_completo;
      residenteProntuario = resData.numero_prontuario;
    }
    const staffMap = new Map((staffData ?? []).map((s) => [s.user_id, s.full_name]));
    abertoPorNome = staffMap.get(oc.aberto_por) ?? null;
    avaliadoPorNome = oc.avaliado_por ? (staffMap.get(oc.avaliado_por) ?? null) : null;
  }

  const gravCfg = GRAVIDADE_CONFIG[oc.gravidade as keyof typeof GRAVIDADE_CONFIG] ?? GRAVIDADE_CONFIG.moderada;
  const statusCfg = STATUS_CONFIG[oc.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.aberta;
  const podeAvaliar = oc.status === "aberta" || oc.status === "em_avaliacao";

  return (
    <div className="space-y-5 max-w-2xl">
      <Link
        href="/painel/ocorrencias"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Ocorrências
      </Link>

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

      {residenteNome && residenteId && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Acolhido envolvido</span>
          </div>
          <Link href={`/painel/residentes/${residenteId}`} className="font-semibold text-blue-700 hover:underline">
            {residenteNome}
          </Link>
          {residenteProntuario && (
            <p className="text-xs text-muted-foreground mt-0.5">{residenteProntuario}</p>
          )}
        </div>
      )}

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
        <InfoRow label="Registrado por" value={abertoPorNome ?? oc.aberto_por} />
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

      {oc.status === "confirmada" || oc.status === "improcedente" ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="size-4 text-green-600" />
            Avaliação da Coordenação
          </h2>
          <InfoRow label="Avaliado por" value={avaliadoPorNome ?? oc.avaliado_por ?? "—"} />
          <InfoRow label="Data da avaliação" value={oc.data_avaliacao ? formatDate(oc.data_avaliacao) : "—"} />
          {oc.parecer && (
            <div className="pt-2 border-t border-gray-50">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Parecer</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{oc.parecer}</p>
            </div>
          )}
        </div>
      ) : null}

      {podeAvaliar && <AvaliacaoForm />}
    </div>
  );
}

function InfoRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-4">
      <span className="text-xs font-medium text-muted-foreground sm:w-36 shrink-0">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}
