import { useState, useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, Plus, Trash2, RotateCcw, TrendingUp } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend, LineChart, Line, BarChart, Bar, Cell, ReferenceLine } from "recharts";

interface ScenarioParams {
  name: string;
  probability: number;
  initialCapex: number;
  annualRevenue: number;
  revenueGrowth: number;
  opexRate: number;
  discountRate: number;
  color: string;
}

const defaultScenarios: ScenarioParams[] = [
  { name: "Bull Case", probability: 0.20, initialCapex: 150000, annualRevenue: 42000, revenueGrowth: 3.5, opexRate: 12, discountRate: 6, color: "#10b981" },
  { name: "Base Case", probability: 0.55, initialCapex: 150000, annualRevenue: 28000, revenueGrowth: 3.0, opexRate: 15, discountRate: 6, color: "#2B7BC2" },
  { name: "Bear Case", probability: 0.25, initialCapex: 150000, annualRevenue: 18000, revenueGrowth: 2.0, opexRate: 18, discountRate: 6, color: "#E8652D" },
];

const defaultMarketIndicators = [
  { label: "IRA Tax Credit", value: "30%", trend: "Stable through 2032", up: true },
  { label: "Carbon Price (EU ETS)", value: "$84/tCO2", trend: "+3.7% this month", up: true },
  { label: "10Y Treasury Rate", value: "4.25%", trend: "+15bps this quarter", up: false },
  { label: "Geothermal LCOE", value: "$0.04/kWh", trend: "-8% YoY", up: true },
];

const energyForecast = [
  { year: "2024", gas: 4.2, electric: 0.12, geothermal: 0.045 },
  { year: "2025", gas: 4.5, electric: 0.125, geothermal: 0.044 },
  { year: "2026", gas: 4.9, electric: 0.13, geothermal: 0.043 },
  { year: "2027", gas: 5.3, electric: 0.138, geothermal: 0.042 },
  { year: "2028", gas: 5.8, electric: 0.145, geothermal: 0.041 },
  { year: "2029", gas: 6.2, electric: 0.155, geothermal: 0.04 },
  { year: "2030", gas: 6.8, electric: 0.165, geothermal: 0.039 },
  { year: "2031", gas: 7.4, electric: 0.178, geothermal: 0.038 },
  { year: "2032", gas: 8.1, electric: 0.19, geothermal: 0.037 },
  { year: "2033", gas: 8.9, electric: 0.205, geothermal: 0.036 },
];

const drillingSuccessData = [
  { depth: "200ft", success: 95, avgCost: 28000 },
  { depth: "300ft", success: 88, avgCost: 45000 },
  { depth: "400ft", success: 78, avgCost: 68000 },
  { depth: "500ft", success: 65, avgCost: 95000 },
  { depth: "600ft", success: 52, avgCost: 130000 },
  { depth: "800ft", success: 38, avgCost: 195000 },
];

function computeCashFlows(s: ScenarioParams, years: number) {
  const data: { year: string; value: number }[] = [];
  let cumulative = -s.initialCapex;
  for (let y = 0; y <= years; y++) {
    if (y === 0) {
      data.push({ year: `Y${y}`, value: cumulative });
      continue;
    }
    const rev = s.annualRevenue * Math.pow(1 + s.revenueGrowth / 100, y);
    const opex = rev * (s.opexRate / 100);
    const netCF = (rev - opex) / Math.pow(1 + s.discountRate / 100, y);
    cumulative += netCF;
    data.push({ year: `Y${y}`, value: Math.round(cumulative) });
  }
  return data;
}

function computeNPV(s: ScenarioParams, years: number) {
  let npv = -s.initialCapex;
  for (let y = 1; y <= years; y++) {
    const rev = s.annualRevenue * Math.pow(1 + s.revenueGrowth / 100, y);
    const opex = rev * (s.opexRate / 100);
    npv += (rev - opex) / Math.pow(1 + s.discountRate / 100, y);
  }
  return npv;
}

