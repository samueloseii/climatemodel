import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Sliders, RotateCcw, Download, Info } from "lucide-react";

interface Variable {
  id: string;
  name: string;
  base: number;
  low: number;
  high: number;
  unit: string;
}

const defaultVariables: Variable[] = [
  { id: "1", name: "Drilling Cost", base: 65, low: 45, high: 95, unit: "$/ft" },
  { id: "2", name: "Bore Depth", base: 300, low: 200, high: 500, unit: "ft" },
  { id: "3", name: "Heat Pump Cost", base: 25000, low: 18000, high: 35000, unit: "$" },
  { id: "4", name: "Annual Energy Savings", base: 6500, low: 4000, high: 9000, unit: "$/yr" },
  { id: "5", name: "Discount Rate", base: 5, low: 3, high: 8, unit: "%" },
  { id: "6", name: "Energy Escalation", base: 3, low: 1, high: 5, unit: "%" },
  { id: "7", name: "Carbon Credits", base: 2000, low: 500, high: 5000, unit: "$/yr" },
  { id: "8", name: "System Lifetime", base: 25, low: 15, high: 35, unit: "years" },
];

function computeNPV(vars: Record<string, number>): number {
  const drillingCost = (vars["Drilling Cost"] || 65) * (vars["Bore Depth"] || 300);
  const heatPumpCost = vars["Heat Pump Cost"] || 25000;
  const totalCapex = drillingCost + heatPumpCost;
  const annualSavings = vars["Annual Energy Savings"] || 6500;
  const carbonCredits = vars["Carbon Credits"] || 2000;
  const discountRate = (vars["Discount Rate"] || 5) / 100;
  const escalation = (vars["Energy Escalation"] || 3) / 100;
  const life = vars["System Lifetime"] || 25;

  let npv = -totalCapex;
  for (let t = 1; t <= life; t++) {
    const cf = annualSavings * Math.pow(1 + escalation, t) + carbonCredits;
    npv += cf / Math.pow(1 + discountRate, t);
  }
  return npv;
}

