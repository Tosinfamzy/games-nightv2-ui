import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TeamManagementPanel } from './TeamManagementPanel'
import * as teamService from '../lib/api/services/team.service'
import * as playerService from '../lib/api/services/player.service'

// Mock services
vi.mock('../lib/api/services/team.service')
vi.mock('../lib/api/services/player.service')
vi.mock('../lib/toast', () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock window.confirm
global.confirm = vi.fn(() => true)

describe('TeamManagementPanel', () => {
  let queryClient: QueryClient

  const mockTeams = [
    {
      id: 'team-1',
      name: 'Team Alpha',
      color: '#FF5733',
      position: 1,
      isActive: true,
      playerIds: ['player-1', 'player-2'],
      scoreIds: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'team-2',
      name: 'Team Beta',
      color: '#3366FF',
      position: 2,
      isActive: true,
      playerIds: ['player-3'],
      scoreIds: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ]

  const mockPlayers = [
    {
      id: 'player-1',
      name: 'Alice',
      email: 'alice@test.com',
      status: 'ready' as const,
      isOnline: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'player-2',
      name: 'Bob',
      email: 'bob@test.com',
      status: 'ready' as const,
      isOnline: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'player-3',
      name: 'Charlie',
      email: 'charlie@test.com',
      status: 'ready' as const,
      isOnline: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'player-4',
      name: 'Diana',
      email: 'diana@test.com',
      status: 'ready' as const,
      isOnline: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ]

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
    ;(global.confirm as any).mockReturnValue(true)
  })

  const renderPanel = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TeamManagementPanel
          gameId="game-1"
          sessionId="session-1"
          isHost={true}
          {...props}
        />
      </QueryClientProvider>,
    )
  }

  it('should render team management panel for host', async () => {
    vi.mocked(teamService.teamService.getByGame).mockResolvedValue(mockTeams)
    vi.mocked(playerService.playerService.getBySession).mockResolvedValue(
      mockPlayers,
    )

    renderPanel()

    await waitFor(() => {
      expect(screen.getByText('Team Management')).toBeInTheDocument()
    })

    expect(screen.getByText('2 teams')).toBeInTheDocument()
  })

  it('should show message for non-host users', () => {
    renderPanel({ isHost: false })

    expect(screen.getByText('Only the host can manage teams.')).toBeInTheDocument()
  })

  it('should display all teams with their players', async () => {
    vi.mocked(teamService.teamService.getByGame).mockResolvedValue(mockTeams)
    vi.mocked(playerService.playerService.getBySession).mockResolvedValue(
      mockPlayers,
    )

    renderPanel()

    await waitFor(() => {
      expect(screen.getAllByText('Team Alpha').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Team Beta').length).toBeGreaterThan(0)
    })

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('should show loading state while fetching data', () => {
    vi.mocked(teamService.teamService.getByGame).mockImplementation(
      () => new Promise(() => {}), // Never resolves
    )
    vi.mocked(playerService.playerService.getBySession).mockImplementation(
      () => new Promise(() => {}),
    )

    renderPanel()

    // Check for the loading spinner div
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('should show empty state when no teams exist', async () => {
    vi.mocked(teamService.teamService.getByGame).mockResolvedValue([])
    vi.mocked(playerService.playerService.getBySession).mockResolvedValue(
      mockPlayers,
    )

    renderPanel()

    await waitFor(() => {
      expect(screen.getByText('No teams have been created yet.')).toBeInTheDocument()
    })

    expect(
      screen.getByText('Create teams first to manage them.'),
    ).toBeInTheDocument()
  })

  it('should display dissolve button for each team', async () => {
    vi.mocked(teamService.teamService.getByGame).mockResolvedValue(mockTeams)
    vi.mocked(playerService.playerService.getBySession).mockResolvedValue(
      mockPlayers,
    )

    renderPanel()

    await waitFor(() => {
      const dissolveButtons = screen.getAllByText('Dissolve Team')
      expect(dissolveButtons).toHaveLength(2)
    })
  })

  it('should show confirmation dialog when dissolving a team', async () => {
    vi.mocked(teamService.teamService.getByGame).mockResolvedValue(mockTeams)
    vi.mocked(playerService.playerService.getBySession).mockResolvedValue(
      mockPlayers,
    )
    vi.mocked(teamService.teamService.dissolveTeam).mockResolvedValue({
      message: 'Team dissolved successfully',
    })

    renderPanel()

    await waitFor(() => {
      expect(screen.getAllByText('Dissolve Team')).toHaveLength(2)
    })

    const dissolveButtons = screen.getAllByText('Dissolve Team')
    await userEvent.click(dissolveButtons[0])

    expect(global.confirm).toHaveBeenCalledWith(
      expect.stringContaining('Team Alpha'),
    )
  })

  it('should show move to dropdown for each player', async () => {
    vi.mocked(teamService.teamService.getByGame).mockResolvedValue(mockTeams)
    vi.mocked(playerService.playerService.getBySession).mockResolvedValue(
      mockPlayers,
    )

    renderPanel()

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    // Find all "Move to..." dropdowns
    const dropdowns = screen.getAllByRole('combobox')
    expect(dropdowns.length).toBeGreaterThan(0)
  })

  it('should display unassigned players section', async () => {
    // Player 4 is unassigned
    vi.mocked(teamService.teamService.getByGame).mockResolvedValue(mockTeams)
    vi.mocked(playerService.playerService.getBySession).mockResolvedValue(
      mockPlayers,
    )

    renderPanel()

    await waitFor(() => {
      expect(screen.getByText('Unassigned Players')).toBeInTheDocument()
    })

    expect(screen.getByText('Diana')).toBeInTheDocument()
  })

  it('should disable buttons during processing', async () => {
    vi.mocked(teamService.teamService.getByGame).mockResolvedValue(mockTeams)
    vi.mocked(playerService.playerService.getBySession).mockResolvedValue(
      mockPlayers,
    )
    vi.mocked(teamService.teamService.dissolveTeam).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000)),
    )

    renderPanel()

    await waitFor(() => {
      expect(screen.getAllByText('Dissolve Team')).toHaveLength(2)
    })

    const dissolveButtons = screen.getAllByText('Dissolve Team')
    await userEvent.click(dissolveButtons[0])

    // Buttons should be disabled during operation
    dissolveButtons.forEach((button) => {
      expect(button).toBeDisabled()
    })
  })

  it('should show team colors', async () => {
    vi.mocked(teamService.teamService.getByGame).mockResolvedValue(mockTeams)
    vi.mocked(playerService.playerService.getBySession).mockResolvedValue(
      mockPlayers,
    )

    renderPanel()

    await waitFor(() => {
      expect(screen.getAllByText('Team Alpha').length).toBeGreaterThan(0)
    })

    const colorDivs = document.querySelectorAll('[style*="background-color"]')
    expect(colorDivs.length).toBeGreaterThan(0)
  })

  it('should show player counts', async () => {
    vi.mocked(teamService.teamService.getByGame).mockResolvedValue(mockTeams)
    vi.mocked(playerService.playerService.getBySession).mockResolvedValue(
      mockPlayers,
    )

    renderPanel()

    await waitFor(() => {
      expect(screen.getByText('(2 players)')).toBeInTheDocument()
      expect(screen.getByText('(1 player)')).toBeInTheDocument()
    })
  })

  it('should not dissolve team if user cancels confirmation', async () => {
    ;(global.confirm as any).mockReturnValue(false)

    vi.mocked(teamService.teamService.getByGame).mockResolvedValue(mockTeams)
    vi.mocked(playerService.playerService.getBySession).mockResolvedValue(
      mockPlayers,
    )
    vi.mocked(teamService.teamService.dissolveTeam).mockResolvedValue({
      message: 'Team dissolved successfully',
    })

    renderPanel()

    await waitFor(() => {
      expect(screen.getAllByText('Dissolve Team')).toHaveLength(2)
    })

    const dissolveButtons = screen.getAllByText('Dissolve Team')
    await userEvent.click(dissolveButtons[0])

    expect(teamService.teamService.dissolveTeam).not.toHaveBeenCalled()
  })

  it('should handle reassign player action', async () => {
    vi.mocked(teamService.teamService.getByGame).mockResolvedValue(mockTeams)
    vi.mocked(playerService.playerService.getBySession).mockResolvedValue(
      mockPlayers,
    )
    vi.mocked(teamService.teamService.reassignPlayer).mockResolvedValue(
      mockTeams[1],
    )

    renderPanel()

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    // Find Alice's dropdown and select Team Beta
    const dropdowns = screen.getAllByRole('combobox')
    const aliceDropdown = dropdowns[0] // First player's dropdown

    await userEvent.selectOptions(aliceDropdown, 'team-2')

    await waitFor(() => {
      expect(teamService.teamService.reassignPlayer).toHaveBeenCalledWith(
        'player-1',
        'team-2',
      )
    })
  })
})
