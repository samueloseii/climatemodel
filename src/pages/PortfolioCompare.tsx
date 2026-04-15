import { useState } from "react";
import { Plus, Trash2, BarChart3, TrendingUp, Shield, AlertTriangle, ArrowUpRight, ArrowDownRight, Upload } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";

interface Project {
  id: string;
  name: string;
  location: string;
  capacity: number;
  capex: number;
  npv: number;
  irr: number;
  payback: number;
  var95: number;
  cvar95: number;
  pPositive: number;
  drillingRisk: number;
  reservoirConf: number;
  regulatoryRisk: number;
  financingScore: number;
  technologyScore: number;
}

const defaultProjects: Project[] = [
  { id: "1", name: "Olkaria Phase V", location: "Kenya", capacity: 140, capex: 420, npv: 285, irr: 18.5, payback: 5.2, var95: -42, cvar95: -68, pPositive: 94.2, drillingRisk: 35, reservoirConf: 72, regulatoryRisk: 25, financingScore: 85, technologyScore: 90 },
  { id: "2", name: "Cerro Pabellón Exp.", location: "Chile", capacity: 80, capex: 310, npv: 142, irr: 14.2, payback: 6.8, var95: -55, cvar95: -89, pPositive: 87.5, drillingRisk: 45, reservoirConf: 65, regulatoryRisk: 30, financingScore: 78, technologyScore: 85 },
  { id: "3", name: "Salton Sea Unit 7", location: "California, USA", capacity: 60, capex: 180, npv: 195, irr: 22.1, payback: 4.1, var95: -28, cvar95: -41, pPositive: 96.8, drillingRisk: 20, reservoirConf: 88, regulatoryRisk: 15, financingScore: 92, technologyScore: 95 },
];

const colors = ["#2B7BC2", "#E8652D", "#10b981", "#a855f7", "#f59e0b", "#ec4899"];

