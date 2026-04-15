import { DollarSign, TrendingUp, Leaf, ExternalLink } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { carbonPriceTrends } from "../data/mockData";

export default function Financing() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800">Financing & Revenue Optimization</h1>
      <p className="text-slate-500 mt-1">Explore financing options, incentive programs, and revenue streams to maximize project ROI</p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        {[
          { label: "Financing Options", value: "8", sub: "Available programs", icon: DollarSign },
          { label: "Avg. Interest Rate", value: "4.8%", sub: "For geothermal projects", icon: TrendingUp },
          { label: "Tax Incentives", value: "30%", sub: "ITC under IRA", icon: Leaf },
          { label: "Carbon Markets", value: "4", sub: "Active trading systems", icon: Leaf },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
            </div>
            <stat.icon size={20} className="text-green-500" />
          </div>
        ))}
      </div>

      {/* Carbon Credits Trading */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Leaf size={18} className="text-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-800">Carbon Credits Trading Integration</h3>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Revenue Stream</span>
              </div>
              <p className="text-sm text-slate-500">Monetize CO&#8322; emissions savings through global carbon markets</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live Feed
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { market: "EU ETS", price: "$84.00", change: "+3.7% this month", region: "European Union" },
            { market: "California Cap-and-Trade", price: "$46.00", change: "+7.0% this month", region: "California, USA" },
            { market: "RGGI", price: "$18.00", change: "+5.9% this month", region: "Northeast US States" },
            { market: "Voluntary Markets", price: "$15.00", change: "+7.1% this month", region: "Global (Verra, Gold Standard)" },
          ].map((m) => (
            <div key={m.market} className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">{m.market}</span>
                <TrendingUp size={14} className="text-green-500" />
              </div>
              <p className="text-xl font-bold text-slate-800">{m.price}</p>
              <p className="text-xs text-green-600 mt-0.5">{m.change}</p>
              <p className="text-xs text-slate-400">{m.region}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Carbon Credit Revenue */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
        <div className="flex items-center gap-3 mb-3">
          <DollarSign size={20} className="text-green-600" />
          <h3 className="text-lg font-semibold text-slate-800">Carbon Credit Revenue Integration</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Geothermal systems reduce CO&#8322; emissions by eliminating fossil fuel combustion for heating and cooling. The platform automatically calculates potential carbon credit revenue based on annual emissions savings and current market prices, then integrates this revenue stream into your project's NPV and IRR calculations.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">Example: 45,000 sq ft Office</p>
            <p className="text-lg font-bold text-slate-800">~156 tCO&#8322;e/year avoided</p>
            <p className="text-sm font-semibold text-green-600">Annual revenue: $2,340 - $13,100</p>
            <p className="text-xs text-slate-400 mt-1">25-year NPV: $58,500 - $327,500</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">Market Eligibility</p>
            <p className="text-lg font-bold text-slate-800">Compliance & Voluntary</p>
            <p className="text-sm text-green-600">Location-based eligibility check</p>
            <p className="text-xs text-slate-400 mt-1">Verified through registries</p>
          </div>
        </div>
        <a href="#" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-3">
          View calculation methodology & ROI impact <ExternalLink size={14} />
        </a>
      </div>

      {/* Price Trends Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">6-Month Price Trends ($/tCO&#8322;e)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={carbonPriceTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="euEts" stroke="#3b82f6" name="EU ETS" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="california" stroke="#10b981" name="California" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="rggi" stroke="#f97316" name="RGGI" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="voluntary" stroke="#eab308" name="Voluntary" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Federal & State Tax Incentives */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Leaf size={20} className="text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Federal & State Tax Incentives</h3>
              <p className="text-sm text-slate-500">IRA tax credits, state rebates, and utility incentive programs</p>
            </div>
          </div>
          <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700">
            Calculate My Incentives &rarr;
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-lg p-5">
            <p className="text-sm font-semibold text-slate-700 mb-1">Federal ITC</p>
            <p className="text-3xl font-bold text-slate-800">30%</p>
            <p className="text-sm text-slate-500 mt-1">Investment Tax Credit under Inflation Reduction Act (IRA)</p>
            <ul className="mt-3 space-y-1 text-xs text-green-600">
              <li className="flex items-center gap-1">&#9679; Applies to ground-source heat pumps</li>
              <li className="flex items-center gap-1">&#9679; Commercial & residential properties</li>
              <li className="flex items-center gap-1">&#9679; Valid through December 31, 2032</li>
              <li className="flex items-center gap-1">&#9679; Steps down to 26% in 2033-2034</li>
            </ul>
            <a href="#" className="text-sm text-blue-600 hover:underline mt-3 inline-block">View eligibility details &rarr;</a>
          </div>
          <div className="bg-slate-50 rounded-lg p-5">
            <p className="text-sm font-semibold text-slate-700 mb-1">State Rebates</p>
            <p className="text-3xl font-bold text-slate-800">Varies</p>
            <p className="text-sm text-slate-500 mt-1">Location-specific state and utility programs</p>
            <ul className="mt-3 space-y-1 text-xs text-green-600">
              <li className="flex items-center gap-1">&#9679; Colorado: up to $12,000 per system</li>
              <li className="flex items-center gap-1">&#9679; California: $3,000-$6,000 rebates</li>
              <li className="flex items-center gap-1">&#9679; NY: up to $15,000 heat pump incentives</li>
              <li className="flex items-center gap-1">&#9679; Automatically loaded by project location</li>
            </ul>
          </div>
          <div className="bg-slate-50 rounded-lg p-5">
            <p className="text-sm font-semibold text-slate-700 mb-1">Section 179D</p>
            <p className="text-3xl font-bold text-slate-800">$5.00</p>
            <p className="text-sm text-slate-500 mt-1">Per sq ft for energy-efficient commercial buildings</p>
            <ul className="mt-3 space-y-1 text-xs text-green-600">
              <li className="flex items-center gap-1">&#9679; Enhanced under IRA (was $1.88/sq ft)</li>
              <li className="flex items-center gap-1">&#9679; Applies to HVAC system improvements</li>
              <li className="flex items-center gap-1">&#9679; Must meet energy savings thresholds</li>
              <li className="flex items-center gap-1">&#9679; Example: 45,000 sq ft = $225,000</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Financing Options */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={18} className="text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-800">Traditional Financing Options</h3>
          </div>
          <div className="space-y-3">
            {["Commercial Bank Loan (4.5-6.5%)", "PACE Financing (5.0-7.0%)", "SBA 504 Loan (4.0-5.5%)", "Equipment Lease (5.5-8.0%)"].map((opt) => (
              <div key={opt} className="bg-slate-50 rounded-lg px-4 py-3 text-sm text-slate-700">{opt}</div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={18} className="text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-800">Alternative Structures</h3>
          </div>
          <div className="space-y-3">
            {["Power Purchase Agreement (PPA)", "Shared Savings (ESCO)", "On-Bill Financing", "Green Bonds / Tax Equity"].map((opt) => (
              <div key={opt} className="bg-slate-50 rounded-lg px-4 py-3 text-sm text-slate-700">{opt}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
