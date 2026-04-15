import { useState, useMemo } from "react";
import { Swords, Info, Plus, Trash2, RotateCcw } from "lucide-react";
import { minimaxRegret, maximin, maximax, hurwiczCriterion } from "../data/simulationEngine";
import type { DecisionOption } from "../data/simulationEngine";

const defaultOptions: DecisionOption[] = [
  { name: "Construction-to-Term Loan", outcomes: [
    { state: "Strong Market", value: 1200000 },
    { state: "Base Case", value: 450000 },
    { state: "Weak Market", value: -180000 },
    { state: "Adverse Scenario", value: -520000 },
  ]},
  { name: "Convertible Grant + Equity", outcomes: [
    { state: "Strong Market", value: 950000 },
    { state: "Base Case", value: 520000 },
    { state: "Weak Market", value: 80000 },
    { state: "Adverse Scenario", value: -150000 },
  ]},
  { name: "Tax Equity Partnership", outcomes: [
    { state: "Strong Market", value: 800000 },
    { state: "Base Case", value: 380000 },
    { state: "Weak Market", value: 150000 },
    { state: "Adverse Scenario", value: -50000 },
  ]},
  { name: "Blended Finance (DFI)", outcomes: [
    { state: "Strong Market", value: 650000 },
    { state: "Base Case", value: 420000 },
    { state: "Weak Market", value: 250000 },
    { state: "Adverse Scenario", value: 100000 },
  ]},
];

type Criterion = "minimax" | "maximin" | "maximax" | "hurwicz";

