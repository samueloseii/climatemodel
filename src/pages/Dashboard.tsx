import { useNavigate } from "react-router-dom";
import { Activity, Shield, Brain, Swords, TrendingUp, ArrowUpRight, Mountain, DollarSign, BarChart3, Layers } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl p-8" style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.7))", border: "1px solid rgba(51,65,85,0.4)" }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(43,123,194,0.08) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium tracking-wider uppercase">Analytics Engine Active</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Geothermal Investment <span className="gradient-text">Intelligence</span>
          </h1>
          <p className="text-slate-400 text-base max-w-2xl leading-relaxed">
            Quantify pre-FID uncertainty, optimize financial structures, and communicate risk to stakeholders with institutional-grade analytics.
          </p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => navigate("/monte-carlo")} className="btn-primary flex items-center gap-2">
              <Activity size={16} /> Run Simulation
            </button>
            <button onClick={() => navigate("/risk-analysis")} className="btn-secondary flex items-center gap-2">
              <Shield size={16} /> Risk Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Portfolio NPV", value: "$4.2M", change: "+12.4%", icon: BarChart3, color: "#10b981" },
          { label: "Avg. IRR", value: "13.8%", change: "+2.1%", icon: TrendingUp, color: "#2B7BC2" },
          { label: "VaR (95%)", value: "$-142K", change: "Controlled", icon: Shield, color: "#E8652D" },
          { label: "Active Models", value: "24", change: "3 running", icon: Activity, color: "#6CB4D9" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <stat.icon size={18} style={{ color: stat.color }} />
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                {stat.change} <ArrowUpRight size={11} />
              </span>
            </div>
            <p className="text-2xl font-bold text-white tabular-nums">{stat.value}</p>
            <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Analysis Tools Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Analysis Modules</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Activity, title: "Monte Carlo Simulation", desc: "Run stochastic simulations with customizable distributions for drilling costs, energy savings, and market variables.", path: "/monte-carlo", accent: "text-blue-400", tag: "Core Engine" },
            { icon: Shield, title: "Risk Analysis (VaR / CVaR)", desc: "Value-at-Risk and Conditional VaR with sensitivity tornado charts. Quantify downside exposure for lenders.", path: "/risk-analysis", accent: "text-amber-400", tag: "Risk Metrics" },
            { icon: Brain, title: "Expected Utility Theory", desc: "Stakeholder-specific risk preferences. Compare risk-neutral vs risk-averse decision frameworks with editable scenarios.", path: "/expected-utility", accent: "text-violet-400", tag: "Decision Science" },
            { icon: Swords, title: "Decision Theory", desc: "Maximin, Maximax, Hurwicz criterion, and Minimax Regret across customizable financing structures and market states.", path: "/decision-theory", accent: "text-cyan-400", tag: "Game Theory" },
            { icon: TrendingUp, title: "Predictions & Scenarios", desc: "Multi-scenario forecasting with probability-weighted outcomes under bull, base, and bear market conditions.", path: "/predictions", accent: "text-emerald-400", tag: "Forecasting" },
            { icon: Mountain, title: "Geological Assessment", desc: "Subsurface characterization, thermal gradient analysis, and site suitability scoring for geothermal prospects.", path: "/geological", accent: "text-rose-400", tag: "Geoscience" },
            { icon: DollarSign, title: "Financing & Revenue", desc: "Compare financing structures, model carbon credit revenue, and analyze tax incentive programs.", path: "/financing", accent: "text-green-400", tag: "Capital" },
            { icon: Layers, title: "Sensitivity Analysis", desc: "Tornado diagrams showing which input variables drive the most uncertainty in project outcomes.", path: "/risk-analysis", accent: "text-orange-400", tag: "Analytics" },
          ].map((tool) => (
            <div key={tool.title} onClick={() => navigate(tool.path)} className="glass-card-hover p-5 cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <tool.icon size={18} className={tool.accent} />
                <span className="text-xs text-slate-500 font-medium">{tool.tag}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5 transition-colors" style={{ color: undefined }}>{tool.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Methodology</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Combines Bayesian uncertainty quantification, Monte Carlo simulation, and stakeholder-aware decision frameworks.
          Each tool adapts output to the evaluator — developers see expected NPV, lenders see CVaR and DSCR,
          development banks see minimax regret across portfolio scenarios. Built on USGS, IEA, NREL, and World Bank data.
        </p>
      </div>
    </div>
  );
}
