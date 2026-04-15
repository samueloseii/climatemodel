export interface Project {
  id: string;
  name: string;
  location: string;
  state: string;
  county: string;
  buildingType: string;
  sqft: number;
  date: string;
  status: "In Progress" | "Completed" | "Draft" | "Review";
  npv: number;
  paybackPeriod: number;
  irr: number;
  lastModified: string;
}

export const projects: Project[] = [
  { id: "1", name: "San Francisco Bay Area Campus", location: "San Francisco, CA", state: "California", county: "Bay Area", buildingType: "Office", sqft: 125000, date: "1/5/2026", status: "In Progress", npv: 1240500, paybackPeriod: 8.5, irr: 11.8, lastModified: "2 hours ago" },
  { id: "2", name: "Sacramento Government Building", location: "Sacramento, CA", state: "California", county: "Sacramento Valley", buildingType: "Government", sqft: 85000, date: "12/12/2025", status: "In Progress", npv: 678900, paybackPeriod: 7.9, irr: 12.4, lastModified: "1 day ago" },
  { id: "3", name: "Denver Tech Center Office Retrofit", location: "Denver, CO", state: "Colorado", county: "Denver Metro", buildingType: "Office Building", sqft: 45000, date: "1/15/2026", status: "In Progress", npv: 285400, paybackPeriod: 7.2, irr: 13.5, lastModified: "2 hours ago" },
  { id: "4", name: "Boulder Residential Complex", location: "Boulder, CO", state: "Colorado", county: "Boulder County", buildingType: "Multi-Family", sqft: 32000, date: "2/10/2026", status: "Draft", npv: 156200, paybackPeriod: 9.1, irr: 10.2, lastModified: "3 days ago" },
  { id: "5", name: "Aspen Ski Resort Lodge", location: "Aspen, CO", state: "Colorado", county: "Pitkin County", buildingType: "Hotel", sqft: 68000, date: "11/20/2025", status: "Completed", npv: 542800, paybackPeriod: 6.8, irr: 15.7, lastModified: "1 week ago" },
  { id: "6", name: "Fort Collins Brewery Campus", location: "Fort Collins, CO", state: "Colorado", county: "Larimer County", buildingType: "Manufacturing", sqft: 54000, date: "12/5/2025", status: "In Progress", npv: 324500, paybackPeriod: 7.6, irr: 12.8, lastModified: "5 days ago" },
  { id: "7", name: "Boise Mixed-Use Development", location: "Boise, ID", state: "Idaho", county: "Ada County", buildingType: "Mixed-Use", sqft: 72000, date: "1/28/2026", status: "Draft", npv: 389700, paybackPeriod: 8.1, irr: 11.9, lastModified: "1 week ago" },
  { id: "8", name: "Portland Community College", location: "Portland, OR", state: "Oregon", county: "Multnomah County", buildingType: "School", sqft: 95000, date: "2/1/2026", status: "Draft", npv: 445600, paybackPeriod: 10.2, irr: 9.1, lastModified: "3 days ago" },
  { id: "9", name: "Bend Fitness Center", location: "Bend, OR", state: "Oregon", county: "Deschutes County", buildingType: "Recreation", sqft: 28000, date: "10/15/2025", status: "Completed", npv: 198300, paybackPeriod: 8.8, irr: 10.9, lastModified: "5 days ago" },
  { id: "10", name: "Seattle Hospital Expansion", location: "Seattle, WA", state: "Washington", county: "King County", buildingType: "Hospital", sqft: 156000, date: "9/22/2025", status: "In Progress", npv: 1850200, paybackPeriod: 9.5, irr: 10.5, lastModified: "1 week ago" },
];

export const recentProjects = [
  { name: "Boulder Community Center", location: "Colorado", buildingType: "Small Commercial", status: "In Progress" as const, lastModified: "2 hours ago" },
  { name: "Denver Office Complex", location: "Colorado", buildingType: "Midsize Commercial", status: "Completed" as const, lastModified: "1 day ago" },
  { name: "Portland Residential", location: "Oregon", buildingType: "Residential", status: "In Progress" as const, lastModified: "3 days ago" },
  { name: "Seattle Mixed-Use", location: "Washington", buildingType: "Midsize Commercial", status: "Review" as const, lastModified: "5 days ago" },
  { name: "Boise School District", location: "Idaho", buildingType: "Small Commercial", status: "Completed" as const, lastModified: "1 week ago" },
];

export interface DataSource {
  id: string;
  dataType: string;
  region: string;
  source: string;
  sourceColor: string;
  status: string;
  statusColor: string;
  lastUpdated: string;
}

