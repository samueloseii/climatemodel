import { Mountain, Thermometer, Layers, Droplets, MapPin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const thermalGradients = [
  { region: "Basin & Range (NV)", gradient: 45, suitability: 95, color: "#10b981" },
  { region: "Cascades (OR/WA)", gradient: 38, suitability: 82, color: "#10b981" },
  { region: "Rio Grande Rift (NM)", gradient: 35, suitability: 78, color: "#3b82f6" },
  { region: "Colorado Plateau", gradient: 28, suitability: 65, color: "#3b82f6" },
  { region: "Great Plains", gradient: 22, suitability: 48, color: "#f97316" },
  { region: "Appalachian Basin", gradient: 18, suitability: 35, color: "#f97316" },
  { region: "Gulf Coast", gradient: 32, suitability: 72, color: "#3b82f6" },
  { region: "Salton Sea (CA)", gradient: 55, suitability: 98, color: "#10b981" },
];

const soilTypes = [
  { type: "Granite/Basalt", conductivity: "2.5-3.5", rating: "Excellent", color: "text-emerald-400" },
  { type: "Limestone", conductivity: "2.0-2.8", rating: "Good", color: "text-blue-400" },
  { type: "Sandstone", conductivity: "1.5-2.5", rating: "Moderate", color: "text-orange-400" },
  { type: "Shale/Clay", conductivity: "1.0-1.8", rating: "Poor", color: "text-red-400" },
  { type: "Sand/Gravel (saturated)", conductivity: "1.8-2.4", rating: "Good", color: "text-blue-400" },
  { type: "Volcanic Tuff", conductivity: "1.2-2.0", rating: "Moderate", color: "text-orange-400" },
];

const wellConfigs = [
  { config: "Vertical Closed Loop", depth: "150-400 ft", cost: "$15-45/ft", bestFor: "Residential, small commercial", efficiency: 85 },
  { config: "Horizontal Loop", depth: "4-6 ft deep, 400-600 ft", cost: "$10-20/ft", bestFor: "Large lots, low-rise", efficiency: 78 },
  { config: "Standing Column Well", depth: "200-1500 ft", cost: "$20-35/ft", bestFor: "High water table areas", efficiency: 92 },
  { config: "Open Loop (Aquifer)", depth: "varies", cost: "$12-25/ft", bestFor: "Areas with clean aquifers", efficiency: 95 },
];

export default function Geological() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Geological <span className="gradient-text">Assessment</span></h1>
        <p className="text-slate-400 mt-1">Subsurface characterization, thermal gradient analysis, and site suitability scoring</p>
      </div>

      {/* Thermal Gradient Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Thermometer size={20} className="text-orange-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Regional Thermal Gradients</h3>
            <p className="text-sm text-slate-400">Average geothermal gradient (degrees C/km) and site suitability score by region</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={thermalGradients} layout="vertical" barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 60]} />
            <YAxis type="category" dataKey="region" tick={{ fontSize: 11, fill: "#94a3b8" }} width={150} />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569", borderRadius: 12 }} formatter={(v: number) => [`${v} C/km`, "Gradient"]} />
            <Bar dataKey="gradient" radius={[0, 6, 6, 0]}>
              {thermalGradients.map((entry, i) => (
                <Cell key={i} fill={entry.color} opacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Suitability Scores */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Site Suitability Scoring</h3>
        <div className="grid grid-cols-4 gap-3">
          {thermalGradients.map(r => (
            <div key={r.region} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={14} className="text-slate-400" />
                <p className="text-sm text-slate-300 font-medium">{r.region}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-700/50 rounded-full h-2.5">
                  <div className="h-full rounded-full" style={{ width: `${r.suitability}%`, backgroundColor: r.color }} />
                </div>
                <span className={`text-sm font-bold ${r.suitability > 80 ? "text-emerald-400" : r.suitability > 60 ? "text-blue-400" : "text-orange-400"}`}>{r.suitability}%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{r.gradient} C/km gradient</p>
            </div>
          ))}
        </div>
      </div>

      {/* Subsurface Layers Visualization */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Layers size={20} className="text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Subsurface Layer Model</h3>
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
            <div key={layer.layer} className={`bg-gradient-to-r ${layer.color} border-x border-slate-600/30 ${i === 0 ? "rounded-t-xl border-t" : ""} ${i === 5 ? "rounded-b-xl border-b" : ""} px-6 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-400 w-20">{layer.depth}</span>
                <span className="text-sm text-white font-medium">{layer.layer}</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-slate-300 flex items-center gap-1"><Thermometer size={12} /> {layer.temp}</span>
                <span className="text-slate-300 flex items-center gap-1"><Droplets size={12} /> {layer.conductivity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Soil Conductivity Table */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mountain size={20} className="text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Soil Thermal Conductivity Reference</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {soilTypes.map(s => (
            <div key={s.type} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
              <p className="text-sm font-medium text-slate-200">{s.type}</p>
              <p className="text-xs text-slate-500 mt-1">Conductivity: {s.conductivity} W/mK</p>
              <p className={`text-sm font-semibold ${s.color} mt-2`}>{s.rating}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Well Configurations */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recommended Well Configurations</h3>
        <div className="space-y-3">
          {wellConfigs.map(w => (
            <div key={w.config} className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/30 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{w.config}</p>
                <p className="text-xs text-slate-500 mt-1">Depth: {w.depth} | Cost: {w.cost}</p>
                <p className="text-xs text-slate-400 mt-0.5">Best for: {w.bestFor}</p>
              </div>
              <div className="text-center shrink-0 ml-6">
                <p className="text-xs text-slate-400">Efficiency</p>
                <p className={`text-2xl font-bold ${w.efficiency > 90 ? "text-emerald-400" : w.efficiency > 80 ? "text-blue-400" : "text-orange-400"}`}>{w.efficiency}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
