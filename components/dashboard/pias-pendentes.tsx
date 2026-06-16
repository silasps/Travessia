import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

interface PiasPendentesProps {
  count: number;
}

export function PiasPendentes({ count }: PiasPendentesProps) {
  return (
    <Link href="/painel/residentes?pia=pendente&status=todos" className="block group">
      <Card className={cn("h-full border-2 transition-all group-hover:shadow-md group-hover:-translate-y-0.5", count > 0 ? "border-purple-200 bg-purple-50" : "border-gray-100")}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            PIAs Pendentes
          </CardTitle>
          <ClipboardList className={cn("size-5", count > 0 ? "text-purple-600" : "text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{count}</div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">
              {count === 0
                ? "Todos em dia"
                : count === 1
                ? "1 PIA em rascunho ou revisão"
                : `${count} PIAs em rascunho ou revisão`}
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
