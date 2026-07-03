import { isValidUUID } from '@rms/utils';

export { isValidUUID };

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Calculates standard pagination metadata offsets
 */
export function buildPaginationMeta(
  page: number,
  limit: number,
  totalItems: number
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Converts date strings safely to ISO formats
 */
export function toISODateString(dateInput: Date | string | number): string {
  try {
    return new Date(dateInput).toISOString();
  } catch {
    return new Date().toISOString();
  }
}
