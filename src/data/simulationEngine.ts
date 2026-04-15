// Monte Carlo Simulation Engine
export interface SimulationParams {
  drillingCostPerFt: { mean: number; std: number };
  boreDepth: { mean: number; std: number };
  numBores: number;
  heatPumpCost: { mean: number; std: number };
  distributionCost: { mean: number; std: number };
  laborCost: { mean: number; std: number };
  annualEnergyCost: { mean: number; std: number };
  savingsPercent: { mean: number; std: number };
  energyEscalation: { mean: number; std: number };
  discountRate: { mean: number; std: number };
  projectLifeYears: number;
  itcRate: number;
  carbonCreditsPerYear: { mean: number; std: number };
}

export interface SimulationResult {
  npv: number;
  irr: number;
  paybackYears: number;
  totalCost: number;
  annualSavings: number;
  lifetimeSavings: number;
  carbonRevenue: number;
  netCost: number;
}

export const defaultParams: SimulationParams = {
  drillingCostPerFt: { mean: 45, std: 8 },
  boreDepth: { mean: 300, std: 40 },
  numBores: 6,
  heatPumpCost: { mean: 35000, std: 5000 },
  distributionCost: { mean: 15000, std: 3000 },
  laborCost: { mean: 20000, std: 4000 },
  annualEnergyCost: { mean: 18000, std: 3000 },
  savingsPercent: { mean: 55, std: 8 },
  energyEscalation: { mean: 3.5, std: 1.2 },
  discountRate: { mean: 6, std: 1.5 },
  projectLifeYears: 25,
  itcRate: 0.30,
  carbonCreditsPerYear: { mean: 4500, std: 1500 },
};

function boxMullerRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function sampleNormal(mean: number, std: number): number {
  return mean + std * boxMullerRandom();
}

function samplePositiveNormal(mean: number, std: number): number {
  return Math.max(0.01, sampleNormal(mean, std));
}

export function runSingleSimulation(params: SimulationParams): SimulationResult {
  const drillingCost = samplePositiveNormal(params.drillingCostPerFt.mean, params.drillingCostPerFt.std)
    * samplePositiveNormal(params.boreDepth.mean, params.boreDepth.std)
    * params.numBores;
  const heatPumpCost = samplePositiveNormal(params.heatPumpCost.mean, params.heatPumpCost.std);
  const distCost = samplePositiveNormal(params.distributionCost.mean, params.distributionCost.std);
  const labCost = samplePositiveNormal(params.laborCost.mean, params.laborCost.std);

  const totalCost = drillingCost + heatPumpCost + distCost + labCost;
  const itcCredit = totalCost * params.itcRate;
  const netCost = totalCost - itcCredit;

  const annualEnergy = samplePositiveNormal(params.annualEnergyCost.mean, params.annualEnergyCost.std);
  const savingsPct = Math.min(90, Math.max(10, sampleNormal(params.savingsPercent.mean, params.savingsPercent.std))) / 100;
  const escalation = sampleNormal(params.energyEscalation.mean, params.energyEscalation.std) / 100;
  const discount = Math.max(0.01, sampleNormal(params.discountRate.mean, params.discountRate.std) / 100);
  const carbonRev = samplePositiveNormal(params.carbonCreditsPerYear.mean, params.carbonCreditsPerYear.std);

  let npv = -netCost;
  let lifetimeSavings = 0;
  let lifetimeCarbon = 0;
  let cumulativeCashFlow = -netCost;
  let paybackYears = params.projectLifeYears;
  let paybackFound = false;

  const cashFlows: number[] = [-netCost];

  for (let year = 1; year <= params.projectLifeYears; year++) {
    const energySaving = annualEnergy * savingsPct * Math.pow(1 + escalation, year - 1);
    const totalAnnualBenefit = energySaving + carbonRev;
    const maintenanceCost = 500 + year * 50;
    const netAnnualCF = totalAnnualBenefit - maintenanceCost;

    cashFlows.push(netAnnualCF);
    npv += netAnnualCF / Math.pow(1 + discount, year);
    lifetimeSavings += energySaving;
    lifetimeCarbon += carbonRev;
    cumulativeCashFlow += netAnnualCF;

    if (cumulativeCashFlow >= 0 && !paybackFound) {
      // Linear interpolation: previous cumulative was negative, current is >= 0
      // previousCumulative = cumulativeCashFlow - netAnnualCF (value before this year's CF)
      const previousCumulative = cumulativeCashFlow - netAnnualCF;
      if (previousCumulative < 0 && netAnnualCF > 0) {
        paybackYears = (year - 1) + Math.abs(previousCumulative) / netAnnualCF;
      } else {
        paybackYears = year;
      }
      paybackFound = true;
    }
  }

  const irr = calculateIRR(cashFlows);

  return {
    npv,
    irr: irr * 100,
    paybackYears,
    totalCost,
    annualSavings: annualEnergy * savingsPct,
    lifetimeSavings,
    carbonRevenue: lifetimeCarbon,
    netCost,
  };
}

