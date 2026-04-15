import { useState, useMemo } from "react";
import { Swords, Info } from "lucide-react";
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

export default function DecisionTheory() {
  const [options] = useState<DecisionOption[]>(defaultOptions);
  const [alpha, setAlpha] = useState(0.6);

  const regret = useMemo(() => minimaxRegret(options), [options]);
  const maximinResult = useMemo(() => maximin(options), [options]);
  const maximaxResult = useMemo(() => maximax(options), [options]);
  const hurwicz = useMemo(() => hurwiczCriterion(options, alpha), [options, alpha]);

  const states = options[0]?.outcomes.map(o => o.state) ?? [];
  const fmt = (v: number) => v >= 0 ? `$${(v / 1000).toFixed(0)}K` : `-$${(Math.abs(v) / 1000).toFixed(0)}K`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Decision <span className="gradient-text">Theory</span></h1>
        <p className="text-slate-400 mt-1">Minimax Regret, Maximin, Maximax, and Hurwicz criterion for financing structure optimization</p>
      </div>

      {/* Payoff Matrix */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Payoff Matrix &mdash; Financing Structures vs Market States (NPV)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-sm font-medium text-orange-400 py-3 pr-4">Financing Structure</th>
                {states.map(s => (
                  <th key={s} className="text-center text-sm font-medium text-orange-400 py-3 px-3">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {options.map((opt) => (
                <tr key={opt.name} className="border-b border-slate-800/50">
                  <td className="py-3 pr-4 text-sm text-slate-200 font-medium">{opt.name}</td>
                  {opt.outcomes.map((o, j) => (
                    <td key={j} className="py-3 px-3 text-center">
                      <span className={`text-sm font-mono font-medium ${o.value >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(o.value)}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Criteria Results */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Swords size={18} className="text-cyan-400" />
            <h3 className="text-base font-semibold text-white">Minimax Regret</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">Minimizes the maximum opportunity cost across all scenarios</p>
          <div className="space-y-2">
            {regret.regretMatrix.map(r => (
              <div key={r.option} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${r.option === regret.bestOption ? "bg-emerald-500/10 border-emerald-500/30" : "bg-slate-800/30 border-slate-700/30"}`}>
                <span className="text-sm text-slate-200">{r.option}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Max Regret:</span>
                  <span className={`text-sm font-bold ${r.option === regret.bestOption ? "text-emerald-400" : "text-slate-300"}`}>{fmt(r.maxRegret)}</span>
                  {r.option === regret.bestOption && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Best</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Swords size={18} className="text-blue-400" />
            <h3 className="text-base font-semibold text-white">Maximin (Pessimistic)</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">Maximizes worst-case outcome &mdash; preferred by risk-averse lenders</p>
          <div className="space-y-2">
            {maximinResult.map(r => (
              <div key={r.option} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${r.option === r.bestOption ? "bg-blue-500/10 border-blue-500/30" : "bg-slate-800/30 border-slate-700/30"}`}>
                <span className="text-sm text-slate-200">{r.option}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Worst Case:</span>
                  <span className={`text-sm font-bold ${r.minValue >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(r.minValue)}</span>
                  {r.option === r.bestOption && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Best</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Swords size={18} className="text-emerald-400" />
            <h3 className="text-base font-semibold text-white">Maximax (Optimistic)</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">Maximizes best-case outcome &mdash; aggressive developer perspective</p>
          <div className="space-y-2">
            {maximaxResult.map(r => (
              <div key={r.option} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${r.option === r.bestOption ? "bg-emerald-500/10 border-emerald-500/30" : "bg-slate-800/30 border-slate-700/30"}`}>
                <span className="text-sm text-slate-200">{r.option}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Best Case:</span>
                  <span className="text-sm font-bold text-emerald-400">{fmt(r.maxValue)}</span>
                  {r.option === r.bestOption && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Best</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Swords size={18} className="text-orange-400" />
            <h3 className="text-base font-semibold text-white">Hurwicz Criterion</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">Weighted blend of optimism and pessimism</p>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs text-slate-400">Optimism:</span>
            <input type="range" min={0} max={1} step={0.05} value={alpha} onChange={e => setAlpha(Number(e.target.value))} className="flex-1 accent-orange-500" />
            <span className="text-sm text-orange-400 font-bold w-10">{alpha.toFixed(2)}</span>
          </div>
          <div className="space-y-2">
            {hurwicz.map(r => (
              <div key={r.option} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${r.option === r.bestOption ? "bg-orange-500/10 border-orange-500/30" : "bg-slate-800/30 border-slate-700/30"}`}>
                <span className="text-sm text-slate-200">{r.option}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${r.value >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(r.value)}</span>
                  {r.option === r.bestOption && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">Best</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-6 border-orange-500/20">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-orange-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-semibold text-white mb-1">Decision Theory for Geothermal Financing</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Different criteria recommend different financing structures because they reflect different risk philosophies.
              <strong className="text-cyan-400"> Minimax Regret</strong> recommends <strong className="text-white">{regret.bestOption}</strong>.
              <strong className="text-blue-400"> Maximin</strong> (lender perspective) recommends <strong className="text-white">{maximinResult.find(r => r.option === r.bestOption)?.option}</strong>.
              By making these frameworks explicit, GeoPro enables structured negotiation between project sponsors and capital providers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
