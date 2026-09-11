import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { gameLibraryService } from '../../lib/api/services/game-library.service'
import {
  useApplyNightPlan,
  useNightPlanSuggestion,
} from '../../lib/api/hooks/use-night-planner'
import { showToast, toastHelpers } from '../../lib/toast'
import { ConfirmDialog } from '../ConfirmDialog'
import { HeadcountStep } from './HeadcountStep'
import { PickGamesStep } from './PickGamesStep'
import { TuneStep } from './TuneStep'
import { TeamsStep } from './TeamsStep'
import { ReviewStep } from './ReviewStep'
import type { ApplyNightPlan } from '../../lib/api/types/night-plan'
import type { SelectedGame } from './types'

const STEPS = ['headcount', 'games', 'tune', 'teams', 'review'] as const
type Step = (typeof STEPS)[number]
const STEP_LABELS: Record<Step, string> = {
  headcount: 'Headcount',
  games: 'Games',
  tune: 'Rounds',
  teams: 'Teams',
  review: 'Review',
}

const MIN_TEAMS = 2
const MAX_TEAMS = 8

interface NightBuilderProps {
  sessionId: string
  defaultPlayerCount: number
  /** Whether the session already has games/teams (apply will replace them). */
  hasExistingLineup: boolean
}

export function NightBuilder({
  sessionId,
  defaultPlayerCount,
  hasExistingLineup,
}: NightBuilderProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('headcount')
  const [playerCount, setPlayerCount] = useState(defaultPlayerCount)
  const [selected, setSelected] = useState<Array<SelectedGame>>([])
  const [teamCount, setTeamCount] = useState(3)
  const [teamCountTouched, setTeamCountTouched] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { data: library = [], isLoading: libraryLoading } = useQuery({
    queryKey: ['game-library'],
    queryFn: gameLibraryService.getAll,
  })
  const libraryById = useMemo(
    () => new Map(library.map((g) => [g.id, g])),
    [library],
  )

  const selectedIds = useMemo(() => selected.map((s) => s.id), [selected])

  const minTeamsRequired = useMemo(
    () =>
      selected.reduce((max, s) => {
        const lib = libraryById.get(s.id)
        return Math.max(max, lib?.minTeams ?? 0)
      }, 0),
    [selected, libraryById],
  )
  const teamFloor = Math.max(MIN_TEAMS, minTeamsRequired)

  const suggestionQuery = useNightPlanSuggestion(
    sessionId,
    playerCount,
    selectedIds,
  )
  const suggestion = suggestionQuery.data
  const applyMutation = useApplyNightPlan(sessionId)

  // Adopt the suggested team count until the host overrides it.
  useEffect(() => {
    if (!teamCountTouched && suggestion?.teamSuggestion.teamCount) {
      setTeamCount(suggestion.teamSuggestion.teamCount)
    }
  }, [suggestion, teamCountTouched])

  // Never let the team count sit below what the selected games require.
  useEffect(() => {
    setTeamCount((current) => Math.min(MAX_TEAMS, Math.max(current, teamFloor)))
  }, [teamFloor])

  const toggleGame = (id: string) => {
    setSelected((prev) => {
      if (prev.some((s) => s.id === id)) return prev.filter((s) => s.id !== id)
      const lib = libraryById.get(id)
      return [...prev, { id, rounds: lib?.recommendedRounds || 1 }]
    })
  }

  const setRounds = (id: string, rounds: number) =>
    setSelected((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, rounds: Math.max(1, rounds) } : s,
      ),
    )

  const moveGame = (index: number, direction: -1 | 1) =>
    setSelected((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })

  const applyPlan = () => {
    const plan: ApplyNightPlan = {
      games: selected.map((s, i) => ({
        gameLibraryId: s.id,
        maxRounds: s.rounds,
        orderIndex: i,
      })),
      teams: { count: teamCount },
    }
    applyMutation.mutate(plan, {
      onSuccess: () => {
        showToast.success('Night plan applied 🎲')
        navigate({ to: '/sessions/$id', params: { id: sessionId } })
      },
      onError: (error) => toastHelpers.operationError('apply the plan', error),
    })
  }

  const onApplyClick = () => {
    if (hasExistingLineup) setConfirmOpen(true)
    else applyPlan()
  }

  const stepIndex = STEPS.indexOf(step)
  const canAdvance = step !== 'games' || selected.length > 0
  const goNext = () => {
    const next = STEPS[stepIndex + 1]
    if (next) setStep(next)
  }
  const goBack = () => {
    const prev = STEPS[stepIndex - 1]
    if (prev) setStep(prev)
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Stepper */}
      <ol className="mb-6 flex items-center justify-between text-xs font-medium">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                i <= stepIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`ml-1.5 hidden sm:inline ${
                i === stepIndex ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {STEP_LABELS[s]}
            </span>
            {i < STEPS.length - 1 && (
              <span className="mx-1 h-px flex-1 bg-gray-200" />
            )}
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        {step === 'headcount' && (
          <HeadcountStep playerCount={playerCount} onChange={setPlayerCount} />
        )}
        {step === 'games' && (
          <PickGamesStep
            library={library}
            isLoading={libraryLoading}
            selectedIds={selectedIds}
            playerCount={playerCount}
            onToggle={toggleGame}
          />
        )}
        {step === 'tune' && (
          <TuneStep
            selected={selected}
            libraryById={libraryById}
            onRounds={setRounds}
            onMove={moveGame}
          />
        )}
        {step === 'teams' && (
          <TeamsStep
            playerCount={playerCount}
            teamCount={teamCount}
            minTeamsRequired={minTeamsRequired}
            onChange={(count) => {
              setTeamCountTouched(true)
              setTeamCount(count)
            }}
          />
        )}
        {step === 'review' && (
          <ReviewStep
            selected={selected}
            libraryById={libraryById}
            playerCount={playerCount}
            teamCount={teamCount}
            warnings={suggestion?.warnings ?? []}
            applying={applyMutation.isPending}
            onApply={onApplyClick}
          />
        )}
      </div>

      {/* Nav */}
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={stepIndex === 0}
          className="min-h-[44px] rounded-lg px-4 font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40"
        >
          Back
        </button>
        {step !== 'review' && (
          <button
            type="button"
            onClick={goNext}
            disabled={!canAdvance}
            className="min-h-[44px] rounded-lg bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Next
          </button>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Replace the current line-up?"
        message="This session already has games or teams. Applying this plan will replace them with the new line-up."
        confirmLabel="Replace"
        variant="warning"
        onConfirm={applyPlan}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  )
}
