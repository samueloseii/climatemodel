import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  Shield,
  Brain,
  Swords,
  TrendingUp,
  Mountain,
  FolderOpen,
  DollarSign,
  Settings,
  Eye,
  FlaskConical,
  Wrench,
  FileDown,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", section: "Overview" },
  { to: "/monte-carlo", icon: Activity, label: "Monte Carlo", section: "Analysis" },
  { to: "/risk-analysis", icon: Shield, label: "Risk Analysis", section: "Analysis" },
  { to: "/expected-utility", icon: Brain, label: "Expected Utility", section: "Analysis" },
  { to: "/decision-theory", icon: Swords, label: "Decision Theory", section: "Analysis" },
  { to: "/voi-analysis", icon: Eye, label: "Value of Info", section: "Decision Science" },
  { to: "/bayesian", icon: FlaskConical, label: "Bayesian Updating", section: "Decision Science" },
  { to: "/reliability", icon: Wrench, label: "Reliability", section: "Decision Science" },
  { to: "/predictions", icon: TrendingUp, label: "Predictions", section: "Forecasting" },
  { to: "/geological", icon: Mountain, label: "Geological", section: "Forecasting" },
  { to: "/projects", icon: FolderOpen, label: "Projects", section: "Management" },
  { to: "/financing", icon: DollarSign, label: "Financing", section: "Management" },
  { to: "/reports", icon: FileDown, label: "Reports", section: "Management" },
  { to: "/settings", icon: Settings, label: "Settings", section: "Management" },
];

const sections = ["Overview", "Analysis", "Decision Science", "Forecasting", "Management"];

export default function Sidebar() {
  return (
    <aside className="w-56 min-h-screen flex flex-col shrink-0" style={{ background: "linear-gradient(180deg, #0d1526 0%, #0b1120 100%)", borderRight: "1px solid rgba(51,65,85,0.3)" }}>
      <div className="flex items-center gap-3 pt-6 pb-5 px-5">
        <img src="/logo.jpeg" alt="Middle Earth Innovations" className="w-10 h-10 rounded-lg object-contain" style={{ background: "white" }} />
        <div>
          <p className="text-sm font-semibold text-white leading-tight">GeoPro</p>
          <p className="text-xs" style={{ color: "#6CB4D9" }}>Middle Earth Innovations</p>
        </div>
      </div>

      <nav className="flex-1 px-3 pb-4">
        {sections.map(section => (
          <div key={section} className="mb-1">
            <p className="px-3 pt-4 pb-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">{section}</p>
            {navItems.filter(item => item.section === section).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                    isActive
                      ? "font-medium" + " bg-[#2B7BC2]/15 text-[#6CB4D9]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`
                }
              >
                <item.icon size={16} strokeWidth={1.75} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-3 mt-auto">
        <div className="rounded-lg p-3" style={{ background: "rgba(43,123,194,0.06)", border: "1px solid rgba(43,123,194,0.15)" }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: "#E8652D" }}>Analytics Engine</p>
          <p className="text-xs text-slate-500 leading-relaxed">v3.0 &middot; 14 modules active</p>
        </div>
      </div>
    </aside>
  );
}
