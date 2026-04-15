import { useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from "recharts";

const scenarioData = Array.from({ length: 26 }, (_, i) => {
  const year = i;
  const bull = -150000 + year * 42000 * Math.pow(1.035, year) / Math.pow(1.06, year);
  const base = -150000 + year * 28000 * Math.pow(1.03, year) / Math.pow(1.06, year);
  const bear = -150000 + year * 18000 * Math.pow(1.02, year) / Math.pow(1.06, year);
  return { year: `Y${year}`, bull: Math.round(bull), base: Math.round(base), bear: Math.round(bear) };
});

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

const drillingSuccess = [
  { depth: "200ft", success: 95, avgCost: 28000 },
  { depth: "300ft", success: 88, avgCost: 45000 },
  { depth: "400ft", success: 78, avgCost: 68000 },
  { depth: "500ft", success: 65, avgCost: 95000 },
  { depth: "600ft", success: 52, avgCost: 130000 },
  { depth: "800ft", success: 38, avgCost: 195000 },
];

export default function Predictions() {
  const [selectedScenario, setSelectedScenario] = useState<"bull" | "base" | "bear">("base");

  const scenarioDetails = {
    bull: { label: "Bull Case", prob: "20%", desc: "High thermal gradient, favorable policy, strong carbon markets", color: "text-emerald-400", npv: "$1.8M", irr: "18.2%" },
    base: { label: "Base Case", prob: "55%", desc: "Conservative estimates, current policy environment", color: "text-blue-400", npv: "$520K", irr: "13.1%" },
    bear: { label: "Bear Case", prob: "25%", desc: "Low resource quality, policy uncertainty, cost overruns", color: "text-red-400", npv: "-$85K", irr: "4.8%" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Prediction <span className="gradient-text">Analysis</span></h1>
        <p className="text-slate-400 mt-1">Multi-scenario forecasting for geothermal project cash flows and market conditions</p>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-3 gap-4">
        {(["bull", "base", "bear"] as const).map(key => {
          const s = scenarioDetails[key];
          return (
            <div key={key} onClick={() => setSelectedScenario(key)} className={`glass-card-hover p-5 cursor-pointer ${selectedScenario === key ? "border-orange-500/40" : ""}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${s.color}`}>{s.label}</span>
                <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded-full">P = {s.prob}</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">{s.desc}</p>
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-slate-400">NPV</p>
                  <p className={`text-lg font-bold ${s.color}`}>{s.npv}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">IRR</p>
                  <p className={`text-lg font-bold ${s.color}`}>{s.irr}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cumulative Cash Flow Chart */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-1">Cumulative Cash Flow by Scenario (25-Year Projection)</h3>
        <p className="text-sm text-slate-400 mb-4">Discounted cash flows including energy savings, carbon credits, maintenance, and financing costs</p>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={scenarioData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#94a3b8" }} interval={2} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569", borderRadius: 12, fontSize: 13 }} formatter={(v: number) => [`$${(v / 1000).toFixed(0)}K`, ""]} />
            <Legend />
            <Area type="monotone" dataKey="bull" name="Bull Case" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
            <Area type="monotone" dataKey="base" name="Base Case" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
            <Area type="monotone" dataKey="bear" name="Bear Case" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Energy Price Forecast */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-1">Energy Price Forecasts (2024-2033)</h3>
        <p className="text-sm text-slate-400 mb-4">Projected energy cost trajectories &mdash; geothermal advantage grows as fossil fuel prices escalate</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={energyForecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569", borderRadius: 12 }} />
            <Legend />
            <Line type="monotone" dataKey="gas" name="Natural Gas ($/therm)" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="electric" name="Electricity ($/kWh)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="geothermal" name="Geothermal LCOE ($/kWh)" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Drilling Success Probability */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Drilling Success Probability by Depth</h3>
        <div className="grid grid-cols-6 gap-3">
          {drillingSuccess.map(d => (
            <div key={d.depth} className="text-center bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
              <p className="text-sm font-medium text-slate-300">{d.depth}</p>
              <p className={`text-2xl font-bold mt-1 ${d.success > 80 ? "text-emerald-400" : d.success > 60 ? "text-orange-400" : "text-red-400"}`}>{d.success}%</p>
              <p className="text-xs text-slate-500 mt-1">${(d.avgCost / 1000).toFixed(0)}K avg cost</p>
            </div>
          ))}
        </div>
      </div>

      {/* Market Indicators */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "IRA Tax Credit", value: "30%", trend: "Stable through 2032", up: true },
          { label: "Carbon Price (EU ETS)", value: "$84/tCO2", trend: "+3.7% this month", up: true },
          { label: "10Y Treasury Rate", value: "4.25%", trend: "+15bps this quarter", up: false },
          { label: "Geothermal LCOE", value: "$0.04/kWh", trend: "-8% YoY", up: true },
        ].map(m => (
          <div key={m.label} className="glass-card p-5">
            <p className="text-xs text-slate-400">{m.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{m.value}</p>
            <p className={`text-xs mt-1 flex items-center gap-1 ${m.up ? "text-emerald-400" : "text-red-400"}`}>
              {m.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {m.trend}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