export const dataSources: DataSource[] = [
  { id: "1", dataType: "Climate Zone Data", region: "Northwest", source: "DOE", sourceColor: "bg-red-500", status: "Verified", statusColor: "bg-green-500", lastUpdated: "Jan 15, 2026" },
  { id: "2", dataType: "Drilling Benchmarks", region: "Rocky Mountains", source: "NREL", sourceColor: "bg-blue-500", status: "Verified", statusColor: "bg-green-500", lastUpdated: "Feb 1, 2026" },
  { id: "3", dataType: "Electricity Prices", region: "Colorado", source: "User", sourceColor: "bg-gray-400", status: "User Modified", statusColor: "bg-yellow-500", lastUpdated: "Feb 10, 2026" },
  { id: "4", dataType: "IRA Tax Incentives", region: "National", source: "DOE", sourceColor: "bg-red-500", status: "Verified", statusColor: "bg-green-500", lastUpdated: "Jan 1, 2026" },
  { id: "5", dataType: "Ground Temperature", region: "Southwest", source: "NREL", sourceColor: "bg-blue-500", status: "Verified", statusColor: "bg-green-500", lastUpdated: "Dec 20, 2025" },
  { id: "6", dataType: "Equipment Costs", region: "Custom", source: "User", sourceColor: "bg-gray-400", status: "User Modified", statusColor: "bg-yellow-500", lastUpdated: "Feb 5, 2026" },
  { id: "7", dataType: "Installation Labor Rates", region: "Pacific Northwest", source: "DOE", sourceColor: "bg-red-500", status: "Verified", statusColor: "bg-green-500", lastUpdated: "Jan 28, 2026" },
  { id: "8", dataType: "COP Performance Data", region: "National", source: "NREL", sourceColor: "bg-blue-500", status: "Verified", statusColor: "bg-green-500", lastUpdated: "Jan 12, 2026" },
  { id: "9", dataType: "EU ETS Carbon Prices", region: "European Union", source: "ICE Futures", sourceColor: "bg-teal-500", status: "Live Feed", statusColor: "bg-emerald-500", lastUpdated: "Feb 18, 2026" },
  { id: "10", dataType: "California Cap-and-Trade", region: "California", source: "CARB", sourceColor: "bg-purple-500", status: "Live Feed", statusColor: "bg-emerald-500", lastUpdated: "Feb 18, 2026" },
];

export interface Communication {
  id: string;
  title: string;
  project: string;
  recipientRole: string;
  recipientName: string;
  type: string;
  sentDate: string;
  status: "Delivered" | "Draft";
  opened: boolean;
  downloads: number;
  summary: string;
}

export const communications: Communication[] = [
  { id: "1", title: "Geothermal ROI Analysis - Executive Overview", project: "Denver Tech Center Office Retrofit", recipientRole: "CFO", recipientName: "Sarah Martinez", type: "Executive Summary", sentDate: "2/15/2026", status: "Delivered", opened: true, downloads: 2, summary: "NPV: $285,400 | Payback: 7.2 years | IRR: 13.5%" },
  { id: "2", title: "Detailed System Specifications & Maintenance Plan", project: "Denver Tech Center Office Retrofit", recipientRole: "Facilities Manager", recipientName: "Mike Johnson", type: "Technical Report", sentDate: "2/14/2026", status: "Delivered", opened: true, downloads: 3, summary: "System sizing, installation timeline, O&M requirements" },
  { id: "3", title: "Investment Returns & Financing Options", project: "Boulder Residential Complex", recipientRole: "Building Owner", recipientName: "Jennifer Lee", type: "Financial Analysis", sentDate: "2/12/2026", status: "Delivered", opened: true, downloads: 1, summary: "NPV: $156,200 | Payback: 9.1 years | Loan vs. Cash comparison" },
  { id: "4", title: "Carbon Reduction & Sustainability Metrics", project: "Aspen Ski Resort Lodge", recipientRole: "Sustainability Director", recipientName: "Alex Thompson", type: "Environmental Impact", sentDate: "2/10/2026", status: "Delivered", opened: true, downloads: 4, summary: "156 tons CO2/year avoided, LEED credits, ESG impact" },
  { id: "5", title: "Strategic Investment Overview - Geothermal System", project: "San Francisco Bay Area Campus", recipientRole: "Board Member", recipientName: "Robert Chen", type: "Executive Summary", sentDate: "2/8/2026", status: "Delivered", opened: false, downloads: 0, summary: "NPV: $1.24M | Strategic alignment with climate goals" },
];

export const carbonPriceTrends = [
  { month: "Aug '25", euEts: 72, california: 38, rggi: 18, voluntary: 12 },
  { month: "Sep '25", euEts: 74, california: 39, rggi: 19, voluntary: 13 },
  { month: "Oct '25", euEts: 71, california: 40, rggi: 17, voluntary: 12 },
  { month: "Nov '25", euEts: 76, california: 41, rggi: 18, voluntary: 13 },
  { month: "Dec '25", euEts: 78, california: 42, rggi: 19, voluntary: 14 },
  { month: "Jan '26", euEts: 80, california: 44, rggi: 18, voluntary: 14 },
  { month: "Feb '26", euEts: 84, california: 46, rggi: 18, voluntary: 15 },
];