export default function DecisionTheory() {
  const [options, setOptions] = useState<DecisionOption[]>(defaultOptions);
  const [alpha, setAlpha] = useState(0.6);
  const [activeCriterion, setActiveCriterion] = useState<Criterion>("minimax");

  const regret = useMemo(() => minimaxRegret(options), [options]);
  const maximinResult = useMemo(() => maximin(options), [options]);
  const maximaxResult = useMemo(() => maximax(options), [options]);
  const hurwicz = useMemo(() => hurwiczCriterion(options, alpha), [options, alpha]);

  const states = options[0]?.outcomes.map(o => o.state) ?? [];
  const fmt = (v: number) => v >= 0 ? `$${(v / 1000).toFixed(0)}K` : `-$${(Math.abs(v) / 1000).toFixed(0)}K`;

  const updateValue = (oi: number, oj: number, value: number) => {
    setOptions(prev => prev.map((opt, i) => i === oi ? { ...opt, outcomes: opt.outcomes.map((o, j) => j === oj ? { ...o, value } : o) } : opt));
  };
  const updateName = (oi: number, name: string) => {
    setOptions(prev => prev.map((opt, i) => i === oi ? { ...opt, name } : opt));
  };
  const updateStateName = (si: number, name: string) => {
    setOptions(prev => prev.map(opt => ({ ...opt, outcomes: opt.outcomes.map((o, j) => j === si ? { ...o, state: name } : o) })));
  };
  const addRow = () => {
    setOptions(prev => [...prev, { name: `Structure ${prev.length + 1}`, outcomes: states.map(s => ({ state: s, value: 0 })) }]);
  };
  const removeRow = (idx: number) => {
    if (options.length <= 2) return;
    setOptions(prev => prev.filter((_, i) => i !== idx));
  };
  const addCol = () => {
    const n = `State ${states.length + 1}`;
    setOptions(prev => prev.map(opt => ({ ...opt, outcomes: [...opt.outcomes, { state: n, value: 0 }] })));
  };
  const removeCol = (si: number) => {
    if (states.length <= 2) return;
    setOptions(prev => prev.map(opt => ({ ...opt, outcomes: opt.outcomes.filter((_, j) => j !== si) })));
  };

  const criteria = [
    { key: "minimax" as const, label: "Minimax Regret", color: "#6CB4D9", twColor: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/25" },
    { key: "maximin" as const, label: "Maximin", color: "#2B7BC2", twColor: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/25" },
    { key: "maximax" as const, label: "Maximax", color: "#10b981", twColor: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25" },
    { key: "hurwicz" as const, label: "Hurwicz", color: "#E8652D", twColor: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/25" },
  ];

  const renderResults = () => {
    switch (activeCriterion) {
      case "minimax":
        return regret.regretMatrix.map(r => (
          <div key={r.option} className={`flex items-center justify-between px-4 py-2.5 rounded-lg border ${r.option === regret.bestOption ? "bg-cyan-500/8 border-cyan-500/25" : "border-slate-700/30"}`}>
            <span className="text-sm text-slate-300">{r.option}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Max Regret:</span>
              <span className={`text-sm font-semibold tabular-nums ${r.option === regret.bestOption ? "text-cyan-400" : "text-slate-300"}`}>{fmt(r.maxRegret)}</span>
              {r.option === regret.bestOption && <span className="text-xs bg-cyan-500/15 text-cyan-400 px-2 py-0.5 rounded">Best</span>}
            </div>
          </div>
        ));
      case "maximin":
        return maximinResult.map(r => (
          <div key={r.option} className={`flex items-center justify-between px-4 py-2.5 rounded-lg border ${r.option === r.bestOption ? "bg-blue-500/8 border-blue-500/25" : "border-slate-700/30"}`}>
            <span className="text-sm text-slate-300">{r.option}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Worst:</span>
              <span className={`text-sm font-semibold tabular-nums ${r.minValue >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(r.minValue)}</span>
              {r.option === r.bestOption && <span className="text-xs bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded">Best</span>}
            </div>
          </div>
        ));
      case "maximax":
        return maximaxResult.map(r => (
          <div key={r.option} className={`flex items-center justify-between px-4 py-2.5 rounded-lg border ${r.option === r.bestOption ? "bg-emerald-500/8 border-emerald-500/25" : "border-slate-700/30"}`}>
            <span className="text-sm text-slate-300">{r.option}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Best:</span>
              <span className="text-sm font-semibold tabular-nums text-emerald-400">{fmt(r.maxValue)}</span>
              {r.option === r.bestOption && <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded">Best</span>}
            </div>
          </div>
        ));
      case "hurwicz":
        return hurwicz.map(r => (
          <div key={r.option} className={`flex items-center justify-between px-4 py-2.5 rounded-lg border ${r.option === r.bestOption ? "bg-amber-500/8 border-amber-500/25" : "border-slate-700/30"}`}>
            <span className="text-sm text-slate-300">{r.option}</span>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold tabular-nums ${r.value >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(r.value)}</span>
              {r.option === r.bestOption && <span className="text-xs bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded">Best</span>}
            </div>
          </div>
        ));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Decision <span className="gradient-text">Theory</span></h1>
          <p className="text-sm text-slate-400 mt-0.5">Financing structure optimization under uncertainty</p>
        </div>
        <button onClick={() => setOptions(defaultOptions)} className="btn-secondary flex items-center gap-1.5">
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* Editable Payoff Matrix */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Payoff Matrix <span className="text-slate-500 font-normal">&mdash; click any cell to edit</span></h3>
          <div className="flex items-center gap-2">
            <button onClick={addCol} className="btn-secondary flex items-center gap-1 text-xs py-1.5 px-3">
              <Plus size={11} /> State
            </button>
            <button onClick={addRow} className="btn-primary flex items-center gap-1 text-xs py-1.5 px-3">
              <Plus size={11} /> Structure
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/40">
                <th className="text-left text-xs font-medium py-2 pr-2 w-52" style={{ color: "#2B7BC2" }}>Financing Structure</th>
                {states.map((s, si) => (
                  <th key={si} className="py-2 px-1">
                    <div className="flex items-center gap-1 justify-center">
                      <input value={s} onChange={e => updateStateName(si, e.target.value)} className="input-dark text-xs text-center w-28 py-1" />
                      {states.length > 2 && <button onClick={() => removeCol(si)} className="text-slate-600 hover:text-red-400"><Trash2 size={11} /></button>}
                    </div>
                  </th>
                ))}
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {options.map((opt, oi) => (
                <tr key={oi} className="border-b border-slate-800/30">
                  <td className="py-1.5 pr-2">
                    <input value={opt.name} onChange={e => updateName(oi, e.target.value)} className="input-dark text-xs w-full py-1.5" />
                  </td>
                  {opt.outcomes.map((o, j) => (
                    <td key={j} className="py-1.5 px-1">
                      <input type="number" step={50000} value={o.value} onChange={e => updateValue(oi, j, Number(e.target.value))} className={`input-dark w-28 text-xs text-center py-1.5 font-mono tabular-nums ${o.value >= 0 ? "text-emerald-400" : "text-red-400"}`} />
                    </td>
                  ))}
                  <td className="py-1.5 pl-1">
                    {options.length > 2 && <button onClick={() => removeRow(oi)} className="text-slate-600 hover:text-red-400 p-0.5"><Trash2 size={12} /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Criteria Tabs */}
      <div className="flex items-center gap-2">
        {criteria.map(c => (
          <button key={c.key} onClick={() => setActiveCriterion(c.key)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all border ${activeCriterion === c.key ? c.bg + " " + c.color : "tab-inactive"}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Swords size={16} style={{ color: criteria.find(c => c.key === activeCriterion)?.color }} />
          <h3 className="text-sm font-semibold text-white">{criteria.find(c => c.key === activeCriterion)?.label} Results</h3>
        </div>
        {activeCriterion === "hurwicz" && (
          <div className="flex items-center gap-4 mb-4 p-3 rounded-lg" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <span className="text-xs text-slate-400">Optimism (alpha):</span>
            <input type="range" min={0} max={1} step={0.05} value={alpha} onChange={e => setAlpha(Number(e.target.value))} className="flex-1 accent-blue-500" />
            <span className="text-sm text-amber-400 font-semibold tabular-nums w-10">{alpha.toFixed(2)}</span>
          </div>
        )}
        <div className="space-y-1.5">
          {renderResults()}
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card p-5" style={{ borderColor: "rgba(43,123,194,0.15)" }}>
        <div className="flex items-start gap-3">
          <Info size={18} className="shrink-0 mt-0.5" style={{ color: "#2B7BC2" }} />
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Decision Theory for Geothermal Financing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Different criteria reflect different risk philosophies.
              <strong style={{ color: "#6CB4D9" }}> Minimax Regret</strong> recommends <strong className="text-white">{regret.bestOption}</strong>.
              <strong style={{ color: "#2B7BC2" }}> Maximin</strong> (lender perspective) recommends <strong className="text-white">{maximinResult.find(r => r.option === r.bestOption)?.option}</strong>.
              GeoPro makes these frameworks explicit for structured negotiation between project sponsors and capital providers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
