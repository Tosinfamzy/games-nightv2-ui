/* eslint-disable @typescript-eslint/array-type */
/**
 * Data transformation utilities
 * Transforms lean API types to enriched component types
 */

import type { Game, Player, Team } from '../api/types'
import type { UIGame, UIPlayer, UITeam } from '../types/component-types'

/**
 * Transform API Player to UI Player with normalized status
 */
export function transformPlayer(player: Player): UIPlayer {
  // Normalize status: 'joined' and 'disconnected' become 'not_ready' for UI
  let normalizedStatus: 'ready' | 'not_ready' | 'playing'
  if (player.status === 'joined' || player.status === 'disconnected') {
    normalizedStatus = 'not_ready'
  } else {
    normalizedStatus = player.status
  }

  return {
    id: player.id,
    name: player.name,
    email: player.email,
    status: normalizedStatus,
    teamId: player.teamId,
    isOnline: player.isOnline,
  }
}

/**
 * Transform multiple API Players to UI Players
 */
export function transformPlayers(players: Player[]): UIPlayer[] {
  return players.map(transformPlayer)
}

/**
 * Enrich API Teams with full Player objects
 * Looks up players by ID and attaches them to teams
 */
export function enrichTeamsWithPlayers(
  teams: Team[],
  players: Player[],
): UITeam[] {
  return teams.map((team) => {
    // Find all players that belong to this team
    const teamPlayers = team.playerIds
      .map((playerId) => players.find((p) => p.id === playerId))
      .filter((p): p is Player => p !== undefined)
      .map(transformPlayer)

    return {
      id: team.id,
      name: team.name,
      color: team.color,
      position: team.position,
      isActive: team.isActive,
      sessionId: team.sessionId,
      gameId: team.gameId,
      players: teamPlayers,
      scoreIds: team.scoreIds,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    }
  })
}

/**
 * Transform API Game to UI Game with normalized status and optional recommendedTeamSize
 */
export function transformGame(
  game: Game,
  includeRecommendedTeamSize = false,
): UIGame {
  // Extract min/max players from gameLibrary if available, otherwise use direct properties
  const minPlayers = (game as any).gameLibrary?.minPlayers ?? game.minPlayers
  const maxPlayers = (game as any).gameLibrary?.maxPlayers ?? game.maxPlayers

  const uiGame: UIGame = {
    id: game.id,
    name: game.name,
    description: game.description ?? (game as any).gameLibrary?.description,
    minPlayers,
    maxPlayers,
    // Normalize status to lowercase for UI components
    status: game.status.toLowerCase() as
      | 'scheduled'
      | 'in_progress'
      | 'completed',
    categories:
      (game as any).categories ?? (game as any).gameLibrary?.categories,
  }

  // Add recommendedTeamSize if requested
  if (includeRecommendedTeamSize) {
    if (maxPlayers) {
      uiGame.recommendedTeamSize = Math.floor(maxPlayers / 2)
    } else {
      uiGame.recommendedTeamSize = 2
    }
  }

  return uiGame
}

/**
 * Transform multiple API Games to UI Games
 */
export function transformGames(
  games: Game[],
  includeRecommendedTeamSize = false,
): UIGame[] {
  return games.map((game) => transformGame(game, includeRecommendedTeamSize))
}
