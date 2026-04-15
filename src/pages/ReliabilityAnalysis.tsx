import { useState, useMemo } from "react";
import { RotateCcw, Info, Plus, Trash2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";

// Weibull distribution functions
function weibullReliability(t: number, k: number, lambda: number): number {
  return Math.exp(-Math.pow(t / lambda, k));
}

function weibullHazard(t: number, k: number, lambda: number): number {
  if (t <= 0) return k <= 1 ? (k === 1 ? 1 / lambda : Infinity) : 0;
  return (k / lambda) * Math.pow(t / lambda, k - 1);
}

function weibullPDF(t: number, k: number, lambda: number): number {
  if (t <= 0) return 0;
  return (k / lambda) * Math.pow(t / lambda, k - 1) * Math.exp(-Math.pow(t / lambda, k));
}

function weibullMTTF(k: number, lambda: number): number {
  // MTTF = lambda * Gamma(1 + 1/k)
  // Use Stirling approx for Gamma
  const x = 1 + 1 / k;
  // Simple gamma approximation using Lanczos
  const g = 7;
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  let z = x - 1;
  let s = c[0];
  for (let i = 1; i < g + 2; i++) s += c[i] / (z + i);
  const t2 = z + g + 0.5;
  const gamma = Math.sqrt(2 * Math.PI) * Math.pow(t2, z + 0.5) * Math.exp(-t2) * s;
  return lambda * gamma;
}

interface Component {
  name: string;
  k: number; // shape parameter
  lambda: number; // scale parameter (characteristic lifetime in years)
  cost: number; // replacement cost
}

const defaultComponents: Component[] = [
  { name: "Downhole Pump", k: 1.8, lambda: 8, cost: 85000 },
  { name: "Heat Exchanger", k: 2.2, lambda: 12, cost: 120000 },
  { name: "Surface Piping", k: 3.0, lambda: 20, cost: 45000 },
  { name: "Control System", k: 1.2, lambda: 15, cost: 35000 },
  { name: "Turbine/Generator", k: 2.5, lambda: 18, cost: 350000 },
];

export default function ReliabilityAnalysis() {
  const [components, setComponents] = useState<Component[]>(defaultComponents);
  const [timeHorizon, setTimeHorizon] = useState(30);
  const [selectedComp, setSelectedComp] = useState(0);

  const comp = components[selectedComp] || components[0];

  // Generate reliability curves for selected component
  const reliabilityData = useMemo(() => {
    const data: { year: number; reliability: number; hazard: number; pdf: number }[] = [];
    for (let t = 0; t <= timeHorizon; t += 0.5) {
      data.push({
        year: t,
        reliability: weibullReliability(t, comp.k, comp.lambda) * 100,
        hazard: weibullHazard(t, comp.k, comp.lambda) * 100,
        pdf: weibullPDF(t, comp.k, comp.lambda) * 100,
      });
    }
    return data;
  }, [comp, timeHorizon]);

  // System reliability (series system - all must work)
  const systemReliabilityData = useMemo(() => {
    const data: { year: number; system: number; [key: string]: number }[] = [];
    for (let t = 0; t <= timeHorizon; t += 1) {
      const row: { year: number; system: number; [key: string]: number } = { year: t, system: 100 };
      let sysR = 1;
      components.forEach(c => {
        const r = weibullReliability(t, c.k, c.lambda);
        row[c.name] = r * 100;
        sysR *= r;
      });
      row.system = sysR * 100;
      data.push(row);
    }
    return data;
  }, [components, timeHorizon]);

  // Summary metrics
  const metrics = useMemo(() => {
    return components.map(c => {
      const mttf = weibullMTTF(c.k, c.lambda);
      const r5 = weibullReliability(5, c.k, c.lambda) * 100;
      const r10 = weibullReliability(10, c.k, c.lambda) * 100;
      const hazardType = c.k < 1 ? "Decreasing (infant mortality)" : c.k === 1 ? "Constant (random)" : c.k < 2 ? "Mildly increasing" : "Increasing (wear-out)";
      return { name: c.name, mttf, r5, r10, hazardType, k: c.k, lambda: c.lambda, cost: c.cost };
    });
  }, [components]);

  // Expected replacement cost over project life
  const expectedCosts = useMemo(() => {
    return components.map(c => {
      const mttf = weibullMTTF(c.k, c.lambda);
      const expectedReplacements = Math.max(0, timeHorizon / mttf - 1);
      return {
        name: c.name,
        mttf,
        expectedReplacements: expectedReplacements,
        expectedCost: expectedReplacements * c.cost,
        cost: c.cost,
      };
    });
  }, [components, timeHorizon]);

  const totalExpectedCost = expectedCosts.reduce((s, c) => s + c.expectedCost, 0);

  const updateComponent = (idx: number, field: keyof Component, value: string | number) => {
    setComponents(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const addComponent = () => {
    setComponents(prev => [...prev, { name: `Component ${prev.length + 1}`, k: 2.0, lambda: 10, cost: 50000 }]);
  };

  const removeComponent = (idx: number) => {
    if (components.length <= 2) return;
    if (selectedComp >= components.length - 1) setSelectedComp(Math.max(0, components.length - 2));
    setComponents(prev => prev.filter((_, i) => i !== idx));
  };

  const fmt = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v.toFixed(0)}`;

  const colors = ["#2B7BC2", "#E8652D", "#10b981", "#6CB4D9", "#a855f7", "#f59e0b", "#ec4899"];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reliability <span className="gradient-text">Analysis</span></h1>
          <p className="text-sm text-slate-400 mt-0.5">Weibull failure modeling for geothermal infrastructure components</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Horizon:</span>
            <input type="number" min={5} max={50} value={timeHorizon} onChange={e => setTimeHorizon(Number(e.target.value))} className="input-dark w-16 text-xs text-center py-1.5" />
            <span className="text-xs text-slate-500">years</span>
          </div>
          <button onClick={() => { setComponents(defaultComponents); setSelectedComp(0); }} className="btn-secondary flex items-center gap-1.5">
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Component Table */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Infrastructure Components <span className="text-slate-500 font-normal">&mdash; Weibull parameters</span></h3>
          <button onClick={addComponent} className="btn-primary flex items-center gap-1 text-xs py-1.5 px-3">
            <Plus size={11} /> Add Component
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/40">
                <th className="text-left py-2 px-2 font-medium" style={{ color: "#2B7BC2" }}>Component</th>
                <th className="text-center py-2 px-2 font-medium text-slate-400">Shape (k)</th>
                <th className="text-center py-2 px-2 font-medium text-slate-400">Scale (&lambda;, yrs)</th>
                <th className="text-center py-2 px-2 font-medium text-slate-400">Replace Cost</th>
                <th className="text-center py-2 px-2 font-medium text-slate-400">MTTF</th>
                <th className="text-center py-2 px-2 font-medium text-slate-400">R(5yr)</th>
                <th className="text-center py-2 px-2 font-medium text-slate-400">R(10yr)</th>
                <th className="text-center py-2 px-2 font-medium text-slate-400">Hazard Type</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {components.map((c, i) => {
                const m = metrics[i];
                return (
                  <tr key={i} onClick={() => setSelectedComp(i)} className={`border-b border-slate-800/30 cursor-pointer transition-colors ${selectedComp === i ? "bg-slate-800/40" : "hover:bg-slate-800/20"}`}>
                    <td className="py-1.5 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
                        <input value={c.name} onChange={e => updateComponent(i, "name", e.target.value)} onClick={e => e.stopPropagation()} className="input-dark text-xs py-1 w-36" />
                      </div>
                    </td>
                    <td className="py-1.5 px-2"><input type="number" step={0.1} min={0.1} value={c.k} onChange={e => updateComponent(i, "k", Number(e.target.value))} onClick={e => e.stopPropagation()} className="input-dark text-xs text-center py-1 w-16 mx-auto block" /></td>
                    <td className="py-1.5 px-2"><input type="number" step={1} min={1} value={c.lambda} onChange={e => updateComponent(i, "lambda", Number(e.target.value))} onClick={e => e.stopPropagation()} className="input-dark text-xs text-center py-1 w-16 mx-auto block" /></td>
                    <td className="py-1.5 px-2"><input type="number" step={5000} value={c.cost} onChange={e => updateComponent(i, "cost", Number(e.target.value))} onClick={e => e.stopPropagation()} className="input-dark text-xs text-center py-1 w-24 mx-auto block font-mono" /></td>
                    <td className="py-1.5 px-2 text-center font-mono" style={{ color: "#10b981" }}>{m?.mttf.toFixed(1)} yr</td>
                    <td className="py-1.5 px-2 text-center font-mono" style={{ color: (m?.r5 ?? 0) > 80 ? "#10b981" : (m?.r5 ?? 0) > 50 ? "#E8652D" : "#ef4444" }}>{m?.r5.toFixed(1)}%</td>
                    <td className="py-1.5 px-2 text-center font-mono" style={{ color: (m?.r10 ?? 0) > 80 ? "#10b981" : (m?.r10 ?? 0) > 50 ? "#E8652D" : "#ef4444" }}>{m?.r10.toFixed(1)}%</td>
                    <td className="py-1.5 px-2 text-center text-slate-400">{m?.hazardType}</td>
                    <td className="py-1.5 px-1">
                      {components.length > 2 && <button onClick={(e) => { e.stopPropagation(); removeComponent(i); }} className="text-slate-600 hover:text-red-400"><Trash2 size={12} /></button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Component Detail Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Reliability Function R(t) &mdash; <span style={{ color: colors[selectedComp % colors.length] }}>{comp.name}</span></h3>
          <p className="text-xs text-slate-500 mb-3">Probability of surviving beyond time t</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={reliabilityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "Years", position: "insideBottom", offset: -5, fontSize: 11, fill: "#94a3b8" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v.toFixed(1)}%`, ""]} />
              <Area type="monotone" dataKey="reliability" name="Reliability" stroke={colors[selectedComp % colors.length]} fill={colors[selectedComp % colors.length]} fillOpacity={0.15} strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Hazard Rate h(t) &mdash; <span style={{ color: colors[selectedComp % colors.length] }}>{comp.name}</span></h3>
          <p className="text-xs text-slate-500 mb-3">Instantaneous failure rate (% per year)</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={reliabilityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "Years", position: "insideBottom", offset: -5, fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `${v.toFixed(0)}%`} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v.toFixed(2)}%/yr`, ""]} />
              <Line type="monotone" dataKey="hazard" name="Hazard Rate" stroke="#E8652D" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Reliability */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-1">System Reliability (Series Configuration)</h3>
        <p className="text-xs text-slate-500 mb-3">All components must function; system reliability is the product of individual reliabilities</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={systemReliabilityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "Years", position: "insideBottom", offset: -5, fontSize: 11, fill: "#94a3b8" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `${v}%`} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v.toFixed(1)}%`, ""]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {components.map((c, i) => (
              <Line key={c.name} type="monotone" dataKey={c.name} stroke={colors[i % colors.length]} strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            ))}
            <Line type="monotone" dataKey="system" name="System" stroke="#ffffff" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Expected Replacement Costs */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Expected Replacement Costs over {timeHorizon} Years</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/40">
                <th className="text-left py-2 px-2 font-medium text-slate-400">Component</th>
                <th className="text-center py-2 px-2 font-medium text-slate-400">MTTF</th>
                <th className="text-center py-2 px-2 font-medium text-slate-400">Unit Cost</th>
                <th className="text-center py-2 px-2 font-medium text-slate-400">Expected Replacements</th>
                <th className="text-center py-2 px-2 font-medium text-slate-400">Expected Cost</th>
              </tr>
            </thead>
            <tbody>
              {expectedCosts.map((c, i) => (
                <tr key={i} className="border-b border-slate-800/30">
                  <td className="py-2 px-2 text-slate-300 font-medium">{c.name}</td>
                  <td className="py-2 px-2 text-center font-mono" style={{ color: "#6CB4D9" }}>{c.mttf.toFixed(1)} yr</td>
                  <td className="py-2 px-2 text-center font-mono text-slate-300">{fmt(c.cost)}</td>
                  <td className="py-2 px-2 text-center font-mono text-slate-300">{c.expectedReplacements.toFixed(1)}</td>
                  <td className="py-2 px-2 text-center font-mono font-medium" style={{ color: c.expectedCost > 200000 ? "#E8652D" : "#10b981" }}>{fmt(c.expectedCost)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-600/50">
                <td className="py-2 px-2 text-white font-semibold" colSpan={4}>Total Expected Replacement Cost</td>
                <td className="py-2 px-2 text-center font-mono font-bold text-lg" style={{ color: "#E8652D" }}>{fmt(totalExpectedCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bathtub Curve Note */}
      <div className="glass-card p-5" style={{ borderColor: "rgba(43,123,194,0.15)" }}>
        <div className="flex items-start gap-3">
          <Info size={18} style={{ color: "#2B7BC2" }} className="shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Understanding the Weibull Shape Parameter</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The Weibull <strong className="text-white">shape parameter k</strong> determines the failure mode:
              <strong style={{ color: "#6CB4D9" }}> k &lt; 1</strong> means decreasing hazard (infant mortality / burn-in failures).
              <strong style={{ color: "#10b981" }}> k = 1</strong> gives constant hazard (exponential, random failures).
              <strong style={{ color: "#E8652D" }}> k &gt; 1</strong> means increasing hazard (wear-out / aging).
              Most geothermal components exhibit k &gt; 1 due to thermal cycling, corrosion, and mechanical wear.
              The <strong className="text-white">scale parameter &lambda;</strong> is the characteristic lifetime &mdash; the time at which 63.2% of units have failed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
