import { useNavigate } from "react-router-dom";
import { Activity, Shield, Brain, Swords, TrendingUp, ArrowUpRight, Zap, Target, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border border-slate-700/50 p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-amber-500/5 to-transparent rounded-full translate-y-32 -translate-x-16" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-medium tracking-wider uppercase">Live Analytics Engine</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Geothermal Investment <span className="gradient-text">Intelligence</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Quantify uncertainty, optimize financial structures, and communicate risk to stakeholders with institutional-grade analytics.
          </p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => navigate("/monte-carlo")} className="btn-primary flex items-center gap-2">
              <Activity size={18} /> Run Simulation
            </button>
            <button onClick={() => navigate("/risk-analysis")} className="btn-secondary flex items-center gap-2">
              <Shield size={18} /> Risk Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Portfolio NPV", value: "$4.2M", change: "+12.4%", icon: BarChart3, color: "from-emerald-500/20 to-emerald-600/5", iconColor: "text-emerald-400" },
          { label: "Avg. IRR", value: "13.8%", change: "+2.1%", icon: TrendingUp, color: "from-blue-500/20 to-blue-600/5", iconColor: "text-blue-400" },
          { label: "VaR (95%)", value: "$-142K", change: "Controlled", icon: Shield, color: "from-orange-500/20 to-orange-600/5", iconColor: "text-orange-400" },
          { label: "Active Models", value: "24", change: "3 running", icon: Activity, color: "from-purple-500/20 to-purple-600/5", iconColor: "text-purple-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card-hover p-5 stat-glow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon size={20} className={stat.iconColor} />
              </div>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                {stat.change} <ArrowUpRight size={12} />
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-slate-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Analysis Tools Grid */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Activity, title: "Monte Carlo Simulation", desc: "Run 5,000+ trial simulations with customizable probability distributions for drilling costs, energy savings, and market variables.", path: "/monte-carlo", color: "from-orange-500 to-amber-500", tag: "Core Engine" },
          { icon: Shield, title: "Risk Analysis (VaR / CVaR)", desc: "Value-at-Risk and Conditional VaR analysis with sensitivity tornado charts. Quantify downside exposure for lenders.", path: "/risk-analysis", color: "from-red-500 to-rose-500", tag: "Risk Metrics" },
          { icon: Brain, title: "Expected Utility Theory", desc: "Model stakeholder-specific risk preferences. Compare risk-neutral vs risk-averse decision frameworks.", path: "/expected-utility", color: "from-violet-500 to-purple-500", tag: "Decision Science" },
          { icon: Swords, title: "Minimax & Decision Theory", desc: "Maximin, Maximax, Hurwicz criterion, and Minimax Regret analysis across financing structures.", path: "/decision-theory", color: "from-cyan-500 to-blue-500", tag: "Game Theory" },
          { icon: TrendingUp, title: "Prediction & Scenario Analysis", desc: "Multi-scenario forecasting with probability-weighted outcomes under bull, base, and bear cases.", path: "/predictions", color: "from-emerald-500 to-teal-500", tag: "Forecasting" },
          { icon: Target, title: "Sensitivity Analysis", desc: "Tornado diagrams showing which input variables drive the most uncertainty in project outcomes.", path: "/risk-analysis", color: "from-amber-500 to-yellow-500", tag: "Analytics" },
        ].map((tool) => (
          <div key={tool.title} onClick={() => navigate(tool.path)} className="glass-card-hover p-6 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg`}>
                <tool.icon size={22} className="text-white" />
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">{tool.tag}</span>
            </div>
            <h3 className="text-base font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors">{tool.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{tool.desc}</p>
            <div className="mt-4 flex items-center gap-1 text-sm text-orange-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Launch Tool <ArrowUpRight size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* Methodology Banner */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 flex items-center justify-center shrink-0">
            <Zap size={24} className="text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Institutional-Grade Methodology</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Our analytics engine combines Bayesian uncertainty quantification, Monte Carlo simulation, and stakeholder-aware decision frameworks.
              Each tool adapts its output to the evaluator — developers see expected NPV, lenders see CVaR and debt service coverage,
              and development banks see minimax regret across portfolio scenarios. Built on public data from USGS, IEA, NREL, and World Bank.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
