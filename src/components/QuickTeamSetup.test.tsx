import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test/test-utils'
import { TeamFormationStrategy } from '../lib/api/types/team.dto'
import { teamService } from '../lib/api/services/team.service'
import { QuickTeamSetup } from './QuickTeamSetup'

vi.mock('../lib/api/services/team.service', () => ({
  teamService: {
    createTeams: vi.fn(),
  },
}))

describe('QuickTeamSetup', () => {
  const baseProps = {
    sessionId: 'session-1',
    gameId: 'game-1',
    playerCount: 2,
    onCreated: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('prompts to add a game when there is no game yet', () => {
    renderWithProviders(<QuickTeamSetup {...baseProps} gameId={undefined} />)
    expect(screen.getByText(/Add a game to get started/i)).toBeInTheDocument()
    expect(screen.queryByText(/Split into 2 teams/i)).not.toBeInTheDocument()
  })

  it('offers only a 2-team split for two players', () => {
    renderWithProviders(<QuickTeamSetup {...baseProps} playerCount={2} />)
    expect(screen.getByText('Split into 2 teams')).toBeInTheDocument()
    expect(screen.queryByText('3 teams')).not.toBeInTheDocument()
    expect(screen.queryByText('4 teams')).not.toBeInTheDocument()
  })

  it('offers 2/3/4-team options for four players', () => {
    renderWithProviders(<QuickTeamSetup {...baseProps} playerCount={4} />)
    expect(screen.getByText('Split into 2 teams')).toBeInTheDocument()
    expect(screen.getByText('3 teams')).toBeInTheDocument()
    expect(screen.getByText('4 teams')).toBeInTheDocument()
  })

  it('creates balanced teams for the active game on tap', async () => {
    vi.mocked(teamService.createTeams).mockResolvedValue([
      { id: 't1' },
      { id: 't2' },
    ] as never)
    const onCreated = vi.fn()
    renderWithProviders(
      <QuickTeamSetup {...baseProps} playerCount={2} onCreated={onCreated} />,
    )

    await userEvent.click(screen.getByText('Split into 2 teams'))

    expect(teamService.createTeams).toHaveBeenCalledWith('game-1', {
      strategy: TeamFormationStrategy.BALANCED,
      teamCount: 2,
    })
    await waitFor(() => expect(onCreated).toHaveBeenCalled())
  })
})
