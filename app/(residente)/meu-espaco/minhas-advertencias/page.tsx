import type { Metadata } from "next";
import { AlertOctagon, CheckCircle2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getMockAdvertencias } from "@/lib/mock-data";
import { resolveResidenteAcesso } from "@/lib/residente-preview";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Minhas Advertências" };

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

const TIPO_CONFIG = {
  verbal: {
    label: "Advertência Verbal",
    badge: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    icon: "bg-yellow-100 text-yellow-600",
  },
  escrita: {
    label: "Advertência Escrita",
    badge: "bg-orange-100 text-orange-800 border border-orange-200",
    icon: "bg-orange-100 text-orange-600",
  },
  suspensao: {
    label: "Suspensão Temporária",
    badge: "bg-red-100 text-red-800 border border-red-200",
    icon: "bg-red-100 text-red-600",
  },
};

export default async function MinhasAdvertenciasPage() {
  let advertencias: Awaited<ReturnType<typeof getMockAdvertencias>>;

  if (DEV_MODE) {
    advertencias = getMockAdvertencias("r01");
  } else {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const acesso = await resolveResidenteAcesso(supabase, user.id);
    if (!acesso) redirect("/login");

    if (!acesso.residenteId) {
      advertencias = getMockAdvertencias("r01");
    } else {
      const { data } = await supabase
        .from("advertencias")
        .select("*")
        .eq("residente_id", acesso.residenteId)
        .order("created_at", { ascending: false });

      advertencias = data ?? [];
    }
  }

  const pendenteReconhecimento = advertencias.filter((a) => !a.reconhecido_em).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/meu-espaco"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Advertências</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Histórico de advertências recebidas</p>
        </div>
      </div>

      {/* Aviso pendente */}
      {pendenteReconhecimento > 0 && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <AlertOctagon className="size-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800">
              {pendenteReconhecimento === 1
                ? "Você tem 1 advertência aguardando reconhecimento"
                : `Você tem ${pendenteReconhecimento} advertências aguardando reconhecimento`}
            </p>
            <p className="text-xs text-orange-700 mt-0.5">
              Fale com um membro da equipe para reconhecer formalmente.
            </p>
          </div>
        </div>
      )}

      {/* Lista */}
      {advertencias.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <CheckCircle2 className="size-12 mx-auto mb-3 text-green-400" />
          <p className="text-base font-semibold text-gray-700">Nenhuma advertência registrada</p>
          <p className="text-sm text-muted-foreground mt-1">
            Continue assim! Siga as normas da casa e mantenha seu histórico limpo.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {advertencias.map((adv) => {
            const cfg = TIPO_CONFIG[adv.tipo as keyof typeof TIPO_CONFIG] ?? TIPO_CONFIG.verbal;
            return (
              <div key={adv.id} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                {/* Cabeçalho */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(adv.created_at)}</span>
                </div>

                {/* Motivo */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">
                    Motivo
                  </p>
                  <p className="text-sm font-semibold text-gray-900">{adv.motivo}</p>
                </div>

                {/* Descrição */}
                {adv.descricao && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">
                      Descrição
                    </p>
                    <p className="text-sm text-gray-700">{adv.descricao}</p>
                  </div>
                )}

                {/* Reconhecimento */}
                <div className="border-t border-gray-100 pt-2 flex items-center gap-2">
                  {adv.reconhecido_em ? (
                    <>
                      <CheckCircle2 className="size-4 text-green-500 flex-shrink-0" />
                      <span className="text-xs text-green-700">
                        Reconhecido em {formatDate(adv.reconhecido_em)}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertOctagon className="size-4 text-orange-400 flex-shrink-0" />
                      <span className="text-xs text-orange-700 font-medium">
                        Aguardando reconhecimento
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
