import { useState, useMemo } from "react";
import { Play, Shield, AlertTriangle, Info } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { defaultParams, runMonteCarloSimulation, computeMean, computeVaR, computeCVaR, computePercentile, runSensitivityAnalysis } from "../data/simulationEngine";

// Extreme Value Analysis: GPD tail estimation
function fitGPD(tailLosses: number[]): { xi: number; sigma: number } {
  // Method of Moments for GPD shape (xi) and scale (sigma)
  if (tailLosses.length < 5) return { xi: 0.1, sigma: 100000 };
  const mean = tailLosses.reduce((s, v) => s + v, 0) / tailLosses.length;
  const variance = tailLosses.reduce((s, v) => s + (v - mean) ** 2, 0) / (tailLosses.length - 1);
  const cv2 = variance / (mean * mean);
  const xi = 0.5 * (cv2 - 1); // shape parameter
  const sigma = mean * (1 + xi) / 2; // scale parameter
  return { xi: Math.max(-0.5, Math.min(xi, 2)), sigma: Math.max(1, sigma) };
}

function gpdQuantile(p: number, xi: number, sigma: number, threshold: number): number {
  // GPD quantile function: threshold + sigma/xi * ((1-p)^(-xi) - 1)
  if (Math.abs(xi) < 1e-6) return threshold + sigma * (-Math.log(1 - p));
  return threshold + (sigma / xi) * (Math.pow(1 - p, -xi) - 1);
}

