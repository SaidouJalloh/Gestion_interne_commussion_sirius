export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export const apiResponse = {
  success<T>(data: T, meta?: Record<string, unknown>): ApiSuccessResponse<T> {
    return { success: true, data, meta };
  },
  error(
    message: string,
    code?: string,
    details?: unknown,
  ): ApiErrorResponse {
    return { success: false, message, code, details };
  },
};


