import { Player } from '../lib/api/types';

interface OnlinePlayerCountProps {
  players: Player[];
  showDetails?: boolean;
  className?: string;
}

/**
 * Display count of online players
 */
export default function OnlinePlayerCount({
  players,
  showDetails = false,
  className = '',
}: OnlinePlayerCountProps) {
  const onlineCount = players.filter((p) => p.isOnline).length;
  const totalCount = players.length;
  const percentage = totalCount > 0 ? (onlineCount / totalCount) * 100 : 0;

  // Determine color based on percentage
  const getColorClasses = () => {
    if (percentage >= 75) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (percentage > 0) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  if (showDetails) {
    return (
      <div className={`inline-flex flex-col gap-2 ${className}`}>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getColorClasses()}`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold">
              {onlineCount} / {totalCount} Online
            </p>
            <p className="text-xs opacity-75">{Math.round(percentage)}% active</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getColorClasses()} ${className}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          onlineCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
        }`}
      />
      <span className="text-sm font-medium">
        {onlineCount}/{totalCount} online
      </span>
    </div>
  );
}