export default function SensitivityAnalysis() {
  const [variables, setVariables] = useState<Variable[]>(defaultVariables);

  const baseValues: Record<string, number> = {};
  variables.forEach(v => { baseValues[v.name] = v.base; });
  const baseNPV = useMemo(() => computeNPV(baseValues), [variables]);

  const tornadoData = useMemo(() => {
    return variables.map(v => {
      const lowVals = { ...baseValues, [v.name]: v.low };
      const highVals = { ...baseValues, [v.name]: v.high };
      const npvLow = computeNPV(lowVals);
      const npvHigh = computeNPV(highVals);
      const downside = Math.min(npvLow, npvHigh) - baseNPV;
      const upside = Math.max(npvLow, npvHigh) - baseNPV;
      return {
        name: v.name,
        downside: Math.round(downside),
        upside: Math.round(upside),
        range: Math.round(Math.abs(upside - downside)),
        low: v.low,
        high: v.high,
        unit: v.unit,
      };
    }).sort((a, b) => b.range - a.range);
  }, [variables]);

  const spiderLineData = useMemo(() => {
    const steps = [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50];
    return steps.map(pct => {
      const row: Record<string, number | string> = { pctChange: `${pct > 0 ? "+" : ""}${pct}%` };
      variables.slice(0, 5).forEach(v => {
        const adjusted = v.base * (1 + pct / 100);
        const vals = { ...baseValues, [v.name]: adjusted };
        row[v.name] = Math.round(computeNPV(vals) - baseNPV);
      });
      return row;
    });
  }, [variables]);

  const updateVariable = (id: string, field: keyof Variable, value: number) => {
    setVariables(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const fmt = (v: number) => {
    if (Math.abs(v) >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
    if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  };

  const colors = ["#2B7BC2", "#E8652D", "#10b981", "#a855f7", "#f59e0b"];

  return (
    <div className="space-y-5 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sensitivity <span className="gradient-text">Analysis</span></h1>
          <p className="text-sm text-slate-400 mt-0.5">Identify which variables have the greatest impact on project NPV</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setVariables(defaultVariables)} className="btn-secondary flex items-center gap-1.5 text-xs">
            <RotateCcw size={14} /> Reset
          </button>
          <button className="btn-secondary flex items-center gap-1.5 text-xs">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Base NPV */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sliders size={18} style={{ color: "#2B7BC2" }} />
          <div>
            <p className="text-sm font-semibold text-white">Base Case NPV: <span className="text-emerald-400 tabular-nums">{fmt(baseNPV)}</span></p>
            <p className="text-xs text-slate-500">Computed from current parameter values below</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Info size={12} className="text-slate-500" />
          <span className="text-xs text-slate-500">Drag sliders to adjust variable ranges</span>
        </div>
      </div>

      {/* Variable Controls with Range Sliders */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Input Variables <span className="text-slate-500 font-normal">— adjust base, low, and high values</span></h3>
        <div className="grid grid-cols-2 gap-4">
          {variables.map(v => (
            <div key={v.id} className="rounded-lg p-3" style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(51,65,85,0.3)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">{v.name}</span>
                <span className="text-xs text-slate-500">{v.unit}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div>
                  <label className="text-xs text-red-400 block mb-0.5">Low</label>
                  <input type="number" value={v.low} onChange={e => updateVariable(v.id, "low", Number(e.target.value))} className="input-dark w-full text-xs py-1 tabular-nums" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-0.5">Base</label>
                  <input type="number" value={v.base} onChange={e => updateVariable(v.id, "base", Number(e.target.value))} className="input-dark w-full text-xs py-1 tabular-nums" />
                </div>
                <div>
                  <label className="text-xs text-emerald-400 block mb-0.5">High</label>
                  <input type="number" value={v.high} onChange={e => updateVariable(v.id, "high", Number(e.target.value))} className="input-dark w-full text-xs py-1 tabular-nums" />
                </div>
              </div>
              <input type="range" min={v.low} max={v.high} value={v.base} onChange={e => updateVariable(v.id, "base", Number(e.target.value))} className="range-slider w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Tornado Chart */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Tornado Chart — NPV Impact Range</h3>
        <p className="text-xs text-slate-500 mb-4">Variables sorted by their total impact on NPV when varied between low and high values</p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={tornadoData} layout="vertical" barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v: number) => fmt(v)} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
              formatter={(value: number, name: string) => [fmt(value), name === "downside" ? "Downside" : "Upside"]}
            />
            <Bar dataKey="downside" fill="#ef4444" radius={[4, 0, 0, 4]} name="Downside" opacity={0.8} />
            <Bar dataKey="upside" fill="#10b981" radius={[0, 4, 4, 0]} name="Upside" opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Spider / Sensitivity Lines */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Spider Plot — NPV Sensitivity to % Change</h3>
        <p className="text-xs text-slate-500 mb-4">Shows how NPV deviates from base case as each variable changes by ±50% (top 5 variables)</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={spiderLineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="pctChange" tick={{ fontSize: 10, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v: number) => fmt(v)} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} formatter={(value: number) => [fmt(value as number), undefined]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {variables.slice(0, 5).map((v, i) => (
              <Bar key={v.id} dataKey={v.name} fill={colors[i]} opacity={0.7} radius={[2, 2, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Key Findings */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Key Findings</h3>
        <div className="space-y-2">
          {tornadoData.slice(0, 3).map((v, i) => (
            <div key={v.name} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: i === 0 ? "rgba(232,101,45,0.06)" : "rgba(43,123,194,0.04)", border: `1px solid ${i === 0 ? "rgba(232,101,45,0.15)" : "rgba(43,123,194,0.1)"}` }}>
              <span className="text-xs font-bold text-white w-5">#{i + 1}</span>
              <span className="text-xs text-slate-300 flex-1">
                <strong className="text-white">{v.name}</strong> has the {i === 0 ? "highest" : `${i === 1 ? "2nd" : "3rd"} highest`} impact on project NPV with a total swing of <strong className="text-white">{fmt(v.range)}</strong> ({v.low}–{v.high} {v.unit})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
