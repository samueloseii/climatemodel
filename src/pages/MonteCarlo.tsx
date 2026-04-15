import { useState, useMemo } from "react";
import { Play, RotateCcw, Download, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { defaultParams, runMonteCarloSimulation, computeMean, computeStd, computePercentile, computeVaR, computeCVaR, buildHistogram } from "../data/simulationEngine";
import type { SimulationParams, SimulationResult } from "../data/simulationEngine";

export default function MonteCarlo() {
  const [numTrials, setNumTrials] = useState(5000);
  const [results, setResults] = useState<SimulationResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [params, setParams] = useState<SimulationParams>(defaultParams);

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

  const fmt = (v: number) => v >= 0 ? `$${(v/1000).toFixed(0)}K` : `-$${(Math.abs(v)/1000).toFixed(0)}K`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Monte Carlo <span className="gradient-text">Simulation</span></h1>
        <p className="text-slate-400 mt-1">Stochastic geothermal project modeling with {numTrials.toLocaleString()} randomized trials</p>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">Geothermal Project Parameters</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Trials:</span>
              <select value={numTrials} onChange={e => setNumTrials(Number(e.target.value))} className="select-dark text-sm py-1.5">
                <option value={1000}>1,000</option>
                <option value={5000}>5,000</option>
                <option value={10000}>10,000</option>
                <option value={25000}>25,000</option>
              </select>
            </div>
            <button onClick={() => { setResults(null); setParams(defaultParams); }} className="btn-secondary flex items-center gap-2 text-sm py-2">
              <RotateCcw size={14} /> Reset
            </button>
            <button onClick={runSim} disabled={running} className="btn-primary flex items-center gap-2 text-sm py-2">
              <Play size={14} /> {running ? "Running..." : "Run Simulation"}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
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
              <div key={p.label} className="space-y-2">
                <label className="text-xs font-medium text-slate-400">{p.label}</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input type="number" value={val.mean} onChange={e => updateParam(p.key, "mean", Number(e.target.value))} className="input-dark w-full text-xs py-2" />
                    <span className="text-xs text-slate-500">Mean</span>
                  </div>
                  <div className="flex-1">
                    <input type="number" value={val.std} onChange={e => updateParam(p.key, "std", Number(e.target.value))} className="input-dark w-full text-xs py-2" />
                    <span className="text-xs text-slate-500">Std Dev</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {results && (
        <>
          <div className="grid grid-cols-6 gap-3">
            {[
              { label: "Mean NPV", value: fmt(meanNPV), color: "text-emerald-400" },
              { label: "P5 (Downside)", value: fmt(p5), color: "text-red-400" },
              { label: "P95 (Upside)", value: fmt(p95), color: "text-emerald-400" },
              { label: "VaR 95%", value: fmt(var95), color: "text-orange-400" },
              { label: "CVaR 95%", value: fmt(cvar95), color: "text-red-400" },
              { label: "P(NPV > 0)", value: `${probPositive.toFixed(1)}%`, color: probPositive > 70 ? "text-emerald-400" : "text-orange-400" },
            ].map(s => (
              <div key={s.label} className="glass-card p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">NPV Distribution</h3>
                <p className="text-sm text-slate-400">{numTrials.toLocaleString()} simulated outcomes &mdash; geothermal project 25-year horizon</p>
              </div>
              <button className="btn-secondary flex items-center gap-2 text-sm py-1.5">
                <Download size={14} /> Export
              </button>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={npvHist} barCategoryGap={0}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="bin" tick={{ fontSize: 10, fill: "#94a3b8" }} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569", borderRadius: 12, fontSize: 13 }} labelStyle={{ color: "#e2e8f0" }} formatter={(value: number) => [value, "Frequency"]} />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {npvHist.map((entry, i) => (
                    <Cell key={i} fill={entry.range[1] < 0 ? "#ef4444" : entry.range[0] < 0 ? "#f97316" : "#10b981"} opacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-2">IRR Distribution</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center"><p className="text-xs text-slate-400">Mean IRR</p><p className="text-2xl font-bold text-emerald-400">{computeMean(irrValues).toFixed(1)}%</p></div>
                <div className="text-center"><p className="text-xs text-slate-400">Std Dev</p><p className="text-2xl font-bold text-slate-300">{computeStd(irrValues).toFixed(1)}%</p></div>
                <div className="text-center"><p className="text-xs text-slate-400">{"P(IRR > 10%)"}</p><p className="text-2xl font-bold text-blue-400">{(irrValues.filter(v => v > 10).length / irrValues.length * 100).toFixed(0)}%</p></div>
              </div>
            </div>
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Payback Period</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center"><p className="text-xs text-slate-400">Mean</p><p className="text-2xl font-bold text-orange-400">{computeMean(paybackValues).toFixed(1)} yr</p></div>
                <div className="text-center"><p className="text-xs text-slate-400">P5 (Best)</p><p className="text-2xl font-bold text-emerald-400">{computePercentile(paybackValues, 0.05).toFixed(1)} yr</p></div>
                <div className="text-center"><p className="text-xs text-slate-400">P95 (Worst)</p><p className="text-2xl font-bold text-red-400">{computePercentile(paybackValues, 0.95).toFixed(1)} yr</p></div>
              </div>
            </div>
          </div>
        </>
      )}

      {!results && (
        <div className="glass-card p-16 text-center">
          <Activity size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400">Configure parameters and click &ldquo;Run Simulation&rdquo;</h3>
          <p className="text-sm text-slate-500 mt-2">The engine will generate {numTrials.toLocaleString()} randomized trials modeling drilling cost uncertainty, energy savings variability, and financing risk</p>
        </div>
      )}
    </div>
  );
}
