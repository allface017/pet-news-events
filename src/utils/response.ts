import type { ApiResponse } from "../types/index";

export function successResponse<T>(
  data: T,
  meta?: Record<string, unknown>
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
}
