export default function Architecture() {
  const layers = [
    { name: "User Inputs", desc: "Project parameters, cost data, financing options", color: "bg-slate-800" },
    { name: "Techno-Economic Engine", desc: "Load calculations, system sizing, energy modeling", color: "bg-orange-500" },
    { name: "Financial Model Layer", desc: "NPV, IRR, payback calculations, sensitivity analysis", color: "bg-blue-700" },
    { name: "Visualization Engine", desc: "Charts, dashboards, audience-specific views", color: "bg-orange-500" },
    { name: "Export Layer", desc: "PDF reports, Excel models, presentation slides", color: "bg-slate-800" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800">Integration Architecture</h1>
      <p className="text-orange-500 mt-1">Middle Earth Decision Layer Architecture Overview</p>

      <div className="bg-white rounded-xl border border-slate-200 p-8 mt-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-8">Middle Earth Decision Layer Architecture</h3>
        <div className="flex flex-col items-center gap-2 max-w-2xl mx-auto">
          {layers.map((layer, i) => (
            <div key={layer.name} className="w-full">
              <div className={`${layer.color} text-white rounded-lg p-5 text-center`}>
                <p className="font-semibold text-lg">{layer.name}</p>
                <p className="text-sm opacity-80 mt-1">{layer.desc}</p>
              </div>
              {i < layers.length - 1 && (
                <div className="flex justify-center py-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-slate-400">
                    <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
