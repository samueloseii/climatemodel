import { User, Bell, Shield, Palette, Database, Globe } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { title: "Profile", desc: "Manage your account information and preferences", icon: User, fields: ["Full Name", "Email", "Organization", "Role"] },
          { title: "Notifications", desc: "Configure alert preferences and report delivery", icon: Bell, fields: ["Email Alerts", "Simulation Complete", "Risk Threshold Alerts", "Weekly Reports"] },
          { title: "Security", desc: "Authentication, API keys, and access controls", icon: Shield, fields: ["Two-Factor Auth", "API Key Management", "Session Timeout", "Audit Log"] },
          { title: "Display", desc: "Theme, chart preferences, and visualization settings", icon: Palette, fields: ["Dark Mode", "Chart Color Scheme", "Default Currency", "Number Format"] },
          { title: "Data Sources", desc: "Configure external data feeds and API integrations", icon: Database, fields: ["USGS Database", "IEA Energy Data", "Carbon Market Feed", "Weather API"] },
          { title: "Regional", desc: "Locale, timezone, and regulatory framework settings", icon: Globe, fields: ["Timezone", "Currency", "Regulatory Framework", "Carbon Market Region"] },
        ].map(section => (
          <div key={section.title} className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <section.icon size={20} className="text-orange-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{section.title}</h3>
                <p className="text-xs text-slate-500">{section.desc}</p>
              </div>
            </div>
            <div className="space-y-3">
              {section.fields.map(field => (
                <div key={field} className="flex items-center justify-between bg-slate-800/40 rounded-xl px-4 py-3 border border-slate-700/20">
                  <span className="text-sm text-slate-300">{field}</span>
                  <span className="text-xs text-slate-500">Configure &rarr;</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
