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
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/monte-carlo", icon: Activity, label: "Monte Carlo" },
  { to: "/risk-analysis", icon: Shield, label: "Risk Analysis" },
  { to: "/expected-utility", icon: Brain, label: "Expected Utility" },
  { to: "/decision-theory", icon: Swords, label: "Decision Theory" },
  { to: "/predictions", icon: TrendingUp, label: "Predictions" },
  { to: "/geological", icon: Mountain, label: "Geological" },
  { to: "/projects", icon: FolderOpen, label: "Projects" },
  { to: "/financing", icon: DollarSign, label: "Financing" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-700/30 flex flex-col shrink-0">
      <div className="flex flex-col items-center pt-7 pb-5 px-4">
        <div className="w-14 h-14 mb-3 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-400 rounded-2xl rotate-6 opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-amber-500 rounded-2xl flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-8 h-8">
              <path d="M20 6 L8 32 L32 32 Z" fill="white" opacity="0.9" />
              <circle cx="20" cy="22" r="5" fill="white" opacity="0.6" />
            </svg>
          </div>
        </div>
        <span className="text-sm font-bold text-white tracking-wider">MIDDLE EARTH</span>
        <span className="text-xs text-orange-400 tracking-widest font-medium">INNOVATIONS</span>
        <span className="text-xs text-slate-500 mt-1">GeoPro Analytics</span>
      </div>
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
      <nav className="flex-1 mt-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-orange-500/15 to-amber-500/10 text-orange-400 border border-orange-500/20 shadow-lg shadow-orange-500/5"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4">
        <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 rounded-xl p-4">
          <p className="text-xs font-semibold text-orange-400 mb-1">Pro Analytics</p>
          <p className="text-xs text-slate-400 leading-relaxed">Monte Carlo &bull; VaR/CVaR &bull; Decision Theory</p>
        </div>
      </div>
    </aside>
  );
}
