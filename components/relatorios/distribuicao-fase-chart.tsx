"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export interface FaseDatum {
  fase: number;
  label: string;
  count: number;
  color: string;
}

interface DistribuicaoFaseChartProps {
  data: FaseDatum[];
  total: number;
}

export function DistribuicaoFaseChart({ data, total }: DistribuicaoFaseChartProps) {
  const hasData = total > 0;
  const pieData = hasData ? data : [{ fase: 0, label: "Sem acolhidos ativos", count: 1, color: "#e5e7eb" }];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative size-36 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="count"
              nameKey="label"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={hasData ? 3 : 0}
              stroke="none"
            >
              {pieData.map((d) => (
                <Cell key={d.fase} fill={d.color} />
              ))}
            </Pie>
            {hasData && (
              <Tooltip formatter={(value, name) => [`${value} acolhido${Number(value) === 1 ? "" : "s"}`, name]} />
            )}
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-gray-900">{total}</span>
          <span className="text-[11px] text-muted-foreground">ativos</span>
        </div>
      </div>

      <div className="w-full sm:w-auto space-y-2.5">
        {data.map((d) => {
          const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
          return (
            <div key={d.fase} className="flex items-center gap-2.5">
              <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-xs font-medium text-gray-700 w-32 truncate">
                F{d.fase} {d.label}
              </span>
              <span className="text-xs font-mono text-gray-500 shrink-0">
                {d.count} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
