import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { TeamDisplay } from './TeamDisplay'

const teams = [
  {
    id: 't1',
    name: 'Red Team',
    color: '#ff0000',
    players: [{ id: 'p1', name: 'Alice', status: 'ready' as const }],
  },
  {
    id: 't2',
    name: 'Blue Team',
    color: '#0000ff',
    players: [{ id: 'p2', name: 'Bob', status: 'ready' as const }],
  },
]

describe('TeamDisplay remove control', () => {
  afterEach(cleanup)

  it('shows no Remove control for players (read-only)', () => {
    render(<TeamDisplay teams={teams} unassignedPlayers={[]} />)
    expect(screen.queryByText('Remove')).toBeNull()
  })

  it('shows a Remove control on each team card for the host', () => {
    render(
      <TeamDisplay
        teams={teams}
        unassignedPlayers={[]}
        isHost
        onRemoveTeam={vi.fn()}
      />,
    )
    expect(screen.getAllByText('Remove')).toHaveLength(2)
  })

  it('calls onRemoveTeam with the team when tapped', () => {
    const onRemoveTeam = vi.fn()
    render(
      <TeamDisplay
        teams={teams}
        unassignedPlayers={[]}
        isHost
        onRemoveTeam={onRemoveTeam}
      />,
    )
    fireEvent.click(screen.getAllByText('Remove')[0])
    expect(onRemoveTeam).toHaveBeenCalledWith({ id: 't1', name: 'Red Team' })
  })
})
