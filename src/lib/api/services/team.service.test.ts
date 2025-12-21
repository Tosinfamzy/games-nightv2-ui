import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../../test/mocks/server'
import { teamService } from './team.service'
import { TeamFormationStrategy } from '../types/team.dto'
import {
  mockTeams,
  mockSuggestions,
  mockTeamStats,
  createMockTeams,
} from '../../../test/fixtures/team.fixture'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const API_V1_URL = `${API_BASE_URL}/v1`

describe('teamService', () => {
  describe('createTeams', () => {
    it('should successfully create teams with valid data', async () => {
      const gameId = 'game-1'
      const createTeamsDto = {
        strategy: TeamFormationStrategy.BALANCED,
        teamCount: 2,
      }

      server.use(
        http.post(`${API_V1_URL}/teams/game/:gameId/create-teams`, () => {
          return HttpResponse.json(mockTeams, { status: 201 })
        }),
      )

      const result = await teamService.createTeams(gameId, createTeamsDto)

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Team Alpha')
      expect(result[1].name).toBe('Team Beta')
    })

    it('should send correct request payload with all fields', async () => {
      const gameId = 'game-1'
      const createTeamsDto = {
        strategy: TeamFormationStrategy.BALANCED,
        teamCount: 3,
        teamNames: ['Red Team', 'Blue Team', 'Green Team'],
        teamColors: ['#FF0000', '#0000FF', '#00FF00'],
      }

      let capturedRequest: any = null

      server.use(
        http.post(
          `${API_V1_URL}/teams/game/:gameId/create-teams`,
          async ({ request }) => {
            capturedRequest = await request.json()
            return HttpResponse.json(createMockTeams(3), { status: 201 })
          },
        ),
      )

      await teamService.createTeams(gameId, createTeamsDto)

      expect(capturedRequest).toEqual({
        strategy: TeamFormationStrategy.BALANCED,
        teamCount: 3,
        teamNames: ['Red Team', 'Blue Team', 'Green Team'],
        teamColors: ['#FF0000', '#0000FF', '#00FF00'],
      })
    })

    it('should handle optional teamNames and teamColors', async () => {
      const gameId = 'game-1'
      const createTeamsDto = {
        strategy: TeamFormationStrategy.AUTOMATIC,
        teamCount: 2,
      }

      server.use(
        http.post(`${API_V1_URL}/teams/game/:gameId/create-teams`, () => {
          return HttpResponse.json(mockTeams, { status: 201 })
        }),
      )

      const result = await teamService.createTeams(gameId, createTeamsDto)

      expect(result).toHaveLength(2)
    })

    it('should call correct endpoint with gameId', async () => {
      const gameId = 'specific-game-123'
      let capturedGameId: string | undefined

      server.use(
        http.post(
          `${API_V1_URL}/teams/game/:gameId/create-teams`,
          ({ params }) => {
            capturedGameId = params.gameId as string
            return HttpResponse.json(mockTeams, { status: 201 })
          },
        ),
      )

      await teamService.createTeams(gameId, {
        strategy: TeamFormationStrategy.RANDOM,
        teamCount: 2,
      })

      expect(capturedGameId).toBe('specific-game-123')
    })

    it('should throw error on 500 response', async () => {
      const gameId = 'game-1'

      server.use(
        http.post(`${API_V1_URL}/teams/game/:gameId/create-teams`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 },
          )
        }),
      )

      await expect(
        teamService.createTeams(gameId, {
          strategy: TeamFormationStrategy.BALANCED,
          teamCount: 2,
        }),
      ).rejects.toThrow()
    })

    it('should throw error on 400 response', async () => {
      const gameId = 'game-1'

      server.use(
        http.post(`${API_V1_URL}/teams/game/:gameId/create-teams`, () => {
          return HttpResponse.json(
            { message: 'Invalid team count' },
            { status: 400 },
          )
        }),
      )

      await expect(
        teamService.createTeams(gameId, {
          strategy: TeamFormationStrategy.BALANCED,
          teamCount: 0,
        }),
      ).rejects.toThrow()
    })
  })

  describe('rebalanceTeams', () => {
    it('should successfully rebalance teams', async () => {
      const gameId = 'game-1'
      const strategy = TeamFormationStrategy.BALANCED

      server.use(
        http.put(`${API_V1_URL}/teams/game/:gameId/rebalance`, () => {
          return HttpResponse.json(mockTeams)
        }),
      )

      const result = await teamService.rebalanceTeams(gameId, strategy)

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Team Alpha')
    })

    it('should send correct request payload with strategy', async () => {
      const gameId = 'game-1'
      const strategy = TeamFormationStrategy.RANDOM
      let capturedRequest: any = null

      server.use(
        http.put(
          `${API_V1_URL}/teams/game/:gameId/rebalance`,
          async ({ request }) => {
            capturedRequest = await request.json()
            return HttpResponse.json(mockTeams)
          },
        ),
      )

      await teamService.rebalanceTeams(gameId, strategy)

      expect(capturedRequest).toEqual({
        strategy: TeamFormationStrategy.RANDOM,
      })
    })

    it('should call correct endpoint with gameId', async () => {
      const gameId = 'specific-game-456'
      let capturedGameId: string | undefined

      server.use(
        http.put(`${API_V1_URL}/teams/game/:gameId/rebalance`, ({ params }) => {
          capturedGameId = params.gameId as string
          return HttpResponse.json(mockTeams)
        }),
      )

      await teamService.rebalanceTeams(gameId, TeamFormationStrategy.BALANCED)

      expect(capturedGameId).toBe('specific-game-456')
    })

    it('should throw error on failure', async () => {
      const gameId = 'game-1'

      server.use(
        http.put(`${API_V1_URL}/teams/game/:gameId/rebalance`, () => {
          return HttpResponse.json(
            { message: 'Failed to rebalance' },
            { status: 500 },
          )
        }),
      )

      await expect(
        teamService.rebalanceTeams(gameId, TeamFormationStrategy.BALANCED),
      ).rejects.toThrow()
    })
  })

  describe('getTeamSuggestions', () => {
    it('should fetch team suggestions for a game', async () => {
      const gameId = 'game-1'

      server.use(
        http.get(`${API_V1_URL}/teams/game/:gameId/suggestions`, () => {
          return HttpResponse.json(mockSuggestions)
        }),
      )

      const result = await teamService.getTeamSuggestions(gameId)

      expect(result).toEqual(mockSuggestions)
      expect(result.suggestions).toHaveLength(3)
      expect(result.validation.isValid).toBe(true)
    })

    it('should return suggestions with pros and cons', async () => {
      const gameId = 'game-1'

      server.use(
        http.get(`${API_V1_URL}/teams/game/:gameId/suggestions`, () => {
          return HttpResponse.json(mockSuggestions)
        }),
      )

      const result = await teamService.getTeamSuggestions(gameId)

      expect(result.suggestions[0].pros).toContain('Even teams')
      expect(result.suggestions[0].pros).toContain('Fair distribution')
      expect(result.suggestions[2].cons).toContain('Uneven teams')
    })

    it('should handle empty suggestions array', async () => {
      const gameId = 'game-1'

      server.use(
        http.get(`${API_V1_URL}/teams/game/:gameId/suggestions`, () => {
          return HttpResponse.json({
            suggestions: [],
            validation: {
              isValid: false,
              errors: ['Not enough players'],
              warnings: [],
            },
          })
        }),
      )

      const result = await teamService.getTeamSuggestions(gameId)

      expect(result.suggestions).toHaveLength(0)
      expect(result.validation.isValid).toBe(false)
      expect(result.validation.errors).toContain('Not enough players')
    })

    it('should call correct endpoint with gameId', async () => {
      const gameId = 'specific-game-789'
      let capturedGameId: string | undefined

      server.use(
        http.get(
          `${API_V1_URL}/teams/game/:gameId/suggestions`,
          ({ params }) => {
            capturedGameId = params.gameId as string
            return HttpResponse.json(mockSuggestions)
          },
        ),
      )

      await teamService.getTeamSuggestions(gameId)

      expect(capturedGameId).toBe('specific-game-789')
    })

    it('should throw error on 404', async () => {
      const gameId = 'nonexistent-game'

      server.use(
        http.get(`${API_V1_URL}/teams/game/:gameId/suggestions`, () => {
          return HttpResponse.json(
            { message: 'Game not found' },
            { status: 404 },
          )
        }),
      )

      await expect(teamService.getTeamSuggestions(gameId)).rejects.toThrow()
    })
  })

  describe('getTeamStats', () => {
    it('should fetch team stats for a game', async () => {
      const gameId = 'game-1'

      server.use(
        http.get(`${API_V1_URL}/teams/game/:gameId/stats`, () => {
          return HttpResponse.json(mockTeamStats)
        }),
      )

      const result = await teamService.getTeamStats(gameId)

      expect(result).toEqual(mockTeamStats)
      expect(result.totalTeams).toBe(2)
      expect(result.averagePlayersPerTeam).toBe(3)
      expect(result.balanceScore).toBe(0.95)
    })

    it('should return player distribution data', async () => {
      const gameId = 'game-1'

      server.use(
        http.get(`${API_V1_URL}/teams/game/:gameId/stats`, () => {
          return HttpResponse.json(mockTeamStats)
        }),
      )

      const result = await teamService.getTeamStats(gameId)

      expect(result.playerDistribution).toBeDefined()
      expect(result.playerDistribution).toHaveLength(2)
      expect(result.playerDistribution[0].teamName).toBe('Team Alpha')
    })

    it('should call correct endpoint with gameId', async () => {
      const gameId = 'specific-game-stats'
      let capturedGameId: string | undefined

      server.use(
        http.get(`${API_V1_URL}/teams/game/:gameId/stats`, ({ params }) => {
          capturedGameId = params.gameId as string
          return HttpResponse.json(mockTeamStats)
        }),
      )

      await teamService.getTeamStats(gameId)

      expect(capturedGameId).toBe('specific-game-stats')
    })

    it('should throw error on failure', async () => {
      const gameId = 'game-1'

      server.use(
        http.get(`${API_V1_URL}/teams/game/:gameId/stats`, () => {
          return HttpResponse.json(
            { message: 'Failed to fetch stats' },
            { status: 500 },
          )
        }),
      )

      await expect(teamService.getTeamStats(gameId)).rejects.toThrow()
    })
  })
})
