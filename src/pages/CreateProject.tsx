import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, MapPin, Thermometer, DollarSign, BarChart3, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import { addProject, computeProjectMetrics, GeoProject } from "../data/projectStore";

type Step = 1 | 2 | 3 | 4;

const PROJECT_TYPES: GeoProject["projectType"][] = ["Geothermal Power", "Direct Use", "Ground Source Heat Pump", "EGS", "Other"];

export default function CreateProject() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);

  // Step 1: Basic info
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [projectType, setProjectType] = useState<GeoProject["projectType"]>("Geothermal Power");
  const [capacityMW, setCapacityMW] = useState(50);
  const [notes, setNotes] = useState("");

  // Step 2: Geological
  const [thermalGradient, setThermalGradient] = useState(40);
  const [reservoirTemp, setReservoirTemp] = useState(250);
  const [reservoirDepth, setReservoirDepth] = useState(2500);
  const [drillingSuccessProb, setDrillingSuccessProb] = useState(0.75);

  // Step 3: Financial
  const [capex, setCapex] = useState(200000000);
  const [drillingCostPerFt, setDrillingCostPerFt] = useState(90);
  const [boreDepth, setBoreDepth] = useState(7000);
  const [numWells, setNumWells] = useState(12);
  const [annualRevenue, setAnnualRevenue] = useState(35000000);
  const [opexPerYear, setOpexPerYear] = useState(8000000);
  const [discountRate, setDiscountRate] = useState(8);
  const [projectLife, setProjectLife] = useState(25);
  const [energyEscalation, setEnergyEscalation] = useState(2.5);
  const [carbonCreditsPerYear, setCarbonCreditsPerYear] = useState(2000000);

  // Preview metrics (computed live)
  const previewMetrics = computeProjectMetrics({
    capex, annualRevenue, opexPerYear, discountRate, projectLife,
    energyEscalation, carbonCreditsPerYear, drillingSuccessProb, thermalGradient, reservoirTemp,
  });

  const canProceed = (): boolean => {
    if (step === 1) return name.trim().length > 0 && location.trim().length > 0 && country.trim().length > 0;
    if (step === 2) return thermalGradient > 0 && reservoirTemp > 0 && reservoirDepth > 0;
    if (step === 3) return capex > 0 && annualRevenue > 0;
    return true;
  };

  const handleCreate = () => {
    addProject({
      name, location, country, projectType, capacity_MW: capacityMW,
      status: "Draft",
      capex, drillingCostPerFt, boreDepth, numWells,
      annualRevenue, opexPerYear, discountRate, projectLife,
      energyEscalation, carbonCreditsPerYear,
      thermalGradient, reservoirTemp, reservoirDepth, drillingSuccessProb,
      notes,
    });
    navigate("/projects");
  };

  const fmt = (v: number): string => {
    if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
    if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    if (Math.abs(v) >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  };

  const stepLabels = ["Project Details", "Geological Data", "Financial Inputs", "Review & Create"];

  return (
    <div className="max-w-4xl mx-auto space-y-6 page-enter">
      <div>
        <h1 className="text-3xl font-bold text-white">Create New <span className="gradient-text">Project</span></h1>
        <p className="text-slate-400 mt-1">Add a geothermal project for analysis and risk assessment</p>
      </div>

      {/* Progress bar */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > i + 1 ? "bg-emerald-500/20 text-emerald-400" :
                step === i + 1 ? "text-white" : "bg-slate-800 text-slate-500"
              }`} style={step === i + 1 ? { background: "rgba(43,123,194,0.2)", border: "1px solid rgba(43,123,194,0.4)" } : {}}>
                {step > i + 1 ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step === i + 1 ? "text-white" : "text-slate-500"}`}>{label}</span>
              {i < 3 && <ChevronRight size={14} className="text-slate-600 mx-2" />}
            </div>
          ))}
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5">
          <div className="progress-bar" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      {/* Step content */}
      <div className="glass-card p-6">
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={18} style={{ color: "#2B7BC2" }} />
              <h2 className="text-lg font-semibold text-white">Project Details</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Project Name *</label>
                <input className="input-dark w-full" placeholder="e.g., Olkaria Phase V" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Project Type</label>
                <select className="select-dark w-full" value={projectType} onChange={e => setProjectType(e.target.value as GeoProject["projectType"])}>
                  {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Location *</label>
                <input className="input-dark w-full" placeholder="e.g., Naivasha, Kenya" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Country *</label>
                <input className="input-dark w-full" placeholder="e.g., Kenya" value={country} onChange={e => setCountry(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Capacity (MW)</label>
                <input type="number" className="input-dark w-full" value={capacityMW} onChange={e => setCapacityMW(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Notes</label>
                <input className="input-dark w-full" placeholder="Optional notes..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-4">
              <Thermometer size={18} style={{ color: "#E8652D" }} />
              <h2 className="text-lg font-semibold text-white">Geological Data</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Thermal Gradient (°C/km)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={10} max={120} value={thermalGradient} onChange={e => setThermalGradient(Number(e.target.value))} className="range-slider flex-1" />
                  <input type="number" className="input-dark w-20 text-center text-xs py-1.5" value={thermalGradient} onChange={e => setThermalGradient(Number(e.target.value))} />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Reservoir Temperature (°C)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={50} max={500} step={10} value={reservoirTemp} onChange={e => setReservoirTemp(Number(e.target.value))} className="range-slider flex-1" />
                  <input type="number" className="input-dark w-20 text-center text-xs py-1.5" value={reservoirTemp} onChange={e => setReservoirTemp(Number(e.target.value))} />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Reservoir Depth (m)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={500} max={6000} step={100} value={reservoirDepth} onChange={e => setReservoirDepth(Number(e.target.value))} className="range-slider flex-1" />
                  <input type="number" className="input-dark w-20 text-center text-xs py-1.5" value={reservoirDepth} onChange={e => setReservoirDepth(Number(e.target.value))} />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Drilling Success Probability</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={0.1} max={1} step={0.05} value={drillingSuccessProb} onChange={e => setDrillingSuccessProb(Number(e.target.value))} className="range-slider flex-1" />
                  <span className="text-sm font-mono text-white w-16 text-center">{(drillingSuccessProb * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg mt-4" style={{ background: "rgba(232,101,45,0.05)", border: "1px solid rgba(232,101,45,0.12)" }}>
              <p className="text-xs text-slate-400">
                <span className="text-white font-medium">Geological Assessment: </span>
                {thermalGradient >= 50 ? "High-enthalpy resource — suitable for flash/dry steam power generation." :
                 thermalGradient >= 30 ? "Medium-enthalpy resource — suitable for binary cycle or direct use applications." :
                 "Low-enthalpy resource — best suited for ground-source heat pump installations."}
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={18} style={{ color: "#10b981" }} />
              <h2 className="text-lg font-semibold text-white">Financial Inputs</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Total CapEx ($)</label>
                <input type="number" className="input-dark w-full font-mono" value={capex} onChange={e => setCapex(Number(e.target.value))} />
                <span className="text-xs text-slate-500 mt-0.5 block">{fmt(capex)}</span>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Annual Revenue ($)</label>
                <input type="number" className="input-dark w-full font-mono" value={annualRevenue} onChange={e => setAnnualRevenue(Number(e.target.value))} />
                <span className="text-xs text-slate-500 mt-0.5 block">{fmt(annualRevenue)}</span>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Annual OpEx ($)</label>
                <input type="number" className="input-dark w-full font-mono" value={opexPerYear} onChange={e => setOpexPerYear(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Carbon Credits ($/yr)</label>
                <input type="number" className="input-dark w-full font-mono" value={carbonCreditsPerYear} onChange={e => setCarbonCreditsPerYear(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Drilling Cost ($/ft)</label>
                <input type="number" className="input-dark w-full font-mono" value={drillingCostPerFt} onChange={e => setDrillingCostPerFt(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Bore Depth (ft)</label>
                <input type="number" className="input-dark w-full font-mono" value={boreDepth} onChange={e => setBoreDepth(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Number of Wells</label>
                <input type="number" className="input-dark w-full font-mono" value={numWells} onChange={e => setNumWells(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Discount Rate (%)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={1} max={20} step={0.5} value={discountRate} onChange={e => setDiscountRate(Number(e.target.value))} className="range-slider flex-1" />
                  <span className="text-sm font-mono text-white w-12 text-center">{discountRate}%</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Project Life (years)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={10} max={40} value={projectLife} onChange={e => setProjectLife(Number(e.target.value))} className="range-slider flex-1" />
                  <span className="text-sm font-mono text-white w-12 text-center">{projectLife}yr</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Energy Price Escalation (%)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={0} max={8} step={0.5} value={energyEscalation} onChange={e => setEnergyEscalation(Number(e.target.value))} className="range-slider flex-1" />
                  <span className="text-sm font-mono text-white w-12 text-center">{energyEscalation}%</span>
                </div>
              </div>
            </div>
            {/* Live NPV preview */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              <div className="p-3 rounded-lg text-center" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
                <p className="text-xs text-slate-400">NPV</p>
                <p className={`text-lg font-bold ${previewMetrics.npv >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(previewMetrics.npv)}</p>
              </div>
              <div className="p-3 rounded-lg text-center" style={{ background: "rgba(43,123,194,0.06)", border: "1px solid rgba(43,123,194,0.15)" }}>
                <p className="text-xs text-slate-400">IRR</p>
                <p className="text-lg font-bold text-white">{previewMetrics.irr}%</p>
              </div>
              <div className="p-3 rounded-lg text-center" style={{ background: "rgba(108,180,217,0.06)", border: "1px solid rgba(108,180,217,0.15)" }}>
                <p className="text-xs text-slate-400">Payback</p>
                <p className="text-lg font-bold text-white">{previewMetrics.paybackYears} yr</p>
              </div>
              <div className="p-3 rounded-lg text-center" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
                <p className="text-xs text-slate-400">Risk Score</p>
                <p className="text-lg font-bold" style={{ color: previewMetrics.riskScore >= 70 ? "#10b981" : previewMetrics.riskScore >= 50 ? "#f59e0b" : "#ef4444" }}>{previewMetrics.riskScore}/100</p>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} style={{ color: "#a855f7" }} />
              <h2 className="text-lg font-semibold text-white">Review & Create</h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-300">Project Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Name</span><span className="text-white">{name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="text-white">{projectType}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Location</span><span className="text-white">{location}, {country}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Capacity</span><span className="text-white">{capacityMW} MW</span></div>
                </div>
                <h3 className="text-sm font-medium text-slate-300 pt-2">Geological</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Thermal Gradient</span><span className="text-white">{thermalGradient} °C/km</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Reservoir Temp</span><span className="text-white">{reservoirTemp} °C</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Reservoir Depth</span><span className="text-white">{reservoirDepth} m</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Drilling Success</span><span className="text-white">{(drillingSuccessProb * 100).toFixed(0)}%</span></div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-300">Financial Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">CapEx</span><span className="text-white font-mono">{fmt(capex)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Annual Revenue</span><span className="text-white font-mono">{fmt(annualRevenue)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Annual OpEx</span><span className="text-white font-mono">{fmt(opexPerYear)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Discount Rate</span><span className="text-white">{discountRate}%</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Project Life</span><span className="text-white">{projectLife} years</span></div>
                </div>
                <h3 className="text-sm font-medium text-slate-300 pt-2">Computed Metrics</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg text-center" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
                    <p className="text-xs text-slate-400">NPV</p>
                    <p className={`text-base font-bold ${previewMetrics.npv >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(previewMetrics.npv)}</p>
                  </div>
                  <div className="p-2 rounded-lg text-center" style={{ background: "rgba(43,123,194,0.06)", border: "1px solid rgba(43,123,194,0.15)" }}>
                    <p className="text-xs text-slate-400">IRR</p>
                    <p className="text-base font-bold text-white">{previewMetrics.irr}%</p>
                  </div>
                  <div className="p-2 rounded-lg text-center" style={{ background: "rgba(108,180,217,0.06)", border: "1px solid rgba(108,180,217,0.15)" }}>
                    <p className="text-xs text-slate-400">Payback</p>
                    <p className="text-base font-bold text-white">{previewMetrics.paybackYears} yr</p>
                  </div>
                  <div className="p-2 rounded-lg text-center" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
                    <p className="text-xs text-slate-400">Risk</p>
                    <p className="text-base font-bold" style={{ color: previewMetrics.riskScore >= 70 ? "#10b981" : previewMetrics.riskScore >= 50 ? "#f59e0b" : "#ef4444" }}>{previewMetrics.riskScore}/100</p>
                  </div>
                </div>
              </div>
            </div>
            {previewMetrics.npv < 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                <AlertTriangle size={14} className="text-red-400 shrink-0" />
                <p className="text-xs text-slate-400">
                  <span className="text-red-400 font-medium">Warning:</span> This project has a negative NPV ({fmt(previewMetrics.npv)}). Consider adjusting financial parameters or conducting additional geological surveys to reduce uncertainty.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => step > 1 ? setStep((step - 1) as Step) : navigate("/projects")}
          className="btn-secondary flex items-center gap-2"
        >
          <ChevronLeft size={16} /> {step === 1 ? "Cancel" : "Back"}
        </button>
        {step < 4 ? (
          <button
            onClick={() => setStep((step + 1) as Step)}
            disabled={!canProceed()}
            className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleCreate} className="flex items-center gap-2 text-white font-medium px-6 py-2 rounded-lg transition-all text-sm" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
            <Zap size={16} /> Create Project & Run Analysis
          </button>
        )}
      </div>
    </div>
  );
}
