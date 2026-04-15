import { Database, Eye, RefreshCw, Upload } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { dataSources } from "../data/mockData";

export default function DataRepository() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800">Data Repository</h1>
      <p className="text-slate-500 mt-1">Manage reference data, benchmarks, and regional information</p>

      <div className="grid grid-cols-4 gap-4 mt-6">
        {[
          { label: "Total Datasets", value: "847", icon: Database },
          { label: "Verified Sources", value: "612", icon: Database },
          { label: "User Modified", value: "235", icon: Database },
          { label: "Last Updated", value: "Today", icon: RefreshCw },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
            </div>
            <stat.icon size={20} className="text-orange-500" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mt-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Filters</h3>
        <div className="grid grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search datasets..."
            className="border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <select className="border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option>All Data Types</option>
            <option>Climate Zone</option>
            <option>Drilling</option>
            <option>Pricing</option>
            <option>Tax Incentives</option>
          </select>
          <select className="border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option>All Sources</option>
            <option>DOE</option>
            <option>NREL</option>
            <option>User</option>
            <option>ICE Futures</option>
          </select>
          <select className="border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option>All Status</option>
            <option>Verified</option>
            <option>User Modified</option>
            <option>Live Feed</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Data Sources</h3>
          <button className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700">
            <Upload size={16} /> Upload Data
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-orange-500 border-b border-slate-100">
              <th className="pb-3 font-medium">Data Type</th>
              <th className="pb-3 font-medium">Region</th>
              <th className="pb-3 font-medium">Source</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Last Updated</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataSources.map((ds) => (
              <tr key={ds.id} className="border-b border-slate-50 last:border-0">
                <td className="py-3.5 text-sm text-slate-700 font-medium">{ds.dataType}</td>
                <td className="py-3.5 text-sm text-slate-500">{ds.region}</td>
                <td className="py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${ds.sourceColor}`}>
                    {ds.source}
                  </span>
                </td>
                <td className="py-3.5"><StatusBadge status={ds.status} /></td>
                <td className="py-3.5 text-sm text-slate-500">{ds.lastUpdated}</td>
                <td className="py-3.5">
                  <div className="flex items-center gap-3">
                    <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                      <Eye size={14} /> View
                    </button>
                    <button className="text-slate-400 hover:text-slate-600">
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
