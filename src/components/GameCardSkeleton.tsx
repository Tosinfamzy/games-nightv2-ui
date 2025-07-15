export function GameCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow animate-pulse">
      <div className="flex justify-between items-start mb-2">
        <div className="h-7 w-48 bg-gray-200 rounded"></div>
        <div className="h-6 w-24 bg-gray-200 rounded"></div>
      </div>
      <div className="h-16 w-full bg-gray-200 rounded mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-5 w-20 bg-gray-200 rounded"></div>
        <div className="h-5 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}
