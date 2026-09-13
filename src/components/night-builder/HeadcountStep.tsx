interface HeadcountStepProps {
  playerCount: number
  onChange: (value: number) => void
}

/**
 * Step 1 — how many people are coming. Drives team sizes and headcount
 * warnings. Defaults from the session's known guests but is always editable
 * (people trickle in on the night).
 */
export function HeadcountStep({ playerCount, onChange }: HeadcountStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          How many people are coming?
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          A rough number is fine — it just sizes the teams and flags games that
          need more or fewer players. You can change it any time.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, playerCount - 1))}
          className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-300 text-xl font-bold text-gray-700 hover:bg-gray-50"
          aria-label="Fewer players"
        >
          −
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={playerCount}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="h-12 w-24 rounded-lg border border-gray-300 text-center text-2xl font-bold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => onChange(playerCount + 1)}
          className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-300 text-xl font-bold text-gray-700 hover:bg-gray-50"
          aria-label="More players"
        >
          +
        </button>
        <span className="text-sm text-gray-500">players expected</span>
      </div>
    </div>
  )
}
