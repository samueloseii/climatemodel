import { useState } from "react";
import { Check, Zap, Star, ArrowRight, Shield, Users, BarChart3, Clock } from "lucide-react";

const plans = [
  {
    name: "Explorer",
    price: 0,
    period: "Free forever",
    desc: "For early-stage project screening and basic feasibility analysis",
    color: "#6CB4D9",
    features: [
      "3 active projects",
      "Monte Carlo simulation (1,000 trials)",
      "Basic NPV/IRR analysis",
      "Sensitivity tornado charts",
      "Community support",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Professional",
    price: 299,
    period: "/month",
    desc: "For developers and consultants running bankable feasibility studies",
    color: "#2B7BC2",
    features: [
      "25 active projects",
      "Monte Carlo simulation (50,000 trials)",
      "Full VaR/CVaR risk analysis",
      "Bayesian updating & VOI analysis",
      "Decision theory (all criteria)",
      "Reliability & Weibull analysis",
      "CSV/Excel data import",
      "PDF report generation",
      "Stakeholder-specific views",
      "Email support (24hr response)",
    ],
    cta: "Start 14-Day Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: 899,
    period: "/month",
    desc: "For DFIs, lenders, and portfolio managers evaluating multiple projects",
    color: "#E8652D",
    features: [
      "Unlimited projects",
      "Monte Carlo simulation (100,000+ trials)",
      "Portfolio-level risk aggregation",
      "Multi-project comparison dashboard",
      "Custom financing structure modeling",
      "API access & webhook integrations",
      "White-label reports",
      "Custom Weibull component library",
      "Dedicated account manager",
      "SOC 2 Type II compliance",
      "SSO / SAML authentication",
      "Priority phone + Slack support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const testimonials = [
  { name: "Sarah Chen", role: "VP of Energy Finance, IFC", quote: "GeoPro transformed how we evaluate geothermal risk. The stakeholder-specific views let us present the same project data to developers, lenders, and our board — each in their own language.", avatar: "SC" },
  { name: "Dr. James Mwangi", role: "Chief Geologist, KenGen", quote: "The Bayesian updating module lets us quantify exactly how much uncertainty each new well reduces. This has accelerated our FID timeline by months.", avatar: "JM" },
  { name: "Maria Gonzalez", role: "Managing Director, LatAm Clean Energy Fund", quote: "We evaluated 12 geothermal projects in our pipeline using GeoPro's portfolio risk tools. The minimax regret analysis identified the optimal allocation across our fund.", avatar: "MG" },
];

export default function Subscription() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="space-y-8 page-enter">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4" style={{ background: "rgba(43,123,194,0.1)", border: "1px solid rgba(43,123,194,0.2)", color: "#6CB4D9" }}>
          <Zap size={12} /> Trusted by 40+ geothermal developers worldwide
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">
          Plans That Scale With Your <span className="gradient-text">Portfolio</span>
        </h1>
        <p className="text-slate-400 text-base leading-relaxed">
          From single-project feasibility to institutional portfolio management. Every plan includes our core analytics engine with Bayesian inference, Monte Carlo simulation, and stakeholder-aware decision frameworks.
        </p>
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <span className={`text-sm ${!annual ? "text-white" : "text-slate-500"}`}>Monthly</span>
          <button onClick={() => setAnnual(!annual)} className="relative w-12 h-6 rounded-full transition-all" style={{ background: annual ? "#2B7BC2" : "#334155" }}>
            <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow" style={{ left: annual ? "calc(100% - 22px)" : "2px" }} />
          </button>
          <span className={`text-sm ${annual ? "text-white" : "text-slate-500"}`}>Annual</span>
          {annual && <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>Save 20%</span>}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-3 gap-5">
        {plans.map((plan) => {
          const displayPrice = annual ? Math.round(plan.price * 0.8) : plan.price;
          return (
            <div key={plan.name} className="relative rounded-xl p-6 transition-all duration-300 hover:scale-[1.02]" style={{
              background: plan.popular ? "linear-gradient(145deg, rgba(43,123,194,0.12), rgba(15,23,42,0.8))" : "linear-gradient(145deg, rgba(15,23,42,0.7), rgba(15,23,42,0.5))",
              border: `1px solid ${plan.popular ? "rgba(43,123,194,0.4)" : "rgba(51,65,85,0.4)"}`,
              boxShadow: plan.popular ? "0 8px 40px -8px rgba(43,123,194,0.15)" : "none",
            }}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold text-white" style={{ background: "linear-gradient(135deg, #2B7BC2, #6CB4D9)" }}>
                  Most Popular
                </div>
              )}
              <div className="mb-5">
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{plan.desc}</p>
              </div>
              <div className="mb-5">
                {plan.price === 0 ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">Free</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">${displayPrice}</span>
                    <span className="text-sm text-slate-400">{plan.period}</span>
                  </div>
                )}
                {annual && plan.price > 0 && (
                  <p className="text-xs text-emerald-400 mt-1">Billed ${displayPrice * 12}/year (save ${plan.price * 12 - displayPrice * 12})</p>
                )}
              </div>
              <button className="w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all mb-5" style={{
                background: plan.popular ? "linear-gradient(135deg, #E8652D, #D4551F)" : "rgba(51,65,85,0.5)",
                color: "white",
                border: plan.popular ? "none" : "1px solid rgba(51,65,85,0.6)",
              }}>
                {plan.cta} <ArrowRight size={14} />
              </button>
              <div className="space-y-2.5">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5">
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: plan.color }} />
                    <span className="text-xs text-slate-300">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Full Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/40">
                <th className="text-left py-3 text-slate-400 font-medium">Feature</th>
                <th className="text-center py-3 text-slate-300 font-semibold">Explorer</th>
                <th className="text-center py-3 font-semibold" style={{ color: "#2B7BC2" }}>Professional</th>
                <th className="text-center py-3 font-semibold" style={{ color: "#E8652D" }}>Enterprise</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {[
                ["Monte Carlo Trials", "1,000", "50,000", "100,000+"],
                ["Active Projects", "3", "25", "Unlimited"],
                ["VaR / CVaR Analysis", "Basic", "Full", "Full + Portfolio"],
                ["Bayesian Updating", "-", "Yes", "Yes + Custom Priors"],
                ["Value of Information (VOI)", "-", "Yes", "Yes"],
                ["Reliability / Weibull", "-", "Yes", "Yes + Custom Library"],
                ["Decision Theory Criteria", "Minimax only", "All 5 criteria", "All + Custom"],
                ["Data Import (CSV/Excel)", "-", "Yes", "Yes + API"],
                ["Report Generation", "Summary only", "Full PDF", "White-label PDF"],
                ["Stakeholder Views", "Developer", "All 3", "Custom roles"],
                ["Extreme Value (GPD)", "-", "Yes", "Yes"],
                ["Convergence Diagnostics", "-", "Yes", "Yes"],
                ["Portfolio Comparison", "-", "-", "Yes"],
                ["API Access", "-", "-", "Yes"],
                ["SSO / SAML", "-", "-", "Yes"],
                ["Support", "Community", "Email (24hr)", "Dedicated + Slack"],
              ].map(([feature, ...values]) => (
                <tr key={feature} className="border-b border-slate-800/50 hover:bg-white/[0.02]">
                  <td className="py-2.5 text-slate-300">{feature}</td>
                  {values.map((v, i) => (
                    <td key={i} className="text-center py-2.5">
                      {v === "-" ? <span className="text-slate-600">—</span> : <span className="text-slate-300">{v}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Shield, label: "SOC 2 Type II", desc: "Enterprise-grade security", color: "#10b981" },
          { icon: Users, label: "40+ Customers", desc: "Across 12 countries", color: "#2B7BC2" },
          { icon: BarChart3, label: "$2.1B Analyzed", desc: "Total project value", color: "#E8652D" },
          { icon: Clock, label: "99.9% Uptime", desc: "SLA for Enterprise", color: "#6CB4D9" },
        ].map((t) => (
          <div key={t.label} className="glass-card p-4 text-center">
            <t.icon size={20} className="mx-auto mb-2" style={{ color: t.color }} />
            <p className="text-sm font-semibold text-white">{t.label}</p>
            <p className="text-xs text-slate-500">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">What Our Users Say</h2>
        <div className="grid grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card p-5">
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} fill="#f59e0b" color="#f59e0b" />)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #2B7BC2, #6CB4D9)" }}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-xl p-8 text-center" style={{ background: "linear-gradient(135deg, rgba(43,123,194,0.15), rgba(232,101,45,0.08))", border: "1px solid rgba(43,123,194,0.2)" }}>
        <h2 className="text-xl font-bold text-white mb-2">Ready to De-Risk Your Next Project?</h2>
        <p className="text-sm text-slate-400 mb-5 max-w-xl mx-auto">Join 40+ geothermal developers, DFIs, and energy investors using GeoPro to make faster, more confident investment decisions.</p>
        <div className="flex items-center justify-center gap-3">
          <button className="btn-primary flex items-center gap-2">Start Free Trial <ArrowRight size={14} /></button>
          <button className="btn-secondary flex items-center gap-2">Schedule Demo <ArrowRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}