export default function PortfolioCompare() {
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [sortBy, setSortBy] = useState<keyof Project>("npv");

  const addProject = () => {
    const id = Date.now().toString();
    setProjects(prev => [...prev, {
      id, name: "New Project", location: "Location", capacity: 50, capex: 200,
      npv: 100, irr: 12, payback: 7, var95: -30, cvar95: -50, pPositive: 85,
      drillingRisk: 40, reservoirConf: 60, regulatoryRisk: 30, financingScore: 70, technologyScore: 75,
    }]);
  };

  const removeProject = (id: string) => {
    if (projects.length <= 1) return;
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const updateProject = (id: string, field: keyof Project, value: string | number) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const radarData = [
    { metric: "IRR", fullMark: 30 },
    { metric: "P(NPV>0)", fullMark: 100 },
    { metric: "Reservoir Conf.", fullMark: 100 },
    { metric: "Financing", fullMark: 100 },
    { metric: "Technology", fullMark: 100 },
  ].map(d => {
    const entry: Record<string, string | number> = { metric: d.metric, fullMark: d.fullMark };
    projects.forEach(p => {
      if (d.metric === "IRR") entry[p.name] = p.irr;
      else if (d.metric === "P(NPV>0)") entry[p.name] = p.pPositive;
      else if (d.metric === "Reservoir Conf.") entry[p.name] = p.reservoirConf;
      else if (d.metric === "Financing") entry[p.name] = p.financingScore;
      else if (d.metric === "Technology") entry[p.name] = p.technologyScore;
    });
    return entry;
  });

  const barData = projects.map((p, i) => ({ name: p.name.length > 15 ? p.name.slice(0, 15) + "…" : p.name, NPV: p.npv, VaR: Math.abs(p.var95), fill: colors[i % colors.length] }));

  const sorted = [...projects].sort((a, b) => {
    const va = a[sortBy], vb = b[sortBy];
    if (typeof va === "number" && typeof vb === "number") return vb - va;
    return 0;
  });

  const portfolioNPV = projects.reduce((s, p) => s + p.npv, 0);
  const portfolioCapex = projects.reduce((s, p) => s + p.capex, 0);
  const avgIRR = projects.reduce((s, p) => s + p.irr, 0) / projects.length;
  const avgPPos = projects.reduce((s, p) => s + p.pPositive, 0) / projects.length;

  return (
    <div className="space-y-5 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio <span className="gradient-text">Comparison</span></h1>
          <p className="text-sm text-slate-400 mt-0.5">Compare projects side-by-side across financial, risk, and geological metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={addProject} className="btn-secondary flex items-center gap-1.5 text-xs">
            <Plus size={14} /> Add Project
          </button>
          <button className="btn-secondary flex items-center gap-1.5 text-xs">
            <Upload size={14} /> Import CSV
          </button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Portfolio NPV", value: `$${portfolioNPV}M`, icon: BarChart3, color: "#10b981", sub: `${projects.length} projects` },
          { label: "Total CapEx", value: `$${portfolioCapex}M`, icon: TrendingUp, color: "#2B7BC2", sub: "Committed capital" },
          { label: "Avg. IRR", value: `${avgIRR.toFixed(1)}%`, icon: TrendingUp, color: "#E8652D", sub: "Weighted average" },
          { label: "Avg. P(NPV>0)", value: `${avgPPos.toFixed(1)}%`, icon: Shield, color: "#6CB4D9", sub: "Portfolio confidence" },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <s.icon size={16} style={{ color: s.color }} />
              <span className="text-xs text-emerald-400 flex items-center gap-0.5"><ArrowUpRight size={10} /> Active</span>
            </div>
            <p className="text-xl font-bold text-white tabular-nums">{s.value}</p>
            <p className="text-xs text-slate-500">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Risk-Return Radar</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <PolarRadiusAxis tick={{ fontSize: 9, fill: "#475569" }} />
              {projects.map((p, i) => (
                <Radar key={p.id} name={p.name} dataKey={p.name} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.15} strokeWidth={2} />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-3">NPV vs Downside Risk</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="NPV" name="NPV ($M)" radius={[4, 4, 0, 0]}>
                {barData.map((_entry, i) => <Cell key={i} fill={colors[i % colors.length]} opacity={0.8} />)}
              </Bar>
              <Bar dataKey="VaR" name="VaR 95% ($M)" radius={[4, 4, 0, 0]}>
                {barData.map((_entry, i) => <Cell key={i} fill={colors[i % colors.length]} opacity={0.3} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Detailed Comparison</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Sort by:</span>
            <select value={sortBy as string} onChange={e => setSortBy(e.target.value as keyof Project)} className="select-dark text-xs py-1">
              <option value="npv">NPV</option>
              <option value="irr">IRR</option>
              <option value="payback">Payback</option>
              <option value="pPositive">P(NPV&gt;0)</option>
              <option value="var95">VaR</option>
              <option value="capacity">Capacity</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/40">
                <th className="text-left py-2 text-slate-400 font-medium">Project</th>
                <th className="text-left py-2 text-slate-400 font-medium">Location</th>
                <th className="text-right py-2 text-slate-400 font-medium">MW</th>
                <th className="text-right py-2 text-slate-400 font-medium">CapEx ($M)</th>
                <th className="text-right py-2 text-slate-400 font-medium">NPV ($M)</th>
                <th className="text-right py-2 text-slate-400 font-medium">IRR</th>
                <th className="text-right py-2 text-slate-400 font-medium">Payback</th>
                <th className="text-right py-2 text-slate-400 font-medium">VaR 95%</th>
                <th className="text-right py-2 text-slate-400 font-medium">P(NPV&gt;0)</th>
                <th className="text-right py-2 text-slate-400 font-medium">Score</th>
                <th className="text-center py-2 text-slate-400 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => {
                const score = Math.round(p.pPositive * 0.3 + p.irr * 2 + (100 - p.drillingRisk) * 0.2 + p.reservoirConf * 0.2);
                return (
                  <tr key={p.id} className="border-b border-slate-800/30 hover:bg-white/[0.02] group">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: colors[i % colors.length] }} />
                        <input value={p.name} onChange={e => updateProject(p.id, "name", e.target.value)} className="bg-transparent text-slate-200 font-medium text-xs border-none outline-none w-40" />
                      </div>
                    </td>
                    <td className="py-2.5">
                      <input value={p.location} onChange={e => updateProject(p.id, "location", e.target.value)} className="bg-transparent text-slate-400 text-xs border-none outline-none w-28" />
                    </td>
                    <td className="text-right py-2.5">
                      <input type="number" value={p.capacity} onChange={e => updateProject(p.id, "capacity", Number(e.target.value))} className="bg-transparent text-slate-300 text-xs text-right border-none outline-none w-12 tabular-nums" />
                    </td>
                    <td className="text-right py-2.5">
                      <input type="number" value={p.capex} onChange={e => updateProject(p.id, "capex", Number(e.target.value))} className="bg-transparent text-slate-300 text-xs text-right border-none outline-none w-14 tabular-nums" />
                    </td>
                    <td className="text-right py-2.5">
                      <span className={`font-semibold tabular-nums ${p.npv >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        <input type="number" value={p.npv} onChange={e => updateProject(p.id, "npv", Number(e.target.value))} className={`bg-transparent text-xs text-right border-none outline-none w-14 tabular-nums font-semibold ${p.npv >= 0 ? "text-emerald-400" : "text-red-400"}`} />
                      </span>
                    </td>
                    <td className="text-right py-2.5">
                      <span className="text-slate-300 tabular-nums flex items-center justify-end gap-0.5">
                        <input type="number" value={p.irr} step={0.1} onChange={e => updateProject(p.id, "irr", Number(e.target.value))} className="bg-transparent text-slate-300 text-xs text-right border-none outline-none w-12 tabular-nums" />%
                        {p.irr > 15 ? <ArrowUpRight size={10} className="text-emerald-400" /> : <ArrowDownRight size={10} className="text-amber-400" />}
                      </span>
                    </td>
                    <td className="text-right py-2.5 text-slate-300 tabular-nums">
                      <input type="number" value={p.payback} step={0.1} onChange={e => updateProject(p.id, "payback", Number(e.target.value))} className="bg-transparent text-slate-300 text-xs text-right border-none outline-none w-10 tabular-nums" />yr
                    </td>
                    <td className="text-right py-2.5">
                      <span className="text-red-400 tabular-nums">${Math.abs(p.var95)}M</span>
                    </td>
                    <td className="text-right py-2.5">
                      <span className={`tabular-nums ${p.pPositive > 90 ? "text-emerald-400" : p.pPositive > 75 ? "text-amber-400" : "text-red-400"}`}>{p.pPositive}%</span>
                    </td>
                    <td className="text-right py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${score > 60 ? "bg-emerald-500/15 text-emerald-400" : score > 40 ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"}`}>
                        {score}
                      </span>
                    </td>
                    <td className="text-center py-2.5">
                      <button onClick={() => removeProject(p.id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Alerts */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <AlertTriangle size={14} style={{ color: "#E8652D" }} /> Portfolio Risk Alerts
        </h3>
        <div className="space-y-2">
          {projects.filter(p => p.drillingRisk > 40).map(p => (
            <div key={p.id + "-drill"} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "rgba(232,101,45,0.06)", border: "1px solid rgba(232,101,45,0.15)" }}>
              <AlertTriangle size={12} style={{ color: "#E8652D" }} />
              <span className="text-xs text-slate-300"><strong className="text-white">{p.name}:</strong> Drilling risk is elevated at {p.drillingRisk}%. Consider additional geophysical surveys before FID.</span>
            </div>
          ))}
          {projects.filter(p => p.pPositive < 90).map(p => (
            <div key={p.id + "-prob"} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
              <Shield size={12} style={{ color: "#f59e0b" }} />
              <span className="text-xs text-slate-300"><strong className="text-white">{p.name}:</strong> P(NPV&gt;0) is {p.pPositive}%. Lender covenant typically requires &gt;90% for project finance.</span>
            </div>
          ))}
          {projects.every(p => p.pPositive >= 90 && p.drillingRisk <= 40) && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
              <Shield size={12} style={{ color: "#10b981" }} />
              <span className="text-xs text-emerald-400">All projects meet baseline risk thresholds. Portfolio is within acceptable parameters.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
