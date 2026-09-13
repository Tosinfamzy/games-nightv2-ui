import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { nightPlannerService } from '../services/night-planner.service'
import { sessionKeys } from './use-session'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { ApplyNightPlan, NightPlanSuggestion } from '../types/night-plan'
import type { Session } from '../types'

/**
 * Plan suggestion for the selected games + headcount. Only runs once at least
 * one game is selected. Keyed by the inputs so it refetches as the host adjusts
 * the headcount or the selection.
 */
export function useNightPlanSuggestion(
  sessionId: string,
  playerCount: number,
  gameLibraryIds: Array<string>,
): UseQueryResult<NightPlanSuggestion, Error> {
  return useQuery({
    queryKey: [
      'night-plan',
      'suggestion',
      sessionId,
      playerCount,
      gameLibraryIds,
    ],
    queryFn: () =>
      nightPlannerService.suggest(sessionId, { playerCount, gameLibraryIds }),
    enabled: Boolean(sessionId) && gameLibraryIds.length > 0,
  })
}

/**
 * Apply a plan to the session. Invalidates the session detail family so the
 * games/teams tabs reflect the new line-up immediately.
 */
export function useApplyNightPlan(
  sessionId: string,
): UseMutationResult<Session, Error, ApplyNightPlan> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (plan: ApplyNightPlan) =>
      nightPlannerService.apply(sessionId, plan),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(sessionId),
      })
    },
  })
}
