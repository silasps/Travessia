import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface ResumoResidentesProps {
  total: number;
}

export function ResumoResidentes({ total }: ResumoResidentesProps) {
  return (
    <Link href="/painel/residentes" className="block">
      <Card className="h-full border-2 border-green-100 bg-green-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Acolhidos Ativos
          </CardTitle>
          <Users className="size-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {total === 1 ? "1 acolhido ativo" : `${total} acolhidos ativos`}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
