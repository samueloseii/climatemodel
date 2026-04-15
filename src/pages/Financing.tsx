import { DollarSign, TrendingUp, Leaf, Building2, Landmark, HandCoins, Banknote } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { carbonPriceTrends } from "../data/mockData";

export default function Financing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Financing & <span className="gradient-text">Revenue</span></h1>
        <p className="text-slate-400 mt-1">Financing structures, incentive programs, carbon markets, and revenue optimization</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Financing Options", value: "8", sub: "Available programs", icon: DollarSign, accent: "text-orange-400" },
          { label: "Avg. Interest Rate", value: "4.8%", sub: "For geothermal projects", icon: TrendingUp, accent: "text-emerald-400" },
          { label: "Tax Incentives", value: "30%", sub: "ITC under IRA", icon: Leaf, accent: "text-cyan-400" },
          { label: "Carbon Markets", value: "4", sub: "Active trading systems", icon: Leaf, accent: "text-blue-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.sub}</p>
            </div>
            <stat.icon size={20} className={stat.accent} />
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500/15 rounded-full flex items-center justify-center">
              <Leaf size={18} className="text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">Carbon Credits Trading Integration</h3>
                <span className="bg-emerald-500/15 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-medium">Revenue Stream</span>
              </div>
              <p className="text-sm text-slate-400">Monetize CO&#8322; emissions savings through global carbon markets</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
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
            <div key={m.market} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">{m.market}</span>
                <TrendingUp size={14} className="text-emerald-400" />
              </div>
              <p className="text-xl font-bold text-white">{m.price}</p>
              <p className="text-xs text-emerald-400 mt-0.5">{m.change}</p>
              <p className="text-xs text-slate-500">{m.region}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-3">
          <DollarSign size={20} className="text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Carbon Credit Revenue Integration</h3>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Geothermal systems reduce CO&#8322; emissions by eliminating fossil fuel combustion. The platform calculates potential carbon credit revenue based on annual emissions savings and current market prices, then integrates this revenue stream into NPV and IRR calculations.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
            <p className="text-xs text-slate-500 mb-1">Example: 45,000 sq ft Office</p>
            <p className="text-lg font-bold text-white">~156 tCO&#8322;e/year avoided</p>
            <p className="text-sm font-semibold text-emerald-400">Annual revenue: $2,340 - $13,100</p>
            <p className="text-xs text-slate-500 mt-1">25-year NPV: $58,500 - $327,500</p>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
            <p className="text-xs text-slate-500 mb-1">Market Eligibility</p>
            <p className="text-lg font-bold text-white">Compliance & Voluntary</p>
            <p className="text-sm text-emerald-400">Location-based eligibility check</p>
            <p className="text-xs text-slate-500 mt-1">Verified through registries</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">6-Month Price Trends ($/tCO&#8322;e)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={carbonPriceTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569", borderRadius: 12 }} />
            <Legend />
            <Line type="monotone" dataKey="euEts" stroke="#3b82f6" name="EU ETS" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="california" stroke="#10b981" name="California" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="rggi" stroke="#f97316" name="RGGI" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="voluntary" stroke="#eab308" name="Voluntary" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Leaf size={20} className="text-cyan-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Federal & State Tax Incentives</h3>
              <p className="text-sm text-slate-400">IRA tax credits, state rebates, and utility incentive programs</p>
            </div>
          </div>
          <button className="btn-primary text-sm">Calculate My Incentives &rarr;</button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/30">
            <p className="text-sm font-semibold text-orange-400 mb-1">Federal ITC</p>
            <p className="text-3xl font-bold text-white">30%</p>
            <p className="text-sm text-slate-400 mt-1">Investment Tax Credit under IRA</p>
            <ul className="mt-3 space-y-1 text-xs text-emerald-400">
              <li>&#9679; Applies to ground-source heat pumps</li>
              <li>&#9679; Commercial & residential properties</li>
              <li>&#9679; Valid through December 31, 2032</li>
              <li>&#9679; Steps down to 26% in 2033-2034</li>
            </ul>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/30">
            <p className="text-sm font-semibold text-orange-400 mb-1">State Rebates</p>
            <p className="text-3xl font-bold text-white">Varies</p>
            <p className="text-sm text-slate-400 mt-1">Location-specific state programs</p>
            <ul className="mt-3 space-y-1 text-xs text-emerald-400">
              <li>&#9679; Colorado: up to $12,000 per system</li>
              <li>&#9679; California: $3,000-$6,000 rebates</li>
              <li>&#9679; NY: up to $15,000 heat pump incentives</li>
              <li>&#9679; Automatically loaded by project location</li>
            </ul>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/30">
            <p className="text-sm font-semibold text-orange-400 mb-1">Section 179D</p>
            <p className="text-3xl font-bold text-white">$5.00</p>
            <p className="text-sm text-slate-400 mt-1">Per sq ft for energy-efficient buildings</p>
            <ul className="mt-3 space-y-1 text-xs text-emerald-400">
              <li>&#9679; Enhanced under IRA (was $1.88/sq ft)</li>
              <li>&#9679; Applies to HVAC system improvements</li>
              <li>&#9679; Must meet energy savings thresholds</li>
              <li>&#9679; Example: 45,000 sq ft = $225,000</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Landmark size={20} className="text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Financing Structure Comparison</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: "Construction-to-Term Loan", rate: "4.5-6.5%", term: "15-25 yr", icon: Building2, desc: "Traditional debt with construction phase converting to long-term fixed rate", pros: "Low cost of capital, fixed payments", cons: "Requires strong credit, collateral" },
            { name: "Convertible Grant + Equity", rate: "0-3%", term: "5-10 yr", icon: HandCoins, desc: "Development bank grants that convert to equity upon project success", pros: "De-risks early stage, patient capital", cons: "Dilutive, limited availability" },
            { name: "Tax Equity Partnership", rate: "7-9% IRR", term: "10-15 yr", icon: Banknote, desc: "Tax-motivated investors monetize ITC/PTC credits in exchange for equity", pros: "Monetizes tax benefits immediately", cons: "Complex structure, investor requirements" },
            { name: "Blended Finance (DFI)", rate: "2-5%", term: "15-30 yr", icon: Landmark, desc: "Concessional + commercial capital blend with development finance institution", pros: "Below-market rates, longer tenor", cons: "Lengthy approval process, reporting" },
          ].map(f => (
            <div key={f.name} className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/30">
              <div className="flex items-center gap-3 mb-2">
                <f.icon size={18} className="text-orange-400" />
                <h4 className="text-sm font-semibold text-white">{f.name}</h4>
              </div>
              <p className="text-xs text-slate-400 mb-3">{f.desc}</p>
              <div className="flex gap-4 mb-3">
                <div>
                  <p className="text-xs text-slate-500">Rate</p>
                  <p className="text-sm font-bold text-emerald-400">{f.rate}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Term</p>
                  <p className="text-sm font-bold text-blue-400">{f.term}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs"><span className="text-emerald-400">+</span> <span className="text-slate-400">{f.pros}</span></p>
                <p className="text-xs"><span className="text-red-400">-</span> <span className="text-slate-400">{f.cons}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={18} className="text-blue-400" />
            <h3 className="text-base font-semibold text-white">Traditional Financing</h3>
          </div>
          <div className="space-y-2">
            {["Commercial Bank Loan (4.5-6.5%)", "PACE Financing (5.0-7.0%)", "SBA 504 Loan (4.0-5.5%)", "Equipment Lease (5.5-8.0%)"].map((opt) => (
              <div key={opt} className="bg-slate-800/40 rounded-xl px-4 py-3 text-sm text-slate-300 border border-slate-700/20">{opt}</div>
            ))}
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={18} className="text-emerald-400" />
            <h3 className="text-base font-semibold text-white">Alternative Structures</h3>
          </div>
          <div className="space-y-2">
            {["Power Purchase Agreement (PPA)", "Shared Savings (ESCO)", "On-Bill Financing", "Green Bonds / Tax Equity"].map((opt) => (
              <div key={opt} className="bg-slate-800/40 rounded-xl px-4 py-3 text-sm text-slate-300 border border-slate-700/20">{opt}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
