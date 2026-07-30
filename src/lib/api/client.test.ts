import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { APIError, fetchAPI, setClerkTokenGetter } from './client'

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response
}

describe('fetchAPI auth + games-master-as-guest retry', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
    localStorage.clear()
    setClerkTokenGetter(null)
  })

  afterEach(() => {
    setClerkTokenGetter(null)
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  const authHeaderOfCall = (call: number) => {
    const init = fetchMock.mock.calls[call][1] as RequestInit
    return new Headers(init.headers).get('Authorization')
  }

  it('retries a 403 with the player token when signed in as a GM guest', async () => {
    setClerkTokenGetter(() => Promise.resolve('clerk-tok'))
    localStorage.setItem('gn_player_token', 'player-tok')
    fetchMock
      .mockResolvedValueOnce(
        mockResponse(403, { message: 'Only the session host can view this' }),
      )
      .mockResolvedValueOnce(mockResponse(200, [{ id: 'p1' }]))

    const result = await fetchAPI('/sessions/s1/players')

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(authHeaderOfCall(0)).toBe('Bearer clerk-tok') // GM identity first
    expect(authHeaderOfCall(1)).toBe('Bearer player-tok') // then guest identity
    expect(result).toEqual([{ id: 'p1' }])
  })

  it('does not retry when the request succeeds', async () => {
    setClerkTokenGetter(() => Promise.resolve('clerk-tok'))
    localStorage.setItem('gn_player_token', 'player-tok')
    fetchMock.mockResolvedValueOnce(mockResponse(200, { ok: true }))

    await fetchAPI('/sessions/s1')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does not retry a 403 when there is no player token', async () => {
    setClerkTokenGetter(() => Promise.resolve('clerk-tok'))
    fetchMock.mockResolvedValueOnce(
      mockResponse(403, { message: 'Forbidden', code: 'FORBIDDEN' }),
    )

    await expect(fetchAPI('/sessions/s1/players')).rejects.toBeInstanceOf(
      APIError,
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
