import { useMemo } from "react";

interface HeatmapCell {
  x: string;
  y: string;
  value: number;
  label: string;
}

interface RiskHeatmapProps {
  title?: string;
  data?: HeatmapCell[];
}

const defaultData: HeatmapCell[] = (() => {
  const xLabels = ["Drilling Risk", "Reservoir Risk", "Regulatory", "Market Price", "Technology"];
  const yLabels = ["Very Low", "Low", "Medium", "High", "Very High"];
  const cells: HeatmapCell[] = [];
  const values = [
    [0.02, 0.05, 0.03, 0.08, 0.01],
    [0.05, 0.12, 0.08, 0.15, 0.04],
    [0.15, 0.25, 0.18, 0.22, 0.10],
    [0.30, 0.35, 0.28, 0.20, 0.18],
    [0.48, 0.23, 0.43, 0.35, 0.67],
  ];
  for (let yi = 0; yi < yLabels.length; yi++) {
    for (let xi = 0; xi < xLabels.length; xi++) {
      cells.push({ x: xLabels[xi], y: yLabels[yi], value: values[yi][xi], label: `${(values[yi][xi] * 100).toFixed(0)}%` });
    }
  }
  return cells;
})();

function getColor(value: number): string {
  if (value < 0.1) return "rgba(16,185,129,0.3)";
  if (value < 0.2) return "rgba(16,185,129,0.6)";
  if (value < 0.3) return "rgba(245,158,11,0.5)";
  if (value < 0.4) return "rgba(232,101,45,0.6)";
  return "rgba(239,68,68,0.7)";
}

function getTextColor(value: number): string {
  if (value < 0.2) return "#6ee7b7";
  if (value < 0.3) return "#fbbf24";
  if (value < 0.4) return "#fb923c";
  return "#fca5a5";
}

export default function RiskHeatmap({ title = "Risk Factor Correlation Matrix", data }: RiskHeatmapProps) {
  const cells = data || defaultData;

  const { xLabels, yLabels } = useMemo(() => {
    const xs = [...new Set(cells.map(c => c.x))];
    const ys = [...new Set(cells.map(c => c.y))];
    return { xLabels: xs, yLabels: ys };
  }, [cells]);

  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-3">{title}</h3>
      <div className="overflow-x-auto">
        <div className="inline-grid gap-1" style={{ gridTemplateColumns: `80px repeat(${xLabels.length}, 1fr)` }}>
          {/* Header row */}
          <div />
          {xLabels.map(x => (
            <div key={x} className="text-xs text-slate-400 text-center px-2 py-1 font-medium truncate" style={{ minWidth: 80 }}>{x}</div>
          ))}
          {/* Data rows */}
          {yLabels.map(y => (
            <>
              <div key={`label-${y}`} className="text-xs text-slate-400 flex items-center pr-2 font-medium">{y}</div>
              {xLabels.map(x => {
                const cell = cells.find(c => c.x === x && c.y === y);
                const val = cell?.value ?? 0;
                return (
                  <div key={`${x}-${y}`} className="rounded-md flex items-center justify-center text-xs font-semibold tabular-nums transition-all hover:scale-105 cursor-default" style={{ background: getColor(val), color: getTextColor(val), minWidth: 80, height: 36 }}>
                    {cell?.label ?? "—"}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        <span className="text-xs text-slate-500">Impact:</span>
        {[
          { label: "Low", color: "rgba(16,185,129,0.4)" },
          { label: "Medium", color: "rgba(245,158,11,0.5)" },
          { label: "High", color: "rgba(232,101,45,0.6)" },
          { label: "Critical", color: "rgba(239,68,68,0.7)" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
            <span className="text-xs text-slate-400">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
