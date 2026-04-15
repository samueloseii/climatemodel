import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, Upload, ChevronLeft, ChevronRight } from "lucide-react";

const steps = ["Basics", "Costs", "Financing", "Results", "Audience"];

const hvacSystems = ["Select current system...", "Central Air (Split System)", "Packaged Rooftop Unit", "Boiler + Chiller", "Window Units", "None / Unknown"];
const buildingCategories = ["Small Commercial (<25k sqft)", "Midsize Commercial (25k-100k sqft)", "Large Commercial (>100k sqft)", "Residential", "Industrial"];
const operatingSchedules = ["Standard Business Hours (8am-6pm, M-F)", "Extended Hours (6am-10pm, M-F)", "24/7 Operations", "School Schedule", "Seasonal"];
const conditionOptions = ["Select condition...", "Excellent", "Good", "Fair", "Poor"];
const infiltrationOptions = ["Select if known...", "Tight (<0.5 ACH)", "Average (0.5-1.0 ACH)", "Leaky (>1.0 ACH)"];
const states = ["Colorado", "California", "Idaho", "Oregon", "Washington", "New York", "Texas"];

export default function NewProject() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800">New Feasibility Study</h1>
      <p className="text-slate-500 mt-1">Create a comprehensive geothermal ROI analysis</p>

      {/* Step Indicator */}
      <div className="flex items-center mt-8 mb-8">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i <= currentStep
                    ? "bg-orange-500 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-xs mt-1.5 ${i <= currentStep ? "text-orange-500 font-medium" : "text-slate-400"}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 -mt-4 ${i < currentStep ? "bg-orange-500" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {currentStep === 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Step 1: Project Basics</h2>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
            <input
              type="text"
              placeholder="Enter project name"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Project Location */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-slate-800">Project Location</h3>
              <Info size={16} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Precise location helps us access geological data, soil conditions, ground temperature, and regional climate patterns for accurate feasibility modeling.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <select className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {states.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Region / County</label>
                <input type="text" placeholder="e.g., Boulder County, Bay Area" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-xs text-slate-400 mt-1">County or regional area</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City / Town</label>
                <input type="text" placeholder="e.g., Denver" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-xs text-slate-400 mt-1">Municipality name</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ZIP / Postal Code</label>
                <input type="text" placeholder="e.g., 80302" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-xs text-slate-400 mt-1">For climate zone data</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Latitude (Optional)</label>
                <input type="text" placeholder="e.g., 39.7392" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-xs text-slate-400 mt-1">Decimal degrees format</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Longitude (Optional)</label>
                <input type="text" placeholder="e.g., -104.9903" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-xs text-slate-400 mt-1">Decimal degrees format</p>
              </div>
            </div>

            {/* Data Sources Info */}
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Available Geological Data Sources:</p>
              <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li>USGS National Geothermal Database</li>
                <li>State Geological Survey (formation & soil data)</li>
                <li>NOAA Climate Data (temperature, heating/cooling degree days)</li>
                <li>Regional groundwater temperature maps</li>
                <li>Local utility rate schedules & incentive programs</li>
              </ul>
            </div>
          </div>

          {/* Building Characteristics */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-slate-800">Building Characteristics</h3>
              <Info size={16} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Detailed building information enables accurate load calculations, system sizing, and ROI projections.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Building Category</label>
                <select className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {buildingCategories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Specific Use</label>
                <input type="text" placeholder="e.g., Law office, Yoga studio" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-xs text-slate-400 mt-1">Primary building function</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Construction Year</label>
                <input type="text" placeholder="e.g., 1985" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-xs text-slate-400 mt-1">Affects building code standards</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Condition / Renovation Status</label>
                <select className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {conditionOptions.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total Square Footage</label>
                <input type="number" defaultValue={10000} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-xs text-slate-400 mt-1">Conditioned space</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Number of Floors</label>
                <input type="number" defaultValue={1} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-xs text-slate-400 mt-1">Above ground</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Typical Occupancy</label>
                <input type="number" defaultValue={50} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-xs text-slate-400 mt-1">Average # of people</p>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Operating Schedule</label>
              <select className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                {operatingSchedules.map(s => <option key={s}>{s}</option>)}
              </select>
              <p className="text-xs text-slate-400 mt-1">Impacts load profile and energy patterns</p>
            </div>
          </div>

          {/* Building Envelope */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-slate-800">Building Envelope & Insulation</h3>
              <Info size={16} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Insulation quality affects heating/cooling loads and geothermal system sizing.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Overall Insulation Quality</label>
                <select className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>Select quality...</option>
                  <option>Well Insulated (R-30+ walls, R-60 roof)</option>
                  <option>Moderately Insulated (R-13 walls, R-30 roof)</option>
                  <option>Poorly Insulated (R-7 or below)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Window Type</label>
                <select className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>Select window type...</option>
                  <option>Triple Pane Low-E</option>
                  <option>Double Pane Low-E</option>
                  <option>Double Pane Standard</option>
                  <option>Single Pane</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Air Infiltration Rate (Optional)</label>
              <select className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                {infiltrationOptions.map(o => <option key={o}>{o}</option>)}
              </select>
              <p className="text-xs text-slate-400 mt-1">Air changes per hour at 50 pascals (blower door test)</p>
            </div>
          </div>

          {/* HVAC & Load Profile */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-slate-800">Current HVAC System & Load Profile</h3>
              <Info size={16} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Understanding existing system and load patterns ensures accurate geothermal system design.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current HVAC System</label>
                <select className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {hvacSystems.map(s => <option key={s}>{s}</option>)}
                </select>
                <p className="text-xs text-slate-400 mt-1">System to be replaced</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total Design Load (BTU/hr)</label>
                <input type="number" defaultValue={250000} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-xs text-slate-400 mt-1">Combined heating + cooling capacity</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Heating Load (BTU/hr)</label>
                <input type="number" defaultValue={150000} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-xs text-slate-400 mt-1">Design heating capacity</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cooling Load (BTU/hr)</label>
                <input type="number" defaultValue={100000} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-xs text-slate-400 mt-1">Design cooling capacity</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Peak Heating Demand (kW)</label>
                <input type="text" placeholder="e.g., 44" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-xs text-slate-400 mt-1">Maximum electrical demand</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Peak Cooling Demand (kW)</label>
                <input type="text" placeholder="e.g., 29" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-xs text-slate-400 mt-1">Maximum electrical demand</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Annual Heating Hours</label>
                <input type="text" placeholder="e.g., 2500" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-xs text-slate-400 mt-1">Hours per year</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Annual Cooling Hours</label>
                <input type="text" placeholder="e.g., 1200" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <p className="text-xs text-slate-400 mt-1">Hours per year</p>
              </div>
            </div>
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-slate-600">
                <strong>Note:</strong> If detailed load data is unavailable, our system will estimate loads based on building type, size, location, and industry benchmarks. Upload energy bills or engineering reports for more accurate calculations.
              </p>
            </div>
          </div>

          {/* Upload Documents */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <Upload size={32} className="mx-auto text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-700">Upload Project Documents</p>
              <p className="text-xs text-slate-400 mt-1">Drag and drop files here or click to browse</p>
            </div>
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Step 2: Cost Analysis</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Drilling Cost ($/ft)</label>
              <input type="number" defaultValue={45} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Bore Depth (ft)</label>
              <input type="number" defaultValue={300} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Number of Bore Holes</label>
              <input type="number" defaultValue={6} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Heat Pump Equipment Cost ($)</label>
              <input type="number" defaultValue={35000} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Distribution System Cost ($)</label>
              <input type="number" defaultValue={15000} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Installation Labor Cost ($)</label>
              <input type="number" defaultValue={20000} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Annual Energy Cost ($)</label>
              <input type="number" defaultValue={18000} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Projected Annual Savings (%)</label>
              <input type="number" defaultValue={55} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Step 3: Financing Options</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Financing Method</label>
              <select className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option>Cash Purchase</option>
                <option>Commercial Loan</option>
                <option>PACE Financing</option>
                <option>Power Purchase Agreement (PPA)</option>
                <option>Equipment Lease</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loan Term (years)</label>
              <input type="number" defaultValue={15} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Interest Rate (%)</label>
              <input type="number" defaultValue={4.8} step="0.1" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Down Payment (%)</label>
              <input type="number" defaultValue={20} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-800 mb-1">Federal ITC: 30% Tax Credit Available</p>
            <p className="text-sm text-green-700">Under the Inflation Reduction Act, ground-source heat pump installations qualify for a 30% Investment Tax Credit through 2032.</p>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Step 4: Results Preview</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-xl p-5 text-center">
              <p className="text-sm text-slate-500">Net Present Value</p>
              <p className="text-3xl font-bold text-green-600 mt-2">$285,400</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-5 text-center">
              <p className="text-sm text-slate-500">Payback Period</p>
              <p className="text-3xl font-bold text-orange-500 mt-2">7.2 years</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-5 text-center">
              <p className="text-sm text-slate-500">Internal Rate of Return</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">13.5%</p>
            </div>
          </div>
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-slate-600">
              These results are based on your input parameters and regional data. Adjust inputs in previous steps to see how they affect outcomes. A full sensitivity analysis will be available in the generated report.
            </p>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Step 5: Target Audience</h2>
          <p className="text-sm text-slate-500 mb-4">Select stakeholders who will receive tailored reports with audience-specific framing and metrics.</p>
          <div className="space-y-3">
            {[
              { role: "CFO / Finance Director", desc: "NPV, IRR, payback period, cash flow projections" },
              { role: "Facilities Manager", desc: "System specs, maintenance schedule, installation timeline" },
              { role: "Building Owner / Developer", desc: "Investment returns, property value impact, financing options" },
              { role: "Sustainability Director", desc: "Carbon reduction, LEED credits, ESG metrics" },
              { role: "Board / Executive Committee", desc: "Strategic overview, risk assessment, competitive positioning" },
              { role: "Commercial Lender", desc: "Debt service coverage, collateral value, downside risk (CVaR)" },
              { role: "Development Bank", desc: "Development impact, minimax regret, portfolio diversification" },
            ].map((audience) => (
              <label key={audience.role} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" className="mt-1 accent-orange-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700">{audience.role}</p>
                  <p className="text-xs text-slate-400">{audience.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => currentStep === 0 ? navigate("/") : setCurrentStep(currentStep - 1)}
          className="flex items-center gap-2 px-6 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
        >
          <ChevronLeft size={16} />
          {currentStep === 0 ? "Cancel" : "Back"}
        </button>
        <button
          onClick={() => currentStep < steps.length - 1 ? setCurrentStep(currentStep + 1) : navigate("/projects")}
          className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
        >
          {currentStep === steps.length - 1 ? "Submit" : "Next"}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
