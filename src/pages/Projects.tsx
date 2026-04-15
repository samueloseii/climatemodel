import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, AlertTriangle, CheckCircle, XCircle, Brain, ChevronDown, ChevronUp, MapPin, Zap, Search, Filter } from "lucide-react";
import { loadProjects, deleteProject, type GeoProject } from "../data/projectStore";
import { generateProjectInsights, analyzeFinancing } from "../data/aiInsights";

function fmt(v: number): string {
  if (Math.abs(v) >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  if (Math.abs(v) >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
  if (Math.abs(v) >= 1e3) return "$" + (v / 1e3).toFixed(0) + "K";
  return "$" + v.toFixed(0);
}

const statusColor: Record<string, string> = { Exploration: "#f59e0b", Development: "#2B7BC2", Operational: "#10b981", "Pre-Feasibility": "#a855f7", Construction: "#E8652D" };

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<GeoProject[]>(() => loadProjects());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "npv" | "irr" | "risk">("name");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const handleDelete = useCallback((id: string) => {
    deleteProject(id);
    setProjects(loadProjects());
    if (expandedId === id) setExpandedId(null);
  }, [expandedId]);

  const statuses = useMemo(() => ["All", ...Array.from(new Set(projects.map(p => p.status)))], [projects]);

  const filtered = useMemo(() => {
    let list = projects;
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.country.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus !== "All") list = list.filter(p => p.status === filterStatus);
    if (sortBy === "npv") list = [...list].sort((a, b) => b.npv - a.npv);
    else if (sortBy === "irr") list = [...list].sort((a, b) => b.irr - a.irr);
    else if (sortBy === "risk") list = [...list].sort((a, b) => b.riskScore - a.riskScore);
    else list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [projects, search, sortBy, filterStatus]);

  const portfolio = useMemo(() => {
    const total = projects.reduce((s, p) => s + p.capex, 0);
    const avgIRR = projects.length > 0 ? projects.reduce((s, p) => s + p.irr, 0) / projects.length : 0;
    const avgRisk = projects.length > 0 ? projects.reduce((s, p) => s + p.riskScore, 0) / projects.length : 0;
    const totalMW = projects.reduce((s, p) => s + p.capacity_MW, 0);
    const viable = projects.filter(p => p.npv > 0 && p.irr > p.discountRate).length;
    return { total, avgIRR, avgRisk, totalMW, viable, count: projects.length };
  }, [projects]);

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Project <span className="gradient-text">Portfolio</span></h1>
          <p className="text-slate-400 mt-1">Manage geothermal projects with real-time financial analysis and AI insights</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => navigate("/create-project")}>
          <Plus size={16} /> Create Project
        </button>
      </div>

      <div className="grid grid-cols-6 gap-3">
        {[
          { label: "Total CapEx", value: fmt(portfolio.total), color: "#2B7BC2" },
          { label: "Projects", value: String(portfolio.count), color: "#6CB4D9" },
          { label: "Total Capacity", value: portfolio.totalMW.toFixed(0) + " MW", color: "#E8652D" },
          { label: "Avg IRR", value: portfolio.avgIRR.toFixed(1) + "%", color: "#10b981" },
          { label: "Avg Risk Score", value: portfolio.avgRisk.toFixed(0) + "/100", color: "#f59e0b" },
          { label: "Viable Projects", value: portfolio.viable + "/" + portfolio.count, color: portfolio.viable === portfolio.count ? "#10b981" : "#f59e0b" },
        ].map(m => (
          <div key={m.label} className="glass-card p-4">
            <p className="text-xs text-slate-500 mb-1">{m.label}</p>
            <p className="text-xl font-bold" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search projects..." className="input-dark pl-9 w-full" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <select className="select-dark" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <select className="select-dark" value={sortBy} onChange={e => setSortBy(e.target.value as "name" | "npv" | "irr" | "risk")}>
          <option value="name">Sort: Name</option>
          <option value="npv">Sort: NPV</option>
          <option value="irr">Sort: IRR</option>
          <option value="risk">Sort: Risk Score</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(project => {
          const isExpanded = expandedId === project.id;
          const viable = project.npv > 0 && project.irr > project.discountRate;
          const sc = statusColor[project.status] || "#94a3b8";
          return (
            <div key={project.id} className="glass-card overflow-hidden">
              <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setExpandedId(isExpanded ? null : project.id)}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: sc + "15" }}>
                    <Zap size={18} style={{ color: sc }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white">{project.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: sc + "15", color: sc }}>{project.status}</span>
                      {viable ? <CheckCircle size={14} className="text-emerald-400" /> : <AlertTriangle size={14} className="text-amber-400" />}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10} /> {project.country}</span>
                      <span className="text-xs text-slate-500">{project.capacity_MW} MW</span>
                      <span className="text-xs text-slate-500">{project.projectLife} yr life</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right"><p className="text-xs text-slate-500">NPV</p><p className="text-sm font-bold" style={{ color: project.npv >= 0 ? "#10b981" : "#ef4444" }}>{fmt(project.npv)}</p></div>
                  <div className="text-right"><p className="text-xs text-slate-500">IRR</p><p className="text-sm font-bold" style={{ color: project.irr > project.discountRate ? "#10b981" : "#ef4444" }}>{project.irr.toFixed(1)}%</p></div>
                  <div className="text-right"><p className="text-xs text-slate-500">Payback</p><p className="text-sm font-bold text-white">{project.paybackYears} yr</p></div>
                  <div className="text-right"><p className="text-xs text-slate-500">Risk</p><p className="text-sm font-bold" style={{ color: project.riskScore >= 70 ? "#10b981" : project.riskScore >= 50 ? "#f59e0b" : "#ef4444" }}>{project.riskScore}/100</p></div>
                  <div className="text-right min-w-[70px]"><p className="text-xs text-slate-500">CapEx</p><p className="text-sm font-bold text-white">{fmt(project.capex)}</p></div>
                  {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                </div>
              </button>
              {isExpanded && <ProjectDetail project={project} onDelete={handleDelete} />}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-400 mb-3">No projects found.</p>
          <button className="btn-primary" onClick={() => navigate("/create-project")}>Create Your First Project</button>
        </div>
      )}
    </div>
  );
}

function ProjectDetail({ project, onDelete }: { project: GeoProject; onDelete: (id: string) => void }) {
  const insights = useMemo(() => generateProjectInsights(project.capex, project.annualRevenue, project.opexPerYear, project.capacity_MW, project.discountRate, project.projectLife, project.thermalGradient, project.reservoirTemp, project.drillingSuccessProb, project.riskScore, project.npv, project.irr, project.paybackYears), [project]);
  const financing = useMemo(() => analyzeFinancing(project.capex, project.annualRevenue, project.opexPerYear, project.capacity_MW, project.discountRate, project.projectLife, project.energyEscalation, project.carbonCreditsPerYear, project.riskScore, project.drillingSuccessProb), [project]);

  const insightColors: Record<string, string> = { recommendation: "#10b981", warning: "#f59e0b", opportunity: "#6CB4D9", risk: "#ef4444" };
  const insightIcons: Record<string, typeof CheckCircle> = { recommendation: CheckCircle, warning: AlertTriangle, opportunity: Zap, risk: XCircle };

  return (
    <div className="border-t border-slate-700/30 p-5 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30"><p className="text-xs text-slate-500">Annual Revenue</p><p className="text-base font-bold text-emerald-400">{fmt(project.annualRevenue)}</p></div>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30"><p className="text-xs text-slate-500">Annual OpEx</p><p className="text-base font-bold text-red-400">{fmt(project.opexPerYear)}</p></div>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30"><p className="text-xs text-slate-500">Equity IRR (Best)</p><p className="text-base font-bold" style={{ color: "#2B7BC2" }}>{financing.equityIRR.toFixed(1)}%</p></div>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30"><p className="text-xs text-slate-500">LCOE</p><p className="text-base font-bold text-white">${financing.lcoe.toFixed(2)}/MWh</p></div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30"><p className="text-xs text-slate-500">Reservoir Temp</p><p className="text-sm font-bold text-white">{project.reservoirTemp}&deg;C</p></div>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30"><p className="text-xs text-slate-500">Thermal Gradient</p><p className="text-sm font-bold text-white">{project.thermalGradient}&deg;C/km</p></div>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30"><p className="text-xs text-slate-500">Drilling Success</p><p className="text-sm font-bold" style={{ color: project.drillingSuccessProb >= 0.7 ? "#10b981" : "#f59e0b" }}>{(project.drillingSuccessProb * 100).toFixed(0)}%</p></div>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30"><p className="text-xs text-slate-500">DSCR</p><p className="text-sm font-bold" style={{ color: financing.dscr >= 1.3 ? "#10b981" : "#f59e0b" }}>{financing.dscr.toFixed(2)}x</p></div>
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30"><p className="text-xs text-slate-500">Best Financing</p><p className="text-sm font-bold" style={{ color: "#2B7BC2" }}>{financing.recommended}</p></div>
      </div>

      <div className="rounded-lg p-3" style={{ background: financing.isViable ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)", border: `1px solid ${financing.isViable ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}` }}>
        <div className="flex items-center gap-2">
          {financing.isViable ? <CheckCircle size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-red-400" />}
          <p className="text-xs text-slate-300"><span className="font-semibold">{financing.isViable ? "Viable" : "Not Viable"}:</span> {financing.viabilityReason}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Brain size={14} style={{ color: "#a855f7" }} />
          <h4 className="text-sm font-semibold text-white">AI Insights</h4>
          <span className="badge-new text-[10px]">AI</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {insights.slice(0, 4).map(ins => {
            const Icon = insightIcons[ins.type] || AlertTriangle;
            const color = insightColors[ins.type] || "#94a3b8";
            return (
              <div key={ins.id} className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/20">
                <div className="flex items-start gap-2">
                  <Icon size={12} style={{ color }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-white">{ins.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{ins.detail}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition flex items-center gap-1" onClick={() => onDelete(project.id)}>
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );
}
