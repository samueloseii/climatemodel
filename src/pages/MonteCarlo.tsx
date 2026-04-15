import { useState, useMemo } from "react";
import { Play, RotateCcw, Download, Activity, Plus, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { defaultParams, runMonteCarloSimulation, computeMean, computeStd, computePercentile, computeVaR, computeCVaR, buildHistogram } from "../data/simulationEngine";
import type { SimulationParams, SimulationResult } from "../data/simulationEngine";

interface CustomParam {
  id: string;
  label: string;
  mean: number;
  std: number;
}

export default function MonteCarlo() {
  const [numTrials, setNumTrials] = useState(5000);
  const [results, setResults] = useState<SimulationResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [params, setParams] = useState<SimulationParams>(defaultParams);
  const [projectLife, setProjectLife] = useState(25);
  const [customParams, setCustomParams] = useState<CustomParam[]>([]);
  const [outputMetric, setOutputMetric] = useState<"npv" | "irr" | "payback">("npv");

  const runSim = () => {
    setRunning(true);
    setTimeout(() => {
      const r = runMonteCarloSimulation(params, numTrials);
      setResults(r);
      setRunning(false);
    }, 100);
  };

  const npvValues = useMemo(() => results?.map(r => r.npv) ?? [], [results]);
  const irrValues = useMemo(() => results?.map(r => r.irr) ?? [], [results]);
  const paybackValues = useMemo(() => results?.map(r => r.paybackYears) ?? [], [results]);
  const npvHist = useMemo(() => npvValues.length ? buildHistogram(npvValues, 50) : [], [npvValues]);
  const meanNPV = useMemo(() => npvValues.length ? computeMean(npvValues) : 0, [npvValues]);
  const p5 = useMemo(() => npvValues.length ? computePercentile(npvValues, 0.05) : 0, [npvValues]);
  const p95 = useMemo(() => npvValues.length ? computePercentile(npvValues, 0.95) : 0, [npvValues]);
  const var95 = useMemo(() => npvValues.length ? computeVaR(npvValues, 0.95) : 0, [npvValues]);
  const cvar95 = useMemo(() => npvValues.length ? computeCVaR(npvValues, 0.95) : 0, [npvValues]);
  const probPositive = useMemo(() => npvValues.length ? (npvValues.filter(v => v > 0).length / npvValues.length * 100) : 0, [npvValues]);

  const updateParam = (key: keyof SimulationParams, subkey: "mean" | "std", value: number) => {
    setParams(prev => {
      const current = prev[key];
      if (typeof current === "object" && current !== null && "mean" in current) {
        return { ...prev, [key]: { ...current, [subkey]: value } };
      }
      return prev;
    });
  };

  const addCustomParam = () => {
    setCustomParams(prev => [...prev, { id: Date.now().toString(), label: "Custom Variable", mean: 0, std: 100 }]);
  };

  const removeCustomParam = (id: string) => {
    setCustomParams(prev => prev.filter(p => p.id !== id));
  };

  const updateCustomParam = (id: string, field: keyof CustomParam, value: string | number) => {
    setCustomParams(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const fmt = (v: number) => v >= 0 ? `$${(v/1000).toFixed(0)}K` : `-$${(Math.abs(v)/1000).toFixed(0)}K`;

  const metricTabs = [
    { key: "npv" as const, label: "NPV Distribution" },
    { key: "irr" as const, label: "IRR Analysis" },
    { key: "payback" as const, label: "Payback Period" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Monte Carlo <span className="gradient-text">Simulation</span></h1>
          <p className="text-sm text-slate-400 mt-0.5">Stochastic geothermal project modeling with {numTrials.toLocaleString()} randomized trials</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setResults(null); setParams(defaultParams); setCustomParams([]); }} className="btn-secondary flex items-center gap-1.5">
            <RotateCcw size={14} /> Reset
          </button>
          <button onClick={runSim} disabled={running} className="btn-primary flex items-center gap-1.5">
            <Play size={14} /> {running ? "Running..." : "Run Simulation"}
          </button>
        </div>
      </div>

      {/* Controls bar */}
      <div className="glass-card p-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Trials:</span>
          <select value={numTrials} onChange={e => setNumTrials(Number(e.target.value))} className="select-dark text-xs py-1.5">
            <option value={1000}>1,000</option>
            <option value={5000}>5,000</option>
            <option value={10000}>10,000</option>
            <option value={25000}>25,000</option>
            <option value={50000}>50,000</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Project Life:</span>
          <input type="number" min={5} max={50} value={projectLife} onChange={e => setProjectLife(Number(e.target.value))} className="input-dark w-16 text-xs text-center py-1.5" />
          <span className="text-xs text-slate-500">years</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">ITC Rate:</span>
          <input type="number" min={0} max={50} value={30} className="input-dark w-16 text-xs text-center py-1.5" readOnly />
          <span className="text-xs text-slate-500">%</span>
        </div>
        <div className="ml-auto">
          <button onClick={addCustomParam} className="btn-secondary flex items-center gap-1.5 text-xs py-1.5">
            <Plus size={12} /> Add Variable
          </button>
        </div>
      </div>

      {/* Parameters */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Input Parameters <span className="text-slate-500 font-normal">&mdash; edit mean and standard deviation for each variable</span></h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Drilling Cost ($/ft)", key: "drillingCostPerFt" as const },
            { label: "Bore Depth (ft)", key: "boreDepth" as const },
            { label: "Heat Pump Cost ($)", key: "heatPumpCost" as const },
            { label: "Annual Energy Cost ($)", key: "annualEnergyCost" as const },
            { label: "Savings %", key: "savingsPercent" as const },
            { label: "Energy Escalation %", key: "energyEscalation" as const },
            { label: "Discount Rate %", key: "discountRate" as const },
            { label: "Carbon Credits ($/yr)", key: "carbonCreditsPerYear" as const },
          ].map(p => {
            const val = params[p.key];
            if (typeof val !== "object" || !("mean" in val)) return null;
            return (
              <div key={p.label} className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">{p.label}</label>
                <div className="flex gap-1.5">
                  <div className="flex-1">
                    <input type="number" value={val.mean} onChange={e => updateParam(p.key, "mean", Number(e.target.value))} className="input-dark w-full text-xs py-1.5" />
                    <span className="text-xs text-slate-600">Mean</span>
                  </div>
                  <div className="flex-1">
                    <input type="number" value={val.std} onChange={e => updateParam(p.key, "std", Number(e.target.value))} className="input-dark w-full text-xs py-1.5" />
                    <span className="text-xs text-slate-600">Std Dev</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom parameters */}
        {customParams.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700/30">
            <h4 className="text-xs font-medium mb-2" style={{ color: "#6CB4D9" }}>Custom Variables</h4>
            <div className="grid grid-cols-4 gap-3">
              {customParams.map(cp => (
                <div key={cp.id} className="space-y-1.5 relative">
                  <div className="flex items-center gap-1">
                    <input value={cp.label} onChange={e => updateCustomParam(cp.id, "label", e.target.value)} className="input-dark text-xs py-1 flex-1 font-medium" />
                    <button onClick={() => removeCustomParam(cp.id)} className="text-slate-600 hover:text-red-400"><Trash2 size={12} /></button>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="flex-1">
                      <input type="number" value={cp.mean} onChange={e => updateCustomParam(cp.id, "mean", Number(e.target.value))} className="input-dark w-full text-xs py-1.5" />
                      <span className="text-xs text-slate-600">Mean</span>
                    </div>
                    <div className="flex-1">
                      <input type="number" value={cp.std} onChange={e => updateCustomParam(cp.id, "std", Number(e.target.value))} className="input-dark w-full text-xs py-1.5" />
                      <span className="text-xs text-slate-600">Std Dev</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {results && (
        <>
          {/* Summary metrics */}
          <div className="grid grid-cols-6 gap-3">
            {[
              { label: "Mean NPV", value: fmt(meanNPV), hexColor: "#10b981" },
              { label: "P5 (Downside)", value: fmt(p5), hexColor: "#ef4444" },
              { label: "P95 (Upside)", value: fmt(p95), hexColor: "#10b981" },
              { label: "VaR 95%", value: fmt(var95), hexColor: "#E8652D" },
              { label: "CVaR 95%", value: fmt(cvar95), hexColor: "#ef4444" },
              { label: "P(NPV > 0)", value: `${probPositive.toFixed(1)}%`, hexColor: probPositive > 70 ? "#10b981" : "#E8652D" },
            ].map(s => (
              <div key={s.label} className="glass-card p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <p className="text-lg font-bold tabular-nums" style={{ color: s.hexColor }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Output metric tabs */}
          <div className="flex items-center gap-2">
            {metricTabs.map(tab => (
              <button key={tab.key} onClick={() => setOutputMetric(tab.key)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all border ${outputMetric === tab.key ? "tab-active" : "tab-inactive"}`}>
                {tab.label}
              </button>
            ))}
            <div className="ml-auto">
              <button className="btn-secondary flex items-center gap-1.5 text-xs py-1.5">
                <Download size={12} /> Export CSV
              </button>
            </div>
          </div>

          {outputMetric === "npv" && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-1">NPV Distribution</h3>
              <p className="text-xs text-slate-500 mb-4">{numTrials.toLocaleString()} simulated outcomes &mdash; {projectLife}-year horizon</p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={npvHist} barCategoryGap={0}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="bin" tick={{ fontSize: 10, fill: "#64748b" }} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#e2e8f0" }} formatter={(value: number) => [value, "Frequency"]} />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                    {npvHist.map((entry, i) => (
                      <Cell key={i} fill={entry.range[1] < 0 ? "#ef4444" : entry.range[0] < 0 ? "#E8652D" : "#2B7BC2"} opacity={0.75} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {outputMetric === "irr" && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-4">IRR Distribution Summary</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <p className="text-xs text-slate-400 mb-1">Mean IRR</p>
                  <p className="text-3xl font-bold text-emerald-400 tabular-nums">{computeMean(irrValues).toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <p className="text-xs text-slate-400 mb-1">Std Dev</p>
                  <p className="text-3xl font-bold text-blue-400 tabular-nums">{computeStd(irrValues).toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
                  <p className="text-xs text-slate-400 mb-1">P(IRR &gt; 10%)</p>
                  <p className="text-3xl font-bold text-violet-400 tabular-nums">{(irrValues.filter(v => v > 10).length / irrValues.length * 100).toFixed(0)}%</p>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <p className="text-xs text-slate-400 mb-1">Median IRR</p>
                  <p className="text-3xl font-bold text-amber-400 tabular-nums">{computePercentile(irrValues, 0.5).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}

          {outputMetric === "payback" && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Payback Period Summary</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <p className="text-xs text-slate-400 mb-1">Mean Payback</p>
                  <p className="text-3xl font-bold text-amber-400 tabular-nums">{computeMean(paybackValues).toFixed(1)} yr</p>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <p className="text-xs text-slate-400 mb-1">P5 (Best)</p>
                  <p className="text-3xl font-bold text-emerald-400 tabular-nums">{computePercentile(paybackValues, 0.05).toFixed(1)} yr</p>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <p className="text-xs text-slate-400 mb-1">P95 (Worst)</p>
                  <p className="text-3xl font-bold text-red-400 tabular-nums">{computePercentile(paybackValues, 0.95).toFixed(1)} yr</p>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <p className="text-xs text-slate-400 mb-1">P(Payback &lt; 10yr)</p>
                  <p className="text-3xl font-bold text-blue-400 tabular-nums">{(paybackValues.filter(v => v < 10).length / paybackValues.length * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!results && (
        <div className="glass-card p-12 text-center">
          <Activity size={36} className="text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-400">Configure parameters and run simulation</h3>
          <p className="text-xs text-slate-500 mt-1">The engine will generate {numTrials.toLocaleString()} randomized trials modeling drilling cost uncertainty, energy savings variability, and financing risk</p>
        </div>
      )}
    </div>
  );
}
