import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test/test-utils'
import { TeamFormationInterface } from './TeamFormationInterface'
import { TeamFormationStrategy } from '../lib/api/types/team.dto'
import { teamService } from '../lib/api/services/team.service'
import { mockSuggestions, mockTeams } from '../test/fixtures/team.fixture'

vi.mock('../lib/api/services/team.service', () => ({
  teamService: {
    createTeams: vi.fn(),
    rebalanceTeams: vi.fn(),
    getTeamSuggestions: vi.fn(),
    getTeamStats: vi.fn(),
  },
}))

describe('TeamFormationInterface', () => {
  const mockPlayers = [
    { id: 'p1', name: 'Player 1', status: 'ready' as const },
    { id: 'p2', name: 'Player 2', status: 'ready' as const },
    { id: 'p3', name: 'Player 3', status: 'ready' as const },
    { id: 'p4', name: 'Player 4', status: 'ready' as const },
    { id: 'p5', name: 'Player 5', status: 'not_ready' as const },
    { id: 'p6', name: 'Player 6', status: 'ready' as const },
  ]

  const mockGames = [
    {
      id: 'game-1',
      name: 'Capture the Flag',
      minPlayers: 4,
      maxPlayers: 12,
      recommendedTeamSize: 4,
    },
    {
      id: 'game-2',
      name: 'Dodgeball',
      minPlayers: 6,
      maxPlayers: 16,
      recommendedTeamSize: 5,
    },
  ]

  const defaultProps = {
    sessionId: 'session-1',
    players: mockPlayers,
    teams: [],
    games: mockGames,
    onTeamsCreated: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(teamService.getTeamSuggestions).mockResolvedValue(mockSuggestions)
  })

  describe('Basic Rendering', () => {
    it('should render header and description', () => {
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      expect(screen.getByText('Team Formation')).toBeInTheDocument()
      expect(
        screen.getByText(/Organize players into balanced teams/),
      ).toBeInTheDocument()
    })

    it('should render game selection dropdown', () => {
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      expect(screen.getByText('Select Game')).toBeInTheDocument()
      const dropdown = screen.getByRole('combobox')
      expect(dropdown).toBeInTheDocument()
    })

    it('should render all 4 strategy cards', () => {
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      expect(screen.getByText('Smart Auto')).toBeInTheDocument()
      expect(screen.getByText('Balanced')).toBeInTheDocument()
      expect(screen.getByText('Random')).toBeInTheDocument()
      expect(screen.getByText('Manual')).toBeInTheDocument()
    })

    it('should show "Recommended" badge on BALANCED strategy', () => {
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      expect(screen.getByText('Recommended')).toBeInTheDocument()
    })

    it('should render player status section', () => {
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      expect(screen.getByText(/Player Status/)).toBeInTheDocument()
      expect(screen.getByText(/6 total/)).toBeInTheDocument()
    })

    it('should render create teams button', () => {
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      const button = screen.getByRole('button', { name: /Create Teams/i })
      expect(button).toBeInTheDocument()
    })

    it('should disable create button initially when no game selected', () => {
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      const button = screen.getByRole('button', { name: /Create Teams/i })
      expect(button).toBeDisabled()
    })
  })

  describe('Game Selection', () => {
    it('should populate dropdown with games from props', () => {
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      const dropdown = screen.getByRole('combobox')
      const options = screen.getAllByRole('option')

      // +1 for "Choose a game..." placeholder
      expect(options).toHaveLength(mockGames.length + 1)
      expect(
        screen.getByText('Capture the Flag (4-12 players)'),
      ).toBeInTheDocument()
      expect(screen.getByText('Dodgeball (6-16 players)')).toBeInTheDocument()
    })

    it('should display game info when game is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      const dropdown = screen.getByRole('combobox')
      await user.selectOptions(dropdown, 'game-1')

      await waitFor(() => {
        expect(screen.getByText(/Min Players:/)).toBeInTheDocument()
        expect(screen.getByText(/Max Players:/)).toBeInTheDocument()
        expect(screen.getByText(/Team Size:/)).toBeInTheDocument()
      })
    })

    it('should trigger suggestions query when game is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      const dropdown = screen.getByRole('combobox')
      await user.selectOptions(dropdown, 'game-1')

      await waitFor(() => {
        expect(teamService.getTeamSuggestions).toHaveBeenCalledWith('game-1')
      })
    })
  })

  describe('Strategy Selection', () => {
    it('should allow selecting each strategy type', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      // Get all radio inputs to select strategies
      const radios = screen.getAllByRole('radio') as HTMLInputElement[]

      // Find radios by their value attribute
      const automaticRadio = radios.find(
        (r) => r.value === TeamFormationStrategy.AUTOMATIC,
      )!
      const balancedRadio = radios.find(
        (r) => r.value === TeamFormationStrategy.BALANCED,
      )!
      const randomRadio = radios.find(
        (r) => r.value === TeamFormationStrategy.RANDOM,
      )!
      const manualRadio = radios.find(
        (r) => r.value === TeamFormationStrategy.MANUAL,
      )!

      await user.click(automaticRadio)
      await user.click(balancedRadio)
      await user.click(randomRadio)
      await user.click(manualRadio)

      // Verify the last one clicked (Manual) is checked
      expect(manualRadio).toBeChecked()

      // Verify the card has the blue border by checking the parent card div
      const manualCard = manualRadio.closest('.border-2')
      expect(manualCard).toHaveClass('border-blue-500')
    })

    it('should highlight selected strategy with blue border', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      const radios = screen.getAllByRole('radio') as HTMLInputElement[]
      const balancedRadio = radios.find(
        (r) => r.value === TeamFormationStrategy.BALANCED,
      )!
      await user.click(balancedRadio)

      const balancedCard = balancedRadio.closest('.border-2')
      expect(balancedCard).toHaveClass('border-blue-500')
    })

    it('should display correct description for each strategy', () => {
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      expect(screen.getByText(/Snake draft distribution/)).toBeInTheDocument()
      expect(screen.getByText(/Random assignment/)).toBeInTheDocument()
      expect(screen.getByText(/Smart distribution/)).toBeInTheDocument()
      expect(screen.getByText(/Create empty teams/)).toBeInTheDocument()
    })

    it('should show manual team count input only for MANUAL strategy', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      // Initially not visible (AUTOMATIC selected)
      expect(screen.queryByText('Number of Teams')).not.toBeInTheDocument()

      // Select MANUAL strategy
      const radios = screen.getAllByRole('radio') as HTMLInputElement[]
      const manualRadio = radios.find(
        (r) => r.value === TeamFormationStrategy.MANUAL,
      )!
      await user.click(manualRadio)

      // Now visible
      await waitFor(() => {
        expect(screen.getByText('Number of Teams')).toBeInTheDocument()
      })
    })

    it('should hide team customization for MANUAL strategy', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      // Initially visible (AUTOMATIC selected)
      expect(screen.getByText('Customize team names')).toBeInTheDocument()

      // Select MANUAL strategy
      const radios = screen.getAllByRole('radio') as HTMLInputElement[]
      const manualRadio = radios.find(
        (r) => r.value === TeamFormationStrategy.MANUAL,
      )!
      await user.click(manualRadio)

      // Now hidden
      await waitFor(() => {
        expect(
          screen.queryByText('Customize team names'),
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Team Name Customization', () => {
    it('should show "Customize team names" checkbox for non-MANUAL strategies', () => {
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      const checkbox = screen.getByRole('checkbox', {
        name: /Customize team names/i,
      })
      expect(checkbox).toBeInTheDocument()
    })

    it('should initialize team name inputs when checkbox is checked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      const dropdown = screen.getByRole('combobox')
      await user.selectOptions(dropdown, 'game-1')

      await waitFor(() => {
        expect(teamService.getTeamSuggestions).toHaveBeenCalled()
      })

      const checkbox = screen.getByRole('checkbox', {
        name: /Customize team names/i,
      })
      await user.click(checkbox)

      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText(/Team \d+ name/)
        expect(inputs.length).toBeGreaterThan(0)
      })
    })

    it('should update teamNames state when user types', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      const dropdown = screen.getByRole('combobox')
      await user.selectOptions(dropdown, 'game-1')

      await waitFor(() => {
        expect(teamService.getTeamSuggestions).toHaveBeenCalled()
      })

      const checkbox = screen.getByRole('checkbox', {
        name: /Customize team names/i,
      })
      await user.click(checkbox)

      await waitFor(async () => {
        const input = screen.getByPlaceholderText('Team 1 name')
        await user.clear(input)
        await user.type(input, 'Red Dragons')
        expect(input).toHaveValue('Red Dragons')
      })
    })
  })

  describe('Team Color Customization', () => {
    it('should show "Customize team colors" checkbox', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      const dropdown = screen.getByRole('combobox')
      await user.selectOptions(dropdown, 'game-1')

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', {
          name: /Customize team colors/i,
        })
        expect(checkbox).toBeInTheDocument()
      })
    })
  })

  describe('Formation Suggestions Display', () => {
    it('should fetch and display suggestions when game is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      const dropdown = screen.getByRole('combobox')
      await user.selectOptions(dropdown, 'game-1')

      await waitFor(() => {
        expect(screen.getByText('Formation Suggestions')).toBeInTheDocument()
      })
    })

    it('should show up to 3 suggestions', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      const dropdown = screen.getByRole('combobox')
      await user.selectOptions(dropdown, 'game-1')

      await waitFor(() => {
        expect(screen.getByText(/2 teams × 3 players/)).toBeInTheDocument()
        expect(screen.getByText(/3 teams × 2 players/)).toBeInTheDocument()
      })
    })

    it('should display pros with green checkmarks', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      const dropdown = screen.getByRole('combobox')
      await user.selectOptions(dropdown, 'game-1')

      await waitFor(() => {
        expect(screen.getByText(/Even teams/)).toBeInTheDocument()
        expect(screen.getByText(/Fair distribution/)).toBeInTheDocument()
      })
    })

    it('should display cons with amber warnings', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      const dropdown = screen.getByRole('combobox')
      await user.selectOptions(dropdown, 'game-1')

      await waitFor(() => {
        expect(screen.getByText(/Uneven teams/)).toBeInTheDocument()
      })
    })

    it('should show validation badge', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      const dropdown = screen.getByRole('combobox')
      await user.selectOptions(dropdown, 'game-1')

      await waitFor(() => {
        expect(screen.getByText(/Valid/)).toBeInTheDocument()
      })
    })
  })

  describe('Player Status', () => {
    it('should display total player count', () => {
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      expect(screen.getByText(/6\s+total/)).toBeInTheDocument()
    })

    it('should display unassigned players count', () => {
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      expect(screen.getByText('6')).toBeInTheDocument() // All unassigned initially
    })

    it('should display players in teams count when teams exist', () => {
      const propsWithTeams = {
        ...defaultProps,
        teams: mockTeams,
      }

      renderWithProviders(<TeamFormationInterface {...propsWithTeams} />)

      expect(screen.getByText(/In Teams/)).toBeInTheDocument()
    })

    it('should list unassigned players with status badges', () => {
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      expect(screen.getByText('Player 1')).toBeInTheDocument()
      expect(screen.getByText('Player 2')).toBeInTheDocument()
      expect(screen.getByText('Player 5')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should disable create button when no game selected', () => {
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      const button = screen.getByRole('button', { name: /Create Teams/i })
      expect(button).toBeDisabled()
    })

    it('should disable create button when no unassigned players', () => {
      const playersInTeams = mockPlayers.map((p) => ({ ...p }))
      const teamsWithPlayers = [
        {
          ...mockTeams[0],
          players: playersInTeams.slice(0, 3),
        },
        {
          ...mockTeams[1],
          players: playersInTeams.slice(3, 6),
        },
      ]

      const props = {
        ...defaultProps,
        teams: teamsWithPlayers as any,
      }

      renderWithProviders(<TeamFormationInterface {...props} />)

      const button = screen.getByRole('button', { name: /Create Teams/i })
      expect(button).toBeDisabled()
    })

    it('should handle empty suggestions gracefully', async () => {
      vi.mocked(teamService.getTeamSuggestions).mockResolvedValue({
        suggestions: [],
        validation: {
          isValid: false,
          errors: ['Not enough players'],
          warnings: [],
        },
      })

      const user = userEvent.setup()
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      const dropdown = screen.getByRole('combobox')
      await user.selectOptions(dropdown, 'game-1')

      await waitFor(() => {
        // Should not crash, suggestions section should not appear
        expect(
          screen.queryByText('Formation Suggestions'),
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Rebalance Teams Flow', () => {
    it('should show rebalance button only when teams exist', () => {
      renderWithProviders(<TeamFormationInterface {...defaultProps} />)

      expect(
        screen.queryByRole('button', { name: /Rebalance/i }),
      ).not.toBeInTheDocument()

      const propsWithTeams = {
        ...defaultProps,
        teams: mockTeams,
      }

      const { rerender } = renderWithProviders(
        <TeamFormationInterface {...propsWithTeams} />,
      )

      expect(
        screen.getByRole('button', { name: /Rebalance/i }),
      ).toBeInTheDocument()
    })
  })
})
