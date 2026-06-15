import type { Metadata } from "next";
import { CheckCircle2, Clock, Star, Target } from "lucide-react";
import { getMockResidente, getMockMarcos, MOCK_FASES } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Minha Evolução" };

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

const FASE_CONFIG = [
  { fase: 1, label: "Acolhimento",   cor: "blue" },
  { fase: 2, label: "Reorganização", cor: "amber" },
  { fase: 3, label: "Autonomia",     cor: "green" },
  { fase: 4, label: "Preparação",    cor: "purple" },
];

const COR_CLASSES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  blue:   { bg: "bg-blue-100",   border: "border-blue-300",   text: "text-blue-800",   dot: "bg-blue-500" },
  amber:  { bg: "bg-amber-100",  border: "border-amber-300",  text: "text-amber-800",  dot: "bg-amber-500" },
  green:  { bg: "bg-green-100",  border: "border-green-300",  text: "text-green-800",  dot: "bg-green-500" },
  purple: { bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-800", dot: "bg-purple-500" },
  gray:   { bg: "bg-gray-100",   border: "border-gray-200",   text: "text-gray-500",   dot: "bg-gray-300" },
};

export default async function MinhaEvolucaoPage() {
  // Em produção, buscar do banco via portal
  const residente = getMockResidente("r01")!;
  const marcos = getMockMarcos("r01");
  const faseAtual = residente.fase_atual;

  const faseInfo = MOCK_FASES.find((f) => f.numero === faseAtual);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minha Evolução</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Sua jornada no Projeto Travessia</p>
      </div>

      {/* Progresso de fases */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <h2 className="font-semibold text-gray-900 text-base">Onde você está</h2>
        <div className="flex items-center gap-1">
          {FASE_CONFIG.map((f, i) => {
            const concluida = f.fase < faseAtual;
            const atual = f.fase === faseAtual;
            const futura = f.fase > faseAtual;
            const cor = atual ? f.cor : futura ? "gray" : f.cor;
            const cls = COR_CLASSES[cor];

            return (
              <div key={f.fase} className="flex items-center flex-1 min-w-0">
                <div
                  className={`flex flex-col items-center gap-1 flex-1 min-w-0 p-2 rounded-xl border-2 transition-all ${
                    atual
                      ? `${cls.bg} ${cls.border}`
                      : futura
                      ? "bg-gray-50 border-gray-200"
                      : `${cls.bg} border-transparent`
                  }`}
                >
                  <span className={`text-xs font-bold ${atual ? cls.text : futura ? "text-gray-400" : cls.text}`}>
                    F{f.fase}
                  </span>
                  {concluida && <CheckCircle2 className={`size-4 ${cls.text}`} />}
                  {atual && <Star className={`size-4 ${cls.text}`} />}
                  {futura && <Clock className="size-4 text-gray-300" />}
                  <span className={`text-[10px] text-center leading-tight hidden sm:block ${futura ? "text-gray-400" : cls.text}`}>
                    {f.label}
                  </span>
                </div>
                {i < FASE_CONFIG.length - 1 && (
                  <div className={`h-0.5 w-3 shrink-0 ${f.fase < faseAtual ? COR_CLASSES[FASE_CONFIG[i + 1].cor].dot : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {faseInfo && (
          <div className={`rounded-xl p-3 ${COR_CLASSES[FASE_CONFIG[faseAtual - 1].cor].bg}`}>
            <p className={`text-sm font-medium ${COR_CLASSES[FASE_CONFIG[faseAtual - 1].cor].text} mb-1`}>
              Você está na {faseInfo.nome}
            </p>
            <p className="text-sm text-gray-700">{faseInfo.descricao}</p>
          </div>
        )}
      </div>

      {/* Objetivos da fase atual */}
      {faseInfo?.objetivos && faseInfo.objetivos.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <h2 className="font-semibold text-gray-900 text-base flex items-center gap-2">
            <Target className="size-5 text-blue-600" />
            Seus objetivos agora
          </h2>
          <ul className="space-y-2">
            {faseInfo.objetivos.map((obj, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-800">
                <span className="size-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Conquistas / marcos */}
      {marcos.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900 text-base flex items-center gap-2">
            <Star className="size-5 text-amber-500" />
            Suas conquistas
          </h2>
          <div className="space-y-2">
            {[...marcos].reverse().map((m) => (
              <div key={m.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3">
                <div className="size-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Star className="size-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-base">{m.descricao}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(m.data_marco)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {marcos.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          <Star className="size-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium text-base">Suas conquistas aparecerão aqui</p>
          <p className="text-sm mt-1">Continue firme no programa!</p>
        </div>
      )}
    </div>
  );
}
