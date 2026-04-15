import { useNavigate } from "react-router-dom";
import { FolderOpen, TrendingUp, Clock, Leaf } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { recentProjects } from "../data/mockData";

export default function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: "Active Projects", value: "24", icon: FolderOpen },
    { label: "Projects This Month", value: "8", icon: TrendingUp },
    { label: "Avg Time Saved", value: "12h", icon: Clock },
    { label: "CO\u2082 Avoided", value: "1,240 tons", icon: Leaf },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
      <p className="text-slate-500 mt-1">
        Welcome back. Here's an overview of your geothermal feasibility projects.
      </p>

      {/* Welcome Banner */}
      <div className="mt-6 bg-slate-800 rounded-xl p-6 text-white flex items-start gap-4">
        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <Leaf size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Welcome to GeoPro</h2>
          <p className="text-slate-300 text-sm mt-1">
            Your decision-support platform for geothermal ROI analysis. Turn uncertainty into clear, client-ready insights. Start by creating a new feasibility study or explore your existing projects below.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
            </div>
            <stat.icon size={22} className="text-orange-500" />
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-lg font-semibold text-slate-800">Quick Actions</h3>
        <button
          onClick={() => navigate("/new-project")}
          className="mt-3 bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          Create New Feasibility Study
        </button>
      </div>

      {/* Recent Projects Table */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Projects</h3>
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-orange-500 border-b border-slate-100">
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Location</th>
              <th className="pb-3 font-medium">Building Type</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Last Modified</th>
            </tr>
          </thead>
          <tbody>
            {recentProjects.map((project, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0">
                <td className="py-3.5 text-sm text-slate-700 font-medium">{project.name}</td>
                <td className="py-3.5 text-sm text-slate-500">{project.location}</td>
                <td className="py-3.5 text-sm text-slate-500">{project.buildingType}</td>
                <td className="py-3.5"><StatusBadge status={project.status} /></td>
                <td className="py-3.5 text-sm text-slate-500">{project.lastModified}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
