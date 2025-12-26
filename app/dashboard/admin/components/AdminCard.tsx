interface AdminCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "blue" | "green" | "purple" | "orange" | "red";
  loading?: boolean;
}

export default function AdminCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  color = "blue",
  loading = false 
}: AdminCardProps) {
  
  const colorClasses = {
    blue: "border-blue-200 bg-blue-50",
    green: "border-green-200 bg-green-50",
    purple: "border-purple-200 bg-purple-50",
    orange: "border-orange-200 bg-orange-50",
    red: "border-red-200 bg-red-50",
  };
  
  const trendColors = {
    up: "text-green-600 bg-green-100",
    down: "text-red-600 bg-red-100",
    neutral: "text-gray-600 bg-gray-100",
  };
  
  const iconColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    red: "text-red-600",
  };

  if (loading) {
    return (
      <div className={`bg-white p-6 rounded-xl border ${colorClasses[color]} animate-pulse`}>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-300 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border ${colorClasses[color]} hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start mb-2">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">{title}</h2>
        {icon && (
          <div className={`p-2 rounded-lg ${iconColors[color]}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      {trend && trendValue && (
        <div className="flex items-center gap-1">
          <span className={`text-xs px-2 py-1 rounded-full ${trendColors[trend]}`}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
          </span>
          <span className="text-xs text-gray-500">from last month</span>
        </div>
      )}
    </div>
  );
}