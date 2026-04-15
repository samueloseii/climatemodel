interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colors: Record<string, string> = {
    "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
    "Completed": "bg-green-100 text-green-700 border-green-200",
    "Draft": "bg-gray-100 text-gray-600 border-gray-200",
    "Review": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Delivered": "bg-green-100 text-green-700 border-green-200",
    "Verified": "bg-green-100 text-green-700 border-green-200",
    "User Modified": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Live Feed": "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        colors[status] || "bg-gray-100 text-gray-600 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}