function computeIRR(s: ScenarioParams, years: number) {
  let lo = -0.5, hi = 2;
  for (let iter = 0; iter < 100; iter++) {
    const mid = (lo + hi) / 2;
    let npv = -s.initialCapex;
    for (let y = 1; y <= years; y++) {
      const rev = s.annualRevenue * Math.pow(1 + s.revenueGrowth / 100, y);
      const opex = rev * (s.opexRate / 100);
      npv += (rev - opex) / Math.pow(1 + mid, y);
    }
    if (npv > 0) lo = mid; else hi = mid;
  }
  return ((lo + hi) / 2) * 100;
}

function computePayback(s: ScenarioParams) {
  let cumulative = -s.initialCapex;
  for (let y = 1; y <= 40; y++) {
    const rev = s.annualRevenue * Math.pow(1 + s.revenueGrowth / 100, y);
    const opex = rev * (s.opexRate / 100);
    cumulative += rev - opex;
    if (cumulative >= 0) return y;
  }
  return -1;
}

export default function Predictions() {
  const [scenarios, setScenarios] = useState<ScenarioParams[]>(defaultScenarios);
  const [projectLife, setProjectLife] = useState(25);
  const [selectedScenario, setSelectedScenario] = useState(1);

  const cashFlowData = useMemo(() => {
    const allFlows = scenarios.map(s => computeCashFlows(s, projectLife));
    return Array.from({ length: projectLife + 1 }, (_, i) => {
      const row: Record<string, string | number> = { year: `Y${i}` };
      scenarios.forEach((s, si) => { row[s.name] = allFlows[si][i]?.value ?? 0; });
      return row;
    });
  }, [scenarios, projectLife]);

  const scenarioMetrics = useMemo(() => {
    return scenarios.map(s => ({
      name: s.name,
      npv: computeNPV(s, projectLife),
      irr: computeIRR(s, projectLife),
      payback: computePayback(s),
      color: s.color,
    }));
  }, [scenarios, projectLife]);

  const expectedNPV = useMemo(() => {
    return scenarios.reduce((sum, s) => sum + s.probability * computeNPV(s, projectLife), 0);
  }, [scenarios, projectLife]);

  const updateScenario = (idx: number, field: keyof ScenarioParams, value: string | number) => {
    setScenarios(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const addScenario = () => {
    const colors = ["#a855f7", "#f59e0b", "#ec4899", "#6366f1", "#14b8a6"];
    setScenarios(prev => [...prev, {
      name: `Scenario ${prev.length + 1}`,
      probability: 0,
      initialCapex: 150000,
      annualRevenue: 25000,
      revenueGrowth: 2.5,
      opexRate: 15,
      discountRate: 6,
      color: colors[prev.length % colors.length],
    }]);
  };

  const removeScenario = (idx: number) => {
    if (scenarios.length <= 2) return;
    setScenarios(prev => prev.filter((_, i) => i !== idx));
  };

  const fmt = (v: number) => v >= 0 ? `$${(v / 1000).toFixed(0)}K` : `-$${(Math.abs(v) / 1000).toFixed(0)}K`;
  const totalProb = scenarios.reduce((s, sc) => s + sc.probability, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Prediction <span className="gradient-text">Analysis</span></h1>
          <p className="text-sm text-slate-400 mt-0.5">Multi-scenario forecasting for geothermal project cash flows and market conditions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Project Life:</span>
            <input type="number" min={5} max={40} value={projectLife} onChange={e => setProjectLife(Number(e.target.value))} className="input-dark w-16 text-xs text-center py-1.5" />
            <span className="text-xs text-slate-500">yrs</span>
          </div>
          <button onClick={() => { setScenarios(defaultScenarios); setProjectLife(25); }} className="btn-secondary flex items-center gap-1.5 text-xs">
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* Editable Scenario Parameters */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Scenario Parameters <span className="text-slate-500 font-normal">&mdash; fully editable assumptions</span></h3>
          <button onClick={addScenario} className="btn-primary flex items-center gap-1 text-xs py-1.5 px-3">
            <Plus size={11} /> Add Scenario
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700/40">
                <th className="text-left py-2 px-2 font-medium">Scenario</th>
                <th className="text-center py-2 px-2 font-medium">Probability</th>
                <th className="text-center py-2 px-2 font-medium">Initial CapEx</th>
                <th className="text-center py-2 px-2 font-medium">Annual Revenue</th>
                <th className="text-center py-2 px-2 font-medium">Rev Growth %</th>
                <th className="text-center py-2 px-2 font-medium">OpEx Rate %</th>
                <th className="text-center py-2 px-2 font-medium">Discount Rate %</th>
                <th className="text-center py-2 px-2 font-medium">NPV</th>
                <th className="text-center py-2 px-2 font-medium">IRR</th>
                <th className="text-center py-2 px-2 font-medium">Payback</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s, i) => {
                const m = scenarioMetrics[i];
                return (
                  <tr key={i} className="border-b border-slate-800/40 hover:bg-slate-800/20">
                    <td className="py-1.5 px-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                        <input value={s.name} onChange={e => updateScenario(i, "name", e.target.value)} className="input-dark text-xs py-1 w-28" />
                      </div>
                    </td>
                    <td className="py-1.5 px-1"><input type="number" step={0.05} min={0} max={1} value={s.probability} onChange={e => updateScenario(i, "probability", Number(e.target.value))} className="input-dark text-xs text-center py-1 w-16 mx-auto block" /></td>
                    <td className="py-1.5 px-1"><input type="number" step={10000} value={s.initialCapex} onChange={e => updateScenario(i, "initialCapex", Number(e.target.value))} className="input-dark text-xs text-center py-1 w-24 mx-auto block font-mono" /></td>
                    <td className="py-1.5 px-1"><input type="number" step={1000} value={s.annualRevenue} onChange={e => updateScenario(i, "annualRevenue", Number(e.target.value))} className="input-dark text-xs text-center py-1 w-24 mx-auto block font-mono" /></td>
                    <td className="py-1.5 px-1"><input type="number" step={0.5} value={s.revenueGrowth} onChange={e => updateScenario(i, "revenueGrowth", Number(e.target.value))} className="input-dark text-xs text-center py-1 w-16 mx-auto block" /></td>
                    <td className="py-1.5 px-1"><input type="number" step={1} value={s.opexRate} onChange={e => updateScenario(i, "opexRate", Number(e.target.value))} className="input-dark text-xs text-center py-1 w-16 mx-auto block" /></td>
                    <td className="py-1.5 px-1"><input type="number" step={0.5} value={s.discountRate} onChange={e => updateScenario(i, "discountRate", Number(e.target.value))} className="input-dark text-xs text-center py-1 w-16 mx-auto block" /></td>
                    <td className="py-1.5 px-1 text-center font-mono font-medium" style={{ color: (m?.npv ?? 0) >= 0 ? "#10b981" : "#ef4444" }}>{fmt(m?.npv ?? 0)}</td>
                    <td className="py-1.5 px-1 text-center font-mono font-medium" style={{ color: s.color }}>{(m?.irr ?? 0).toFixed(1)}%</td>
                    <td className="py-1.5 px-1 text-center text-slate-300">{(m?.payback ?? -1) > 0 ? `${m?.payback}yr` : "N/A"}</td>
                    <td className="py-1.5 px-1">
                      {scenarios.length > 2 && (
                        <button onClick={() => removeScenario(i)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-500">
            Total probability: <span className={Math.abs(totalProb - 1) < 0.001 ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>{totalProb.toFixed(2)}</span>
            {Math.abs(totalProb - 1) >= 0.001 && <span className="text-red-400 ml-1">(must equal 1.00)</span>}
          </p>
          <p className="text-xs text-slate-400">Probability-weighted NPV: <span className="text-white font-semibold">{fmt(expectedNPV)}</span></p>
        </div>
      </div>

      {/* Scenario Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {scenarioMetrics.map((m, i) => (
          <div key={i} onClick={() => setSelectedScenario(i)} className="glass-card-hover p-4 cursor-pointer" style={selectedScenario === i ? { borderColor: m.color + "50" } : {}}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold" style={{ color: m.color }}>{m.name}</span>
              <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded-full">P = {(scenarios[i]?.probability * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-slate-400">NPV</p>
                <p className="text-lg font-bold tabular-nums" style={{ color: m.npv >= 0 ? "#10b981" : "#ef4444" }}>{fmt(m.npv)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">IRR</p>
                <p className="text-lg font-bold tabular-nums" style={{ color: m.color }}>{m.irr.toFixed(1)}%</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Payback</p>
                <p className="text-lg font-bold text-slate-200 tabular-nums">{m.payback > 0 ? `${m.payback}yr` : "N/A"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cumulative Cash Flow Chart */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-0.5">Cumulative Discounted Cash Flow ({projectLife}-Year Projection)</h3>
        <p className="text-xs text-slate-500 mb-3">All scenarios computed from editable parameters above</p>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={cashFlowData}>
            <defs>
              {scenarios.map((s) => (
                <linearGradient key={s.name} id={`grad-${s.name.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#64748b" }} interval={2} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`$${(v / 1000).toFixed(0)}K`, ""]} />
            <Legend />
            <ReferenceLine y={0} stroke="#475569" strokeDasharray="4 4" label={{ value: "Break-even", position: "right", fontSize: 10, fill: "#64748b" }} />
            {scenarios.map((s) => (
              <Area key={s.name} type="monotone" dataKey={s.name} stroke={s.color} fill={`url(#grad-${s.name.replace(/\s/g, '')})`} strokeWidth={2} animationDuration={1200} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Energy Price Forecast */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-0.5">Energy Price Forecasts (2024-2033)</h3>
          <p className="text-xs text-slate-500 mb-3">Geothermal advantage grows as fossil fuel prices escalate</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={energyForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="gas" name="Natural Gas ($/therm)" stroke="#E8652D" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="electric" name="Electricity ($/kWh)" stroke="#2B7BC2" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="geothermal" name="Geothermal LCOE ($/kWh)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Drilling Success */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Drilling Success Probability by Depth</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={drillingSuccessData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="depth" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="success" name="Success Rate %" radius={[4, 4, 0, 0]}>
                {drillingSuccessData.map((d, i) => (
                  <Cell key={i} fill={d.success > 80 ? "#10b981" : d.success > 60 ? "#E8652D" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Market Indicators */}
      <div className="grid grid-cols-4 gap-3">
        {defaultMarketIndicators.map(m => (
          <div key={m.label} className="glass-card p-4">
            <p className="text-xs text-slate-400">{m.label}</p>
            <p className="text-xl font-bold text-white mt-1 tabular-nums">{m.value}</p>
            <p className={`text-xs mt-1 flex items-center gap-1 ${m.up ? "text-emerald-400" : "text-red-400"}`}>
              {m.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />} {m.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Insight */}
      <div className="glass-card p-5" style={{ borderColor: "rgba(43,123,194,0.15)" }}>
        <div className="flex items-start gap-3">
          <TrendingUp size={16} style={{ color: "#2B7BC2" }} className="shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Probability-Weighted Analysis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The probability-weighted expected NPV across all {scenarios.length} scenarios is <span className="font-semibold" style={{ color: expectedNPV >= 0 ? "#10b981" : "#ef4444" }}>{fmt(expectedNPV)}</span>.
              Adjust scenario probabilities and financial assumptions above to stress-test project viability under different conditions.
              All calculations update in real-time as you modify inputs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
