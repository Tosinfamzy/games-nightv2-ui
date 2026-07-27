import { describe, expect, it } from 'vitest'
import { ErrorCode } from '../errors/error-codes'
import {
  ErrorSeverity,
  classifyConnectError,
  handleWebSocketError,
} from './socket-error-handler'

describe('handleWebSocketError', () => {
  it('redirects to rejoin for auth codes', () => {
    const r = handleWebSocketError({ code: ErrorCode.TOKEN_INVALID })
    expect(r.shouldRedirect).toBe(true)
    expect(r.redirectPath).toBe('/rejoin')
    expect(r.message).toMatch(/rejoin/i)
  })

  it('shows the specific backend message for state codes', () => {
    const r = handleWebSocketError({
      code: ErrorCode.GAME_INVALID_STATE,
      message: 'Game is already completed',
    })
    expect(r.shouldRedirect).toBe(false)
    expect(r.severity).toBe(ErrorSeverity.ERROR)
    expect(r.message).toBe('Game is already completed')
  })

  it('surfaces the first validation detail', () => {
    const r = handleWebSocketError({
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Validation failed',
      details: ['name is required'],
    })
    expect(r.message).toBe('name is required')
  })

  it('accepts the legacy { error } shape and a raw string', () => {
    expect(
      handleWebSocketError({ error: 'boom', code: 'ChatError' }).message,
    ).toBe('boom')
    expect(handleWebSocketError('nope').message).toBe('nope')
  })
})

describe('classifyConnectError', () => {
  it('flags unreachable transport without redirecting', () => {
    const r = classifyConnectError(new Error('xhr poll error'), 'games')
    expect(r.shouldRedirect).toBe(false)
    expect(r.message).toMatch(/can't reach|check your connection/i)
  })

  it('redirects on a structured auth code in error.data', () => {
    const err = Object.assign(new Error('nope'), {
      data: { code: ErrorCode.TOKEN_INVALID },
    })
    const r = classifyConnectError(err)
    expect(r.shouldRedirect).toBe(true)
    expect(r.redirectPath).toBe('/rejoin')
  })

  it('redirects on a handshake auth message (no code channel)', () => {
    const r = classifyConnectError(new Error('Unauthorized: Invalid token'))
    expect(r.shouldRedirect).toBe(true)
  })

  it('defaults to a soft reconnecting warning', () => {
    const r = classifyConnectError(new Error('something odd'), 'chat')
    expect(r.severity).toBe(ErrorSeverity.WARNING)
    expect(r.shouldRedirect).toBe(false)
  })
})
