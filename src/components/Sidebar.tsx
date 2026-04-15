import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PlusSquare,
  FolderOpen,
  Database,
  DollarSign,
  MessageSquare,
  FileText,
  GitBranch,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/new-project", icon: PlusSquare, label: "New Project" },
  { to: "/projects", icon: FolderOpen, label: "Projects" },
  { to: "/data", icon: Database, label: "Data Repository" },
  { to: "/financing", icon: DollarSign, label: "Financing" },
  { to: "/communications", icon: MessageSquare, label: "Communications" },
  { to: "/reports", icon: FileText, label: "Reports" },
  { to: "/architecture", icon: GitBranch, label: "Architecture" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-44 min-h-screen bg-slate-800 text-white flex flex-col shrink-0">
      <div className="flex flex-col items-center pt-6 pb-4 px-3">
        <div className="w-16 h-16 mb-2 relative">
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle cx="40" cy="40" r="36" fill="#1e40af" opacity="0.3" />
            <path d="M20 55 L40 20 L60 55 Z" fill="#f97316" opacity="0.9" />
            <path d="M28 55 L40 30 L52 55 Z" fill="#1e40af" opacity="0.8" />
            <circle cx="40" cy="40" r="8" fill="#f97316" />
            <path d="M15 58 Q40 65 65 58" stroke="#f97316" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <span className="text-xs font-bold text-center leading-tight tracking-wide">
          MIDDLE EARTH
        </span>
        <span className="text-xs text-orange-400 tracking-widest">
          INNOVATIONS
        </span>
      </div>
      <nav className="flex-1 mt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-slate-700 text-orange-400 border-l-3 border-orange-400"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white border-l-3 border-transparent"
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
