import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { User, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { resolveResidenteAcesso } from "@/lib/residente-preview";
import { getMockResidente } from "@/lib/mock-data";
import { formatDate, maskCPF } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Meu Perfil" };

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

interface PerfilData {
  nomeCompleto: string;
  nomeSocial: string | null;
  cpf: string | null;
  dataNascimento: string | null;
  naturalidade: string | null;
  numeroProntuario: string;
  dataEntrada: string;
  faseAtual: number;
  fotoUrl: string | null;
  lgpdConsentAt: string | null;
}

function fromMock(): PerfilData {
  const r = getMockResidente("r01")!;
  return {
    nomeCompleto: r.nome_completo,
    nomeSocial: r.nome_social,
    cpf: r.cpf,
    dataNascimento: r.data_nascimento,
    naturalidade: r.naturalidade,
    numeroProntuario: r.numero_prontuario,
    dataEntrada: r.data_entrada,
    faseAtual: r.fase_atual,
    fotoUrl: r.foto_url,
    lgpdConsentAt: r.lgpd_consent_at,
  };
}

export default async function MeuPerfilPage() {
  let perfil: PerfilData;

  if (DEV_MODE) {
    perfil = fromMock();
  } else {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const acesso = await resolveResidenteAcesso(supabase, user.id);
    if (!acesso) redirect("/login");

    if (!acesso.residenteId) {
      perfil = fromMock();
    } else {
      const { data: r } = await supabase
        .from("residentes")
        .select(
          "nome_completo, nome_social, cpf, data_nascimento, naturalidade, numero_prontuario, data_entrada, fase_atual, foto_url, lgpd_consent_at"
        )
        .eq("id", acesso.residenteId)
        .single();
      if (!r) redirect("/login");

      perfil = {
        nomeCompleto: r.nome_completo,
        nomeSocial: r.nome_social,
        cpf: r.cpf,
        dataNascimento: r.data_nascimento,
        naturalidade: r.naturalidade,
        numeroProntuario: r.numero_prontuario,
        dataEntrada: r.data_entrada,
        faseAtual: r.fase_atual,
        fotoUrl: r.foto_url,
        lgpdConsentAt: r.lgpd_consent_at,
      };
    }
  }

  const nomeExibido = perfil.nomeSocial ?? perfil.nomeCompleto;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Seus dados pessoais no programa</p>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center py-4">
        <div className="size-24 rounded-full bg-blue-100 flex items-center justify-center">
          {perfil.fotoUrl ? (
            <Image
              src={perfil.fotoUrl}
              alt={nomeExibido}
              width={96}
              height={96}
              className="size-24 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <User className="size-12 text-blue-600" />
          )}
        </div>
        <p className="text-xl font-bold text-gray-900 mt-3">{nomeExibido}</p>
        <p className="text-sm text-muted-foreground">{perfil.numeroProntuario}</p>
      </div>

      {/* Dados pessoais */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
        <h2 className="font-semibold text-gray-900">Identificação</h2>

        {perfil.nomeSocial && (
          <InfoRow label="Nome completo" value={perfil.nomeCompleto} />
        )}
        <InfoRow label="Nome social" value={perfil.nomeSocial ?? "—"} />
        <InfoRow
          label="CPF"
          value={perfil.cpf ? maskCPF(perfil.cpf) : "Não informado"}
        />
        <InfoRow label="Data de nascimento" value={perfil.dataNascimento ? formatDate(perfil.dataNascimento) : "—"} />
        <InfoRow label="Naturalidade" value={perfil.naturalidade ?? "—"} />
      </div>

      {/* Situação no programa */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
        <h2 className="font-semibold text-gray-900">Situação no programa</h2>
        <InfoRow label="Prontuário" value={perfil.numeroProntuario} />
        <InfoRow label="Data de entrada" value={formatDate(perfil.dataEntrada)} />
        <InfoRow label="Fase atual" value={`Fase ${perfil.faseAtual}`} />
      </div>

      {/* Privacidade */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-blue-600" />
          <h2 className="font-semibold text-blue-900">Seus dados estão protegidos</h2>
        </div>
        <p className="text-sm text-blue-800">
          Suas informações são guardadas com segurança e usadas apenas para seu acompanhamento social. Você tem direito de pedir acesso, correção ou exclusão dos seus dados a qualquer momento.
        </p>
        {perfil.lgpdConsentAt && (
          <p className="text-xs text-blue-700 mt-1">
            Consentimento registrado em {formatDate(perfil.lgpdConsentAt)}
          </p>
        )}
      </div>

      {/* Aviso somente leitura */}
      <p className="text-xs text-center text-muted-foreground pb-2">
        Para atualizar seus dados, fale com a equipe técnica.
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-base text-gray-900">{value}</span>
    </div>
  );
}
