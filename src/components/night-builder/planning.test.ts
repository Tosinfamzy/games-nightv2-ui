import { describe, expect, it } from 'vitest'
import {
  formatLabel,
  formatMinutes,
  scoringLabel,
  segmentMinutes,
  splitEvenly,
} from './planning'
import { GameFormat } from '../../lib/api/types/night-plan'

describe('splitEvenly', () => {
  it('splits evenly when divisible', () => {
    expect(splitEvenly(24, 3)).toEqual([8, 8, 8])
  })

  it('keeps sizes within one, larger teams first', () => {
    expect(splitEvenly(20, 3)).toEqual([7, 7, 6])
    expect(splitEvenly(14, 3)).toEqual([5, 5, 4])
  })

  it('handles more teams than players', () => {
    expect(splitEvenly(2, 3)).toEqual([1, 1, 0])
  })

  it('guards degenerate inputs', () => {
    expect(splitEvenly(10, 0)).toEqual([])
    expect(splitEvenly(-1, 3)).toEqual([])
  })
})

describe('segmentMinutes', () => {
  it('equals the estimate at the recommended rounds', () => {
    expect(segmentMinutes(15, 3, 3)).toBe(15)
  })

  it('scales proportionally when rounds are tuned', () => {
    expect(segmentMinutes(15, 6, 3)).toBe(30)
    expect(segmentMinutes(15, 1, 3)).toBe(5)
  })

  it('falls back when no estimate exists', () => {
    expect(segmentMinutes(null, 1, 1)).toBe(10)
    expect(segmentMinutes(undefined, 2, 0)).toBe(10)
  })
})

describe('formatMinutes', () => {
  it('formats hours and minutes', () => {
    expect(formatMinutes(135)).toBe('2h 15m')
    expect(formatMinutes(45)).toBe('45m')
    expect(formatMinutes(120)).toBe('2h')
    expect(formatMinutes(0)).toBe('0m')
  })
})

describe('scoringLabel', () => {
  it('reports a flat winner bonus when set', () => {
    expect(scoringLabel(5)).toBe('Winner scores 5 pts')
  })

  it('falls back to placement points', () => {
    expect(scoringLabel(null)).toBe('Placement — 1st 3, 2nd 2, 3rd 1')
    expect(scoringLabel(undefined)).toBe('Placement — 1st 3, 2nd 2, 3rd 1')
  })
})

describe('formatLabel', () => {
  it('maps every format to a label', () => {
    expect(formatLabel(GameFormat.FREE_FOR_ALL)).toBe('Everyone plays')
    expect(formatLabel(GameFormat.ROUND_ROBIN)).toBe('2 teams, round-robin')
    expect(formatLabel(GameFormat.TRIO)).toBe('Trios (one per team)')
    expect(formatLabel(GameFormat.ALL_TEAMS)).toBe('All teams at once')
  })
})
