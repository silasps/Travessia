import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface OcorrenciasAbertasProps {
  count: number;
}

export function OcorrenciasAbertas({ count }: OcorrenciasAbertasProps) {
  return (
    <Link href="/painel/ocorrencias" className="block">
      <Card className={cn("h-full border-2", count > 0 ? "border-amber-200 bg-amber-50" : "border-gray-100")}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Ocorrências
          </CardTitle>
          <AlertTriangle className={cn("size-5", count > 0 ? "text-amber-600" : "text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{count}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {count === 0
              ? "Nenhuma pendente"
              : count === 1
              ? "1 aguardando avaliação"
              : `${count} aguardando avaliação`}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
