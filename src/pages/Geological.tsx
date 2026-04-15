import { useState, useMemo } from "react";
import { Mountain, Thermometer, Layers, Droplets, MapPin, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const thermalGradients = [
  { region: "Basin & Range (NV)", gradient: 45, suitability: 95, category: "Western US" },
  { region: "Cascades (OR/WA)", gradient: 38, suitability: 82, category: "Western US" },
  { region: "Rio Grande Rift (NM)", gradient: 35, suitability: 78, category: "Western US" },
  { region: "Colorado Plateau", gradient: 28, suitability: 65, category: "Western US" },
  { region: "Great Plains", gradient: 22, suitability: 48, category: "Central US" },
  { region: "Appalachian Basin", gradient: 18, suitability: 35, category: "Eastern US" },
  { region: "Gulf Coast", gradient: 32, suitability: 72, category: "Southern US" },
  { region: "Salton Sea (CA)", gradient: 55, suitability: 98, category: "Western US" },
  { region: "Yellowstone (WY)", gradient: 60, suitability: 92, category: "Western US" },
  { region: "Geysers (CA)", gradient: 50, suitability: 96, category: "Western US" },
  { region: "Hawaii (Big Island)", gradient: 48, suitability: 88, category: "Pacific" },
  { region: "Alaska (Aleutians)", gradient: 42, suitability: 75, category: "Pacific" },
];

function getGradientColor(suitability: number) {
  if (suitability >= 80) return "#10b981";
  if (suitability >= 60) return "#2B7BC2";
  return "#E8652D";
}

const soilTypes = [
  { type: "Granite/Basalt", conductivity: "2.5-3.5", rating: "Excellent", color: "#10b981" },
  { type: "Limestone", conductivity: "2.0-2.8", rating: "Good", color: "#2B7BC2" },
  { type: "Sandstone", conductivity: "1.5-2.5", rating: "Moderate", color: "#E8652D" },
  { type: "Shale/Clay", conductivity: "1.0-1.8", rating: "Poor", color: "#ef4444" },
  { type: "Sand/Gravel (saturated)", conductivity: "1.8-2.4", rating: "Good", color: "#2B7BC2" },
  { type: "Volcanic Tuff", conductivity: "1.2-2.0", rating: "Moderate", color: "#E8652D" },
];

const wellConfigs = [
  { config: "Vertical Closed Loop", depth: "150-400 ft", cost: "$15-45/ft", bestFor: "Residential, small commercial", efficiency: 85 },
  { config: "Horizontal Loop", depth: "4-6 ft deep, 400-600 ft", cost: "$10-20/ft", bestFor: "Large lots, low-rise", efficiency: 78 },
  { config: "Standing Column Well", depth: "200-1500 ft", cost: "$20-35/ft", bestFor: "High water table areas", efficiency: 92 },
  { config: "Open Loop (Aquifer)", depth: "varies", cost: "$12-25/ft", bestFor: "Areas with clean aquifers", efficiency: 95 },
];

const regions = ["All Regions", "Western US", "Central US", "Eastern US", "Southern US", "Pacific"];
const suitabilityFilters = ["All", "Excellent (80+)", "Good (60-79)", "Moderate (<60)"];

export default function Geological() {
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedSuitability, setSelectedSuitability] = useState("All");
  const [minGradient, setMinGradient] = useState(0);

  const filtered = useMemo(() => {
    return thermalGradients.filter(r => {
      if (selectedRegion !== "All Regions" && r.category !== selectedRegion) return false;
      if (selectedSuitability === "Excellent (80+)" && r.suitability < 80) return false;
      if (selectedSuitability === "Good (60-79)" && (r.suitability < 60 || r.suitability >= 80)) return false;
      if (selectedSuitability === "Moderate (<60)" && r.suitability >= 60) return false;
      if (r.gradient < minGradient) return false;
      return true;
    }).sort((a, b) => b.gradient - a.gradient);
  }, [selectedRegion, selectedSuitability, minGradient]);

  const avgGradient = filtered.length ? (filtered.reduce((s, r) => s + r.gradient, 0) / filtered.length).toFixed(1) : "0";
  const avgSuitability = filtered.length ? (filtered.reduce((s, r) => s + r.suitability, 0) / filtered.length).toFixed(0) : "0";
  const topRegion = filtered.length ? filtered[0] : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Geological <span className="gradient-text">Assessment</span></h1>
        <p className="text-sm text-slate-400 mt-0.5">Subsurface characterization, thermal gradient analysis, and site suitability scoring</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} style={{ color: "#E8652D" }} />
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Filter & Select Regions</h3>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Region:</span>
            <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} className="select-dark text-xs py-1.5">
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Suitability:</span>
            <select value={selectedSuitability} onChange={e => setSelectedSuitability(e.target.value)} className="select-dark text-xs py-1.5">
              {suitabilityFilters.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Min Gradient:</span>
            <input type="number" min={0} max={60} value={minGradient} onChange={e => setMinGradient(Number(e.target.value))} className="input-dark w-16 text-xs text-center py-1.5" />
            <span className="text-xs text-slate-500">C/km</span>
          </div>
          <div className="ml-auto flex items-center gap-4 text-xs">
            <span className="text-slate-400">{filtered.length} regions</span>
            <span className="text-slate-400">Avg Gradient: <span className="font-medium" style={{ color: "#6CB4D9" }}>{avgGradient} C/km</span></span>
            <span className="text-slate-400">Avg Suitability: <span className="font-medium" style={{ color: "#10b981" }}>{avgSuitability}%</span></span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="glass-card p-4">
          <p className="text-xs text-slate-400">Regions Analyzed</p>
          <p className="text-xl font-bold text-white mt-1">{filtered.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">of {thermalGradients.length} total</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-slate-400">Avg Thermal Gradient</p>
          <p className="text-xl font-bold mt-1" style={{ color: "#6CB4D9" }}>{avgGradient} C/km</p>
          <p className="text-xs text-slate-500 mt-0.5">filtered regions</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-slate-400">Avg Suitability</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{avgSuitability}%</p>
          <p className="text-xs text-slate-500 mt-0.5">site viability score</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-slate-400">Top Region</p>
          <p className="text-xl font-bold text-white mt-1">{topRegion?.region?.split("(")[0]?.trim() ?? "N/A"}</p>
          <p className="text-xs text-slate-500 mt-0.5">{topRegion ? `${topRegion.gradient} C/km` : ""}</p>
        </div>
      </div>

      {/* Thermal Gradient Chart */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Thermometer size={16} style={{ color: "#E8652D" }} />
          <div>
            <h3 className="text-sm font-semibold text-white">Regional Thermal Gradients</h3>
            <p className="text-xs text-slate-500">Average geothermal gradient (C/km) &mdash; filtered by selection above</p>
          </div>
        </div>
        {filtered.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(200, filtered.length * 36)}>
            <BarChart data={filtered} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} domain={[0, 65]} />
              <YAxis type="category" dataKey="region" tick={{ fontSize: 11, fill: "#94a3b8" }} width={160} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v} C/km`, "Gradient"]} />
              <Bar dataKey="gradient" radius={[0, 4, 4, 0]}>
                {filtered.map((entry, i) => (
                  <Cell key={i} fill={getGradientColor(entry.suitability)} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-slate-500 text-sm">No regions match current filters</div>
        )}
      </div>

      {/* Suitability Scores */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Site Suitability Scoring</h3>
        <div className="grid grid-cols-4 gap-3">
          {filtered.map(r => (
            <div key={r.region} className="rounded-lg p-3" style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(51,65,85,0.3)" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin size={12} className="text-slate-500" />
                <p className="text-xs text-slate-300 font-medium">{r.region}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-700/50 rounded-full h-2">
                  <div className="h-full rounded-full transition-all" style={{ width: `${r.suitability}%`, backgroundColor: getGradientColor(r.suitability) }} />
                </div>
                <span className="text-xs font-bold tabular-nums" style={{ color: getGradientColor(r.suitability) }}>{r.suitability}%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{r.gradient} C/km &middot; {r.category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Subsurface Layers Visualization */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={16} style={{ color: "#2B7BC2" }} />
          <h3 className="text-sm font-semibold text-white">Subsurface Layer Model</h3>
        </div>
        <div className="max-w-3xl mx-auto space-y-0">
          {[
            { layer: "Topsoil", depth: "0-10 ft", temp: "55 F", conductivity: "Low", color: "from-amber-900/60 to-amber-800/40" },
            { layer: "Clay/Silt Layer", depth: "10-40 ft", temp: "56 F", conductivity: "1.2 W/mK", color: "from-orange-900/60 to-orange-800/40" },
            { layer: "Sand & Gravel (Water Table)", depth: "40-80 ft", temp: "57 F", conductivity: "1.8 W/mK", color: "from-cyan-900/60 to-cyan-800/40" },
            { layer: "Fractured Limestone", depth: "80-200 ft", temp: "58 F", conductivity: "2.4 W/mK", color: "from-slate-700/80 to-slate-600/40" },
            { layer: "Dense Granite Bedrock", depth: "200-500 ft", temp: "62 F", conductivity: "3.0 W/mK", color: "from-slate-800/90 to-slate-700/60" },
            { layer: "Deep Formation (Target Zone)", depth: "500+ ft", temp: "72 F", conductivity: "3.2 W/mK", color: "from-red-950/80 to-red-900/40" },
          ].map((layer, i) => (
            <div key={layer.layer} className={`bg-gradient-to-r ${layer.color} border-x border-slate-600/30 ${i === 0 ? "rounded-t-xl border-t" : ""} ${i === 5 ? "rounded-b-xl border-b" : ""} px-5 py-3 flex items-center justify-between`}>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-400 w-20">{layer.depth}</span>
                <span className="text-xs text-white font-medium">{layer.layer}</span>
              </div>
              <div className="flex items-center gap-5 text-xs">
                <span className="text-slate-300 flex items-center gap-1"><Thermometer size={11} /> {layer.temp}</span>
                <span className="text-slate-300 flex items-center gap-1"><Droplets size={11} /> {layer.conductivity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Soil Conductivity Table */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Mountain size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Soil Thermal Conductivity</h3>
          </div>
          <div className="space-y-2">
            {soilTypes.map(s => (
              <div key={s.type} className="flex items-center justify-between rounded-lg p-3" style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(51,65,85,0.3)" }}>
                <div>
                  <p className="text-xs font-medium text-slate-200">{s.type}</p>
                  <p className="text-xs text-slate-500">{s.conductivity} W/mK</p>
                </div>
                <span className="text-xs font-semibold" style={{ color: s.color }}>{s.rating}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Well Configurations */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Well Configurations</h3>
          <div className="space-y-2">
            {wellConfigs.map(w => (
              <div key={w.config} className="flex items-center justify-between rounded-lg p-3" style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(51,65,85,0.3)" }}>
                <div>
                  <p className="text-xs font-semibold text-white">{w.config}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Depth: {w.depth} | Cost: {w.cost}</p>
                  <p className="text-xs text-slate-400">Best for: {w.bestFor}</p>
                </div>
                <div className="text-center shrink-0 ml-4">
                  <p className="text-xs text-slate-400">Efficiency</p>
                  <p className="text-lg font-bold" style={{ color: w.efficiency > 90 ? "#10b981" : w.efficiency > 80 ? "#2B7BC2" : "#E8652D" }}>{w.efficiency}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
