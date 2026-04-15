import { useState, useMemo } from "react";
import { Brain, Sliders, Plus, Trash2, RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { computeExpectedUtility } from "../data/simulationEngine";
import type { UtilityScenario } from "../data/simulationEngine";

const defaultScenarios: UtilityScenario[] = [
  { name: "Excellent Resource", probability: 0.15, npv: 1800000, description: "High temp gradient, low drilling risk, strong offtake" },
  { name: "Good Resource", probability: 0.30, npv: 850000, description: "Moderate gradient, standard drilling conditions" },
  { name: "Base Case", probability: 0.30, npv: 320000, description: "Conservative estimates, typical market conditions" },
  { name: "Below Average", probability: 0.15, npv: -120000, description: "Lower-than-expected thermal output, cost overruns" },
  { name: "Poor Resource", probability: 0.10, npv: -450000, description: "Failed wells, regulatory delays, weak energy prices" },
];

const stakeholders = [
  { name: "Developer (Risk Neutral)", riskAversion: 0, color: "#10b981", desc: "Maximizes expected value" },
  { name: "Commercial Lender", riskAversion: 2.5, color: "#2B7BC2", desc: "Minimizes downside exposure" },
  { name: "Development Bank", riskAversion: 1.0, color: "#6CB4D9", desc: "Moderate risk aversion, portfolio view" },
  { name: "Conservative Investor", riskAversion: 5.0, color: "#E8652D", desc: "Strongly risk-averse, capital preservation" },
];

export default function ExpectedUtility() {
  const [scenarios, setScenarios] = useState<UtilityScenario[]>(defaultScenarios);
  const [selectedStakeholder, setSelectedStakeholder] = useState(0);
  const [customRA, setCustomRA] = useState(2.5);

  const results = useMemo(() => {
    return stakeholders.map(s => ({
      ...s,
      ...computeExpectedUtility(scenarios, s.riskAversion),
    }));
  }, [scenarios]);

  const customResult = useMemo(() => computeExpectedUtility(scenarios, customRA), [scenarios, customRA]);

  const chartData = results.map(r => ({
    name: r.name.split(" (")[0],
    EV: Math.round(r.expectedValue),
    CE: Math.round(r.certaintyEquivalent),
    RP: Math.round(r.riskPremium),
  }));

  const updateScenario = (idx: number, field: keyof UtilityScenario, value: string | number) => {
    setScenarios(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const addScenario = () => {
    setScenarios(prev => [...prev, { name: `Scenario ${prev.length + 1}`, probability: 0, npv: 0, description: "Custom scenario" }]);
  };

  const removeScenario = (idx: number) => {
    if (scenarios.length <= 2) return;
    setScenarios(prev => prev.filter((_, i) => i !== idx));
  };

  const totalProb = scenarios.reduce((s, sc) => s + sc.probability, 0);
  const fmt = (v: number) => v >= 0 ? `$${(v/1000).toFixed(0)}K` : `-$${(Math.abs(v)/1000).toFixed(0)}K`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Expected <span className="gradient-text">Utility</span> Analysis</h1>
          <p className="text-sm text-slate-400 mt-0.5">Stakeholder-aware decision modeling &mdash; the same project looks different to each evaluator</p>
        </div>
        <button onClick={() => setScenarios(defaultScenarios)} className="btn-secondary flex items-center gap-1.5">
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* Scenarios */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Resource Scenarios <span className="text-slate-500 font-normal">&mdash; add, remove, or edit scenarios</span></h3>
          <button onClick={addScenario} className="btn-primary flex items-center gap-1 text-xs py-1.5 px-3">
            <Plus size={11} /> Add Scenario
          </button>
        </div>
        <div className="space-y-2">
          {scenarios.map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg p-2.5" style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(51,65,85,0.3)" }}>
              <input value={s.name} onChange={e => updateScenario(i, "name", e.target.value)} className="input-dark flex-1 text-xs py-1.5" />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-slate-500">P:</span>
                <input type="number" step={0.05} min={0} max={1} value={s.probability} onChange={e => updateScenario(i, "probability", Number(e.target.value))} className="input-dark w-16 text-xs text-center py-1.5" />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-slate-500">NPV:</span>
                <input type="number" step={50000} value={s.npv} onChange={e => updateScenario(i, "npv", Number(e.target.value))} className="input-dark w-28 text-xs text-center py-1.5 font-mono" />
              </div>
              <input value={s.description} onChange={e => updateScenario(i, "description", e.target.value)} className="input-dark w-52 text-xs py-1.5 shrink-0" placeholder="Description" />
              {scenarios.length > 2 && (
                <button onClick={() => removeScenario(i)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-500">
            Total probability: <span className={Math.abs(totalProb - 1) < 0.001 ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
              {totalProb.toFixed(2)}
            </span> {Math.abs(totalProb - 1) >= 0.001 && <span className="text-red-400">(must equal 1.00)</span>}
          </p>
          <p className="text-xs text-slate-500">{scenarios.length} scenarios</p>
        </div>
      </div>

      {/* Stakeholder Comparison */}
      <div className="grid grid-cols-4 gap-3">
        {results.map((r, i) => (
          <div key={r.name} onClick={() => setSelectedStakeholder(i)} className="glass-card-hover p-4 cursor-pointer" style={selectedStakeholder === i ? { borderColor: r.color + "60" } : {}}>
            <p className="text-sm font-semibold mb-0.5" style={{ color: r.color }}>{r.name}</p>
            <p className="text-xs text-slate-500 mb-3">{r.desc}</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Expected Value</span>
                <span className="text-white font-medium tabular-nums">{fmt(r.expectedValue)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Certainty Equiv.</span>
                <span className="font-medium tabular-nums" style={{ color: r.color }}>{fmt(r.certaintyEquivalent)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Risk Premium</span>
                <span className={`font-medium tabular-nums ${r.riskPremium > 0 ? "text-red-400" : "text-emerald-400"}`}>{fmt(r.riskPremium)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Expected Value vs Certainty Equivalent by Stakeholder</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`$${(v/1000).toFixed(0)}K`, ""]} />
            <Bar dataKey="EV" name="Expected Value" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="CE" name="Certainty Equivalent" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={stakeholders[i]?.color ?? "#64748b"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Risk Aversion Slider */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sliders size={16} style={{ color: "#E8652D" }} />
          <h3 className="text-sm font-semibold text-white">Custom Risk Aversion Parameter</h3>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <input type="range" min={0} max={10} step={0.1} value={customRA} onChange={e => setCustomRA(Number(e.target.value))} className="w-full" style={{ accentColor: "#E8652D" }} />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Risk Neutral (0)</span>
              <span>Moderate (5)</span>
              <span>Very Risk Averse (10)</span>
            </div>
          </div>
          <div className="text-center shrink-0 w-44">
            <p className="text-xs text-slate-400">Risk Aversion: <span className="font-bold" style={{ color: "#E8652D" }}>{customRA.toFixed(1)}</span></p>
            <p className="text-lg font-bold text-white mt-1">CE: {fmt(customResult.certaintyEquivalent)}</p>
            <p className="text-xs text-red-400">Risk Premium: {fmt(customResult.riskPremium)}</p>
          </div>
        </div>
      </div>

      {/* Key Insight */}
      <div className="glass-card p-5" style={{ borderColor: "rgba(43,123,194,0.15)" }}>
        <div className="flex items-start gap-3">
          <Brain size={18} style={{ color: "#2B7BC2" }} className="shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Why This Matters for Geothermal</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              A developer sees expected NPV of <span className="text-emerald-400 font-medium">{fmt(results[0]?.expectedValue ?? 0)}</span> and moves forward.
              But a commercial lender values this project at only <span className="font-medium" style={{ color: "#2B7BC2" }}>{fmt(results[1]?.certaintyEquivalent ?? 0)}</span>.
              This <span className="text-red-400 font-medium">{fmt(results[1]?.riskPremium ?? 0)}</span> gap is the risk premium &mdash; why bankable projects fail to get financed.
              GeoPro bridges this gap by making implicit risk models explicit and comparable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
