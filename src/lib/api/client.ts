// Auto-detect API URL: use env var if set, otherwise use current host with port 3000
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  // Use current hostname with backend port (works for both localhost and network IPs)
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  return `${protocol}//${hostname}:3000`
}

const API_URL = getApiUrl()

// Custom error class for API errors
export class APIError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export interface RequestConfig extends RequestInit {
  params?: Record<string, string>
}

export async function fetchAPI<T>(
  endpoint: string,
  config?: RequestConfig,
): Promise<T> {
  if (!endpoint || typeof endpoint !== 'string') {
    throw new APIError(
      0,
      'INVALID_ENDPOINT',
      'Invalid endpoint provided to fetchAPI',
      { endpoint },
    )
  }

  const { params, ...init } = config || {}

  // Automatically prepend /v1 if not already present
  const versionedEndpoint = endpoint.startsWith('/v1/')
    ? endpoint
    : `/v1${endpoint}`

  // Build URL with query parameters
  const url = new URL(versionedEndpoint, API_URL)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  // Add default headers and auth token
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')

  const token = localStorage.getItem('auth_token')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // Make the request
  const response = await fetch(url, {
    ...init,
    headers,
  })

  // Handle non-2xx responses
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new APIError(
      response.status,
      data.code || 'UNKNOWN_ERROR',
      data.message || 'An unexpected error occurred',
      data,
    )
  }

  // Parse JSON response
  return response.json()
}

// Type for pagination parameters
export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'ASC' | 'DESC'
}

// Type for API response with pagination
export interface PaginatedResponse<T> {
  items: Array<T>
  total: number
  page: number
  limit: number
  pages: number
}
