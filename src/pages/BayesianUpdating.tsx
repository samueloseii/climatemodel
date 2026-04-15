import { useState, useMemo } from "react";
import { RotateCcw, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, Line, AreaChart, Area } from "recharts";

// Beta distribution helper functions
function lnGamma(z: number): number {
  // Lanczos approximation
  const g = 7;
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
  }
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) {
    x += c[i] / (z + i);
  }
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function betaPDF(x: number, a: number, b: number): number {
  if (x <= 0 || x >= 1) return 0;
  const lnB = lnGamma(a) + lnGamma(b) - lnGamma(a + b);
  return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - lnB);
}

function betaMean(a: number, b: number): number {
  return a / (a + b);
}

function betaVar(a: number, b: number): number {
  return (a * b) / ((a + b) ** 2 * (a + b + 1));
}

function betaMode(a: number, b: number): number {
  if (a > 1 && b > 1) return (a - 1) / (a + b - 2);
  if (a <= 1 && b > 1) return 0;
  if (a > 1 && b <= 1) return 1;
  return 0.5;
}

// Beta-Binomial predictive PMF
function betaBinomialPMF(k: number, n: number, a: number, b: number): number {
  // P(X=k | n, a, b) = C(n,k) * B(k+a, n-k+b) / B(a, b)
  const lnCnk = lnGamma(n + 1) - lnGamma(k + 1) - lnGamma(n - k + 1);
  const lnBnum = lnGamma(k + a) + lnGamma(n - k + b) - lnGamma(n + a + b);
  const lnBden = lnGamma(a) + lnGamma(b) - lnGamma(a + b);
  return Math.exp(lnCnk + lnBnum - lnBden);
}

interface WellData {
  label: string;
  tested: number;
  successful: number;
}

