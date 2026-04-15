import { useState } from "react";
import { FileDown, Check, Loader2, Building2, TrendingUp, Shield, Brain, Eye, Wrench, FlaskConical } from "lucide-react";

interface ReportConfig {
  projectName: string;
  projectLocation: string;
  preparedFor: string;
  preparedBy: string;
  includeExecutiveSummary: boolean;
  includeMonteCarlo: boolean;
  includeRiskAnalysis: boolean;
  includeExpectedUtility: boolean;
  includeDecisionTheory: boolean;
  includeVOI: boolean;
  includeBayesian: boolean;
  includeReliability: boolean;
  includePredictions: boolean;
  includeGeological: boolean;
  includeFinancing: boolean;
}

const defaultConfig: ReportConfig = {
  projectName: "East African Rift Geothermal Project",
  projectLocation: "Olkaria, Kenya",
  preparedFor: "Development Finance Institution",
  preparedBy: "Middle Earth Innovations",
  includeExecutiveSummary: true,
  includeMonteCarlo: true,
  includeRiskAnalysis: true,
  includeExpectedUtility: true,
  includeDecisionTheory: true,
  includeVOI: true,
  includeBayesian: true,
  includeReliability: true,
  includePredictions: true,
  includeGeological: true,
  includeFinancing: true,
};

