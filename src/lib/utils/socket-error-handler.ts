/**
 * WebSocket error interface matching backend error format
 */
export interface WebSocketError {
  error: string;
  code: string;
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * Processed error result
 */
export interface ProcessedError {
  message: string;
  severity: ErrorSeverity;
  shouldRedirect: boolean;
  redirectPath?: string;
}

/**
 * Handle WebSocket errors and return processed error information
 * Components can use this to display errors in their preferred way
 */
export function handleWebSocketError(error: WebSocketError): ProcessedError {
  console.error('WebSocket error:', error);

  switch (error.code) {
    case 'NotFoundException':
      return {
        message: error.error || 'Resource not found',
        severity: ErrorSeverity.ERROR,
        shouldRedirect: false,
      };

    case 'ForbiddenException':
      return {
        message: `Access denied: ${error.error}`,
        severity: ErrorSeverity.ERROR,
        shouldRedirect: false,
      };

    case 'UnauthorizedException':
      return {
        message: 'You are not authorized. Please log in again.',
        severity: ErrorSeverity.ERROR,
        shouldRedirect: true,
        redirectPath: '/login',
      };

    case 'BadRequestException':
      return {
        message: error.error || 'Invalid request',
        severity: ErrorSeverity.WARNING,
        shouldRedirect: false,
      };

    case 'ConflictException':
      return {
        message: error.error || 'Conflict occurred',
        severity: ErrorSeverity.WARNING,
        shouldRedirect: false,
      };

    case 'InternalServerErrorException':
      return {
        message: 'An internal server error occurred. Please try again later.',
        severity: ErrorSeverity.ERROR,
        shouldRedirect: false,
      };

    default:
      return {
        message: error.error || 'An unknown error occurred',
        severity: ErrorSeverity.ERROR,
        shouldRedirect: false,
      };
  }
}

/**
 * Handle HTTP errors from REST API calls
 */
export function handleHTTPError(response: Response): ProcessedError {
  console.error('HTTP error:', response.status, response.statusText);

  switch (response.status) {
    case 400:
      return {
        message: 'Invalid request',
        severity: ErrorSeverity.WARNING,
        shouldRedirect: false,
      };

    case 401:
      return {
        message: 'You are not authorized. Please log in again.',
        severity: ErrorSeverity.ERROR,
        shouldRedirect: true,
        redirectPath: '/login',
      };

    case 403:
      return {
        message: 'Access denied',
        severity: ErrorSeverity.ERROR,
        shouldRedirect: false,
      };

    case 404:
      return {
        message: 'Resource not found',
        severity: ErrorSeverity.ERROR,
        shouldRedirect: false,
      };

    case 409:
      return {
        message: 'Conflict occurred',
        severity: ErrorSeverity.WARNING,
        shouldRedirect: false,
      };

    case 500:
    case 502:
    case 503:
      return {
        message: 'Server error. Please try again later.',
        severity: ErrorSeverity.ERROR,
        shouldRedirect: false,
      };

    default:
      return {
        message: `Request failed with status ${response.status}`,
        severity: ErrorSeverity.ERROR,
        shouldRedirect: false,
      };
  }
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
  }

  return 'An unexpected error occurred';
}
