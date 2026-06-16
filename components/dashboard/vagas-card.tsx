import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface VagasCardProps {
  ocupadas: number;
  capacidade: number;
}

export function VagasCard({ ocupadas, capacidade }: VagasCardProps) {
  const percentual = capacidade > 0 ? Math.round((ocupadas / capacidade) * 100) : 0;
  const vagas = capacidade - ocupadas;

  const status =
    percentual >= 95
      ? "critico"
      : percentual >= 80
      ? "alerta"
      : "normal";

  return (
    <Link href="/painel/residentes" className="block group">
      <Card
        className={cn(
          "border-2 transition-all h-full group-hover:shadow-md group-hover:-translate-y-0.5",
          status === "critico"
            ? "border-red-200 bg-red-50"
            : status === "alerta"
            ? "border-amber-200 bg-amber-50"
            : "border-sky-100 bg-sky-50"
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Acolhidos
          </CardTitle>
          <Users
            className={cn(
              "size-5",
              status === "critico"
                ? "text-red-600"
                : status === "alerta"
                ? "text-amber-600"
                : "text-sky-600"
            )}
          />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{ocupadas}</span>
            <span className="text-sm text-muted-foreground">
              {ocupadas === 1 ? "ativo" : "ativos"}
            </span>
          </div>
          <Progress
            value={percentual}
            className={cn(
              "h-2",
              status === "critico"
                ? "[&_[data-slot=progress-indicator]]:bg-red-500"
                : status === "alerta"
                ? "[&_[data-slot=progress-indicator]]:bg-amber-500"
                : "[&_[data-slot=progress-indicator]]:bg-sky-500"
            )}
          />
          <div className="flex items-center justify-between">
            <p
              className={cn(
                "text-xs font-medium",
                status === "critico"
                  ? "text-red-700"
                  : status === "alerta"
                  ? "text-amber-700"
                  : "text-sky-700"
              )}
            >
              {vagas === 0
                ? "Capacidade máxima atingida"
                : `${vagas} vaga${vagas !== 1 ? "s" : ""} livre${vagas !== 1 ? "s" : ""} de ${capacidade}`}
            </p>
            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              Ver lista →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
