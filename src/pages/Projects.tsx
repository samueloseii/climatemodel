import { MapPin, Building2, Square, Calendar } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { projects } from "../data/mockData";

export default function Projects() {
  const grouped = projects.reduce<Record<string, typeof projects>>((acc, p) => {
    if (!acc[p.state]) acc[p.state] = [];
    acc[p.state].push(p);
    return acc;
  }, {});

  const totalProjects = projects.length;
  const inProgress = projects.filter((p) => p.status === "In Progress").length;
  const completed = projects.filter((p) => p.status === "Completed").length;
  const draft = projects.filter((p) => p.status === "Draft").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Projects</h1>
        <p className="text-slate-400 mt-1">Manage all geothermal feasibility studies</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Projects", value: totalProjects, accent: "text-white" },
          { label: "In Progress", value: inProgress, accent: "text-blue-400" },
          { label: "Completed", value: completed, accent: "text-emerald-400" },
          { label: "Draft", value: draft, accent: "text-slate-300" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.accent}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {Object.entries(grouped).map(([state, stateProjects]) => (
        <div key={state}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <h2 className="text-xl font-bold text-white">{state}</h2>
            <span className="text-sm text-slate-500">
              ({stateProjects.length} project{stateProjects.length > 1 ? "s" : ""})
            </span>
          </div>
          <div className="space-y-4">
            {stateProjects.map((project) => (
              <div key={project.id} className="glass-card-hover p-5 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {project.location} &bull; {project.county}</span>
                    <span className="flex items-center gap-1"><Building2 size={14} /> {project.buildingType}</span>
                    <span className="flex items-center gap-1"><Square size={14} /> {project.sqft.toLocaleString()} sq ft</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> {project.date}</span>
                  </div>
                  <div className="flex items-center gap-6 mt-3">
                    <div>
                      <span className="text-xs text-slate-500">NPV</span>
                      <p className="text-sm font-bold text-emerald-400">${project.npv.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Payback Period</span>
                      <p className="text-sm font-bold text-slate-300">{project.paybackPeriod} years</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">IRR</span>
                      <p className="text-sm font-bold text-emerald-400">{project.irr}%</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-primary text-sm">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
