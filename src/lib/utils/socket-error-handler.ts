import { isAuthError, resolveErrorMessage } from '../errors/error-codes'

/**
 * Processes WebSocket errors into a consistent, code-driven result the UI can
 * act on. Branches on the backend's stable error `code` (via the shared
 * error-codes helpers) rather than sniffing message strings.
 */

export enum ErrorSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export interface ProcessedError {
  message: string
  severity: ErrorSeverity
  shouldRedirect: boolean
  redirectPath?: string
}

interface NormalizedError {
  code?: string
  message?: string
  details?: unknown
}

/**
 * Normalize anything a socket hands us — the backend `exception` envelope
 * ({ code, message, details }), the legacy gateway shape ({ error, code }),
 * a raw Error, or a string — into a common shape.
 */
function normalize(input: unknown): NormalizedError {
  if (typeof input === 'string') return { message: input }
  if (input instanceof Error) return { message: input.message }
  if (input && typeof input === 'object') {
    const o = input as Record<string, unknown>
    return {
      code: typeof o.code === 'string' ? o.code : undefined,
      // Prefer the new `message`, fall back to the legacy `error` field.
      message:
        typeof o.message === 'string'
          ? o.message
          : typeof o.error === 'string'
            ? o.error
            : undefined,
      details: o.details,
    }
  }
  return {}
}

/** Redirect target for errors that require the player to rejoin. */
const REJOIN_PATH = '/rejoin'

/**
 * Process a server-pushed WebSocket error (the `exception` event, or a legacy
 * `*:error` payload).
 */
export function handleWebSocketError(
  input: unknown,
  contextLabel = 'the server',
): ProcessedError {
  const normalized = normalize(input)

  if (isAuthError(normalized)) {
    return {
      message: 'Your session expired. Please rejoin.',
      severity: ErrorSeverity.ERROR,
      shouldRedirect: true,
      redirectPath: REJOIN_PATH,
    }
  }

  return {
    message: resolveErrorMessage(
      normalized,
      `Something went wrong with ${contextLabel}.`,
    ),
    severity: ErrorSeverity.ERROR,
    shouldRedirect: false,
  }
}

/**
 * Classify a Socket.IO `connect_error` (a transport/handshake failure, which
 * unlike a runtime `exception` carries no guaranteed structured code). We
 * prefer a structured `code` if the server attached one via `error.data`, then
 * fall back to the few transport signatures worth distinguishing for the user.
 */
export function classifyConnectError(
  error: unknown,
  contextLabel = 'the server',
): ProcessedError {
  const data = (error as { data?: unknown } | null)?.data
  if (data && isAuthError(normalize(data))) {
    return {
      message: 'Your session expired. Please rejoin.',
      severity: ErrorSeverity.ERROR,
      shouldRedirect: true,
      redirectPath: REJOIN_PATH,
    }
  }

  const raw =
    error instanceof Error ? error.message.toLowerCase() : String(error ?? '')

  if (
    raw.includes('econnrefused') ||
    raw.includes('xhr poll error') ||
    raw.includes('timeout')
  ) {
    return {
      message: `Can't reach the server for ${contextLabel}. Check your connection.`,
      severity: ErrorSeverity.ERROR,
      shouldRedirect: false,
    }
  }

  // Handshake auth rejections still surface as a message here (no code channel).
  if (
    raw.includes('unauthorized') ||
    raw.includes('token') ||
    raw.includes('expired') ||
    raw.includes('invalid')
  ) {
    return {
      message: 'Your session expired. Please rejoin.',
      severity: ErrorSeverity.ERROR,
      shouldRedirect: true,
      redirectPath: REJOIN_PATH,
    }
  }

  return {
    message: `Reconnecting to ${contextLabel}…`,
    severity: ErrorSeverity.WARNING,
    shouldRedirect: false,
  }
}
