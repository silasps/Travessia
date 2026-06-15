import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BedDouble } from "lucide-react";
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
    <Link href="/painel/residentes" className="block">
      <Card
        className={cn(
          "border-2 transition-colors h-full",
          status === "critico"
            ? "border-red-200 bg-red-50"
            : status === "alerta"
            ? "border-amber-200 bg-amber-50"
            : "border-blue-100 bg-blue-50"
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Vagas
          </CardTitle>
          <BedDouble
            className={cn(
              "size-5",
              status === "critico"
                ? "text-red-600"
                : status === "alerta"
                ? "text-amber-600"
                : "text-blue-600"
            )}
          />
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-3xl font-bold text-gray-900">{ocupadas}</span>
            <span className="text-lg text-muted-foreground">/{capacidade}</span>
          </div>
          <Progress
            value={percentual}
            className={cn(
              "h-2",
              status === "critico"
                ? "[&>div]:bg-red-500"
                : status === "alerta"
                ? "[&>div]:bg-amber-500"
                : "[&>div]:bg-blue-500"
            )}
          />
          <p
            className={cn(
              "text-xs font-medium",
              status === "critico"
                ? "text-red-700"
                : status === "alerta"
                ? "text-amber-700"
                : "text-blue-700"
            )}
          >
            {vagas === 0
              ? "Capacidade máxima atingida"
              : vagas === 1
              ? "1 vaga disponível"
              : `${vagas} vagas disponíveis`}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
