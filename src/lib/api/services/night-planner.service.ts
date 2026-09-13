import { fetchAPI } from '../client'
import type { ApplyNightPlan, NightPlanSuggestion } from '../types/night-plan'
import type { Session } from '../types'

export interface SuggestPlanParams {
  playerCount: number
  gameLibraryIds: Array<string>
}

/**
 * Night Builder API — host-only planning for a session.
 * Backend: games-night-v2/src/night-planner.
 */
export const nightPlannerService = {
  // Tailored plan suggestion (rounds, timing, team split) for the selected
  // games at the given headcount. gameLibraryIds go as a comma-separated query
  // param (the backend accepts either that or repeated params).
  suggest: (
    sessionId: string,
    params: SuggestPlanParams,
  ): Promise<NightPlanSuggestion> =>
    fetchAPI<NightPlanSuggestion>(`/sessions/${sessionId}/plan/suggestions`, {
      params: {
        playerCount: String(params.playerCount),
        gameLibraryIds: params.gameLibraryIds.join(','),
      },
    }),

  // Apply a chosen line-up (games in order + team count) onto a SCHEDULED
  // session. Replaces existing games/teams.
  apply: (sessionId: string, plan: ApplyNightPlan): Promise<Session> =>
    fetchAPI<Session>(`/sessions/${sessionId}/plan`, {
      method: 'POST',
      body: JSON.stringify(plan),
    }),
}
