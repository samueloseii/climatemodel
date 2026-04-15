import { useNavigate } from "react-router-dom";
import { Activity, Shield, Brain, Swords, TrendingUp, ArrowUpRight, Mountain, DollarSign, BarChart3, Eye, FlaskConical, Wrench, FileDown } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl p-8" style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.7))", border: "1px solid rgba(51,65,85,0.4)" }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(43,123,194,0.08) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full" style={{ background: "radial-gradient(circle, rgba(232,101,45,0.05) 0%, transparent 70%)", transform: "translate(-20%, 40%)" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium tracking-wider uppercase">Analytics Engine v3.0 &middot; 14 Modules Active</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Geothermal Investment <span className="gradient-text">Intelligence</span>
          </h1>
          <p className="text-slate-400 text-base max-w-2xl leading-relaxed">
            Quantify pre-FID uncertainty, optimize financial structures, and communicate risk to stakeholders with institutional-grade analytics.
            Powered by Bayesian inference, Monte Carlo simulation, Value of Information theory, and reliability engineering.
          </p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => navigate("/monte-carlo")} className="btn-primary flex items-center gap-2">
              <Activity size={16} /> Run Simulation
            </button>
            <button onClick={() => navigate("/voi-analysis")} className="btn-secondary flex items-center gap-2">
              <Eye size={16} /> Value of Information
            </button>
            <button onClick={() => navigate("/reports")} className="btn-secondary flex items-center gap-2">
              <FileDown size={16} /> Download Report
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
          { label: "Analysis Modules", value: "14", change: "All active", icon: Activity, color: "#6CB4D9" },
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
            { icon: Activity, title: "Monte Carlo Simulation", desc: "5,000+ trial stochastic simulations with NPV/IRR/payback distributions, convergence diagnostics, and customizable inputs.", path: "/monte-carlo", hexColor: "#2B7BC2", tag: "Core Engine" },
            { icon: Shield, title: "Risk Analysis (VaR / CVaR)", desc: "Value-at-Risk and Conditional VaR with sensitivity tornado charts. Stakeholder-specific risk interpretation.", path: "/risk-analysis", hexColor: "#E8652D", tag: "Risk Metrics" },
            { icon: Brain, title: "Expected Utility Theory", desc: "Stakeholder-aware decision modeling. Compare developer, lender, and development bank risk preferences.", path: "/expected-utility", hexColor: "#a855f7", tag: "Decision Science" },
            { icon: Swords, title: "Decision Theory", desc: "Maximin, Maximax, Hurwicz, and Minimax Regret across financing structures. Fully editable payoff matrix.", path: "/decision-theory", hexColor: "#6CB4D9", tag: "Game Theory" },
            { icon: Eye, title: "Value of Information (VOI)", desc: "EVPI & EVSI analysis — quantify whether exploration surveys are worth their cost before spending. Bayesian posterior updating.", path: "/voi-analysis", hexColor: "#10b981", tag: "CEE551" },
            { icon: FlaskConical, title: "Bayesian Updating", desc: "Beta-Binomial conjugate model for drilling success probability. Sequential belief updating with predictive distributions.", path: "/bayesian", hexColor: "#f59e0b", tag: "CEE551" },
            { icon: Wrench, title: "Reliability Analysis", desc: "Weibull failure modeling for geothermal infrastructure. Hazard rates, MTTF, system reliability, replacement cost projections.", path: "/reliability", hexColor: "#ec4899", tag: "CEE551" },
            { icon: TrendingUp, title: "Predictions & Scenarios", desc: "Multi-scenario NPV/IRR/payback forecasting with probability-weighted outcomes and real-time recalculation.", path: "/predictions", hexColor: "#10b981", tag: "Forecasting" },
            { icon: Mountain, title: "Geological Assessment", desc: "Subsurface thermal gradients, soil conductivity, site suitability scoring with regional filtering.", path: "/geological", hexColor: "#ef4444", tag: "Geoscience" },
            { icon: DollarSign, title: "Financing & Revenue", desc: "Compare financing structures, carbon credit markets (EU ETS, California, RGGI), and IRA tax incentives.", path: "/financing", hexColor: "#10b981", tag: "Capital" },
            { icon: FileDown, title: "Report Download", desc: "Generate comprehensive, print-ready project analysis reports with methodology documentation for stakeholders.", path: "/reports", hexColor: "#2B7BC2", tag: "Deliverables" },
          ].map((tool) => (
            <div key={tool.title} onClick={() => navigate(tool.path)} className="glass-card-hover p-5 cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <tool.icon size={18} style={{ color: tool.hexColor }} />
                <span className="text-xs text-slate-500 font-medium">{tool.tag}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">{tool.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology */}
      <div className="glass-card p-5" style={{ borderColor: "rgba(43,123,194,0.15)" }}>
        <h3 className="text-sm font-semibold text-white mb-1">Methodology &amp; Theoretical Foundation</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          GeoPro integrates <strong className="text-white">Bayesian uncertainty quantification</strong>, <strong className="text-white">Monte Carlo simulation</strong>,
          <strong className="text-white"> Value of Information theory</strong> (EVPI/EVSI), <strong className="text-white">Weibull reliability analysis</strong>,
          and <strong className="text-white">stakeholder-aware decision frameworks</strong> (Expected Utility, Minimax Regret, Hurwicz criterion).
          Each tool adapts output to the evaluator — developers see expected NPV, lenders see CVaR and DSCR,
          development banks see minimax regret across portfolio scenarios. Mathematical foundations from CEE551 Decision Science.
          Built on USGS, IEA, NREL, and World Bank data.
        </p>
      </div>
    </div>
  );
}
