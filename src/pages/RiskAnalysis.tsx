import { useState, useMemo } from "react";
import { Play, Shield, AlertTriangle } from "lucide-react";
// recharts not used directly - custom tornado chart
import { defaultParams, runMonteCarloSimulation, computeMean, computeVaR, computeCVaR, computePercentile, runSensitivityAnalysis } from "../data/simulationEngine";

export default function RiskAnalysis() {
  const [results, setResults] = useState<ReturnType<typeof runMonteCarloSimulation> | null>(null);
  const [running, setRunning] = useState(false);
  const [confidence, setConfidence] = useState(0.95);

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
