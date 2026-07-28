import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teamService } from '../lib/api/services/team.service'
import { showToast } from '../lib/toast'

export function useTeamManagement(sessionId?: string) {
  const queryClient = useQueryClient()

  // Refresh the session screen's team/player roster (sessionKeys.teams/players)
  // after a mutation, so the read-only TeamDisplay updates without relying on
  // a socket event.
  const invalidateSessionDetail = () => {
    if (sessionId) {
      queryClient.invalidateQueries({
        queryKey: ['sessions', 'detail', sessionId],
      })
    }
  }

  const swapPlayerMutation = useMutation({
    mutationFn: ({
      playerId,
      fromTeamId,
      toTeamId,
    }: {
      playerId: string
      fromTeamId: string
      toTeamId: string
    }) => teamService.swapPlayer(playerId, fromTeamId, toTeamId),
    onSuccess: (_, variables) => {
      showToast.success('Player swapped successfully')
      // Invalidate queries to refresh team data
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      invalidateSessionDetail()
      queryClient.invalidateQueries({
        queryKey: ['team', variables.fromTeamId],
      })
      queryClient.invalidateQueries({ queryKey: ['team', variables.toTeamId] })
    },
    onError: (error: Error) => {
      showToast.error(`Failed to swap player: ${error.message}`)
    },
  })

  const dissolveTeamMutation = useMutation({
    mutationFn: (teamId: string) => teamService.dissolveTeam(teamId),
    onSuccess: () => {
      showToast.success('Team dissolved successfully')
      // Invalidate all team-related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      invalidateSessionDetail()
      queryClient.invalidateQueries({ queryKey: ['players'] })
    },
    onError: (error: Error) => {
      showToast.error(`Failed to dissolve team: ${error.message}`)
    },
  })

  const reassignPlayerMutation = useMutation({
    mutationFn: ({
      playerId,
      newTeamId,
    }: {
      playerId: string
      newTeamId: string
    }) => teamService.reassignPlayer(playerId, newTeamId),
    onSuccess: (_, variables) => {
      showToast.success('Player reassigned successfully')
      // Invalidate all team and player queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      invalidateSessionDetail()
      queryClient.invalidateQueries({ queryKey: ['team', variables.newTeamId] })
      queryClient.invalidateQueries({ queryKey: ['players'] })
    },
    onError: (error: Error) => {
      showToast.error(`Failed to reassign player: ${error.message}`)
    },
  })

  return {
    swapPlayer: swapPlayerMutation.mutate,
    isSwappingPlayer: swapPlayerMutation.isPending,
    dissolveTeam: dissolveTeamMutation.mutate,
    isDissolvingTeam: dissolveTeamMutation.isPending,
    reassignPlayer: reassignPlayerMutation.mutate,
    isReassigningPlayer: reassignPlayerMutation.isPending,
  }
}
