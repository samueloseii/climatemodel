import { useState, useMemo } from "react";
import { DollarSign, Leaf, Brain, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp, Zap, BarChart3, Target, ArrowRight } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { analyzeFinancing, generateProjectInsights, projectCarbonRevenue, type FinancingAnalysis, type AIInsight } from "../data/aiInsights";
import { useProject, ProjectSelector } from "../data/ProjectContext";
import { useNavigate } from "react-router-dom";

function fmt(v: number): string {
  if (Math.abs(v) >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  if (Math.abs(v) >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
  if (Math.abs(v) >= 1e3) return "$" + (v / 1e3).toFixed(0) + "K";
  return "$" + v.toFixed(0);
}

const insightIcons: Record<string, typeof CheckCircle> = { recommendation: CheckCircle, warning: AlertTriangle, opportunity: Zap, risk: XCircle };
const insightColors: Record<string, string> = { recommendation: "#10b981", warning: "#f59e0b", opportunity: "#6CB4D9", risk: "#ef4444" };

export default function Financing() {
  const navigate = useNavigate();
  const { selectedProject: project } = useProject();
  const [expandedOpt, setExpandedOpt] = useState<string | null>(null);
  const [carbonBasePrice, setCarbonBasePrice] = useState(30);
  const [carbonEscalation, setCarbonEscalation] = useState(5);

  const analysis: FinancingAnalysis | null = useMemo(() => {
    if (!project) return null;
    return analyzeFinancing(project.capex, project.annualRevenue, project.opexPerYear, project.capacity_MW, project.discountRate, project.projectLife, project.energyEscalation, project.carbonCreditsPerYear, project.riskScore, project.drillingSuccessProb);
  }, [project]);

  const insights: AIInsight[] = useMemo(() => {
    if (!project) return [];
    return generateProjectInsights(project.capex, project.annualRevenue, project.opexPerYear, project.capacity_MW, project.discountRate, project.projectLife, project.thermalGradient, project.reservoirTemp, project.drillingSuccessProb, project.riskScore, project.npv, project.irr, project.paybackYears);
  }, [project]);

  const carbonData = useMemo(() => {
    if (!project) return [];
    const annualCredits = project.capacity_MW * 0.85 * 8760 * 0.0005;
    return projectCarbonRevenue(carbonBasePrice, annualCredits, carbonEscalation, Math.min(project.projectLife, 30));
  }, [project, carbonBasePrice, carbonEscalation]);

  if (!project || !analysis) return <div className="text-slate-400 p-8">No projects found. Create a project first.</div>;

  const suitabilityData = analysis.options.map(o => ({ name: o.name.length > 18 ? o.name.slice(0, 18) + "\u2026" : o.name, suitability: o.suitability, fullName: o.name }));

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Financing &amp; <span className="gradient-text">ROI Analysis</span></h1>
          <p className="text-slate-400 mt-1">Dynamic financing optimization, carbon revenue projections, and AI-powered recommendations</p>
        </div>
        <ProjectSelector />
      </div>

      {/* Viability Banner */}
      <div className="rounded-xl p-5" style={{ background: analysis.isViable ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${analysis.isViable ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}` }}>
        <div className="flex items-center gap-3 mb-2">
          {analysis.isViable ? <CheckCircle size={22} className="text-emerald-400" /> : <XCircle size={22} className="text-red-400" />}
          <h2 className="text-lg font-bold text-white">{analysis.isViable ? "Project is Viable \u2014 Geothermal Investment Recommended" : "Project Does Not Meet Viability Threshold"}</h2>
          <span className="ml-auto text-xs px-3 py-1 rounded-full font-semibold" style={{ background: analysis.isViable ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: analysis.isViable ? "#34d399" : "#f87171" }}>
            {analysis.isViable ? "GO" : "CAUTION"}
          </span>
        </div>
        <p className="text-sm text-slate-300">{analysis.viabilityReason}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: "Project IRR", value: analysis.projectIRR.toFixed(1) + "%", sub: "vs " + project.discountRate + "% hurdle", color: analysis.projectIRR > project.discountRate ? "#10b981" : "#ef4444" },
          { label: "Equity IRR", value: analysis.equityIRR.toFixed(1) + "%", sub: "With " + analysis.recommended, color: "#2B7BC2" },
          { label: "LCOE", value: "$" + analysis.lcoe.toFixed(2) + "/MWh", sub: "Levelized cost", color: "#6CB4D9" },
          { label: "DSCR", value: analysis.dscr.toFixed(2) + "x", sub: analysis.dscr >= 1.3 ? "Healthy" : analysis.dscr >= 1.1 ? "Tight" : "Below min", color: analysis.dscr >= 1.3 ? "#10b981" : "#f59e0b" },
          { label: "ROI", value: analysis.roiPercent.toFixed(0) + "%", sub: "Total return on invested", color: "#E8652D" },
          { label: "Payback", value: analysis.paybackYears + " yr", sub: analysis.paybackYears <= 10 ? "Strong" : "Extended", color: analysis.paybackYears <= 10 ? "#10b981" : "#f59e0b" },
        ].map(m => (
          <div key={m.label} className="glass-card p-4">
            <p className="text-xs text-slate-500 mb-1">{m.label}</p>
            <p className="text-xl font-bold" style={{ color: m.color }}>{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={18} style={{ color: "#a855f7" }} />
          <h3 className="text-base font-semibold text-white">AI-Powered Insights</h3>
          <span className="badge-new">AI</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {insights.map(ins => {
            const Icon = insightIcons[ins.type] || AlertTriangle;
            const color = insightColors[ins.type] || "#94a3b8";
            return (
              <div key={ins.id} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: color + "15" }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-white">{ins.title}</h4>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: color + "15", color }}>{ins.confidence}%</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{ins.detail}</p>
                    <p className="text-xs mt-1.5" style={{ color }}>{ins.category} &middot; {ins.impact} impact</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financing Options Comparison */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} style={{ color: "#2B7BC2" }} />
          <h3 className="text-base font-semibold text-white">Financing Structure Comparison</h3>
          <span className="text-xs text-slate-500 ml-auto">Ranked by suitability for {project.name}</span>
        </div>

        <div className="mb-5">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={suitabilityData} layout="vertical" margin={{ left: 120, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} width={115} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569", borderRadius: 8 }} formatter={(v: number) => [v + "/100", "Suitability"]} />
              <Bar dataKey="suitability" radius={[0, 4, 4, 0]}>
                {suitabilityData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#10b981" : i <= 2 ? "#2B7BC2" : "#64748b"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          {analysis.options.map((opt, i) => (
            <div key={opt.name} className="bg-slate-800/40 rounded-xl border border-slate-700/30 overflow-hidden">
              <button className="w-full flex items-center justify-between p-4 text-left" onClick={() => setExpandedOpt(expandedOpt === opt.name ? null : opt.name)}>
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: i === 0 ? "rgba(16,185,129,0.15)" : "rgba(51,65,85,0.5)", color: i === 0 ? "#34d399" : "#94a3b8" }}>
                    {i + 1}
                  </span>
                  <div>
                    <span className="text-sm font-medium text-white">{opt.name}</span>
                    {i === 0 && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">Recommended</span>}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Rate</p>
                    <p className="text-sm font-semibold text-white">{opt.interestRate > 0 ? opt.interestRate + "%" : "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Leverage</p>
                    <p className="text-sm font-semibold text-white">{(opt.debtRatio * 100).toFixed(0)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Tenor</p>
                    <p className="text-sm font-semibold text-white">{opt.tenorYears > 0 ? opt.tenorYears + " yr" : "N/A"}</p>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <p className="text-xs text-slate-500">Score</p>
                    <p className="text-sm font-bold" style={{ color: opt.suitability >= 70 ? "#10b981" : opt.suitability >= 50 ? "#f59e0b" : "#ef4444" }}>{opt.suitability}/100</p>
                  </div>
                  {expandedOpt === opt.name ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                </div>
              </button>
              {expandedOpt === opt.name && (
                <div className="px-4 pb-4 border-t border-slate-700/30 pt-3">
                  <p className="text-xs text-slate-400 mb-3">{opt.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-emerald-400 mb-1.5">Advantages</p>
                      {opt.pros.map((p, j) => <p key={j} className="text-xs text-slate-400 mb-1"><span className="text-emerald-400 mr-1">+</span>{p}</p>)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-red-400 mb-1.5">Considerations</p>
                      {opt.cons.map((c, j) => <p key={j} className="text-xs text-slate-400 mb-1"><span className="text-red-400 mr-1">-</span>{c}</p>)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Carbon Revenue Projections */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Leaf size={18} className="text-emerald-400" />
            <h3 className="text-base font-semibold text-white">Carbon Revenue Projections</h3>
            <span className="badge-new">Dynamic</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Base Carbon Price ($/tCO2)</label>
            <div className="flex items-center gap-3">
              <input type="range" className="range-slider flex-1" min={5} max={150} step={1} value={carbonBasePrice} onChange={e => setCarbonBasePrice(Number(e.target.value))} />
              <span className="text-sm font-bold text-white w-16 text-right">${carbonBasePrice}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Annual Price Escalation (%)</label>
            <div className="flex items-center gap-3">
              <input type="range" className="range-slider flex-1" min={0} max={15} step={0.5} value={carbonEscalation} onChange={e => setCarbonEscalation(Number(e.target.value))} />
              <span className="text-sm font-bold text-white w-16 text-right">{carbonEscalation}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Year 1 Revenue</p>
            <p className="text-lg font-bold text-emerald-400">{carbonData[0] ? fmt(carbonData[0].revenue) : "$0"}</p>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Year 10 Revenue</p>
            <p className="text-lg font-bold text-emerald-400">{carbonData[9] ? fmt(carbonData[9].revenue) : "$0"}</p>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Year 10 Price</p>
            <p className="text-lg font-bold text-white">{carbonData[9] ? "$" + carbonData[9].price.toFixed(2) : "$0"}/t</p>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Cumulative ({project.projectLife}yr)</p>
            <p className="text-lg font-bold" style={{ color: "#2B7BC2" }}>{carbonData.length > 0 ? fmt(carbonData[carbonData.length - 1].cumulative) : "$0"}</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={carbonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#94a3b8" }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={v => fmt(v)} />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569", borderRadius: 8 }} formatter={(v: number) => [fmt(v), ""]} />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Annual Revenue" dot={false} />
            <Line type="monotone" dataKey="cumulative" stroke="#2B7BC2" strokeWidth={2} name="Cumulative" dot={false} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Project Financial Summary */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} style={{ color: "#E8652D" }} />
          <h3 className="text-base font-semibold text-white">Project Financial Summary - {project.name}</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
            <p className="text-xs text-slate-500 mb-2">Capital Structure</p>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-xs text-slate-400">Total CapEx</span><span className="text-sm font-bold text-white">{fmt(project.capex)}</span></div>
              <div className="flex justify-between"><span className="text-xs text-slate-400">Annual Revenue</span><span className="text-sm font-bold text-emerald-400">{fmt(project.annualRevenue)}</span></div>
              <div className="flex justify-between"><span className="text-xs text-slate-400">Annual OpEx</span><span className="text-sm font-bold text-red-400">{fmt(project.opexPerYear)}</span></div>
              <div className="flex justify-between"><span className="text-xs text-slate-400">Net Operating Income</span><span className="text-sm font-bold text-white">{fmt(project.annualRevenue - project.opexPerYear)}</span></div>
            </div>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
            <p className="text-xs text-slate-500 mb-2">Risk &amp; Return</p>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-xs text-slate-400">NPV</span><span className="text-sm font-bold" style={{ color: project.npv >= 0 ? "#10b981" : "#ef4444" }}>{fmt(project.npv)}</span></div>
              <div className="flex justify-between"><span className="text-xs text-slate-400">Project IRR</span><span className="text-sm font-bold text-white">{project.irr.toFixed(1)}%</span></div>
              <div className="flex justify-between"><span className="text-xs text-slate-400">Risk Score</span><span className="text-sm font-bold text-white">{project.riskScore}/100</span></div>
              <div className="flex justify-between"><span className="text-xs text-slate-400">Drilling Success</span><span className="text-sm font-bold text-white">{(project.drillingSuccessProb * 100).toFixed(0)}%</span></div>
            </div>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
            <p className="text-xs text-slate-500 mb-2">Recommended Structure</p>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-xs text-slate-400">Best Fit</span><span className="text-sm font-bold" style={{ color: "#2B7BC2" }}>{analysis.recommended}</span></div>
              <div className="flex justify-between"><span className="text-xs text-slate-400">Equity IRR</span><span className="text-sm font-bold text-emerald-400">{analysis.equityIRR.toFixed(1)}%</span></div>
              <div className="flex justify-between"><span className="text-xs text-slate-400">DSCR</span><span className="text-sm font-bold text-white">{analysis.dscr.toFixed(2)}x</span></div>
              <div className="flex justify-between"><span className="text-xs text-slate-400">LCOE</span><span className="text-sm font-bold text-white">${analysis.lcoe.toFixed(2)}/MWh</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Incentives */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={18} style={{ color: "#6CB4D9" }} />
          <h3 className="text-base font-semibold text-white">Federal &amp; State Tax Incentives</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
            <p className="text-sm font-semibold mb-1" style={{ color: "#E8652D" }}>Federal ITC (IRA)</p>
            <p className="text-3xl font-bold text-white">30%</p>
            <p className="text-xs text-slate-400 mt-1">= {fmt(project.capex * 0.30)} tax credit</p>
            <p className="text-xs text-emerald-400 mt-2">Reduces effective CapEx to {fmt(project.capex * 0.70)}</p>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
            <p className="text-sm font-semibold mb-1" style={{ color: "#E8652D" }}>MACRS Depreciation</p>
            <p className="text-3xl font-bold text-white">5-Year</p>
            <p className="text-xs text-slate-400 mt-1">Accelerated depreciation schedule</p>
            <p className="text-xs text-emerald-400 mt-2">PV of tax shield: ~{fmt(project.capex * 0.22)}</p>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
            <p className="text-sm font-semibold mb-1" style={{ color: "#E8652D" }}>Combined Benefit</p>
            <p className="text-3xl font-bold text-white">{fmt(project.capex * 0.30 + project.capex * 0.22)}</p>
            <p className="text-xs text-slate-400 mt-1">ITC + MACRS tax shield</p>
            <p className="text-xs text-emerald-400 mt-2">52% effective CapEx reduction</p>
          </div>
        </div>
      </div>

      {/* Workflow Navigation */}
      <div className="flex items-center justify-between glass-card p-4">
        <button onClick={() => navigate("/risk-analysis")} className="btn-secondary text-xs">Back: Risk Analysis</button>
        <button onClick={() => navigate("/reports")} className="btn-primary flex items-center gap-1.5 text-xs">Next: Generate Report <ArrowRight size={14} /></button>
      </div>
    </div>
  );
}
