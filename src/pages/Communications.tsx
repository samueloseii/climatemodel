import { MessageSquare, Send, FileText, Download, Eye, Copy, Sparkles } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { communications } from "../data/mockData";

export default function Communications() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800">Stakeholder Communications</h1>
      <p className="text-slate-500 mt-1">Manage and track tailored reports sent to different stakeholder types</p>

      {/* Search & Filters */}
      <div className="flex items-center gap-4 mt-6">
        <input
          type="text"
          placeholder="Search by project, stakeholder, or subject..."
          className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm hover:bg-slate-700">
          <Sparkles size={16} /> Generate New Communication
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <select className="border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
          <option>All Stakeholder Types</option>
          <option>CFO / Finance</option>
          <option>Facilities Manager</option>
          <option>Building Owner</option>
          <option>Sustainability Director</option>
          <option>Board / Executive</option>
        </select>
        <select className="border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
          <option>All Types</option>
          <option>Executive Summary</option>
          <option>Technical Report</option>
          <option>Financial Analysis</option>
          <option>Environmental Impact</option>
        </select>
        <select className="border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
          <option>All Statuses</option>
          <option>Delivered</option>
          <option>Draft</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        {[
          { label: "Total Communications", value: "10", icon: MessageSquare },
          { label: "Delivered", value: "8", icon: Send, color: "text-green-600" },
          { label: "Drafts", value: "2", icon: FileText },
          { label: "Avg. Downloads", value: "2.0", icon: Download },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color || "text-slate-800"}`}>{stat.value}</p>
            </div>
            <stat.icon size={20} className="text-orange-500" />
          </div>
        ))}
      </div>

      {/* Communication Cards */}
      <div className="space-y-4 mt-6">
        {communications.map((comm) => (
          <div key={comm.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare size={16} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-slate-800">{comm.title}</h3>
                    <StatusBadge status={comm.status} />
                  </div>
                  <p className="text-sm text-slate-500">{comm.project}</p>
                  <div className="flex items-center gap-6 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="text-slate-400">{comm.recipientRole}:</span> {comm.recipientName}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={14} /> Type: {comm.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 mt-1 text-sm text-slate-500">
                    <span>Sent: {comm.sentDate}</span>
                    <span>Opened: <span className={comm.opened ? "text-green-600" : "text-slate-400"}>{comm.opened ? "Yes" : "No"}</span></span>
                    <span>Downloads: {comm.downloads}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    <strong>Summary:</strong> {comm.summary}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0 ml-4">
                <button className="flex items-center gap-2 bg-slate-800 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-slate-700">
                  <Eye size={14} /> View
                </button>
                <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 px-4 py-1.5">
                  <Download size={14} /> Download
                </button>
                <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 px-4 py-1.5">
                  <Copy size={14} /> Duplicate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