function calculateIRR(cashFlows: number[]): number {
  // Bisection method: find rate r such that NPV(r) = 0
  // Use tighter tolerance and more iterations for accuracy
  let low = -0.5;
  let high = 5.0;
  
  // Verify that a root exists in the interval
  let npvLow = 0, npvHigh = 0;
  for (let i = 0; i < cashFlows.length; i++) {
    npvLow += cashFlows[i] / Math.pow(1 + low, i);
    npvHigh += cashFlows[i] / Math.pow(1 + high, i);
  }
  // If both same sign, return boundary
  if (npvLow * npvHigh > 0) return npvLow > 0 ? high : low;

  for (let iter = 0; iter < 200; iter++) {
    const mid = (low + high) / 2;
    let npvAtMid = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      npvAtMid += cashFlows[i] / Math.pow(1 + mid, i);
    }
    if (npvAtMid > 0) low = mid;
    else high = mid;
    if (Math.abs(high - low) < 1e-8) break;
  }
  return (low + high) / 2;
}

export function runMonteCarloSimulation(params: SimulationParams, numTrials: number = 5000): SimulationResult[] {
  const results: SimulationResult[] = [];
  for (let i = 0; i < numTrials; i++) {
    results.push(runSingleSimulation(params));
  }
  return results;
}

export function computePercentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * p);
  return sorted[Math.min(idx, sorted.length - 1)];
}

