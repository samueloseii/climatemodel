// Project Store — localStorage-backed persistence for GeoPro projects

export interface GeoProject {
  id: string;
  name: string;
  location: string;
  country: string;
  projectType: "Geothermal Power" | "Direct Use" | "Ground Source Heat Pump" | "EGS" | "Other";
  capacity_MW: number;
  status: "Draft" | "In Progress" | "Under Review" | "FID Ready" | "Completed";
  createdAt: string;
  updatedAt: string;
  capex: number;
  drillingCostPerFt: number;
  boreDepth: number;
  numWells: number;
  annualRevenue: number;
  opexPerYear: number;
  discountRate: number;
  projectLife: number;
  energyEscalation: number;
  carbonCreditsPerYear: number;
  thermalGradient: number;
  reservoirTemp: number;
  reservoirDepth: number;
  drillingSuccessProb: number;
  npv: number;
  irr: number;
  paybackYears: number;
  riskScore: number;
  notes: string;
}

const STORAGE_KEY = "geopro_projects";

function generateId(): string {
  return "proj_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

export function loadProjects(): GeoProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProjects();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return getDefaultProjects();
    return parsed;
  } catch {
    return getDefaultProjects();
  }
}

export function saveProjects(projects: GeoProject[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function addProject(project: Omit<GeoProject, "id" | "createdAt" | "updatedAt" | "npv" | "irr" | "paybackYears" | "riskScore">): GeoProject {
  const projects = loadProjects();
  const computed = computeProjectMetrics(project);
  const newProject: GeoProject = {
    ...project,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...computed,
  };
  projects.push(newProject);
  saveProjects(projects);
  return newProject;
}

export function deleteProject(id: string): boolean {
  const projects = loadProjects();
  const filtered = projects.filter(p => p.id !== id);
  if (filtered.length === projects.length) return false;
  saveProjects(filtered);
  return true;
}

export function computeProjectMetrics(p: Pick<GeoProject, "capex" | "annualRevenue" | "opexPerYear" | "discountRate" | "projectLife" | "energyEscalation" | "carbonCreditsPerYear" | "drillingSuccessProb" | "thermalGradient" | "reservoirTemp">): { npv: number; irr: number; paybackYears: number; riskScore: number } {
  const discount = p.discountRate / 100;
  const escalation = p.energyEscalation / 100;
  const cashFlows: number[] = [-p.capex];
  let npv = -p.capex;
  let cumCF = -p.capex;
  let paybackYears = p.projectLife;
  let paybackFound = false;

  for (let yr = 1; yr <= p.projectLife; yr++) {
    const revenue = p.annualRevenue * Math.pow(1 + escalation, yr - 1);
    const carbon = p.carbonCreditsPerYear;
    const opex = p.opexPerYear * Math.pow(1.02, yr - 1);
    const netCF = revenue + carbon - opex;
    cashFlows.push(netCF);
    npv += netCF / Math.pow(1 + discount, yr);
    cumCF += netCF;
    if (cumCF >= 0 && !paybackFound) {
      const prev = cumCF - netCF;
      paybackYears = prev < 0 && netCF > 0 ? (yr - 1) + Math.abs(prev) / netCF : yr;
      paybackFound = true;
    }
  }

  let lo = -0.5, hi = 5.0;
  let npvLo = 0, npvHi = 0;
  for (let i = 0; i < cashFlows.length; i++) {
    npvLo += cashFlows[i] / Math.pow(1 + lo, i);
    npvHi += cashFlows[i] / Math.pow(1 + hi, i);
  }
  if (npvLo * npvHi <= 0) {
    for (let iter = 0; iter < 200; iter++) {
      const mid = (lo + hi) / 2;
      let npvMid = 0;
      for (let i = 0; i < cashFlows.length; i++) npvMid += cashFlows[i] / Math.pow(1 + mid, i);
      if (npvMid > 0) lo = mid; else hi = mid;
      if (Math.abs(hi - lo) < 1e-8) break;
    }
  }
  const irr = ((lo + hi) / 2) * 100;

  const financialScore = Math.min(100, Math.max(0, npv > 0 ? 50 + (npv / p.capex) * 30 : 20 + (npv / p.capex) * 20));
  const geoScore = Math.min(100, (p.thermalGradient / 60) * 50 + (p.reservoirTemp / 250) * 50);
  const successScore = p.drillingSuccessProb * 100;
  const riskScore = Math.round(financialScore * 0.4 + geoScore * 0.3 + successScore * 0.3);

  return {
    npv: Math.round(npv),
    irr: Math.round(irr * 10) / 10,
    paybackYears: Math.round(paybackYears * 10) / 10,
    riskScore: Math.min(100, Math.max(0, riskScore)),
  };
}

function getDefaultProjects(): GeoProject[] {
  const defaults: GeoProject[] = [
    {
      id: "proj_default_1", name: "Olkaria Phase V", location: "Naivasha, Kenya", country: "Kenya",
      projectType: "Geothermal Power", capacity_MW: 140, status: "In Progress",
      createdAt: "2025-09-15T00:00:00Z", updatedAt: "2026-02-10T00:00:00Z",
      capex: 420000000, drillingCostPerFt: 85, boreDepth: 8000, numWells: 24,
      annualRevenue: 58000000, opexPerYear: 12000000, discountRate: 8, projectLife: 30,
      energyEscalation: 2.5, carbonCreditsPerYear: 3200000,
      thermalGradient: 45, reservoirTemp: 320, reservoirDepth: 2500, drillingSuccessProb: 0.82,
      npv: 0, irr: 0, paybackYears: 0, riskScore: 0,
      notes: "KenGen expansion project. Phase IV operational since 2015.",
    },
    {
      id: "proj_default_2", name: "Salton Sea Unit 7", location: "Imperial County, CA", country: "USA",
      projectType: "Geothermal Power", capacity_MW: 60, status: "Under Review",
      createdAt: "2025-11-01T00:00:00Z", updatedAt: "2026-01-28T00:00:00Z",
      capex: 180000000, drillingCostPerFt: 120, boreDepth: 6000, numWells: 12,
      annualRevenue: 32000000, opexPerYear: 7500000, discountRate: 7, projectLife: 25,
      energyEscalation: 3, carbonCreditsPerYear: 1800000,
      thermalGradient: 55, reservoirTemp: 340, reservoirDepth: 1800, drillingSuccessProb: 0.88,
      npv: 0, irr: 0, paybackYears: 0, riskScore: 0,
      notes: "Lithium co-extraction opportunity. Strong PPA interest from CAISO.",
    },
    {
      id: "proj_default_3", name: "Cerro Pabellon Expansion", location: "Antofagasta, Chile", country: "Chile",
      projectType: "Geothermal Power", capacity_MW: 80, status: "Draft",
      createdAt: "2026-01-05T00:00:00Z", updatedAt: "2026-02-15T00:00:00Z",
      capex: 310000000, drillingCostPerFt: 95, boreDepth: 7500, numWells: 18,
      annualRevenue: 42000000, opexPerYear: 9800000, discountRate: 9, projectLife: 25,
      energyEscalation: 2, carbonCreditsPerYear: 2400000,
      thermalGradient: 38, reservoirTemp: 260, reservoirDepth: 3200, drillingSuccessProb: 0.72,
      npv: 0, irr: 0, paybackYears: 0, riskScore: 0,
      notes: "Highest-altitude geothermal plant in the world.",
    },
    {
      id: "proj_default_4", name: "Reykjanes Deep Drilling", location: "Reykjanes, Iceland", country: "Iceland",
      projectType: "EGS", capacity_MW: 45, status: "FID Ready",
      createdAt: "2025-08-20T00:00:00Z", updatedAt: "2026-02-18T00:00:00Z",
      capex: 195000000, drillingCostPerFt: 150, boreDepth: 15000, numWells: 6,
      annualRevenue: 28000000, opexPerYear: 5200000, discountRate: 6, projectLife: 30,
      energyEscalation: 2, carbonCreditsPerYear: 1200000,
      thermalGradient: 80, reservoirTemp: 450, reservoirDepth: 4500, drillingSuccessProb: 0.65,
      npv: 0, irr: 0, paybackYears: 0, riskScore: 0,
      notes: "IDDP-2 follow-on. Supercritical fluid target at 4.5km depth.",
    },
    {
      id: "proj_default_5", name: "Tulu Moye Phase I", location: "Oromia, Ethiopia", country: "Ethiopia",
      projectType: "Geothermal Power", capacity_MW: 50, status: "In Progress",
      createdAt: "2025-06-10T00:00:00Z", updatedAt: "2026-01-15T00:00:00Z",
      capex: 240000000, drillingCostPerFt: 90, boreDepth: 7000, numWells: 15,
      annualRevenue: 35000000, opexPerYear: 8000000, discountRate: 10, projectLife: 25,
      energyEscalation: 3, carbonCreditsPerYear: 2000000,
      thermalGradient: 42, reservoirTemp: 280, reservoirDepth: 2800, drillingSuccessProb: 0.75,
      npv: 0, irr: 0, paybackYears: 0, riskScore: 0,
      notes: "First independent power project in Ethiopian geothermal. 20yr PPA signed.",
    },
  ];
  for (const p of defaults) {
    const metrics = computeProjectMetrics(p);
    Object.assign(p, metrics);
  }
  saveProjects(defaults);
  return defaults;
}
