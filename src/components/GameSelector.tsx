// Game Selection Component for Session Creation
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { gameLibraryService } from '../lib/api/services/game-library.service'

interface GameSelectorProps {
  selectedGames: Array<string>
  onGameToggle: (gameId: string) => void
}

export function GameSelector({
  selectedGames,
  onGameToggle,
}: GameSelectorProps) {
  const [showGames, setShowGames] = useState(false)

  const { data: games = [], isLoading } = useQuery({
    queryKey: ['game-library'],
    queryFn: gameLibraryService.getAll,
    enabled: showGames,
  })

  if (isLoading) return <div>Loading games...</div>

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setShowGames(!showGames)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
      >
        {showGames ? 'Hide Games' : 'Select Games'} ({selectedGames.length}{' '}
        selected)
      </button>

      {showGames && (
        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
          <div className="grid grid-cols-1 gap-2">
            {games.map((game) => (
              <label
                key={game.id}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedGames.includes(game.id)}
                  onChange={() => onGameToggle(game.id)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{game.name}</span>
                <span className="text-xs text-gray-500">
                  ({game.minPlayers}-{game.maxPlayers} players)
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
