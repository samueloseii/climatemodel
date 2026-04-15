import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { Activity, Shield, Brain, TrendingUp, ArrowUpRight, DollarSign, BarChart3, Eye, FileDown, Layers, Zap, Globe, Award, Target, ArrowRight, CheckCircle, MapPin, AlertTriangle } from "lucide-react";
import { useProject, ProjectSelector } from "../data/ProjectContext";
import { analyzeFinancing, generateProjectInsights } from "../data/aiInsights";
import RiskHeatmap from "../components/RiskHeatmap";

function RiskGauge({ score, label }: { score: number; label: string }) {
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const grade = score >= 85 ? "A+" : score >= 75 ? "A" : score >= 65 ? "B+" : score >= 50 ? "B" : score >= 35 ? "C" : "D";
  const circumference = 2 * Math.PI * 40;
  const dashoffset = circumference * (1 - score / 100);
  return (
    <div className="text-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="mx-auto">
        <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(51,65,85,0.3)" strokeWidth="6" />
        <circle cx="48" cy="48" r="40" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={dashoffset}
          transform="rotate(-90 48 48)" style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.22, 0.61, 0.36, 1)" }} />
        <text x="48" y="44" textAnchor="middle" fill={color} fontSize="22" fontWeight="700">{grade}</text>
        <text x="48" y="60" textAnchor="middle" fill="#64748b" fontSize="10">{score}/100</text>
      </svg>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}

