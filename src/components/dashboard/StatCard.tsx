interface StatCardProps {
  label: string;
  value: number | string;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  subtitle?: string;
  className?: string;
}

/**
 * Reusable stat card component for dashboard metrics
 */
export default function StatCard({
  label,
  value,
  icon,
  trend,
  color = 'blue',
  subtitle,
  className = '',
}: StatCardProps) {
  const iconBgClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100',
    red: 'bg-red-100',
  };

  return (
    <div
      className={`bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>

        {icon && (
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${iconBgClasses[color]}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