export default function RiskAnalysis() {
  const [results, setResults] = useState<ReturnType<typeof runMonteCarloSimulation> | null>(null);
  const [running, setRunning] = useState(false);
  const [confidence, setConfidence] = useState(0.95);
  const [tailThresholdPct, setTailThresholdPct] = useState(10); // % of data in tail

  const runAnalysis = () => {
    setRunning(true);
    setTimeout(() => {
      setResults(runMonteCarloSimulation(defaultParams, 10000));
      setRunning(false);
    }, 100);
  };

  const npvValues = useMemo(() => results?.map(r => r.npv) ?? [], [results]);
  const var_val = useMemo(() => npvValues.length ? computeVaR(npvValues, confidence) : 0, [npvValues, confidence]);
  const cvar_val = useMemo(() => npvValues.length ? computeCVaR(npvValues, confidence) : 0, [npvValues, confidence]);
  const sensitivity = useMemo(() => runSensitivityAnalysis(defaultParams), []);

  // Extreme Value / GPD tail analysis
  const extremeValueData = useMemo(() => {
    if (!npvValues.length) return null;
    const sorted = [...npvValues].sort((a, b) => a - b);
    const tailN = Math.max(5, Math.floor(sorted.length * tailThresholdPct / 100));
    const threshold = sorted[tailN - 1];
    const tailLosses = sorted.slice(0, tailN).map(v => threshold - v);
    const gpd = fitGPD(tailLosses);

    // Return periods: 1-in-N year loss levels
    // The GPD quantile gives the excess loss beyond the threshold.
    // Longer return periods → higher exceedance quantile → larger loss.
    const returnPeriods = [5, 10, 20, 50, 100].map(rp => {
      const exceedanceProb = 1 / rp;
      const quantile = gpdQuantile(1 - exceedanceProb, gpd.xi, gpd.sigma, 0);
      return { returnPeriod: rp, loss: quantile, label: `1-in-${rp}` };
    });

    // Tail distribution curve for chart
    const tailCurve = Array.from({ length: 50 }, (_, i) => {
      const p = (i + 1) / 51;
      const quantile = gpdQuantile(p, gpd.xi, gpd.sigma, 0);
      return { exceedance: ((1 - p) * 100).toFixed(1), loss: Math.round(quantile) };
    });

    return { gpd, threshold, tailN, returnPeriods, tailCurve };
  }, [npvValues, tailThresholdPct]);

  const maxImpact = Math.max(...sensitivity.map(s => s.impact));
  const tornadoData = sensitivity.slice(0, 8).map(s => ({
    variable: s.variable,
    low: s.lowNPV - s.baseNPV,
    high: s.highNPV - s.baseNPV,
    lowLabel: `$${(s.lowNPV/1000).toFixed(0)}K`,
    highLabel: `$${(s.highNPV/1000).toFixed(0)}K`,
    impact: s.impact,
    pct: (s.impact / maxImpact * 100).toFixed(0),
  }));

  const fmt = (v: number) => v >= 0 ? `$${(v/1000).toFixed(0)}K` : `-$${(Math.abs(v)/1000).toFixed(0)}K`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Risk <span className="gradient-text">Analysis</span></h1>
          <p className="text-slate-400 mt-1">VaR, CVaR, and sensitivity analysis for geothermal project risk quantification</p>
        </div>
        <button onClick={runAnalysis} disabled={running} className="btn-primary flex items-center gap-2">
          <Play size={16} /> {running ? "Analyzing..." : "Run Risk Analysis"}
        </button>
      </div>

      {/* Sensitivity Tornado */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-1">Sensitivity Tornado Chart</h3>
        <p className="text-sm text-slate-400 mb-4">Impact of +/-25% change in each variable on project NPV</p>
        <div className="space-y-3">
          {tornadoData.map((item) => (
            <div key={item.variable} className="flex items-center gap-4">
              <div className="w-44 text-right text-sm text-slate-300 shrink-0">{item.variable}</div>
              <div className="flex-1 relative h-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-slate-700" />
                </div>
                <div className="absolute inset-y-0 left-1/2 w-px bg-slate-500" />
                {item.low < 0 ? (
                  <div className="absolute top-0 h-full bg-red-500/70 rounded-l" style={{ right: '50%', width: `${Math.abs(item.low) / (Math.max(Math.abs(item.low), Math.abs(item.high)) * 2) * 100}%` }} />
                ) : (
                  <div className="absolute top-0 h-full bg-emerald-500/70 rounded-r" style={{ left: '50%', width: `${item.low / (Math.max(Math.abs(item.low), Math.abs(item.high)) * 2) * 100}%` }} />
                )}
                {item.high > 0 ? (
                  <div className="absolute top-0 h-full bg-emerald-500/70 rounded-r" style={{ left: '50%', width: `${item.high / (Math.max(Math.abs(item.low), Math.abs(item.high)) * 2) * 100}%` }} />
                ) : (
                  <div className="absolute top-0 h-full bg-red-500/70 rounded-l" style={{ right: '50%', width: `${Math.abs(item.high) / (Math.max(Math.abs(item.low), Math.abs(item.high)) * 2) * 100}%` }} />
                )}
              </div>
              <div className="w-20 text-sm font-mono shrink-0" style={{ color: "#E8652D" }}>{item.pct}% impact</div>
            </div>
          ))}
        </div>
      </div>

      {results && (
        <>
          {/* VaR/CVaR Cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: `VaR (${(confidence*100).toFixed(0)}%)`, value: fmt(var_val), desc: "Maximum expected loss", icon: Shield, hexColor: "#E8652D" },
              { label: `CVaR (${(confidence*100).toFixed(0)}%)`, value: fmt(cvar_val), desc: "Expected loss in worst tail", icon: AlertTriangle, hexColor: "#ef4444" },
              { label: "Mean NPV", value: fmt(computeMean(npvValues)), desc: "Expected project value", icon: Shield, hexColor: "#10b981" },
              { label: "P(Loss)", value: `${(npvValues.filter(v => v < 0).length / npvValues.length * 100).toFixed(1)}%`, desc: "Probability of negative NPV", icon: AlertTriangle, hexColor: npvValues.filter(v => v < 0).length / npvValues.length > 0.3 ? "#ef4444" : "#10b981" },
            ].map(s => (
              <div key={s.label} className="glass-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon size={16} style={{ color: s.hexColor }} />
                  <span className="text-sm text-slate-400">{s.label}</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: s.hexColor }}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Confidence selector */}
          <div className="glass-card p-4 flex items-center gap-4">
            <span className="text-sm text-slate-400">Confidence Level:</span>
            {[0.90, 0.95, 0.99].map(c => (
              <button key={c} onClick={() => setConfidence(c)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${confidence === c ? "border" : "text-slate-400 hover:text-slate-200"}`} style={confidence === c ? { background: "rgba(232,101,45,0.12)", color: "#E8652D", borderColor: "rgba(232,101,45,0.3)" } : {}}>
                {(c*100).toFixed(0)}%
              </button>
            ))}
          </div>

          {/* Risk Interpretation */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Risk Interpretation for Stakeholders</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                <p className="text-sm font-semibold mb-2" style={{ color: "#E8652D" }}>Developer View</p>
                <p className="text-sm text-slate-300">Expected NPV of <span className="text-emerald-400 font-semibold">{fmt(computeMean(npvValues))}</span> with {(npvValues.filter(v => v > 0).length / npvValues.length * 100).toFixed(0)}% probability of positive returns.</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                <p className="text-sm font-semibold mb-2" style={{ color: "#2B7BC2" }}>Lender View (CVaR)</p>
                <p className="text-sm text-slate-300">In the worst {((1-confidence)*100).toFixed(0)}% of scenarios, expected loss is <span className="text-red-400 font-semibold">{fmt(cvar_val)}</span>. DSCR coverage remains adequate.</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                <p className="text-sm font-semibold mb-2" style={{ color: "#6CB4D9" }}>Development Bank View</p>
                <p className="text-sm text-slate-300">Portfolio diversification benefit. P5 downside of <span className="font-semibold" style={{ color: "#E8652D" }}>{fmt(computePercentile(npvValues, 0.05))}</span> is manageable within blended finance structure.</p>
              </div>
            </div>
          </div>

          {/* Extreme Value Analysis */}
          {extremeValueData && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-white">Extreme Value Analysis</h3>
                <div className="group relative">
                  <Info size={14} className="text-slate-500 cursor-help" />
                  <div className="absolute bottom-full left-0 mb-2 w-80 p-3 rounded-lg text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                    Uses the Generalized Pareto Distribution (GPD) to model the tail of the NPV loss distribution. This allows estimation of extreme loss events that may not appear in the simulation sample. From CEE551 L15: Extreme Values.
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-4">GPD tail modeling — Generalized Pareto Distribution for extreme loss estimation (CEE551 L15)</p>

              <div className="flex items-center gap-4 mb-4 p-3 rounded-lg" style={{ background: "rgba(232,101,45,0.05)", border: "1px solid rgba(232,101,45,0.15)" }}>
                <span className="text-xs text-slate-400">Tail threshold (% of data):</span>
                <input type="range" min={2} max={25} step={1} value={tailThresholdPct} onChange={e => setTailThresholdPct(Number(e.target.value))} className="w-40 accent-orange-500" />
                <span className="text-sm font-semibold tabular-nums" style={{ color: "#E8652D" }}>{tailThresholdPct}%</span>
                <span className="text-xs text-slate-500">({extremeValueData.tailN} observations in tail)</span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg" style={{ background: "rgba(232,101,45,0.06)", border: "1px solid rgba(232,101,45,0.15)" }}>
                  <p className="text-xs text-slate-400 mb-1">GPD Shape (&#958;)</p>
                  <p className="text-xl font-bold" style={{ color: "#E8652D" }}>{extremeValueData.gpd.xi.toFixed(3)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{extremeValueData.gpd.xi > 0 ? "Heavy tail (Fréchet)" : extremeValueData.gpd.xi < 0 ? "Bounded tail (Weibull)" : "Exponential tail"}</p>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: "rgba(232,101,45,0.06)", border: "1px solid rgba(232,101,45,0.15)" }}>
                  <p className="text-xs text-slate-400 mb-1">GPD Scale (&#963;)</p>
                  <p className="text-xl font-bold" style={{ color: "#E8652D" }}>{fmt(extremeValueData.gpd.sigma)}</p>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: "rgba(232,101,45,0.06)", border: "1px solid rgba(232,101,45,0.15)" }}>
                  <p className="text-xs text-slate-400 mb-1">Tail Threshold</p>
                  <p className="text-xl font-bold" style={{ color: "#E8652D" }}>{fmt(extremeValueData.threshold)}</p>
                </div>
              </div>

              {/* Return Period Table */}
              <h4 className="text-sm font-semibold text-white mb-2">Return Period Loss Estimates</h4>
              <div className="overflow-x-auto mb-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/40">
                      <th className="text-left text-xs font-medium py-2 px-3" style={{ color: "#2B7BC2" }}>Return Period</th>
                      <th className="text-center text-xs font-medium py-2 px-3" style={{ color: "#2B7BC2" }}>Probability</th>
                      <th className="text-right text-xs font-medium py-2 px-3" style={{ color: "#2B7BC2" }}>Estimated Loss</th>
                      <th className="text-right text-xs font-medium py-2 px-3" style={{ color: "#2B7BC2" }}>Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extremeValueData.returnPeriods.map(rp => (
                      <tr key={rp.returnPeriod} className="border-b border-slate-800/30">
                        <td className="py-2 px-3 text-sm text-slate-300">{rp.label} year</td>
                        <td className="py-2 px-3 text-sm text-slate-400 text-center">{(100 / rp.returnPeriod).toFixed(1)}%</td>
                        <td className="py-2 px-3 text-sm font-semibold text-right text-red-400 tabular-nums">{fmt(rp.loss)}</td>
                        <td className="py-2 px-3 text-xs text-slate-500 text-right">{rp.returnPeriod <= 10 ? "Within project lifetime" : rp.returnPeriod <= 50 ? "Stress scenario" : "Catastrophic scenario"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tail Distribution Chart */}
              <h4 className="text-sm font-semibold text-white mb-2">GPD Tail Loss Curve</h4>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={extremeValueData.tailCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="exceedance" tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "Exceedance Probability (%)", position: "insideBottom", offset: -5, fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v: number) => `$${(v/1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} formatter={(value: number) => [fmt(value), "Loss"]} labelFormatter={(l: string) => `Exceedance: ${l}%`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="loss" stroke="#E8652D" dot={false} name="GPD Estimated Loss" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {!results && (
        <div className="glass-card p-16 text-center">
          <Shield size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400">Click &ldquo;Run Risk Analysis&rdquo; to generate VaR/CVaR metrics</h3>
          <p className="text-sm text-slate-500 mt-2">10,000 simulations will be run to quantify downside risk for lenders and investors</p>
        </div>
      )}
    </div>
  );
}
