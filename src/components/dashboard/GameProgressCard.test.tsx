import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  createMockDashboardGame,
  mockDashboardGames,
} from '../../test/fixtures/dashboard.fixture'
import GameProgressCard from './GameProgressCard'
import type { DashboardGame } from '../../lib/api/types'

// Mock the GameTimer component
vi.mock('../GameTimer', () => ({
  default: ({ gameId, showTeamName, size }: any) => (
    <div
      data-testid="game-timer"
      data-game-id={gameId}
      data-size={size}
      data-show-team-name={showTeamName}
    >
      Mock Game Timer
    </div>
  ),
}))

describe('GameProgressCard', () => {
  const mockSessionId = 'session-1'

  describe('Basic Rendering', () => {
    it('should render game name', () => {
      const game = createMockDashboardGame({ name: 'Trivia Night' })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.getByText('Trivia Night')).toBeInTheDocument()
    })

    it('should render round progress', () => {
      const game = createMockDashboardGame({
        currentRound: 3,
        maxRounds: 5,
      })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.getByText(/Round 3\/5/)).toBeInTheDocument()
    })

    it('should render teams count', () => {
      const game = createMockDashboardGame({ teamsCount: 4 })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.getByText(/4 teams/)).toBeInTheDocument()
    })

    it('should handle single team', () => {
      const game = createMockDashboardGame({ teamsCount: 1 })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.getByText(/1 teams/)).toBeInTheDocument() // Note: component doesn't pluralize
    })
  })

  describe('Game Status Display', () => {
    it('should display IN_PROGRESS status with green color', () => {
      const game = createMockDashboardGame({ status: 'IN_PROGRESS' })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      const statusBadge = screen.getByText('IN_PROGRESS')
      expect(statusBadge).toBeInTheDocument()
      expect(statusBadge).toHaveClass('bg-green-100')
      expect(statusBadge).toHaveClass('text-green-800')
    })

    it('should display COMPLETED status with gray color', () => {
      const game = createMockDashboardGame({ status: 'COMPLETED' })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      const statusBadge = screen.getByText('COMPLETED')
      expect(statusBadge).toHaveClass('bg-gray-100')
      expect(statusBadge).toHaveClass('text-gray-800')
    })

    it('should display SCHEDULED status with blue color', () => {
      const game = createMockDashboardGame({ status: 'SCHEDULED' })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      const statusBadge = screen.getByText('SCHEDULED')
      expect(statusBadge).toHaveClass('bg-blue-100')
      expect(statusBadge).toHaveClass('text-blue-800')
    })

    it('should display PENDING status with blue color', () => {
      const game = createMockDashboardGame({ status: 'PENDING' })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      const statusBadge = screen.getByText('PENDING')
      expect(statusBadge).toHaveClass('bg-blue-100')
    })

    it('should display PAUSED status with yellow color', () => {
      const game = createMockDashboardGame({ status: 'PAUSED' })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      const statusBadge = screen.getByText('PAUSED')
      expect(statusBadge).toHaveClass('bg-yellow-100')
      expect(statusBadge).toHaveClass('text-yellow-800')
    })

    it('should handle unknown status gracefully', () => {
      const game = createMockDashboardGame({
        status: 'UNKNOWN_STATUS' as any,
      })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      const statusBadge = screen.getByText('UNKNOWN_STATUS')
      expect(statusBadge).toHaveClass('bg-gray-100')
    })
  })

  describe('Current Turn Display', () => {
    it('should show current turn for in-progress game', () => {
      const game = createMockDashboardGame({
        status: 'IN_PROGRESS',
        currentTurnTeamName: 'Team Alpha',
      })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.getByText('Current Turn')).toBeInTheDocument()
      expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    })

    it('should not show current turn for completed game', () => {
      const game = createMockDashboardGame({
        status: 'COMPLETED',
        currentTurnTeamName: 'Team Alpha',
      })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.queryByText('Current Turn')).not.toBeInTheDocument()
    })

    it('should not show current turn if team name is null', () => {
      const game = createMockDashboardGame({
        status: 'IN_PROGRESS',
        currentTurnTeamName: undefined,
      })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.queryByText('Current Turn')).not.toBeInTheDocument()
    })

    it('should not show current turn for not started game', () => {
      const game = createMockDashboardGame({
        status: 'SCHEDULED',
        currentTurnTeamName: undefined,
      })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.queryByText('Current Turn')).not.toBeInTheDocument()
    })
  })

  describe('Game Timer Integration', () => {
    it('should show timer for in-progress game with time limit', () => {
      const game = createMockDashboardGame({
        status: 'IN_PROGRESS',
        turnTimeLimit: 60,
      })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      const timer = screen.getByTestId('game-timer')
      expect(timer).toBeInTheDocument()
      expect(timer).toHaveAttribute('data-game-id', game.id)
      expect(timer).toHaveAttribute('data-size', 'sm')
      expect(timer).toHaveAttribute('data-show-team-name', 'false')
    })

    it('should not show timer if game has no time limit', () => {
      const game = createMockDashboardGame({
        status: 'IN_PROGRESS',
        turnTimeLimit: 0,
      })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.queryByTestId('game-timer')).not.toBeInTheDocument()
    })

    it('should not show timer if game is not in progress', () => {
      const game = createMockDashboardGame({
        status: 'COMPLETED',
        turnTimeLimit: 60,
      })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.queryByTestId('game-timer')).not.toBeInTheDocument()
    })

    it('should not show timer if game is paused', () => {
      const game = createMockDashboardGame({
        status: 'PAUSED',
        turnTimeLimit: 60,
      })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.queryByTestId('game-timer')).not.toBeInTheDocument()
    })
  })

  describe('Winner Display', () => {
    it('should show winner info for completed game', () => {
      const game = createMockDashboardGame({
        status: 'COMPLETED',
        winnerId: 'team-1',
      })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.getByText('Winner')).toBeInTheDocument()
      expect(screen.getByText('Game Completed')).toBeInTheDocument()
      expect(screen.getByText('🏆')).toBeInTheDocument()
    })

    it('should not show winner for completed game without winner', () => {
      const game = createMockDashboardGame({
        status: 'COMPLETED',
        winnerId: undefined,
      })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.queryByText('Winner')).not.toBeInTheDocument()
      expect(screen.queryByText('🏆')).not.toBeInTheDocument()
    })

    it('should not show winner for in-progress game', () => {
      const game = createMockDashboardGame({
        status: 'IN_PROGRESS',
        winnerId: undefined,
      })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.queryByText('Winner')).not.toBeInTheDocument()
    })
  })

  describe('Progress Bar', () => {
    it('should display progress percentage', () => {
      const game = createMockDashboardGame({
        currentRound: 3,
        maxRounds: 5,
      })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      // 3/5 = 60%
      expect(screen.getByText('60%')).toBeInTheDocument()
      expect(screen.getByText('Progress')).toBeInTheDocument()
    })

    it('should calculate progress correctly at start', () => {
      const game = createMockDashboardGame({
        currentRound: 0,
        maxRounds: 10,
      })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should calculate progress correctly at completion', () => {
      const game = createMockDashboardGame({
        currentRound: 5,
        maxRounds: 5,
      })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should display green progress bar for completed game', () => {
      const game = createMockDashboardGame({
        status: 'COMPLETED',
        currentRound: 5,
        maxRounds: 5,
      })

      const { container } = render(
        <GameProgressCard game={game} sessionId={mockSessionId} />,
      )

      const progressBar = container.querySelector('.bg-green-500')
      expect(progressBar).toBeInTheDocument()
    })

    it('should display blue progress bar for in-progress game', () => {
      const game = createMockDashboardGame({
        status: 'IN_PROGRESS',
        currentRound: 2,
        maxRounds: 5,
      })

      const { container } = render(
        <GameProgressCard game={game} sessionId={mockSessionId} />,
      )

      const progressBar = container.querySelector('.bg-blue-500')
      expect(progressBar).toBeInTheDocument()
    })

    it('should set correct progress bar width', () => {
      const game = createMockDashboardGame({
        currentRound: 3,
        maxRounds: 4,
      })

      const { container } = render(
        <GameProgressCard game={game} sessionId={mockSessionId} />,
      )

      // 3/4 = 75%
      const progressBar = container.querySelector('.bg-blue-500')
      expect(progressBar).toHaveStyle({ width: '75%' })
    })
  })

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const game = mockDashboardGames[0]
      const { container } = render(
        <GameProgressCard
          game={game}
          sessionId={mockSessionId}
          className="custom-card"
        />,
      )

      const card = container.firstChild
      expect(card).toHaveClass('custom-card')
    })

    it('should preserve base classes with custom className', () => {
      const game = mockDashboardGames[0]
      const { container } = render(
        <GameProgressCard
          game={game}
          sessionId={mockSessionId}
          className="mb-4"
        />,
      )

      const card = container.firstChild
      expect(card).toHaveClass('bg-white')
      expect(card).toHaveClass('border')
      expect(card).toHaveClass('mb-4')
    })
  })

  describe('Complete Game Scenarios', () => {
    it('should render active game with all features', () => {
      const game: DashboardGame = {
        id: 'game-active',
        name: 'Active Trivia',
        status: 'IN_PROGRESS',
        currentRound: 2,
        maxRounds: 5,
        teamsCount: 3,
        currentTurnTeamName: 'Team Alpha',
        turnTimeLimit: 60,
        winnerId: undefined,
        createdAt: new Date('2024-12-25T19:00:00Z').toISOString(),
      }

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.getByText('Active Trivia')).toBeInTheDocument()
      expect(screen.getByText(/Round 2\/5/)).toBeInTheDocument()
      expect(screen.getByText(/3 teams/)).toBeInTheDocument()
      expect(screen.getByText('Current Turn')).toBeInTheDocument()
      expect(screen.getByText('Team Alpha')).toBeInTheDocument()
      expect(screen.getByTestId('game-timer')).toBeInTheDocument()
      expect(screen.getByText('40%')).toBeInTheDocument() // 2/5
    })

    it('should render completed game with winner', () => {
      const game: DashboardGame = {
        id: 'game-complete',
        name: 'Finished Game',
        status: 'COMPLETED',
        currentRound: 5,
        maxRounds: 5,
        teamsCount: 2,
        currentTurnTeamName: undefined,
        turnTimeLimit: 0,
        winnerId: 'team-winner',
        createdAt: new Date('2024-12-25T19:00:00Z').toISOString(),
      }

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.getByText('Finished Game')).toBeInTheDocument()
      expect(screen.getByText('COMPLETED')).toBeInTheDocument()
      expect(screen.getByText('Winner')).toBeInTheDocument()
      expect(screen.getByText('🏆')).toBeInTheDocument()
      expect(screen.queryByTestId('game-timer')).not.toBeInTheDocument()
      expect(screen.queryByText('Current Turn')).not.toBeInTheDocument()
    })

    it('should render scheduled game', () => {
      const game: DashboardGame = {
        id: 'game-scheduled',
        name: 'Upcoming Game',
        status: 'SCHEDULED',
        currentRound: 0,
        maxRounds: 3,
        teamsCount: 4,
        currentTurnTeamName: undefined,
        turnTimeLimit: 30,
        winnerId: undefined,
        createdAt: new Date('2024-12-25T19:00:00Z').toISOString(),
      }

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.getByText('Upcoming Game')).toBeInTheDocument()
      expect(screen.getByText('SCHEDULED')).toBeInTheDocument()
      expect(screen.queryByTestId('game-timer')).not.toBeInTheDocument()
      expect(screen.queryByText('Current Turn')).not.toBeInTheDocument()
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should render paused game', () => {
      const game: DashboardGame = {
        id: 'game-paused',
        name: 'Paused Game',
        status: 'PAUSED',
        currentRound: 2,
        maxRounds: 4,
        teamsCount: 2,
        currentTurnTeamName: 'Team Beta',
        turnTimeLimit: 45,
        winnerId: undefined,
        createdAt: new Date('2024-12-25T19:00:00Z').toISOString(),
      }

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.getByText('Paused Game')).toBeInTheDocument()
      expect(screen.getByText('PAUSED')).toBeInTheDocument()
      expect(screen.queryByTestId('game-timer')).not.toBeInTheDocument() // Timer not shown when paused
      expect(screen.queryByText('Current Turn')).not.toBeInTheDocument() // Current turn not shown when paused
    })
  })

  describe('Edge Cases', () => {
    it('should handle game with single round', () => {
      const game = createMockDashboardGame({
        currentRound: 1,
        maxRounds: 1,
      })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.getByText(/Round 1\/1/)).toBeInTheDocument()
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should handle game with many rounds', () => {
      const game = createMockDashboardGame({
        currentRound: 15,
        maxRounds: 20,
      })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.getByText(/Round 15\/20/)).toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument() // 15/20 = 75%
    })

    it('should handle very long game name', () => {
      const longName =
        'This is a very long game name that might need to wrap or truncate'
      const game = createMockDashboardGame({ name: longName })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.getByText(longName)).toBeInTheDocument()
    })

    it('should handle very long team name', () => {
      const longTeamName = 'The Super Amazing Incredibly Long Team Name'
      const game = createMockDashboardGame({
        status: 'IN_PROGRESS',
        currentTurnTeamName: longTeamName,
      })

      render(<GameProgressCard game={game} sessionId={mockSessionId} />)

      expect(screen.getByText(longTeamName)).toBeInTheDocument()
    })
  })
})
