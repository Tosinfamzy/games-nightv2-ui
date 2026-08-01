const MAX_PLUS_ONES = 10

/**
 * Collects a guest's plus-ones as a list of named rows rather than a bare
 * count — because plus-ones become real players who go on teams and appear on
 * the scoreboard, so "Priya" beats "Milly +2". Each row is one plus-one; the
 * name is optional (a blank row still counts, and the host can name them at
 * check-in). The array length is the plus-one count.
 */
export function PlusOnesInput({
  value,
  onChange,
}: {
  value: Array<string>
  onChange: (names: Array<string>) => void
}) {
  const setAt = (i: number, name: string) =>
    onChange(value.map((n, j) => (j === i ? name : n)))
  const removeAt = (i: number) => onChange(value.filter((_, j) => j !== i))
  const add = () => onChange([...value, ''])

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Bringing anyone? (optional)
      </label>

      {value.length > 0 && (
        <ul className="space-y-2 mb-2">
          {value.map((name, i) => (
            <li key={i} className="flex items-center gap-2">
              <input
                value={name}
                onChange={(e) => setAt(i, e.target.value)}
                placeholder={`Guest ${i + 1} — name (optional)`}
                maxLength={80}
                aria-label={`Plus-one ${i + 1} name`}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove guest ${i + 1}`}
                className="min-h-[44px] min-w-[44px] rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 text-xl leading-none"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {value.length < MAX_PLUS_ONES && (
        <button
          type="button"
          onClick={add}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium min-h-[44px]"
        >
          + Add {value.length === 0 ? 'a guest' : 'another'}
        </button>
      )}
    </div>
  )
}
