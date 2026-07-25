/**
 * Canonical error codes returned by the backend's global exception filter.
 *
 * Keep this in sync with the API's `ErrorCode` enum. The backend sends a stable
 * `code` on every error (HTTP body + WebSocket `exception` events); the UI
 * branches on `code` rather than sniffing human-readable messages.
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  HTTP_ERROR = 'HTTP_ERROR',
}

/** Friendly, user-facing copy per code. */
const CODE_MESSAGES: Partial<Record<ErrorCode, string>> = {
  [ErrorCode.UNAUTHORIZED]: 'Your session expired. Please sign in again.',
  [ErrorCode.FORBIDDEN]: "You don't have permission to do that.",
  [ErrorCode.NOT_FOUND]: "We couldn't find that — it may have been removed.",
  [ErrorCode.CONFLICT]:
    'That conflicts with the current state. Refresh and try again.',
  [ErrorCode.RATE_LIMITED]: "You're doing that too fast — give it a second.",
  [ErrorCode.INTERNAL_ERROR]:
    'Something went wrong on our end. Please try again.',
}

/** Codes that mean the user should re-authenticate. */
export const AUTH_ERROR_CODES: ReadonlySet<string> = new Set([
  ErrorCode.UNAUTHORIZED,
])

interface CodedError {
  code?: string
  message?: string
  details?: unknown
}

function asCodedError(error: unknown): CodedError | null {
  if (error && typeof error === 'object') return error as CodedError
  return null
}

/**
 * Resolve the best user-facing message for an error carrying a backend `code`.
 *
 * Priority: validation detail → friendly per-code copy → the backend's own
 * message → a generic fallback. Works with `APIError` and the WS `exception`
 * payload; falls back gracefully when no `code` is present (e.g. before the
 * filter is deployed, or for network errors).
 */
export function resolveErrorMessage(
  error: unknown,
  fallback = 'An unexpected error occurred',
): string {
  const coded = asCodedError(error)
  if (!coded) return typeof error === 'string' ? error : fallback

  // class-validator surfaces an array of constraint strings in `details`.
  if (
    coded.code === ErrorCode.VALIDATION_ERROR &&
    Array.isArray(coded.details)
  ) {
    const first = coded.details[0]
    if (typeof first === 'string') return first
  }

  if (coded.code && coded.code in CODE_MESSAGES) {
    return CODE_MESSAGES[coded.code as ErrorCode] as string
  }

  return coded.message ?? fallback
}

/** Whether an error indicates the user must re-authenticate. */
export function isAuthError(error: unknown): boolean {
  const coded = asCodedError(error)
  return !!coded?.code && AUTH_ERROR_CODES.has(coded.code)
}
