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
    <div>
      <h1 className="text-3xl font-bold text-slate-800">Projects</h1>
      <p className="text-slate-500 mt-1">Manage all geothermal feasibility studies</p>

      <div className="grid grid-cols-4 gap-4 mt-6">
        {[
          { label: "Total Projects", value: totalProjects, color: "text-slate-800" },
          { label: "In Progress", value: inProgress, color: "text-blue-600" },
          { label: "Completed", value: completed, color: "text-green-600" },
          { label: "Draft", value: draft, color: "text-slate-800" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {Object.entries(grouped).map(([state, stateProjects]) => (
        <div key={state} className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <h2 className="text-xl font-bold text-slate-800">{state}</h2>
            <span className="text-sm text-slate-400">
              ({stateProjects.length} project{stateProjects.length > 1 ? "s" : ""})
            </span>
          </div>
          <div className="space-y-4">
            {stateProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-800">{project.name}</h3>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {project.location} &bull; {project.county}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 size={14} /> {project.buildingType}
                    </span>
                    <span className="flex items-center gap-1">
                      <Square size={14} /> {project.sqft.toLocaleString()} sq ft
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> {project.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 mt-3">
                    <div>
                      <span className="text-xs text-slate-400">NPV</span>
                      <p className="text-sm font-bold text-green-600">
                        ${project.npv.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Payback Period</span>
                      <p className="text-sm font-bold text-slate-700">
                        {project.paybackPeriod} years
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">IRR</span>
                      <p className="text-sm font-bold text-green-600">{project.irr}%</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700">
                    View Details
                  </button>
                  <button className="text-slate-400 hover:text-slate-600 p-2">
                    &bull;&bull;&bull;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