export default function BayesianUpdating() {
  // Prior: Beta(alpha, beta) for probability of drilling success
  const [priorAlpha, setPriorAlpha] = useState(3);
  const [priorBeta, setPriorBeta] = useState(2);

  // Observed well data
  const [wellData, setWellData] = useState<WellData[]>([
    { label: "Phase 1 Wells", tested: 5, successful: 4 },
    { label: "Phase 2 Wells", tested: 8, successful: 5 },
  ]);

  const [predictN, setPredictN] = useState(10);

  // Compute posterior: Beta(alpha + sum(successes), beta + sum(failures))
  const totalSuccesses = wellData.reduce((s, w) => s + w.successful, 0);
  const totalTrials = wellData.reduce((s, w) => s + w.tested, 0);
  const totalFailures = totalTrials - totalSuccesses;

  const postAlpha = priorAlpha + totalSuccesses;
  const postBeta = priorBeta + totalFailures;

  // Generate PDF data for prior and posterior
  const pdfData = useMemo(() => {
    const points: { x: number; prior: number; posterior: number; likelihood: number }[] = [];
    for (let i = 0; i <= 100; i++) {
      const x = i / 100;
      const prior = betaPDF(x, priorAlpha, priorBeta);
      const posterior = betaPDF(x, postAlpha, postBeta);
      // Binomial likelihood (scaled)
      let lik = Math.pow(x, totalSuccesses) * Math.pow(1 - x, totalFailures);
      // Scale likelihood to be visible
      const likMax = Math.pow(totalSuccesses / totalTrials || 0.5, totalSuccesses) * Math.pow(1 - (totalSuccesses / totalTrials || 0.5), totalFailures);
      if (likMax > 0) lik = lik / likMax * Math.max(betaPDF(betaMode(postAlpha, postBeta), postAlpha, postBeta), betaPDF(betaMode(priorAlpha, priorBeta), priorAlpha, priorBeta)) * 0.6;
      points.push({
        x: x * 100,
        prior: Math.round(prior * 1000) / 1000,
        posterior: Math.round(posterior * 1000) / 1000,
        likelihood: Math.round(lik * 1000) / 1000,
      });
    }
    return points;
  }, [priorAlpha, priorBeta, postAlpha, postBeta, totalSuccesses, totalFailures, totalTrials]);

  // Predictive distribution: Beta-Binomial
  const predictiveData = useMemo(() => {
    const data: { k: number; probability: number; label: string }[] = [];
    for (let k = 0; k <= predictN; k++) {
      const p = betaBinomialPMF(k, predictN, postAlpha, postBeta);
      data.push({
        k,
        probability: Math.round(p * 10000) / 10000,
        label: `${k}/${predictN}`,
      });
    }
    return data;
  }, [predictN, postAlpha, postBeta]);

  // Sequential update visualization
  const sequentialData = useMemo(() => {
    const data: { step: string; mean: number; lower: number; upper: number }[] = [];
    let a = priorAlpha, b = priorBeta;
    data.push({
      step: "Prior",
      mean: betaMean(a, b) * 100,
      lower: Math.max(0, (betaMean(a, b) - 2 * Math.sqrt(betaVar(a, b))) * 100),
      upper: Math.min(100, (betaMean(a, b) + 2 * Math.sqrt(betaVar(a, b))) * 100),
    });
    wellData.forEach(w => {
      a += w.successful;
      b += (w.tested - w.successful);
      data.push({
        step: w.label,
        mean: betaMean(a, b) * 100,
        lower: Math.max(0, (betaMean(a, b) - 2 * Math.sqrt(betaVar(a, b))) * 100),
        upper: Math.min(100, (betaMean(a, b) + 2 * Math.sqrt(betaVar(a, b))) * 100),
      });
    });
    return data;
  }, [priorAlpha, priorBeta, wellData]);

  const addWellData = () => {
    setWellData(prev => [...prev, { label: `Phase ${prev.length + 1} Wells`, tested: 5, successful: 3 }]);
  };

  const removeWellData = (idx: number) => {
    if (wellData.length <= 1) return;
    setWellData(prev => prev.filter((_, i) => i !== idx));
  };

  const updateWellData = (idx: number, field: keyof WellData, value: string | number) => {
    setWellData(prev => prev.map((w, i) => {
      if (i !== idx) return w;
      const updated = { ...w, [field]: value };
      if (field === "tested" && typeof value === "number") {
        updated.successful = Math.min(updated.successful, value);
      }
      return updated;
    }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bayesian <span className="gradient-text">Updating</span></h1>
          <p className="text-sm text-slate-400 mt-0.5">Update drilling success beliefs with field data &mdash; Beta-Binomial conjugate model</p>
        </div>
        <button onClick={() => { setPriorAlpha(3); setPriorBeta(2); setWellData([{ label: "Phase 1 Wells", tested: 5, successful: 4 }, { label: "Phase 2 Wells", tested: 8, successful: 5 }]); }} className="btn-secondary flex items-center gap-1.5">
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: "Prior Mean", value: `${(betaMean(priorAlpha, priorBeta) * 100).toFixed(1)}%`, hexColor: "#6CB4D9" },
          { label: "Posterior Mean", value: `${(betaMean(postAlpha, postBeta) * 100).toFixed(1)}%`, hexColor: "#2B7BC2" },
          { label: "Posterior Mode", value: `${(betaMode(postAlpha, postBeta) * 100).toFixed(1)}%`, hexColor: "#10b981" },
          { label: "95% CI Width", value: `${(2 * 2 * Math.sqrt(betaVar(postAlpha, postBeta)) * 100).toFixed(1)}%`, hexColor: "#E8652D" },
          { label: "Equiv. Sample Size", value: `${postAlpha + postBeta - 2}`, hexColor: "#6CB4D9" },
          { label: "Data / Prior Ratio", value: `${(totalTrials / (priorAlpha + priorBeta)).toFixed(1)}x`, hexColor: totalTrials >= priorAlpha + priorBeta ? "#10b981" : "#E8652D" },
        ].map(m => (
          <div key={m.label} className="glass-card p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">{m.label}</p>
            <p className="text-lg font-bold tabular-nums" style={{ color: m.hexColor }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Prior Parameters + Well Data */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Prior Distribution <span className="text-slate-500 font-normal">&mdash; Beta(&alpha;, &beta;)</span></h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Alpha (&alpha;) &mdash; pseudo-successes</label>
              <input type="number" min={0.1} step={0.5} value={priorAlpha} onChange={e => setPriorAlpha(Math.max(0.1, Number(e.target.value)))} className="input-dark w-full text-sm py-2" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Beta (&beta;) &mdash; pseudo-failures</label>
              <input type="number" min={0.1} step={0.5} value={priorBeta} onChange={e => setPriorBeta(Math.max(0.1, Number(e.target.value)))} className="input-dark w-full text-sm py-2" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Prior strength = {priorAlpha + priorBeta} equivalent observations.
            Interpret as {priorAlpha} successes and {priorBeta} failures before any real data.
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Observed Well Data</h3>
            <button onClick={addWellData} className="btn-primary flex items-center gap-1 text-xs py-1.5 px-3">+ Add Phase</button>
          </div>
          <div className="space-y-2">
            {wellData.map((w, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(51,65,85,0.3)" }}>
                <input value={w.label} onChange={e => updateWellData(i, "label", e.target.value)} className="input-dark text-xs py-1.5 flex-1" />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500">Tested:</span>
                  <input type="number" min={1} value={w.tested} onChange={e => updateWellData(i, "tested", Number(e.target.value))} className="input-dark w-14 text-xs text-center py-1.5" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500">Success:</span>
                  <input type="number" min={0} max={w.tested} value={w.successful} onChange={e => updateWellData(i, "successful", Math.min(Number(e.target.value), w.tested))} className="input-dark w-14 text-xs text-center py-1.5" />
                </div>
                {wellData.length > 1 && (
                  <button onClick={() => removeWellData(i)} className="text-slate-600 hover:text-red-400 text-xs">&#10005;</button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Total: {totalSuccesses}/{totalTrials} successful ({totalTrials > 0 ? ((totalSuccesses / totalTrials) * 100).toFixed(0) : 0}%)
          </p>
        </div>
      </div>

      {/* Prior vs Posterior Distribution */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Prior vs Posterior Distribution</h3>
        <p className="text-xs text-slate-500 mb-4">
          Beta({priorAlpha}, {priorBeta}) &rarr; Beta({postAlpha}, {postBeta}) after observing {totalSuccesses}/{totalTrials}
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={pdfData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="x" tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "Drilling Success Probability (%)", position: "insideBottom", offset: -5, fontSize: 11, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "Density", angle: -90, position: "insideLeft", fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} formatter={(v: number, name: string) => [v.toFixed(3), name]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="prior" name="Prior" stroke="#6CB4D9" fill="#6CB4D9" fillOpacity={0.15} strokeWidth={2} />
            <Area type="monotone" dataKey="likelihood" name="Likelihood (scaled)" stroke="#E8652D" fill="#E8652D" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 4" />
            <Area type="monotone" dataKey="posterior" name="Posterior" stroke="#2B7BC2" fill="#2B7BC2" fillOpacity={0.2} strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sequential Updating */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Sequential Belief Update</h3>
        <p className="text-xs text-slate-500 mb-4">How the estimated drilling success probability evolves with each data phase (mean &plusmn; 2&sigma;)</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={sequentialData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="step" tick={{ fontSize: 10, fill: "#64748b" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `${v}%`} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v.toFixed(1)}%`, ""]} />
            <Area type="monotone" dataKey="upper" stroke="none" fill="#2B7BC2" fillOpacity={0.1} />
            <Area type="monotone" dataKey="lower" stroke="none" fill="#0a0e1a" fillOpacity={1} />
            <Line type="monotone" dataKey="mean" stroke="#2B7BC2" strokeWidth={2.5} dot={{ fill: "#2B7BC2", r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Predictive Distribution */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Predictive Distribution (Beta-Binomial)</h3>
            <p className="text-xs text-slate-500">Probability of k successes in next n wells, accounting for parameter uncertainty</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Next wells (n):</span>
            <input type="number" min={1} max={50} value={predictN} onChange={e => setPredictN(Math.max(1, Number(e.target.value)))} className="input-dark w-16 text-xs text-center py-1.5" />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={predictiveData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "Successful Wells", position: "insideBottom", offset: -5, fontSize: 11, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${(v * 100).toFixed(2)}%`, "Probability"]} />
            <Bar dataKey="probability" radius={[3, 3, 0, 0]}>
              {predictiveData.map((entry, i) => (
                <Cell key={i} fill={entry.probability > 0.1 ? "#2B7BC2" : entry.probability > 0.05 ? "#6CB4D9" : "#334155"} opacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Educational Note */}
      <div className="glass-card p-5" style={{ borderColor: "rgba(43,123,194,0.15)" }}>
        <div className="flex items-start gap-3">
          <Info size={18} style={{ color: "#2B7BC2" }} className="shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Why Bayesian Updating Matters for Geothermal</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Geothermal drilling success is uncertain. The <strong className="text-white">Beta-Binomial model</strong> is a natural conjugate pair: the Beta prior represents initial beliefs about success probability,
              and each well drilled updates these beliefs via Bayes' rule.
              The <strong style={{ color: "#E8652D" }}>predictive distribution</strong> accounts for <em>both</em> aleatory uncertainty (random well outcomes)
              and <em>epistemic uncertainty</em> (unknown true success rate).
              Using just the point estimate of success rate <strong className="text-white">underestimates variance</strong> and tail risk &mdash;
              the predictive distribution gives wider, more honest prediction intervals that are critical for financing decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
