// AI Insights Engine — rule-based intelligent recommendations for geothermal projects

export interface AIInsight {
  id: string;
  type: "recommendation" | "warning" | "opportunity" | "risk";
  title: string;
  detail: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  category: string;
}

export interface FinancingOption {
  name: string;
  type: "Senior Debt" | "Mezzanine" | "Equity" | "Blended" | "Tax Equity" | "Concessional" | "Green Bond";
  interestRate: number;
  tenorYears: number;
  debtRatio: number;
  description: string;
  suitability: number;
  pros: string[];
  cons: string[];
}

export interface FinancingAnalysis {
  options: FinancingOption[];
  recommended: string;
  lcoe: number;
  dscr: number;
  equityIRR: number;
  projectIRR: number;
  roiPercent: number;
  paybackYears: number;
  isViable: boolean;
  viabilityReason: string;
}

function fmt(v: number): string {
  if (Math.abs(v) >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  if (Math.abs(v) >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
  if (Math.abs(v) >= 1e3) return "$" + (v / 1e3).toFixed(0) + "K";
  return "$" + v.toFixed(0);
}

export function computeLCOE(capex: number, opexPerYear: number, capacityMW: number, capacityFactor: number, projectLife: number, discountRate: number): number {
  const annualGen = capacityMW * capacityFactor * 8760;
  const dr = discountRate / 100;
  let totalCostPV = capex;
  let totalGenPV = 0;
  for (let yr = 1; yr <= projectLife; yr++) {
    totalCostPV += (opexPerYear * Math.pow(1.02, yr - 1)) / Math.pow(1 + dr, yr);
    totalGenPV += annualGen / Math.pow(1 + dr, yr);
  }
  return totalGenPV > 0 ? totalCostPV / totalGenPV : 0;
}

export function computeDSCR(annualRevenue: number, opexPerYear: number, annualDebtService: number): number {
  const noi = annualRevenue - opexPerYear;
  return annualDebtService > 0 ? noi / annualDebtService : 99;
}

export function computeAnnualDebtService(principal: number, rate: number, tenorYears: number): number {
  if (rate <= 0 || tenorYears <= 0) return principal / Math.max(tenorYears, 1);
  const r = rate / 100;
  return principal * (r * Math.pow(1 + r, tenorYears)) / (Math.pow(1 + r, tenorYears) - 1);
}

export function computeEquityIRR(capex: number, debtRatio: number, interestRate: number, tenorYears: number, annualRevenue: number, opexPerYear: number, escalation: number, projectLife: number, carbonCredits: number): number {
  const equity = capex * (1 - debtRatio);
  if (equity <= 0) return 0;
  const debt = capex * debtRatio;
  const ds = computeAnnualDebtService(debt, interestRate, tenorYears);
  const cfs: number[] = [-equity];
  for (let yr = 1; yr <= projectLife; yr++) {
    const rev = annualRevenue * Math.pow(1 + escalation / 100, yr - 1);
    const opex = opexPerYear * Math.pow(1.02, yr - 1);
    cfs.push(rev + carbonCredits - opex - (yr <= tenorYears ? ds : 0));
  }
  let lo = -0.5, hi = 5.0;
  let nLo = 0, nHi = 0;
  for (let i = 0; i < cfs.length; i++) { nLo += cfs[i] / Math.pow(1 + lo, i); nHi += cfs[i] / Math.pow(1 + hi, i); }
  if (nLo * nHi > 0) return nLo > 0 ? hi * 100 : lo * 100;
  for (let it = 0; it < 200; it++) {
    const mid = (lo + hi) / 2;
    let n = 0;
    for (let i = 0; i < cfs.length; i++) n += cfs[i] / Math.pow(1 + mid, i);
    if (n > 0) lo = mid; else hi = mid;
    if (Math.abs(hi - lo) < 1e-8) break;
  }
  return ((lo + hi) / 2) * 100;
}

export function projectCarbonRevenue(basePrice: number, annualCredits: number, escalation: number, years: number): { year: number; price: number; revenue: number; cumulative: number }[] {
  const data: { year: number; price: number; revenue: number; cumulative: number }[] = [];
  let cum = 0;
  for (let yr = 1; yr <= years; yr++) {
    const price = basePrice * Math.pow(1 + escalation / 100, yr - 1);
    const rev = price * annualCredits;
    cum += rev;
    data.push({ year: yr, price: Math.round(price * 100) / 100, revenue: Math.round(rev), cumulative: Math.round(cum) });
  }
  return data;
}

function bisectionIRR(cashFlows: number[]): number {
  let lo = -0.5, hi = 5.0;
  let nLo = 0, nHi = 0;
  for (let i = 0; i < cashFlows.length; i++) { nLo += cashFlows[i] / Math.pow(1 + lo, i); nHi += cashFlows[i] / Math.pow(1 + hi, i); }
  if (nLo * nHi > 0) return nLo > 0 ? hi * 100 : lo * 100;
  for (let it = 0; it < 200; it++) {
    const mid = (lo + hi) / 2;
    let n = 0;
    for (let i = 0; i < cashFlows.length; i++) n += cashFlows[i] / Math.pow(1 + mid, i);
    if (n > 0) lo = mid; else hi = mid;
    if (Math.abs(hi - lo) < 1e-8) break;
  }
  return ((lo + hi) / 2) * 100;
}

export function analyzeFinancing(
  capex: number, annualRevenue: number, opexPerYear: number, capacityMW: number,
  discountRate: number, projectLife: number, escalation: number, carbonCredits: number,
  riskScore: number, drillingSuccessProb: number
): FinancingAnalysis {
  const cf = 0.85;
  const lcoe = computeLCOE(capex, opexPerYear, capacityMW, cf, projectLife, discountRate);

  const options: FinancingOption[] = [
    { name: "Senior Project Finance", type: "Senior Debt", interestRate: riskScore >= 70 ? 5.5 : riskScore >= 50 ? 7.0 : 9.5, tenorYears: Math.min(projectLife - 5, riskScore >= 70 ? 18 : 12), debtRatio: riskScore >= 70 ? 0.70 : riskScore >= 50 ? 0.60 : 0.45, description: "Traditional project finance with fixed-rate senior debt secured against project cash flows", suitability: 0, pros: [], cons: [] },
    { name: "Mezzanine + Senior", type: "Mezzanine", interestRate: riskScore >= 70 ? 8.0 : 10.5, tenorYears: Math.min(projectLife - 5, 10), debtRatio: riskScore >= 70 ? 0.80 : 0.70, description: "Subordinated debt layer above senior to increase total leverage", suitability: 0, pros: [], cons: [] },
    { name: "Tax Equity Partnership", type: "Tax Equity", interestRate: 0, tenorYears: 10, debtRatio: 0.40, description: "US ITC/PTC monetization via tax equity investor flip structure", suitability: 0, pros: [], cons: [] },
    { name: "DFI Concessional Loan", type: "Concessional", interestRate: riskScore >= 60 ? 3.0 : 4.5, tenorYears: 20, debtRatio: 0.65, description: "Below-market rate from development finance institutions (IFC, AfDB, KfW)", suitability: 0, pros: [], cons: [] },
    { name: "Green Bond Issuance", type: "Green Bond", interestRate: riskScore >= 70 ? 4.5 : 6.0, tenorYears: 15, debtRatio: 0.60, description: "Certified green bond for institutional investors with ESG mandates", suitability: 0, pros: [], cons: [] },
    { name: "Full Equity", type: "Equity", interestRate: 0, tenorYears: 0, debtRatio: 0, description: "100% equity funding with no debt service, maximum flexibility", suitability: 0, pros: [], cons: [] },
    { name: "Blended Finance (DFI + Commercial)", type: "Blended", interestRate: riskScore >= 60 ? 4.5 : 6.0, tenorYears: 18, debtRatio: 0.70, description: "Concessional tranche de-risks commercial tranche, lowering blended cost", suitability: 0, pros: [], cons: [] },
  ];

  for (const opt of options) {
    const eqIRR = computeEquityIRR(capex, opt.debtRatio, opt.interestRate, opt.tenorYears, annualRevenue, opexPerYear, escalation, projectLife, carbonCredits);
    const debtAmt = capex * opt.debtRatio;
    const annDS = opt.debtRatio > 0 ? computeAnnualDebtService(debtAmt, opt.interestRate, opt.tenorYears) : 0;
    const dscr = computeDSCR(annualRevenue, opexPerYear, annDS);
    let score = 50;
    if (eqIRR > 15) score += 15; else if (eqIRR > 10) score += 8;
    if (dscr > 1.5) score += 15; else if (dscr > 1.2) score += 8; else if (dscr < 1.0) score -= 20;
    if (riskScore >= 70 && opt.debtRatio >= 0.6) score += 10;
    if (riskScore < 50 && opt.debtRatio > 0.6) score -= 15;
    if (opt.type === "Concessional" && riskScore < 60) score += 15;
    if (opt.type === "Tax Equity") score += (riskScore >= 60 ? 10 : -5);
    if (opt.type === "Blended") score += 8;
    if (opt.type === "Equity" && riskScore < 50) score += 10;
    opt.suitability = Math.min(100, Math.max(0, score));
    opt.pros = [];
    opt.cons = [];
    if (opt.debtRatio > 0) {
      opt.pros.push("Leverage of " + (opt.debtRatio * 100).toFixed(0) + "% amplifies equity returns");
      if (dscr >= 1.3) opt.pros.push("DSCR of " + dscr.toFixed(2) + "x provides lender comfort");
      if (dscr < 1.2) opt.cons.push("DSCR of " + dscr.toFixed(2) + "x may be too tight");
      opt.cons.push("Debt service of " + fmt(annDS) + "/yr constrains cash flow");
    } else {
      opt.pros.push("No debt service \u2014 full cash flow flexibility");
      opt.cons.push("No leverage \u2014 lower returns on equity");
    }
    if (eqIRR > 12) opt.pros.push("Strong equity IRR of " + eqIRR.toFixed(1) + "%");
    if (opt.interestRate > 0 && opt.interestRate < 5) opt.pros.push("Low cost of debt at " + opt.interestRate + "%");
  }

  options.sort((a, b) => b.suitability - a.suitability);
  const best = options[0];
  const bestDS = best.debtRatio > 0 ? computeAnnualDebtService(capex * best.debtRatio, best.interestRate, best.tenorYears) : 0;
  const dscr = computeDSCR(annualRevenue, opexPerYear, bestDS);
  const equityIRR = computeEquityIRR(capex, best.debtRatio, best.interestRate, best.tenorYears, annualRevenue, opexPerYear, escalation, projectLife, carbonCredits);

  const projCFs: number[] = [-capex];
  for (let yr = 1; yr <= projectLife; yr++) projCFs.push(annualRevenue * Math.pow(1 + escalation / 100, yr - 1) + carbonCredits - opexPerYear * Math.pow(1.02, yr - 1));
  const projectIRR = bisectionIRR(projCFs);

  const totalRev = Array.from({ length: projectLife }, (_, i) => annualRevenue * Math.pow(1 + escalation / 100, i) + carbonCredits).reduce((s, v) => s + v, 0);
  const totalCost = capex + Array.from({ length: projectLife }, (_, i) => opexPerYear * Math.pow(1.02, i)).reduce((s, v) => s + v, 0);
  const roiPercent = capex > 0 ? ((totalRev - totalCost) / capex) * 100 : 0;

  let cumCF = -capex;
  let paybackYears = projectLife;
  for (let yr = 1; yr <= projectLife; yr++) {
    cumCF += annualRevenue * Math.pow(1 + escalation / 100, yr - 1) + carbonCredits - opexPerYear * Math.pow(1.02, yr - 1);
    if (cumCF >= 0) { paybackYears = yr; break; }
  }

  const isViable = projectIRR > discountRate && dscr > 1.1 && drillingSuccessProb > 0.5;
  let viabilityReason = "";
  if (isViable) {
    viabilityReason = "Project IRR of " + projectIRR.toFixed(1) + "% exceeds hurdle rate of " + discountRate + "%. DSCR of " + dscr.toFixed(2) + "x and " + (drillingSuccessProb * 100).toFixed(0) + "% drilling success probability indicate acceptable risk-return profile.";
  } else {
    const reasons: string[] = [];
    if (projectIRR <= discountRate) reasons.push("Project IRR (" + projectIRR.toFixed(1) + "%) does not exceed hurdle rate (" + discountRate + "%)");
    if (dscr <= 1.1) reasons.push("DSCR (" + dscr.toFixed(2) + "x) below minimum lender threshold of 1.1x");
    if (drillingSuccessProb <= 0.5) reasons.push("Drilling success probability (" + (drillingSuccessProb * 100).toFixed(0) + "%) too low");
    viabilityReason = reasons.join(". ") + ".";
  }

  return { options, recommended: best.name, lcoe: Math.round(lcoe * 100) / 100, dscr: Math.round(dscr * 100) / 100, equityIRR: Math.round(equityIRR * 10) / 10, projectIRR: Math.round(projectIRR * 10) / 10, roiPercent: Math.round(roiPercent * 10) / 10, paybackYears, isViable, viabilityReason };
}

export function generateProjectInsights(
  capex: number, annualRevenue: number, opexPerYear: number, capacityMW: number,
  discountRate: number, projectLife: number, thermalGradient: number, reservoirTemp: number,
  drillingSuccessProb: number, riskScore: number, npv: number, irr: number, paybackYears: number
): AIInsight[] {
  const insights: AIInsight[] = [];
  if (npv > 0 && irr > discountRate) {
    insights.push({ id: "viable", type: "recommendation", title: "Project is Financially Viable", detail: "With NPV of " + fmt(npv) + " and IRR of " + irr.toFixed(1) + "% (above " + discountRate + "% hurdle), this project generates positive risk-adjusted returns. Recommend proceeding to detailed feasibility and FID preparation.", confidence: Math.min(95, 70 + riskScore * 0.25), impact: "high", category: "Financial" });
  } else {
    insights.push({ id: "not-viable", type: "warning", title: "Project Does Not Meet Return Threshold", detail: "NPV is " + fmt(npv) + " and IRR is " + irr.toFixed(1) + "% vs " + discountRate + "% hurdle rate. Consider: (1) reducing CapEx through phased development, (2) securing concessional financing, (3) increasing capacity factor, or (4) negotiating higher PPA prices.", confidence: 85, impact: "high", category: "Financial" });
  }
  if (thermalGradient >= 50) {
    insights.push({ id: "high-enthalpy", type: "opportunity", title: "High-Enthalpy Resource Detected", detail: "Thermal gradient of " + thermalGradient + " \u00B0C/km indicates a high-enthalpy system suitable for flash/dry steam generation with capacity factors >90% and LCOE below $50/MWh.", confidence: 88, impact: "high", category: "Geological" });
  } else if (thermalGradient < 25) {
    insights.push({ id: "low-enthalpy", type: "risk", title: "Low-Enthalpy Resource May Limit Options", detail: "Thermal gradient of " + thermalGradient + " \u00B0C/km limits technology to binary cycle or direct-use. Expected capacity factor 70-80%.", confidence: 82, impact: "medium", category: "Geological" });
  }
  if (drillingSuccessProb < 0.7) {
    insights.push({ id: "drilling-risk", type: "risk", title: "Elevated Drilling Risk", detail: "Drilling success probability of " + (drillingSuccessProb * 100).toFixed(0) + "% is below the industry benchmark of 70%. Recommend additional MT/gravity surveys and slim-hole exploration wells.", confidence: 80, impact: "high", category: "Risk" });
  }
  const annualCO2 = capacityMW * 0.85 * 8760 * 0.0005;
  const carbonRev = annualCO2 * 30;
  if (carbonRev > annualRevenue * 0.05) {
    insights.push({ id: "carbon", type: "opportunity", title: "Significant Carbon Revenue Potential", detail: "Estimated " + Math.round(annualCO2).toLocaleString() + " tCO2/yr avoided = " + fmt(carbonRev) + "/yr at $30/tCO2. Consider Gold Standard or VCS certification.", confidence: 72, impact: "medium", category: "Revenue" });
  }
  if (riskScore >= 70 && capex > 100e6) {
    insights.push({ id: "finance-opt", type: "recommendation", title: "Optimize Capital Structure with Leverage", detail: "Strong risk score (" + riskScore + "/100) supports 60-70% leverage. Senior project finance at ~5.5% with 18yr tenor could boost equity IRR significantly.", confidence: 78, impact: "high", category: "Financing" });
  }
  if (paybackYears > 12) {
    insights.push({ id: "payback-long", type: "warning", title: "Extended Payback Period", detail: paybackYears + "-year payback exceeds typical investor appetite of 8-12 years. Consider IRA Section 48 ITC (30%), accelerated depreciation, or higher PPA prices.", confidence: 75, impact: "medium", category: "Financial" });
  }
  if (projectLife > 25) {
    insights.push({ id: "long-life", type: "opportunity", title: "Extended Project Life Enhances Returns", detail: "Project life of " + projectLife + " years captures more cumulative revenue. Consider 20+ year PPA to lock in returns beyond typical 15-year financing tenor.", confidence: 72, impact: "medium", category: "Financial" });
  }
  if (capacityMW < 30 && thermalGradient > 35 && reservoirTemp > 200) {
    insights.push({ id: "scale-up", type: "opportunity", title: "Resource Supports Larger Development", detail: "Reservoir (" + reservoirTemp + " \u00B0C, " + thermalGradient + " \u00B0C/km) could support " + Math.round(capacityMW * 2.5) + "+ MW. Phased development may reduce per-MW CapEx 15-25%.", confidence: 70, impact: "medium", category: "Development" });
  }
  const noi = annualRevenue - opexPerYear;
  const simDS = capex * 0.65 * 0.06 / (1 - Math.pow(1.06, -15));
  const approxDSCR = noi / simDS;
  if (approxDSCR < 1.3) {
    insights.push({ id: "dscr-tight", type: "warning", title: "Tight Debt Service Coverage", detail: "Estimated DSCR of " + approxDSCR.toFixed(2) + "x is below typical lender minimum of 1.3x. Consider increasing equity, extending tenor, or securing revenue guarantees.", confidence: 75, impact: "high", category: "Financing" });
  }
  return insights.sort((a, b) => {
    const o: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return (o[a.impact] || 0) - (o[b.impact] || 0) || b.confidence - a.confidence;
  });
}