function fmt(v: number): string {
  if (Math.abs(v) >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  if (Math.abs(v) >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
  if (Math.abs(v) >= 1e3) return "$" + (v / 1e3).toFixed(0) + "K";
  return "$" + v.toFixed(0);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { projects, selectedProject } = useProject();

  const portfolio = useMemo(() => {
    const totalCapex = projects.reduce((s, p) => s + p.capex, 0);
    const totalNPV = projects.reduce((s, p) => s + p.npv, 0);
    const avgIRR = projects.length > 0 ? projects.reduce((s, p) => s + p.irr, 0) / projects.length : 0;
    const avgRisk = projects.length > 0 ? projects.reduce((s, p) => s + p.riskScore, 0) / projects.length : 0;
    const totalMW = projects.reduce((s, p) => s + p.capacity_MW, 0);
    const viable = projects.filter(p => p.npv > 0 && p.irr > p.discountRate).length;
    return { totalCapex, totalNPV, avgIRR, avgRisk, totalMW, viable, count: projects.length };
  }, [projects]);

  const projectAnalysis = useMemo(() => {
    if (!selectedProject) return null;
    return analyzeFinancing(selectedProject.capex, selectedProject.annualRevenue, selectedProject.opexPerYear, selectedProject.capacity_MW, selectedProject.discountRate, selectedProject.projectLife, selectedProject.energyEscalation, selectedProject.carbonCreditsPerYear, selectedProject.riskScore, selectedProject.drillingSuccessProb);
  }, [selectedProject]);

  const projectInsights = useMemo(() => {
    if (!selectedProject) return [];
    return generateProjectInsights(selectedProject.capex, selectedProject.annualRevenue, selectedProject.opexPerYear, selectedProject.capacity_MW, selectedProject.discountRate, selectedProject.projectLife, selectedProject.thermalGradient, selectedProject.reservoirTemp, selectedProject.drillingSuccessProb, selectedProject.riskScore, selectedProject.npv, selectedProject.irr, selectedProject.paybackYears);
  }, [selectedProject]);

  const financialScore = selectedProject ? Math.min(100, Math.max(0, selectedProject.npv > 0 ? 60 + (selectedProject.irr / 20) * 30 : 30)) : 50;
  const geoScore = selectedProject ? Math.min(100, (selectedProject.thermalGradient / 60) * 50 + (selectedProject.reservoirTemp / 300) * 50) : 50;
  const riskProfileScore = selectedProject ? selectedProject.riskScore : 50;
  const regulatoryScore = selectedProject ? (selectedProject.country === "USA" ? 88 : selectedProject.country === "Iceland" ? 92 : selectedProject.country === "Kenya" ? 72 : 65) : 70;
  const marketScore = selectedProject && projectAnalysis ? Math.min(100, projectAnalysis.lcoe < 50 ? 85 : projectAnalysis.lcoe < 80 ? 70 : 55) : 60;
  const overallScore = Math.round((financialScore * 0.3 + geoScore * 0.2 + riskProfileScore * 0.2 + regulatoryScore * 0.15 + marketScore * 0.15));

  return (
    <div className="space-y-6 page-enter">
      {/* Hero with Project Selector */}
      <div className="relative overflow-hidden rounded-xl p-8" style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.7))", border: "1px solid rgba(51,65,85,0.4)" }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(43,123,194,0.1) 0%, transparent 70%)", transform: "translate(20%, -30%)" }} />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium tracking-wider uppercase">Analytics Engine v4.0</span>
            </div>
            <ProjectSelector />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Geothermal Investment <span className="gradient-text">Intelligence</span></h1>
          <p className="text-slate-400 text-base max-w-2xl leading-relaxed">
            {selectedProject
              ? <>Analyzing <span className="text-white font-medium">{selectedProject.name}</span> ({selectedProject.capacity_MW} MW, {selectedProject.country}) &mdash; {selectedProject.projectType} with {fmt(selectedProject.capex)} CapEx</>
              : "Select a project above to begin analysis, or create a new one."}
          </p>
          {selectedProject && projectAnalysis && (
            <div className="mt-3 flex items-center gap-2">
              {projectAnalysis.isViable
                ? <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-400"><CheckCircle size={16} /> Viable &mdash; {selectedProject.irr.toFixed(1)}% IRR exceeds {selectedProject.discountRate}% hurdle</span>
                : <span className="flex items-center gap-1.5 text-sm font-medium text-amber-400"><AlertTriangle size={16} /> Below viability &mdash; review financing</span>}
            </div>
          )}
        </div>
      </div>

      {/* Guided Workflow */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} style={{ color: "#E8652D" }} />
          <h2 className="text-sm font-semibold text-white">Analysis Workflow</h2>
          <span className="text-xs text-slate-500 ml-auto">Follow these steps to generate a bankable investment report</span>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {[
            { step: 1, label: "Select Project", desc: "Define parameters", path: "/projects", icon: MapPin, color: "#2B7BC2", done: !!selectedProject },
            { step: 2, label: "Risk Analysis", desc: "Monte Carlo & VaR", path: "/monte-carlo", icon: Activity, color: "#E8652D" },
            { step: 3, label: "Financing", desc: "Compare structures", path: "/financing", icon: DollarSign, color: "#10b981" },
            { step: 4, label: "AI Insights", desc: "Viability scoring", path: "/financing", icon: Brain, color: "#a855f7" },
            { step: 5, label: "Report", desc: "Investor-ready", path: "/reports", icon: FileDown, color: "#6CB4D9" },
          ].map((s, i, arr) => (
            <button key={s.step} onClick={() => navigate(s.path)} className="relative flex flex-col items-center p-4 rounded-xl text-center transition-all hover:bg-white/5" style={{ border: "1px solid " + (s.done ? s.color + "40" : "rgba(51,65,85,0.3)"), background: s.done ? s.color + "08" : "transparent" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: s.color + "20", border: "2px solid " + s.color }}>
                {s.done ? <CheckCircle size={18} style={{ color: s.color }} /> : <s.icon size={18} style={{ color: s.color }} />}
              </div>
              <p className="text-xs font-semibold text-white mb-0.5">{s.label}</p>
              <p className="text-xs text-slate-500">{s.desc}</p>
              {i < arr.length - 1 && <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10"><ArrowRight size={14} className="text-slate-600" /></div>}
            </button>
          ))}
        </div>
      </div>

      {/* Real Portfolio Metrics */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: "Portfolio NPV", val: fmt(portfolio.totalNPV), sub: portfolio.totalNPV > 0 ? "Positive" : "Negative", icon: BarChart3, color: portfolio.totalNPV > 0 ? "#10b981" : "#ef4444" },
          { label: "Avg. IRR", val: portfolio.avgIRR.toFixed(1) + "%", sub: portfolio.avgIRR > 8 ? "Above hurdle" : "Monitor", icon: TrendingUp, color: "#2B7BC2" },
          { label: "Total CapEx", val: fmt(portfolio.totalCapex), sub: projects.length + " projects", icon: DollarSign, color: "#E8652D" },
          { label: "Total Capacity", val: portfolio.totalMW.toFixed(0) + " MW", sub: "Combined", icon: Zap, color: "#6CB4D9" },
          { label: "Viable Projects", val: portfolio.viable + "/" + portfolio.count, sub: portfolio.viable === portfolio.count ? "All pass" : "Review needed", icon: CheckCircle, color: portfolio.viable === portfolio.count ? "#10b981" : "#f59e0b" },
          { label: "Avg Risk Score", val: portfolio.avgRisk.toFixed(0) + "/100", sub: portfolio.avgRisk >= 70 ? "Strong" : "Moderate", icon: Shield, color: portfolio.avgRisk >= 70 ? "#10b981" : "#f59e0b" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 card-enter">
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={16} style={{ color: stat.color }} />
              <span className="text-xs font-medium" style={{ color: stat.color }}>{stat.sub}</span>
            </div>
            <p className="text-xl font-bold text-white tabular-nums">{stat.val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Investment Readiness Scorecard */}
      {selectedProject && (
        <div className="glass-card p-5 card-enter">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award size={16} style={{ color: "#f59e0b" }} />
              <h2 className="text-sm font-semibold text-white">{selectedProject.name} &mdash; Investment Readiness</h2>
            </div>
            <button onClick={() => navigate("/financing")} className="text-xs font-medium flex items-center gap-1 hover:text-white" style={{ color: "#6CB4D9" }}>Full Financing <ArrowUpRight size={11} /></button>
          </div>
          <div className="grid grid-cols-6 gap-4">
            <RiskGauge score={overallScore} label="Overall" />
            <RiskGauge score={Math.round(geoScore)} label="Resource" />
            <RiskGauge score={Math.round(financialScore)} label="Financial" />
            <RiskGauge score={riskProfileScore} label="Risk" />
            <RiskGauge score={regulatoryScore} label="Regulatory" />
            <RiskGauge score={Math.round(marketScore)} label="Market" />
          </div>
          <div className="mt-4 flex items-center gap-4 p-3 rounded-lg" style={{ background: "rgba(43,123,194,0.05)", border: "1px solid rgba(43,123,194,0.12)" }}>
            <Target size={14} style={{ color: "#2B7BC2" }} className="shrink-0" />
            <p className="text-xs text-slate-400">
              <span className="text-white font-medium">Score: {overallScore >= 75 ? "A" : overallScore >= 60 ? "B+" : "B"} ({overallScore}/100)</span> &mdash; {
                overallScore >= 75 ? "Exceeds threshold for institutional capital. Proceed to financing optimization."
                : overallScore >= 60 ? "Shows potential. Consider phased exploration or concessional financing."
                : "Needs de-risking before approaching commercial lenders."}
            </p>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {selectedProject && projectInsights.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={16} style={{ color: "#a855f7" }} />
            <h2 className="text-sm font-semibold text-white">AI Insights &mdash; {selectedProject.name}</h2>
            <span className="badge-new">AI</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {projectInsights.slice(0, 4).map(ins => {
              const clr = ins.type === "recommendation" ? "#10b981" : ins.type === "warning" ? "#f59e0b" : ins.type === "opportunity" ? "#6CB4D9" : "#ef4444";
              return (
                <div key={ins.id} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: clr + "15" }}>
                      {ins.type === "recommendation" ? <CheckCircle size={14} style={{ color: clr }} /> : ins.type === "warning" ? <AlertTriangle size={14} style={{ color: clr }} /> : <Zap size={14} style={{ color: clr }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-white">{ins.title}</h4>
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: clr + "15", color: clr }}>{ins.confidence}%</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{ins.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions + Risk Heatmap */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Zap size={14} style={{ color: "#E8652D" }} /> Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Monte Carlo", desc: "Stochastic simulation", path: "/monte-carlo", icon: Activity, color: "#2B7BC2" },
              { label: "Risk Analysis", desc: "VaR, CVaR, sensitivity", path: "/risk-analysis", icon: Shield, color: "#E8652D" },
              { label: "Compare Projects", desc: "Side-by-side radar", path: "/portfolio", icon: Layers, color: "#10b981" },
              { label: "Generate Report", desc: "Stakeholder download", path: "/reports", icon: FileDown, color: "#6CB4D9" },
              { label: "VOI Analysis", desc: "Survey worth it?", path: "/voi-analysis", icon: Eye, color: "#a855f7" },
              { label: "Create Project", desc: "Add geothermal project", path: "/create-project", icon: Globe, color: "#f59e0b" },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.path)} className="flex items-center gap-3 p-3 rounded-lg text-left hover:bg-white/5 group" style={{ border: "1px solid rgba(51,65,85,0.2)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: a.color + "15" }}><a.icon size={14} style={{ color: a.color }} /></div>
                <div><p className="text-xs font-medium text-slate-200 group-hover:text-white">{a.label}</p><p className="text-xs text-slate-500">{a.desc}</p></div>
              </button>
            ))}
          </div>
        </div>
        <div className="glass-card p-5"><RiskHeatmap /></div>
      </div>

      {/* Portfolio Table */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Portfolio Overview</h2>
          <button onClick={() => navigate("/projects")} className="text-xs font-medium flex items-center gap-1 hover:text-white" style={{ color: "#6CB4D9" }}>Manage <ArrowUpRight size={11} /></button>
        </div>
        <table className="w-full text-xs">
          <thead><tr className="text-slate-500 border-b border-slate-700/40">
            <th className="text-left py-2 px-3">Project</th><th className="text-center py-2 px-3">Country</th><th className="text-center py-2 px-3">MW</th><th className="text-center py-2 px-3">CapEx</th><th className="text-center py-2 px-3">NPV</th><th className="text-center py-2 px-3">IRR</th><th className="text-center py-2 px-3">Payback</th><th className="text-center py-2 px-3">Risk</th><th className="text-center py-2 px-3">Status</th>
          </tr></thead>
          <tbody>{projects.map(p => {
            const viable = p.npv > 0 && p.irr > p.discountRate;
            return (
              <tr key={p.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 cursor-pointer" onClick={() => navigate("/financing")}>
                <td className="py-2.5 px-3 font-medium text-white">{p.name}</td>
                <td className="py-2.5 px-3 text-center text-slate-400">{p.country}</td>
                <td className="py-2.5 px-3 text-center text-slate-300">{p.capacity_MW}</td>
                <td className="py-2.5 px-3 text-center text-slate-300">{fmt(p.capex)}</td>
                <td className="py-2.5 px-3 text-center font-mono font-medium" style={{ color: p.npv >= 0 ? "#10b981" : "#ef4444" }}>{fmt(p.npv)}</td>
                <td className="py-2.5 px-3 text-center font-mono font-medium" style={{ color: p.irr > p.discountRate ? "#10b981" : "#ef4444" }}>{p.irr.toFixed(1)}%</td>
                <td className="py-2.5 px-3 text-center text-slate-300">{p.paybackYears} yr</td>
                <td className="py-2.5 px-3 text-center font-medium" style={{ color: p.riskScore >= 70 ? "#10b981" : p.riskScore >= 50 ? "#f59e0b" : "#ef4444" }}>{p.riskScore}/100</td>
                <td className="py-2.5 px-3 text-center"><span className="inline-flex items-center gap-1">{viable ? <CheckCircle size={12} className="text-emerald-400" /> : <AlertTriangle size={12} className="text-amber-400" />}<span className={viable ? "text-emerald-400" : "text-amber-400"}>{viable ? "Viable" : "Review"}</span></span></td>
              </tr>);
          })}</tbody>
        </table>
      </div>
    </div>
  );
}
