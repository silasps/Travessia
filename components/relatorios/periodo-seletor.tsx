import Link from "next/link";
import { Calendar, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "@/lib/utils/format";
import { getPeriodoPresets } from "@/lib/relatorios/data";

interface PeriodoSeletorProps {
  dataInicio: string;
  dataFim: string;
  basePath: string;
  aba?: string;
}

export function PeriodoSeletor({ dataInicio, dataFim, basePath, aba }: PeriodoSeletorProps) {
  const presets = getPeriodoPresets();
  const presetAtivo = presets.find((p) => p.de === dataInicio && p.ate === dataFim);

  const buildHref = (de: string, ate: string) =>
    `${basePath}?de=${de}&ate=${ate}${aba ? `&aba=${aba}` : ""}`;

  return (
    <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 overflow-x-auto self-start shrink-0">
      {presets.map((p) => (
        <Link
          key={p.id}
          href={buildHref(p.de, p.ate)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            presetAtivo?.id === p.id
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {p.label}
        </Link>
      ))}
      <Popover>
        <PopoverTrigger
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
            !presetAtivo ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Calendar className="size-3.5" />
          {!presetAtivo ? `${formatDate(dataInicio)} – ${formatDate(dataFim)}` : "Personalizado"}
          <ChevronDown className="size-3.5" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto">
          <form method="GET" action={basePath} className="flex flex-col gap-3 p-1">
            {aba && <input type="hidden" name="aba" value={aba} />}
            <div className="flex items-end gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">De</label>
                <input
                  type="date"
                  name="de"
                  defaultValue={dataInicio}
                  className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Até</label>
                <input
                  type="date"
                  name="ate"
                  defaultValue={dataFim}
                  className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <button
              type="submit"
              className="h-9 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition-colors cursor-pointer"
            >
              Aplicar período
            </button>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}
