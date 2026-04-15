import { useState, useMemo } from "react";
import { Eye, Info, RotateCcw, Plus, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface State {
  name: string;
  priorProb: number;
  outcomes: number[]; // payoff for each action
}

interface Action {
  name: string;
}

const defaultActions: Action[] = [
  { name: "Drill Full Well" },
  { name: "Slim Hole Test First" },
  { name: "Abandon Site" },
];

const defaultStates: State[] = [
  { name: "High Resource (>200°C)", priorProb: 0.25, outcomes: [2800000, 2200000, 0] },
  { name: "Moderate Resource (150-200°C)", priorProb: 0.40, outcomes: [650000, 480000, 0] },
  { name: "Low Resource (100-150°C)", priorProb: 0.25, outcomes: [-320000, -80000, 0] },
  { name: "Non-Viable (<100°C)", priorProb: 0.10, outcomes: [-850000, -180000, 0] },
];

// Survey signal model: P(signal | state)
interface SignalModel {
  signalName: string;
  likelihoods: number[]; // P(signal | state_i) for each state
}

const defaultSignals: SignalModel[] = [
  { signalName: "Positive Signal", likelihoods: [0.85, 0.55, 0.20, 0.05] },
  { signalName: "Negative Signal", likelihoods: [0.15, 0.45, 0.80, 0.95] },
];

export default function VOIAnalysis() {
  const [actions, setActions] = useState<Action[]>(defaultActions);
  const [states, setStates] = useState<State[]>(defaultStates);
  const [signals, setSignals] = useState<SignalModel[]>(defaultSignals);
  const [surveyCost, setSurveyCost] = useState(120000);

  // Prior expected payoff for each action: E[payoff_a] = sum_s P(s) * payoff(a,s)
  const priorExpected = useMemo(() => {
    return actions.map((_, ai) =>
      states.reduce((sum, s) => sum + s.priorProb * s.outcomes[ai], 0)
    );
  }, [actions, states]);

  // Best prior action (no information)
  const bestPriorIdx = useMemo(() => {
    let best = 0;
    for (let i = 1; i < priorExpected.length; i++) {
      if (priorExpected[i] > priorExpected[best]) best = i;
    }
    return best;
  }, [priorExpected]);

  const bestPriorEV = priorExpected[bestPriorIdx];

  // EVPI: Expected Value of Perfect Information
  // With perfect info, for each state we pick the best action
  const evpiComponents = useMemo(() => {
    return states.map(s => {
      const bestPayoff = Math.max(...s.outcomes);
      return s.priorProb * bestPayoff;
    });
  }, [states]);

  const evWithPerfectInfo = useMemo(() => evpiComponents.reduce((a, b) => a + b, 0), [evpiComponents]);
  const evpi = evWithPerfectInfo - bestPriorEV;

  // EVSI: Expected Value of Sample Information
  // For each signal z: P(z) = sum_s P(z|s)*P(s), then posterior P(s|z) = P(z|s)*P(s)/P(z)
  const evsiCalc = useMemo(() => {
    const signalResults = signals.map(sig => {
      // P(z)
      const pSignal = states.reduce((sum, s, si) => sum + sig.likelihoods[si] * s.priorProb, 0);
      // Posterior for each state
      const posteriors = states.map((s, si) => (sig.likelihoods[si] * s.priorProb) / pSignal);
      // For each action, expected payoff under posterior
      const actionEVs = actions.map((_, ai) =>
        states.reduce((sum, s, si) => sum + posteriors[si] * s.outcomes[ai], 0)
      );
      const bestActionEV = Math.max(...actionEVs);
      const bestActionIdx = actionEVs.indexOf(bestActionEV);
      return {
        signalName: sig.signalName,
        pSignal,
        posteriors,
        actionEVs,
        bestActionIdx,
        bestActionEV,
      };
    });

    const evWithSample = signalResults.reduce((sum, sr) => sum + sr.pSignal * sr.bestActionEV, 0);
    const evsi = evWithSample - bestPriorEV;
    const engs = evsi - surveyCost; // Expected Net Gain from Sampling

    return { signalResults, evWithSample, evsi, engs };
  }, [signals, states, actions, bestPriorEV, surveyCost]);

  // Chart data for prior vs posterior comparison
  const comparisonData = useMemo(() => {
    return actions.map((a, ai) => ({
      name: a.name,
      Prior: Math.round(priorExpected[ai]),
      ...Object.fromEntries(evsiCalc.signalResults.map(sr => [
        `After ${sr.signalName}`, Math.round(sr.actionEVs[ai])
      ])),
    }));
  }, [actions, priorExpected, evsiCalc]);

  const fmt = (v: number) => v >= 0 ? `$${(v / 1000).toFixed(0)}K` : `-$${(Math.abs(v) / 1000).toFixed(0)}K`;

  const totalProb = states.reduce((s, st) => s + st.priorProb, 0);

  const updateState = (si: number, field: string, value: number | string) => {
    setStates(prev => prev.map((s, i) => i === si ? { ...s, [field]: value } : s));
  };

  const updateOutcome = (si: number, ai: number, value: number) => {
    setStates(prev => prev.map((s, i) => i === si ? { ...s, outcomes: s.outcomes.map((o, j) => j === ai ? value : o) } : s));
  };

  const updateSignal = (sigIdx: number, stateIdx: number, value: number) => {
    setSignals(prev => prev.map((sig, i) => i === sigIdx ? {
      ...sig,
      likelihoods: sig.likelihoods.map((l, j) => j === stateIdx ? value : l)
    } : sig));
  };

  const addState = () => {
    setStates(prev => [...prev, {
      name: `State ${prev.length + 1}`,
      priorProb: 0,
      outcomes: actions.map(() => 0),
    }]);
    setSignals(prev => prev.map(sig => ({ ...sig, likelihoods: [...sig.likelihoods, 0.5] })));
  };

  const removeState = (idx: number) => {
    if (states.length <= 2) return;
    setStates(prev => prev.filter((_, i) => i !== idx));
    setSignals(prev => prev.map(sig => ({ ...sig, likelihoods: sig.likelihoods.filter((_, i) => i !== idx) })));
  };

  const reset = () => {
    setActions(defaultActions);
    setStates(defaultStates);
    setSignals(defaultSignals);
    setSurveyCost(120000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Value of <span className="gradient-text">Information</span></h1>
          <p className="text-sm text-slate-400 mt-0.5">EVPI & EVSI analysis &mdash; quantify the value of exploration data before spending</p>
        </div>
        <button onClick={reset} className="btn-secondary flex items-center gap-1.5">
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Best Prior EV", value: fmt(bestPriorEV), desc: actions[bestPriorIdx]?.name, hexColor: "#2B7BC2" },
          { label: "EV with Perfect Info", value: fmt(evWithPerfectInfo), desc: "Knowing true state", hexColor: "#10b981" },
          { label: "EVPI", value: fmt(evpi), desc: "Max value of any survey", hexColor: "#E8652D" },
          { label: "EVSI", value: fmt(evsiCalc.evsi), desc: "Value of proposed survey", hexColor: "#6CB4D9" },
          { label: "Net Gain (ENGS)", value: fmt(evsiCalc.engs), desc: `Survey cost: ${fmt(surveyCost)}`, hexColor: evsiCalc.engs > 0 ? "#10b981" : "#ef4444" },
        ].map(m => (
          <div key={m.label} className="glass-card p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{m.label}</p>
            <p className="text-xl font-bold tabular-nums" style={{ color: m.hexColor }}>{m.value}</p>
            <p className="text-xs text-slate-500 mt-1">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Decision Recommendation */}
      <div className="glass-card p-5" style={{ borderColor: evsiCalc.engs > 0 ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)" }}>
        <div className="flex items-start gap-3">
          <Eye size={18} style={{ color: evsiCalc.engs > 0 ? "#10b981" : "#E8652D" }} className="shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">
              {evsiCalc.engs > 0 ? "Recommendation: Conduct Survey" : "Recommendation: Skip Survey"}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {evsiCalc.engs > 0
                ? `The survey provides ${fmt(evsiCalc.evsi)} in expected information value, exceeding its ${fmt(surveyCost)} cost by ${fmt(evsiCalc.engs)}. The maximum any information could be worth (EVPI) is ${fmt(evpi)}, so this survey captures ${evpi > 0 ? ((evsiCalc.evsi / evpi) * 100).toFixed(0) : 0}% of maximum possible value.`
                : `The survey costs ${fmt(surveyCost)} but only provides ${fmt(evsiCalc.evsi)} in information value. Net loss of ${fmt(Math.abs(evsiCalc.engs))}. Consider a cheaper survey method or proceed with ${actions[bestPriorIdx]?.name}.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Payoff Matrix */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Payoff Matrix <span className="text-slate-500 font-normal">&mdash; edit states, probabilities, and payoffs</span></h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Survey Cost:</span>
              <input type="range" min={10000} max={500000} step={10000} value={surveyCost} onChange={e => setSurveyCost(Number(e.target.value))} className="range-slider w-32" />
              <input type="number" step={10000} value={surveyCost} onChange={e => setSurveyCost(Number(e.target.value))} className="input-dark w-28 text-xs text-center py-1.5 font-mono" />
            </div>
            <button onClick={addState} className="btn-primary flex items-center gap-1 text-xs py-1.5 px-3">
              <Plus size={11} /> Add State
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/40">
                <th className="text-left py-2 px-2 font-medium" style={{ color: "#2B7BC2" }}>State of Nature</th>
                <th className="text-center py-2 px-2 font-medium text-slate-400">Prior P</th>
                {actions.map((a, ai) => (
                  <th key={ai} className="text-center py-2 px-2 font-medium text-slate-400">{a.name}</th>
                ))}
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {states.map((s, si) => (
                <tr key={si} className="border-b border-slate-800/30">
                  <td className="py-1.5 px-2">
                    <input value={s.name} onChange={e => updateState(si, "name", e.target.value)} className="input-dark text-xs py-1.5 w-44" />
                  </td>
                  <td className="py-1.5 px-2">
                    <input type="number" step={0.05} min={0} max={1} value={s.priorProb} onChange={e => updateState(si, "priorProb", Number(e.target.value))} className="input-dark text-xs text-center py-1.5 w-16 mx-auto block" />
                  </td>
                  {actions.map((_, ai) => (
                    <td key={ai} className="py-1.5 px-2">
                      <input type="number" step={50000} value={s.outcomes[ai]} onChange={e => updateOutcome(si, ai, Number(e.target.value))} className={`input-dark text-xs text-center py-1.5 w-28 mx-auto block font-mono ${s.outcomes[ai] >= 0 ? "text-emerald-400" : "text-red-400"}`} />
                    </td>
                  ))}
                  <td className="py-1.5 px-1">
                    {states.length > 2 && <button onClick={() => removeState(si)} className="text-slate-600 hover:text-red-400"><Trash2 size={12} /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Total prior: <span className={Math.abs(totalProb - 1) < 0.001 ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>{totalProb.toFixed(2)}</span>
          {Math.abs(totalProb - 1) >= 0.001 && <span className="text-red-400 ml-1">(must equal 1.00)</span>}
        </p>
      </div>

      {/* Signal Model (Likelihoods) */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Survey Signal Model <span className="text-slate-500 font-normal">&mdash; P(signal | state) likelihoods</span></h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/40">
                <th className="text-left py-2 px-2 font-medium" style={{ color: "#E8652D" }}>Signal</th>
                {states.map((s, si) => (
                  <th key={si} className="text-center py-2 px-2 font-medium text-slate-400">{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {signals.map((sig, sigIdx) => (
                <tr key={sigIdx} className="border-b border-slate-800/30">
                  <td className="py-1.5 px-2 text-slate-300 font-medium">{sig.signalName}</td>
                  {states.map((_, si) => (
                    <td key={si} className="py-1.5 px-2">
                      <input type="number" step={0.05} min={0} max={1} value={sig.likelihoods[si]} onChange={e => updateSignal(sigIdx, si, Number(e.target.value))} className="input-dark text-xs text-center py-1.5 w-16 mx-auto block" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bayesian Posterior Results */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Bayesian Posterior Analysis</h3>
        <div className="grid grid-cols-2 gap-4">
          {evsiCalc.signalResults.map((sr, idx) => (
            <div key={idx} className="rounded-xl p-4" style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(51,65,85,0.3)" }}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold" style={{ color: idx === 0 ? "#10b981" : "#E8652D" }}>
                  {sr.signalName}
                </h4>
                <span className="text-xs text-slate-400">P(signal) = {(sr.pSignal * 100).toFixed(1)}%</span>
              </div>
              <div className="space-y-1.5">
                {states.map((s, si) => (
                  <div key={si} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{s.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">Prior: {(s.priorProb * 100).toFixed(0)}%</span>
                      <span className="text-slate-500">&rarr;</span>
                      <span className="font-medium" style={{ color: sr.posteriors[si] > s.priorProb ? "#10b981" : "#E8652D" }}>
                        Post: {(sr.posteriors[si] * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700/30 flex items-center justify-between">
                <span className="text-xs text-slate-400">Best action:</span>
                <span className="text-xs font-semibold text-white">{actions[sr.bestActionIdx]?.name} ({fmt(sr.bestActionEV)})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Expected Payoff Comparison: Prior vs Post-Survey</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`$${(v / 1000).toFixed(0)}K`, ""]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Prior" fill="#2B7BC2" radius={[4, 4, 0, 0]} />
            {evsiCalc.signalResults.map((sr, idx) => (
              <Bar key={idx} dataKey={`After ${sr.signalName}`} fill={idx === 0 ? "#10b981" : "#E8652D"} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Educational Note */}
      <div className="glass-card p-5" style={{ borderColor: "rgba(43,123,194,0.15)" }}>
        <div className="flex items-start gap-3">
          <Info size={18} style={{ color: "#2B7BC2" }} className="shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Understanding VOI for Geothermal</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong style={{ color: "#E8652D" }}>EVPI</strong> is the maximum you should ever pay for any information &mdash; it assumes you could learn the true resource state perfectly.
              <strong style={{ color: "#6CB4D9" }}> EVSI</strong> measures the practical value of a specific survey (e.g., slim-hole drilling, geophysical survey) given its imperfect signal quality.
              <strong style={{ color: "#10b981" }}> ENGS</strong> (Expected Net Gain from Sampling) subtracts the survey cost; if positive, the survey is worthwhile.
              This framework uses <strong className="text-white">Bayes' Rule</strong> to update prior beliefs about subsurface conditions based on survey signals, then re-optimizes decisions under the posterior.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
