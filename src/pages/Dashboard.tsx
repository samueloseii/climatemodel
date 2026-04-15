import { useNavigate } from "react-router-dom";
import { Activity, Shield, Brain, Swords, TrendingUp, ArrowUpRight, Mountain, DollarSign, BarChart3, Eye, FlaskConical, Wrench, FileDown, Layers, CreditCard, Upload, Zap, Globe, Users, Sliders } from "lucide-react";
import RiskHeatmap from "../components/RiskHeatmap";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 page-enter">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl p-8" style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.7))", border: "1px solid rgba(51,65,85,0.4)" }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(43,123,194,0.1) 0%, transparent 70%)", transform: "translate(20%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(232,101,45,0.06) 0%, transparent 70%)", transform: "translate(-20%, 40%)" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium tracking-wider uppercase">Analytics Engine v3.0 · 16 Modules Active</span>
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
            <button onClick={() => navigate("/portfolio")} className="btn-secondary flex items-center gap-2">
              <Layers size={16} /> Compare Projects
            </button>
            <button onClick={() => navigate("/reports")} className="btn-secondary flex items-center gap-2">
              <FileDown size={16} /> Download Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Portfolio NPV", value: "$4.2M", change: "+12.4%", icon: BarChart3, color: "#10b981" },
          { label: "Avg. IRR", value: "13.8%", change: "+2.1%", icon: TrendingUp, color: "#2B7BC2" },
          { label: "VaR (95%)", value: "$-142K", change: "Controlled", icon: Shield, color: "#E8652D" },
          { label: "Active Projects", value: "8", change: "3 in FID", icon: Globe, color: "#6CB4D9" },
          { label: "Analysis Modules", value: "16", change: "All active", icon: Activity, color: "#a855f7" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={16} style={{ color: stat.color }} />
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
                {stat.change} <ArrowUpRight size={10} />
              </span>
            </div>
            <p className="text-xl font-bold text-white tabular-nums">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions + Risk Heatmap */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Zap size={14} style={{ color: "#E8652D" }} /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "New Monte Carlo", desc: "Run stochastic simulation", path: "/monte-carlo", icon: Activity, color: "#2B7BC2" },
              { label: "Upload Data", desc: "Import CSV project data", path: "/monte-carlo", icon: Upload, color: "#10b981" },
              { label: "Compare Projects", desc: "Side-by-side analysis", path: "/portfolio", icon: Layers, color: "#E8652D" },
              { label: "Generate Report", desc: "Stakeholder-ready PDF", path: "/reports", icon: FileDown, color: "#6CB4D9" },
              { label: "VOI Analysis", desc: "Should we survey first?", path: "/voi-analysis", icon: Eye, color: "#a855f7" },
              { label: "View Pricing", desc: "Plans & subscriptions", path: "/subscription", icon: CreditCard, color: "#f59e0b" },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.path)} className="flex items-center gap-3 p-3 rounded-lg text-left transition-all hover:bg-white/5 group" style={{ border: "1px solid rgba(51,65,85,0.2)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${a.color}15` }}>
                  <a.icon size={14} style={{ color: a.color }} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-200 group-hover:text-white">{a.label}</p>
                  <p className="text-xs text-slate-500">{a.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="glass-card p-5">
          <RiskHeatmap />
        </div>
      </div>

      {/* Analysis Tools Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Analysis Modules</h2>
          <span className="text-xs text-slate-500">16 modules available</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Activity, title: "Monte Carlo", desc: "Stochastic NPV/IRR simulation with convergence diagnostics", path: "/monte-carlo", hexColor: "#2B7BC2", tag: "Core" },
            { icon: Shield, title: "Risk Analysis", desc: "VaR, CVaR, sensitivity tornado, GPD extreme value", path: "/risk-analysis", hexColor: "#E8652D", tag: "Risk" },
            { icon: Brain, title: "Expected Utility", desc: "CARA utility, certainty equivalent, risk premium", path: "/expected-utility", hexColor: "#a855f7", tag: "Decision" },
            { icon: Swords, title: "Decision Theory", desc: "Minimax, Maximin, Hurwicz, Lookahead criteria", path: "/decision-theory", hexColor: "#6CB4D9", tag: "Decision" },
            { icon: Eye, title: "Value of Info", desc: "EVPI, EVSI, ENGS — is the survey worth it?", path: "/voi-analysis", hexColor: "#10b981", tag: "CEE551" },
            { icon: FlaskConical, title: "Bayesian Updating", desc: "Beta-Binomial conjugate model for drilling success", path: "/bayesian", hexColor: "#f59e0b", tag: "CEE551" },
            { icon: Wrench, title: "Reliability", desc: "Weibull MTTF, hazard rates, system reliability", path: "/reliability", hexColor: "#ec4899", tag: "CEE551" },
            { icon: Sliders, title: "Sensitivity", desc: "Tornado charts and spider plots for NPV drivers", path: "/sensitivity", hexColor: "#f59e0b", tag: "New" },
            { icon: Layers, title: "Portfolio Compare", desc: "Multi-project radar charts and risk comparison", path: "/portfolio", hexColor: "#2B7BC2", tag: "New" },
            { icon: TrendingUp, title: "Predictions", desc: "Multi-scenario NPV/IRR cash flow forecasting", path: "/predictions", hexColor: "#10b981", tag: "Forecast" },
            { icon: Mountain, title: "Geological", desc: "Thermal gradients, site suitability, regional data", path: "/geological", hexColor: "#ef4444", tag: "Geo" },
            { icon: DollarSign, title: "Financing", desc: "Carbon markets, IRA incentives, deal structures", path: "/financing", hexColor: "#10b981", tag: "Capital" },
            { icon: FileDown, title: "Reports", desc: "Comprehensive analysis reports for stakeholders", path: "/reports", hexColor: "#2B7BC2", tag: "Output" },
          ].map((tool) => (
            <div key={tool.title} onClick={() => navigate(tool.path)} className="glass-card-hover p-4 cursor-pointer group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${tool.hexColor}12` }}>
                  <tool.icon size={15} style={{ color: tool.hexColor }} />
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${tool.tag === "New" ? "bg-emerald-500/15 text-emerald-400" : "text-slate-600"}`}>{tool.tag}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{tool.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Stats */}
      <div className="glass-card p-4 flex items-center justify-between" style={{ borderColor: "rgba(43,123,194,0.15)" }}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Users size={14} style={{ color: "#6CB4D9" }} />
            <span className="text-xs text-slate-400">40+ Organizations</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={14} style={{ color: "#10b981" }} />
            <span className="text-xs text-slate-400">12 Countries</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 size={14} style={{ color: "#E8652D" }} />
            <span className="text-xs text-slate-400">$2.1B Total Analyzed</span>
          </div>
        </div>
        <button onClick={() => navigate("/subscription")} className="text-xs font-medium flex items-center gap-1.5 transition-colors hover:text-white" style={{ color: "#6CB4D9" }}>
          Upgrade Plan <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  );
}
