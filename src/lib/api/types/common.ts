export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'ASC' | 'DESC'
}

export interface PaginatedResponse<T> {
  items: Array<T>
  total: number
  page: number
  limit: number
  pages: number
}
