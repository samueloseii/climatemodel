import { useState, useMemo } from "react";
import { Brain, Sliders } from "lucide-react";
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
  { name: "Developer (Risk Neutral)", riskAversion: 0, color: "text-emerald-400", desc: "Maximizes expected value" },
  { name: "Commercial Lender", riskAversion: 2.5, color: "text-blue-400", desc: "Minimizes downside exposure" },
  { name: "Development Bank", riskAversion: 1.0, color: "text-purple-400", desc: "Moderate risk aversion, portfolio view" },
  { name: "Conservative Investor", riskAversion: 5.0, color: "text-red-400", desc: "Strongly risk-averse, capital preservation" },
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

  const fmt = (v: number) => v >= 0 ? `$${(v/1000).toFixed(0)}K` : `-$${(Math.abs(v)/1000).toFixed(0)}K`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Expected <span className="gradient-text">Utility</span> Analysis</h1>
        <p className="text-slate-400 mt-1">Stakeholder-aware decision modeling &mdash; the same project looks different to each evaluator</p>
      </div>

      {/* Scenarios */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Geothermal Resource Scenarios</h3>
        <div className="space-y-3">
          {scenarios.map((s, i) => (
            <div key={i} className="flex items-center gap-4 bg-slate-800/40 rounded-xl p-3 border border-slate-700/30">
              <input value={s.name} onChange={e => updateScenario(i, "name", e.target.value)} className="input-dark flex-1 text-sm" />
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-500">P:</span>
                <input type="number" step={0.05} min={0} max={1} value={s.probability} onChange={e => updateScenario(i, "probability", Number(e.target.value))} className="input-dark w-20 text-sm text-center" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-500">NPV:</span>
                <input type="number" step={50000} value={s.npv} onChange={e => updateScenario(i, "npv", Number(e.target.value))} className="input-dark w-32 text-sm text-center" />
              </div>
              <span className="text-xs text-slate-500 w-48 shrink-0 truncate">{s.description}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Total probability: <span className={scenarios.reduce((s, sc) => s + sc.probability, 0) === 1 ? "text-emerald-400" : "text-red-400"}>
            {scenarios.reduce((s, sc) => s + sc.probability, 0).toFixed(2)}
          </span> (must equal 1.00)
        </p>
      </div>

      {/* Stakeholder Comparison */}
      <div className="grid grid-cols-4 gap-4">
        {results.map((r, i) => (
          <div key={r.name} onClick={() => setSelectedStakeholder(i)} className={`glass-card-hover p-5 cursor-pointer ${selectedStakeholder === i ? "border-orange-500/40" : ""}`}>
            <p className={`text-sm font-semibold ${r.color} mb-1`}>{r.name}</p>
            <p className="text-xs text-slate-500 mb-3">{r.desc}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Expected Value</span>
                <span className="text-white font-medium">{fmt(r.expectedValue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Certainty Equiv.</span>
                <span className={`font-medium ${r.color}`}>{fmt(r.certaintyEquivalent)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Risk Premium</span>
                <span className={`font-medium ${r.riskPremium > 0 ? "text-red-400" : "text-emerald-400"}`}>{fmt(r.riskPremium)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Expected Value vs Certainty Equivalent by Stakeholder</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569", borderRadius: 12, fontSize: 13 }} formatter={(v: number) => [`$${(v/1000).toFixed(0)}K`, ""]} />
            <Bar dataKey="EV" name="Expected Value" fill="#10b981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="CE" name="Certainty Equivalent" radius={[6, 6, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={["#10b981", "#3b82f6", "#a855f7", "#ef4444"][i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Risk Aversion Slider */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sliders size={20} className="text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Custom Risk Aversion Parameter</h3>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <input type="range" min={0} max={10} step={0.1} value={customRA} onChange={e => setCustomRA(Number(e.target.value))} className="w-full accent-orange-500" />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Risk Neutral (0)</span>
              <span>Moderate (5)</span>
              <span>Very Risk Averse (10)</span>
            </div>
          </div>
          <div className="text-center shrink-0 w-48">
            <p className="text-xs text-slate-400">Risk Aversion: <span className="text-orange-400 font-bold">{customRA.toFixed(1)}</span></p>
            <p className="text-lg font-bold text-white mt-1">CE: {fmt(customResult.certaintyEquivalent)}</p>
            <p className="text-sm text-red-400">Risk Premium: {fmt(customResult.riskPremium)}</p>
          </div>
        </div>
      </div>

      {/* Key Insight */}
      <div className="glass-card p-6 border-orange-500/20">
        <div className="flex items-start gap-3">
          <Brain size={24} className="text-orange-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-semibold text-white mb-1">Why This Matters for Geothermal</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              A developer sees expected NPV of <span className="text-emerald-400 font-medium">{fmt(results[0]?.expectedValue ?? 0)}</span> and moves forward.
              But a commercial lender, applying their risk aversion, values this project at only <span className="text-blue-400 font-medium">{fmt(results[1]?.certaintyEquivalent ?? 0)}</span>.
              This <span className="text-red-400 font-medium">{fmt(results[1]?.riskPremium ?? 0)}</span> gap is the &ldquo;risk premium&rdquo; &mdash; and it&rsquo;s why bankable projects fail to get financed.
              GeoPro bridges this gap by making implicit risk models explicit and comparable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
