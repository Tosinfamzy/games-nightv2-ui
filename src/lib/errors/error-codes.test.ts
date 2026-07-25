import { describe, expect, it } from 'vitest'
import { ErrorCode, isAuthError, resolveErrorMessage } from './error-codes'

describe('resolveErrorMessage', () => {
  it('surfaces the first validation constraint for VALIDATION_ERROR', () => {
    const err = {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Validation failed',
      details: ['email must be an email', 'password must be a string'],
    }
    expect(resolveErrorMessage(err)).toBe('email must be an email')
  })

  it('uses friendly copy for a known code', () => {
    expect(resolveErrorMessage({ code: ErrorCode.UNAUTHORIZED })).toMatch(
      /session expired/i,
    )
    expect(resolveErrorMessage({ code: ErrorCode.NOT_FOUND })).toMatch(
      /couldn't find/i,
    )
  })

  it('falls back to the backend message for an unmapped code', () => {
    expect(
      resolveErrorMessage({ code: 'SOME_DOMAIN_CODE', message: 'Nope, bad' }),
    ).toBe('Nope, bad')
  })

  it('uses friendly copy for domain codes that have it', () => {
    expect(resolveErrorMessage({ code: ErrorCode.EMAIL_TAKEN })).toMatch(
      /already registered/i,
    )
  })

  it('falls through to the specific backend message for state codes', () => {
    expect(
      resolveErrorMessage({
        code: ErrorCode.GAME_INVALID_STATE,
        message: 'Game is already completed',
      }),
    ).toBe('Game is already completed')
  })

  it('handles a plain string error', () => {
    expect(resolveErrorMessage('boom')).toBe('boom')
  })

  it('uses the fallback when there is nothing usable', () => {
    expect(resolveErrorMessage({}, 'fallback here')).toBe('fallback here')
    expect(resolveErrorMessage(undefined)).toBe('An unexpected error occurred')
  })

  it('works with an APIError-shaped instance', () => {
    class APIError extends Error {
      constructor(
        public status: number,
        public code: string,
        message: string,
        public details?: unknown,
      ) {
        super(message)
      }
    }
    const e = new APIError(404, ErrorCode.NOT_FOUND, 'Game not found')
    expect(resolveErrorMessage(e)).toMatch(/couldn't find/i)
  })
})

describe('isAuthError', () => {
  it('is true for UNAUTHORIZED and TOKEN_INVALID', () => {
    expect(isAuthError({ code: ErrorCode.UNAUTHORIZED })).toBe(true)
    expect(isAuthError({ code: ErrorCode.TOKEN_INVALID })).toBe(true)
  })
  it('is false for other codes and non-coded errors', () => {
    expect(isAuthError({ code: ErrorCode.NOT_FOUND })).toBe(false)
    expect(isAuthError('nope')).toBe(false)
    expect(isAuthError(undefined)).toBe(false)
  })
})