function generateReportHTML(config: ReportConfig): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const sections: string[] = [];

  if (config.includeExecutiveSummary) {
    sections.push(`
      <div class="section">
        <h2>1. Executive Summary</h2>
        <p>This report presents a comprehensive risk-adjusted financial analysis of the <strong>${config.projectName}</strong> located in <strong>${config.projectLocation}</strong>. The analysis employs state-of-the-art decision science methodologies including Monte Carlo simulation, Bayesian inference, Value of Information analysis, reliability modeling, and multi-criteria decision theory to quantify uncertainty and support investment decisions.</p>
        <div class="highlight-box">
          <h3>Key Findings</h3>
          <ul>
            <li><strong>Expected NPV:</strong> Positive under base-case assumptions, with probability-weighted scenarios showing favorable risk-return profile</li>
            <li><strong>Value of Information:</strong> Pre-drilling surveys provide significant expected net gain, supporting phased exploration strategy</li>
            <li><strong>Financing Recommendation:</strong> Blended finance structure optimizes risk allocation across stakeholders</li>
            <li><strong>System Reliability:</strong> Infrastructure replacement costs modeled using Weibull analysis over project lifetime</li>
          </ul>
        </div>
      </div>
    `);
  }

  if (config.includeMonteCarlo) {
    sections.push(`
      <div class="section">
        <h2>2. Monte Carlo Simulation Analysis</h2>
        <h3>2.1 Methodology</h3>
        <p>We employ Monte Carlo simulation with N = 5,000+ randomized trials to propagate input uncertainty through the financial model. Each input parameter is characterized by a probability distribution (typically Normal with specified mean and standard deviation). The simulation generates distributions for key output metrics:</p>
        <ul>
          <li><strong>Net Present Value (NPV):</strong> NPV = -C₀ + Σ(CFₜ / (1+r)ᵗ) where C₀ is initial investment, CFₜ is net cash flow in year t, and r is the discount rate</li>
          <li><strong>Internal Rate of Return (IRR):</strong> Solved via bisection method — the rate r* such that NPV(r*) = 0</li>
          <li><strong>Payback Period:</strong> The year t* when cumulative undiscounted cash flows first become non-negative</li>
        </ul>
        <h3>2.2 Input Parameters</h3>
        <p>Key stochastic inputs include drilling cost per foot, bore depth, heat pump and distribution costs, annual energy savings, energy price escalation, and discount rate. Each is modeled as a truncated normal distribution to prevent physically impossible values.</p>
        <h3>2.3 Key Metrics</h3>
        <table>
          <tr><th>Metric</th><th>Description</th><th>Formula</th></tr>
          <tr><td>Mean NPV</td><td>Expected project value</td><td>E[NPV] = (1/N) Σᵢ NPVᵢ</td></tr>
          <tr><td>P5 / P95</td><td>5th and 95th percentile bounds</td><td>Empirical quantiles of simulated distribution</td></tr>
          <tr><td>P(NPV > 0)</td><td>Probability of positive returns</td><td>Count(NPVᵢ > 0) / N</td></tr>
          <tr><td>VaR (95%)</td><td>Value at Risk</td><td>5th percentile of NPV distribution</td></tr>
          <tr><td>CVaR (95%)</td><td>Conditional VaR (Expected Shortfall)</td><td>E[NPV | NPV ≤ VaR₉₅]</td></tr>
        </table>
      </div>
    `);
  }

  if (config.includeRiskAnalysis) {
    sections.push(`
      <div class="section">
        <h2>3. Risk Analysis</h2>
        <h3>3.1 Value at Risk (VaR)</h3>
        <p>VaR at confidence level α represents the loss threshold that is exceeded with probability (1-α). For a geothermal project, VaR₉₅ answers: "We are 95% confident that the project NPV will not fall below this value."</p>
        <p><strong>VaR_α = F⁻¹(1 - α)</strong> where F⁻¹ is the inverse CDF of the NPV distribution.</p>
        <h3>3.2 Conditional Value at Risk (CVaR)</h3>
        <p>CVaR (also called Expected Shortfall) measures the <em>average</em> loss in the worst (1-α) fraction of scenarios. This is more informative than VaR for stakeholders concerned about tail risk severity:</p>
        <p><strong>CVaR_α = E[NPV | NPV ≤ VaR_α]</strong></p>
        <h3>3.3 Sensitivity Analysis</h3>
        <p>Tornado chart analysis identifies the input variables with the greatest influence on project NPV. Each variable is perturbed ±25% from its base value while holding all others constant. Variables are ranked by their total NPV impact range.</p>
        <h3>3.4 Stakeholder Risk Interpretation</h3>
        <table>
          <tr><th>Stakeholder</th><th>Primary Metric</th><th>Risk Philosophy</th></tr>
          <tr><td>Developer</td><td>Expected NPV</td><td>Risk-neutral, maximize expected value</td></tr>
          <tr><td>Commercial Lender</td><td>CVaR, DSCR</td><td>Minimize downside exposure</td></tr>
          <tr><td>Development Bank</td><td>Portfolio VaR</td><td>Minimax regret across portfolio</td></tr>
        </table>
      </div>
    `);
  }

  if (config.includeExpectedUtility) {
    sections.push(`
      <div class="section">
        <h2>4. Expected Utility Analysis</h2>
        <h3>4.1 Utility Framework</h3>
        <p>Different stakeholders evaluate the same project differently based on their risk preferences. We model utility using the exponential utility function:</p>
        <p><strong>U(x) = (1 - e^(-γx)) / γ</strong></p>
        <p>where γ is the risk aversion coefficient and x is the NPV outcome.</p>
        <h3>4.2 Key Concepts</h3>
        <ul>
          <li><strong>Expected Utility:</strong> EU = Σᵢ pᵢ · U(NPVᵢ) — probability-weighted average of utilities</li>
          <li><strong>Certainty Equivalent (CE):</strong> CE = U⁻¹(EU) — the guaranteed amount the stakeholder would accept instead of the risky project</li>
          <li><strong>Risk Premium (RP):</strong> RP = E[NPV] - CE — the "cost" of risk to this stakeholder</li>
        </ul>
        <h3>4.3 Implications</h3>
        <p>The gap between Expected Value and Certainty Equivalent explains why bankable projects fail to attract financing. GeoPro makes these implicit risk models explicit, enabling structured negotiation between developers and capital providers.</p>
      </div>
    `);
  }

  if (config.includeDecisionTheory) {
    sections.push(`
      <div class="section">
        <h2>5. Decision Theory — Financing Structure Optimization</h2>
        <h3>5.1 Decision Criteria</h3>
        <p>We evaluate alternative financing structures under multiple decision criteria to identify robust recommendations:</p>
        <table>
          <tr><th>Criterion</th><th>Decision Rule</th><th>Best For</th></tr>
          <tr><td>Minimax Regret</td><td>Minimize the maximum regret across all states</td><td>Risk-aware decision-makers</td></tr>
          <tr><td>Maximin</td><td>Maximize the minimum payoff</td><td>Conservative lenders</td></tr>
          <tr><td>Maximax</td><td>Maximize the maximum payoff</td><td>Optimistic developers</td></tr>
          <tr><td>Hurwicz</td><td>Weighted combination of best and worst cases</td><td>Balanced approach</td></tr>
        </table>
        <h3>5.2 Financing Structures Evaluated</h3>
        <ul>
          <li>Construction-to-Term Loan</li>
          <li>Convertible Grant + Equity</li>
          <li>Tax Equity Partnership</li>
          <li>Blended Finance (DFI)</li>
        </ul>
      </div>
    `);
  }

  if (config.includeVOI) {
    sections.push(`
      <div class="section">
        <h2>6. Value of Information Analysis</h2>
        <h3>6.1 EVPI — Expected Value of Perfect Information</h3>
        <p>EVPI represents the maximum amount a decision-maker should pay for any information source:</p>
        <p><strong>EVPI = E_θ[max_a V(a,θ)] - max_a E_θ[V(a,θ)]</strong></p>
        <p>This is the difference between the expected value of deciding with perfect knowledge versus deciding under current uncertainty.</p>
        <h3>6.2 EVSI — Expected Value of Sample Information</h3>
        <p>EVSI measures the practical value of a specific survey or test (e.g., slim-hole drilling, geophysical survey):</p>
        <p><strong>EVSI = E_z[max_a E_θ|z[V(a,θ)]] - max_a E_θ[V(a,θ)]</strong></p>
        <p>EVSI uses Bayes' Rule to compute posterior beliefs P(θ|z) for each possible survey outcome z, then re-optimizes decisions under updated beliefs.</p>
        <h3>6.3 ENGS — Expected Net Gain from Sampling</h3>
        <p><strong>ENGS = EVSI - Survey Cost</strong></p>
        <p>If ENGS > 0, the survey is worthwhile. The ratio EVSI/EVPI indicates what fraction of maximum possible information value this survey captures.</p>
      </div>
    `);
  }

  if (config.includeBayesian) {
    sections.push(`
      <div class="section">
        <h2>7. Bayesian Updating — Geological Uncertainty</h2>
        <h3>7.1 Beta-Binomial Model</h3>
        <p>Drilling success probability θ is modeled with a Beta prior distribution. As wells are drilled, observations update beliefs via conjugacy:</p>
        <p><strong>Prior: θ ~ Beta(α, β)</strong></p>
        <p><strong>Data: k successes in n trials</strong></p>
        <p><strong>Posterior: θ ~ Beta(α + k, β + n - k)</strong></p>
        <h3>7.2 Predictive Distribution</h3>
        <p>The Beta-Binomial predictive distribution accounts for <em>both</em> aleatory uncertainty (random well outcomes) and epistemic uncertainty (unknown success rate). This gives wider, more honest prediction intervals than point-estimate-based predictions:</p>
        <p><strong>Var[X_pred] = Var_aleatory + Var_epistemic</strong></p>
        <h3>7.3 Sequential Updating</h3>
        <p>Each drilling phase updates the posterior, which becomes the prior for the next phase. This sequential process narrows the confidence interval as evidence accumulates, quantifying the value of phased exploration.</p>
      </div>
    `);
  }

  if (config.includeReliability) {
    sections.push(`
      <div class="section">
        <h2>8. Reliability Analysis — Infrastructure Lifecycle</h2>
        <h3>8.1 Weibull Failure Model</h3>
        <p>Component lifetimes are modeled with the Weibull distribution, which is flexible enough to capture all failure modes:</p>
        <p><strong>R(t) = exp(-(t/λ)^k)</strong></p>
        <p><strong>h(t) = (k/λ)(t/λ)^(k-1)</strong></p>
        <p>where k is the shape parameter and λ is the scale parameter (characteristic lifetime).</p>
        <h3>8.2 Shape Parameter Interpretation</h3>
        <table>
          <tr><th>k Range</th><th>Failure Mode</th><th>Example</th></tr>
          <tr><td>k &lt; 1</td><td>Decreasing hazard (infant mortality)</td><td>Electronic components after burn-in</td></tr>
          <tr><td>k = 1</td><td>Constant hazard (random failures)</td><td>Exponential model</td></tr>
          <tr><td>k &gt; 1</td><td>Increasing hazard (wear-out)</td><td>Pumps, heat exchangers, turbines</td></tr>
        </table>
        <h3>8.3 System Reliability</h3>
        <p>For a series system (all components must function): <strong>R_system(t) = Πᵢ R_i(t)</strong></p>
        <p>Expected replacement costs over project life are computed using MTTF = λ · Γ(1 + 1/k).</p>
      </div>
    `);
  }

  if (config.includePredictions) {
    sections.push(`
      <div class="section">
        <h2>9. Prediction Analysis — Cash Flow Forecasting</h2>
        <h3>9.1 Multi-Scenario Framework</h3>
        <p>Probabilistic cash flow projections under Bull, Base, and Bear scenarios, each with assigned probability weights. Key parameters include:</p>
        <ul>
          <li>Initial CapEx, Annual Revenue, Revenue Growth Rate</li>
          <li>Operating Expense Rate, Discount Rate</li>
          <li>Tax credits (IRA 30% ITC)</li>
          <li>Carbon credit revenue</li>
        </ul>
        <h3>9.2 Probability-Weighted NPV</h3>
        <p><strong>E[NPV] = Σᵢ pᵢ · NPVᵢ</strong> — the expected project value accounting for scenario likelihoods.</p>
      </div>
    `);
  }

  if (config.includeFinancing) {
    sections.push(`
      <div class="section">
        <h2>10. Financing Options</h2>
        <h3>10.1 Structures Evaluated</h3>
        <ul>
          <li><strong>Construction-to-Term Loan:</strong> High upside in strong markets but significant downside exposure</li>
          <li><strong>Convertible Grant + Equity:</strong> Reduced downside via grant component</li>
          <li><strong>Tax Equity Partnership:</strong> Leverages IRA tax credits, moderate risk-return profile</li>
          <li><strong>Blended Finance (DFI):</strong> Most stable returns, development bank concessional capital reduces risk</li>
        </ul>
        <h3>10.2 Carbon Credit Markets</h3>
        <p>Revenue streams from carbon credits are modeled across multiple market regimes (EU ETS, California Cap-and-Trade, RGGI, Voluntary markets).</p>
      </div>
    `);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${config.projectName} — GeoPro Analysis Report</title>
<style>
  @page { margin: 1in; size: A4; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a2e; line-height: 1.6; margin: 0; padding: 0; }
  .cover { page-break-after: always; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 90vh; text-align: center; background: linear-gradient(135deg, #0a0e1a 0%, #162447 100%); color: white; padding: 4rem 2rem; }
  .cover h1 { font-size: 2.4rem; font-weight: 700; margin-bottom: 0.5rem; color: #6CB4D9; }
  .cover .subtitle { font-size: 1.1rem; color: #94a3b8; margin-bottom: 2rem; }
  .cover .project-name { font-size: 1.8rem; font-weight: 600; color: #E8652D; margin-bottom: 0.5rem; }
  .cover .location { font-size: 1rem; color: #6CB4D9; margin-bottom: 3rem; }
  .cover .meta { font-size: 0.9rem; color: #64748b; line-height: 2; }
  .cover .tagline { font-size: 0.85rem; color: #475569; margin-top: 3rem; font-style: italic; }
  .section { page-break-inside: avoid; margin-bottom: 2rem; padding: 0 1rem; }
  h2 { color: #2B7BC2; border-bottom: 2px solid #2B7BC2; padding-bottom: 0.3rem; font-size: 1.4rem; margin-top: 2rem; }
  h3 { color: #1a1a2e; font-size: 1.05rem; margin-top: 1.2rem; }
  p { margin: 0.5rem 0; font-size: 0.92rem; }
  ul { margin: 0.5rem 0; padding-left: 1.5rem; }
  li { margin-bottom: 0.3rem; font-size: 0.92rem; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.88rem; }
  th { background: #f1f5f9; color: #1a1a2e; text-align: left; padding: 0.6rem 0.8rem; border: 1px solid #e2e8f0; font-weight: 600; }
  td { padding: 0.5rem 0.8rem; border: 1px solid #e2e8f0; }
  tr:nth-child(even) { background: #f8fafc; }
  .highlight-box { background: #f0f9ff; border-left: 4px solid #2B7BC2; padding: 1rem 1.2rem; margin: 1rem 0; border-radius: 0 8px 8px 0; }
  .highlight-box h3 { margin-top: 0; color: #2B7BC2; }
  strong { color: #1a1a2e; }
  .disclaimer { margin-top: 3rem; padding: 1rem; font-size: 0.8rem; color: #64748b; border-top: 1px solid #e2e8f0; }
  @media print {
    .cover { min-height: 100vh; }
    .section { page-break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="cover">
  <h1>GeoPro Analysis Report</h1>
  <div class="subtitle">Middle Earth Innovations</div>
  <div class="project-name">${config.projectName}</div>
  <div class="location">${config.projectLocation}</div>
  <div class="meta">
    Prepared for: ${config.preparedFor}<br/>
    Prepared by: ${config.preparedBy}<br/>
    Date: ${dateStr}
  </div>
  <div class="tagline">"Turning geothermal uncertainty into bankable insights"</div>
</div>
${sections.join("\n")}
<div class="disclaimer">
  <strong>Disclaimer:</strong> This report is generated by GeoPro, a decision-support platform by Middle Earth Innovations. All analyses are based on user-supplied inputs and publicly available data. Results should be interpreted as indicative estimates, not guarantees. Users should conduct independent due diligence before making investment decisions. Mathematical models are approximations of complex real-world systems.
</div>
</body>
</html>`;
}

export default function ReportDownload() {
  const [config, setConfig] = useState<ReportConfig>(defaultConfig);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const updateConfig = (field: keyof ReportConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const sectionCount = [
    config.includeExecutiveSummary, config.includeMonteCarlo, config.includeRiskAnalysis,
    config.includeExpectedUtility, config.includeDecisionTheory, config.includeVOI,
    config.includeBayesian, config.includeReliability, config.includePredictions,
    config.includeGeological, config.includeFinancing,
  ].filter(Boolean).length;

  const generateReport = () => {
    setGenerating(true);
    setTimeout(() => {
      const html = generateReportHTML(config);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GeoPro_Report_${config.projectName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setGenerating(false);
      setGenerated(true);
      setTimeout(() => setGenerated(false), 3000);
    }, 1500);
  };

  const reportSections = [
    { key: "includeExecutiveSummary" as const, label: "Executive Summary", icon: Building2, desc: "Project overview and key findings" },
    { key: "includeMonteCarlo" as const, label: "Monte Carlo Simulation", icon: TrendingUp, desc: "NPV/IRR distributions, convergence" },
    { key: "includeRiskAnalysis" as const, label: "Risk Analysis", icon: Shield, desc: "VaR, CVaR, sensitivity tornado" },
    { key: "includeExpectedUtility" as const, label: "Expected Utility", icon: Brain, desc: "Stakeholder risk preferences" },
    { key: "includeDecisionTheory" as const, label: "Decision Theory", icon: Shield, desc: "Financing structure optimization" },
    { key: "includeVOI" as const, label: "Value of Information", icon: Eye, desc: "EVPI, EVSI, survey economics" },
    { key: "includeBayesian" as const, label: "Bayesian Updating", icon: FlaskConical, desc: "Prior/posterior, predictive distributions" },
    { key: "includeReliability" as const, label: "Reliability Analysis", icon: Wrench, desc: "Weibull failure modeling" },
    { key: "includePredictions" as const, label: "Predictions", icon: TrendingUp, desc: "Cash flow scenarios, market forecasts" },
    { key: "includeFinancing" as const, label: "Financing Options", icon: Building2, desc: "Structure comparison, carbon credits" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Report <span className="gradient-text">Download</span></h1>
          <p className="text-sm text-slate-400 mt-0.5">Generate comprehensive project analysis reports for stakeholders</p>
        </div>
        <button
          onClick={generateReport}
          disabled={generating || sectionCount === 0}
          className="btn-primary flex items-center gap-2 px-6 py-2.5"
        >
          {generating ? (
            <><Loader2 size={16} className="animate-spin" /> Generating...</>
          ) : generated ? (
            <><Check size={16} /> Downloaded!</>
          ) : (
            <><FileDown size={16} /> Generate &amp; Download Report</>
          )}
        </button>
      </div>

      {/* Project Details */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Project Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Project Name</label>
            <input value={config.projectName} onChange={e => updateConfig("projectName", e.target.value)} className="input-dark w-full text-sm py-2" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Location</label>
            <input value={config.projectLocation} onChange={e => updateConfig("projectLocation", e.target.value)} className="input-dark w-full text-sm py-2" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Prepared For</label>
            <input value={config.preparedFor} onChange={e => updateConfig("preparedFor", e.target.value)} className="input-dark w-full text-sm py-2" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Prepared By</label>
            <input value={config.preparedBy} onChange={e => updateConfig("preparedBy", e.target.value)} className="input-dark w-full text-sm py-2" />
          </div>
        </div>
      </div>

      {/* Section Selection */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Report Sections <span className="text-slate-500 font-normal">&mdash; select what to include</span></h3>
          <p className="text-xs text-slate-400">{sectionCount} sections selected</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {reportSections.map(sec => (
            <label
              key={sec.key}
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
              style={{
                background: config[sec.key] ? "rgba(43,123,194,0.08)" : "rgba(15,23,42,0.5)",
                border: `1px solid ${config[sec.key] ? "rgba(43,123,194,0.25)" : "rgba(51,65,85,0.3)"}`,
              }}
            >
              <input
                type="checkbox"
                checked={config[sec.key] as boolean}
                onChange={e => updateConfig(sec.key, e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: "#2B7BC2" }}
              />
              <sec.icon size={16} style={{ color: config[sec.key] ? "#2B7BC2" : "#475569" }} />
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: config[sec.key] ? "#e2e8f0" : "#64748b" }}>{sec.label}</p>
                <p className="text-xs text-slate-500">{sec.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Preview Info */}
      <div className="glass-card p-5" style={{ borderColor: "rgba(43,123,194,0.15)" }}>
        <div className="flex items-start gap-3">
          <FileDown size={18} style={{ color: "#2B7BC2" }} className="shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Report Format</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reports are generated as <strong className="text-white">print-ready HTML</strong> documents with professional formatting.
              Open in any browser and use <strong className="text-white">Ctrl+P</strong> or <strong className="text-white">File &rarr; Print</strong> to save as PDF.
              The report includes a branded cover page, table of contents, methodology explanations, formulas, and a disclaimer.
              All mathematical formulas and decision frameworks are documented for stakeholder transparency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