export function computeMean(values: number[]): number {
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function computeStd(values: number[]): number {
  const mean = computeMean(values);
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function computeVaR(values: number[], confidence: number = 0.95): number {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * (1 - confidence));
  return sorted[Math.max(0, idx)];
}

export function computeCVaR(values: number[], confidence: number = 0.95): number {
  const var_val = computeVaR(values, confidence);
  const tailValues = values.filter(v => v <= var_val);
  if (tailValues.length === 0) return var_val;
  return computeMean(tailValues);
}

export function buildHistogram(values: number[], numBins: number = 40): { bin: string; count: number; range: [number, number] }[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / numBins;
  const bins: { bin: string; count: number; range: [number, number] }[] = [];

  for (let i = 0; i < numBins; i++) {
    const lo = min + i * binWidth;
    const hi = lo + binWidth;
    const count = values.filter(v => v >= lo && (i === numBins - 1 ? v <= hi : v < hi)).length;
    bins.push({
      bin: `$${(lo / 1000).toFixed(0)}k`,
      count,
      range: [lo, hi],
    });
  }
  return bins;
}

// Sensitivity analysis
export interface SensitivityResult {
  variable: string;
  lowValue: number;
  baseValue: number;
  highValue: number;
  lowNPV: number;
  baseNPV: number;
  highNPV: number;
  impact: number;
}

export function runSensitivityAnalysis(params: SimulationParams): SensitivityResult[] {
  const baseResult = runDeterministicNPV(params);

  const variables: { name: string; key: keyof SimulationParams; subkey: "mean" }[] = [
    { name: "Drilling Cost ($/ft)", key: "drillingCostPerFt", subkey: "mean" },
    { name: "Bore Depth (ft)", key: "boreDepth", subkey: "mean" },
    { name: "Heat Pump Cost ($)", key: "heatPumpCost", subkey: "mean" },
    { name: "Annual Energy Cost ($)", key: "annualEnergyCost", subkey: "mean" },
    { name: "Savings %", key: "savingsPercent", subkey: "mean" },
    { name: "Energy Escalation %", key: "energyEscalation", subkey: "mean" },
    { name: "Discount Rate %", key: "discountRate", subkey: "mean" },
    { name: "Carbon Credits ($/yr)", key: "carbonCreditsPerYear", subkey: "mean" },
  ];

  return variables.map(v => {
    const paramVal = params[v.key];
    if (typeof paramVal === "object" && "mean" in paramVal) {
      const baseVal = paramVal.mean;
      const lowVal = baseVal * 0.75;
      const highVal = baseVal * 1.25;

      const lowParams = { ...params, [v.key]: { ...paramVal, mean: lowVal } };
      const highParams = { ...params, [v.key]: { ...paramVal, mean: highVal } };

      const lowNPV = runDeterministicNPV(lowParams);
      const highNPV = runDeterministicNPV(highParams);

      return {
        variable: v.name,
        lowValue: lowVal,
        baseValue: baseVal,
        highValue: highVal,
        lowNPV,
        baseNPV: baseResult,
        highNPV,
        impact: Math.abs(highNPV - lowNPV),
      };
    }
    return {
      variable: v.name,
      lowValue: 0, baseValue: 0, highValue: 0,
      lowNPV: baseResult, baseNPV: baseResult, highNPV: baseResult,
      impact: 0,
    };
  }).sort((a, b) => b.impact - a.impact);
}

function runDeterministicNPV(params: SimulationParams): number {
  const drillingCost = params.drillingCostPerFt.mean * params.boreDepth.mean * params.numBores;
  const totalCost = drillingCost + params.heatPumpCost.mean + params.distributionCost.mean + params.laborCost.mean;
  const netCost = totalCost * (1 - params.itcRate);
  const annualSavings = params.annualEnergyCost.mean * (params.savingsPercent.mean / 100);
  const escalation = params.energyEscalation.mean / 100;
  const discount = params.discountRate.mean / 100;

  let npv = -netCost;
  for (let year = 1; year <= params.projectLifeYears; year++) {
    const saving = annualSavings * Math.pow(1 + escalation, year - 1);
    const carbon = params.carbonCreditsPerYear.mean;
    const maintenance = 500 + year * 50;
    npv += (saving + carbon - maintenance) / Math.pow(1 + discount, year);
  }
  return npv;
}

// Expected Utility
export interface UtilityScenario {
  name: string;
  probability: number;
  npv: number;
  description: string;
}

export function computeExpectedUtility(scenarios: UtilityScenario[], riskAversion: number): {
  expectedValue: number;
  expectedUtility: number;
  certaintyEquivalent: number;
  riskPremium: number;
} {
  // E[V] = sum_i p_i * NPV_i
  const expectedValue = scenarios.reduce((s, sc) => s + sc.probability * sc.npv, 0);
  
  // Exponential utility: U(x) = (1 - exp(-gamma * x / scale)) / gamma
  // where gamma is risk aversion and scale normalizes to prevent overflow
  const scale = 1000000;
  const utilities = scenarios.map(sc => ({
    ...sc,
    utility: riskAversion === 0
      ? sc.npv
      : (1 - Math.exp(-riskAversion * sc.npv / scale)) / riskAversion,
  }));
  
  // E[U] = sum_i p_i * U(NPV_i)
  const expectedUtility = utilities.reduce((s, u) => s + u.probability * u.utility, 0);
  
  // Certainty Equivalent: CE = U^{-1}(E[U])
  // For exponential: CE = -ln(1 - gamma * E[U]) * scale / gamma
  // Guard against domain error: 1 - gamma * EU must be > 0
  let certaintyEquivalent: number;
  if (riskAversion === 0) {
    certaintyEquivalent = expectedValue;
  } else {
    const arg = 1 - riskAversion * expectedUtility;
    if (arg <= 0) {
      // Utility saturated — CE approaches negative infinity; clamp to large negative
      certaintyEquivalent = -scale * 10;
    } else {
      certaintyEquivalent = -Math.log(arg) * scale / riskAversion;
    }
  }
  
  // Risk Premium: RP = E[V] - CE (positive means risk-averse)
  const riskPremium = expectedValue - certaintyEquivalent;

  return { expectedValue, expectedUtility, certaintyEquivalent, riskPremium };
}

// Minimax / Decision Theory
export interface DecisionOption {
  name: string;
  outcomes: { state: string; value: number }[];
}

export function minimaxRegret(options: DecisionOption[]): {
  regretMatrix: { option: string; regrets: { state: string; regret: number }[]; maxRegret: number }[];
  bestOption: string;
} {
  const states = options[0].outcomes.map(o => o.state);
  const bestPerState = states.map((_state, i) =>
    Math.max(...options.map(o => o.outcomes[i].value))
  );

  const regretMatrix = options.map(option => {
    const regrets = option.outcomes.map((outcome, i) => ({
      state: outcome.state,
      regret: bestPerState[i] - outcome.value,
    }));
    return {
      option: option.name,
      regrets,
      maxRegret: Math.max(...regrets.map(r => r.regret)),
    };
  });

  const best = regretMatrix.reduce((min, r) => r.maxRegret < min.maxRegret ? r : min);
  return { regretMatrix, bestOption: best.option };
}

export function maximin(options: DecisionOption[]): { option: string; minValue: number; bestOption: string } [] {
  const results = options.map(o => ({
    option: o.name,
    minValue: Math.min(...o.outcomes.map(oc => oc.value)),
    bestOption: "",
  }));
  const best = results.reduce((max, r) => r.minValue > max.minValue ? r : max);
  return results.map(r => ({ ...r, bestOption: best.option }));
}

export function maximax(options: DecisionOption[]): { option: string; maxValue: number; bestOption: string }[] {
  const results = options.map(o => ({
    option: o.name,
    maxValue: Math.max(...o.outcomes.map(oc => oc.value)),
    bestOption: "",
  }));
  const best = results.reduce((max, r) => r.maxValue > max.maxValue ? r : max);
  return results.map(r => ({ ...r, bestOption: best.option }));
}

export function hurwiczCriterion(options: DecisionOption[], alpha: number): { option: string; value: number; bestOption: string }[] {
  const results = options.map(o => {
    const min = Math.min(...o.outcomes.map(oc => oc.value));
    const max = Math.max(...o.outcomes.map(oc => oc.value));
    return { option: o.name, value: alpha * max + (1 - alpha) * min, bestOption: "" };
  });
  const best = results.reduce((max, r) => r.value > max.value ? r : max);
  return results.map(r => ({ ...r, bestOption: best.option }));
}
