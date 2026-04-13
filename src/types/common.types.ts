// Common types used across the application

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

// Pagination types according to PAGINATION_GUIDE.md
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Alternative format used in some endpoints
export interface PaginatedItemsResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
}

export type SortOrder = 'asc' | 'desc';

export interface SortOption {
  field: string;
  order: SortOrder;
}

export interface FilterOption {
  field: string;
  value: string | number | boolean;
  operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like';
}
