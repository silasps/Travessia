import type { Metadata } from "next";
import { User, Shield } from "lucide-react";
import { getMockResidente } from "@/lib/mock-data";
import { formatDate, maskCPF } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Meu Perfil" };

export default async function MeuPerfilPage() {
  // Em produção: buscar via portal do residente autenticado
  const r = getMockResidente("r01")!;
  const nomeExibido = r.nome_social ?? r.nome_completo;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Seus dados pessoais no programa</p>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center py-4">
        <div className="size-24 rounded-full bg-blue-100 flex items-center justify-center">
          {r.foto_url ? (
            <img src={r.foto_url} alt={nomeExibido} className="size-24 rounded-full object-cover" />
          ) : (
            <User className="size-12 text-blue-600" />
          )}
        </div>
        <p className="text-xl font-bold text-gray-900 mt-3">{nomeExibido}</p>
        <p className="text-sm text-muted-foreground">{r.numero_prontuario}</p>
      </div>

      {/* Dados pessoais */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
        <h2 className="font-semibold text-gray-900">Identificação</h2>

        {r.nome_social && (
          <InfoRow label="Nome completo" value={r.nome_completo} />
        )}
        <InfoRow label="Nome social" value={r.nome_social ?? "—"} />
        <InfoRow
          label="CPF"
          value={r.cpf ? maskCPF(r.cpf) : "Não informado"}
        />
        <InfoRow label="Data de nascimento" value={r.data_nascimento ? formatDate(r.data_nascimento) : "—"} />
        <InfoRow label="Naturalidade" value={r.naturalidade ?? "—"} />
      </div>

      {/* Situação no programa */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
        <h2 className="font-semibold text-gray-900">Situação no programa</h2>
        <InfoRow label="Prontuário" value={r.numero_prontuario} />
        <InfoRow label="Data de entrada" value={formatDate(r.data_entrada)} />
        <InfoRow label="Fase atual" value={`Fase ${r.fase_atual}`} />
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
        {r.lgpd_consent_at && (
          <p className="text-xs text-blue-700 mt-1">
            Consentimento registrado em {formatDate(r.lgpd_consent_at)}
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
