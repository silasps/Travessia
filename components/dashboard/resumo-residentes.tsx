import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface ResumoResidentesProps {
  total: number;
}

export function ResumoResidentes({ total }: ResumoResidentesProps) {
  return (
    <Link href="/painel/residentes" className="block group">
      <Card className="h-full border-2 border-green-100 bg-green-50 transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Acolhidos Ativos
          </CardTitle>
          <Users className="size-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{total}</div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">
              {total === 1 ? "1 acolhido ativo" : `${total} acolhidos ativos`}
            </p>
            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              Ver →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
