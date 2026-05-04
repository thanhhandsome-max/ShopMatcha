/**
 * Standard API Response Types & Utilities
 * Used across all API endpoints for consistency
 */

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, any>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a successful API response
 */
export function successResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Create an error API response
 */
export function errorResponse(
  error: string,
  details?: Record<string, any>
): ApiErrorResponse {
  return {
    success: false,
    error,
    details,
  };
}

/**
 * Standard error messages
 */
export const ErrorMessages = {
  INVALID_PARAMS: "Invalid parameters",
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  SERVER_ERROR: "Internal server error",
  DATABASE_ERROR: "Database error",
  VALIDATION_ERROR: "Validation failed",
} as const;
