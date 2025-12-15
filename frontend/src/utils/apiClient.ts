import { DEFAULT_HEADERS } from '../config/api';

export type ApiErrorBody = {
  success?: boolean;
  message?: string;
  code?: string;
  details?: unknown;
};

export type ApiSuccessBody<T> = {
  success?: boolean;
  data?: T;
  meta?: Record<string, unknown>;
};

export const parseApiResponse = async <T,>(response: Response): Promise<T> => {
  const raw = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const message =
      raw && typeof raw === 'object' && raw !== null && 'message' in raw
        ? String((raw as ApiErrorBody).message)
        : `Erreur HTTP ${response.status}`;
    throw new Error(message);
  }

  // backend: { success: true, data: ... }
  if (raw && typeof raw === 'object' && raw !== null && 'data' in raw) {
    return (raw as ApiSuccessBody<T>).data as T;
  }

  // fallback
  return raw as T;
};

export type ApiRequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

export const apiRequest = async <T,>(
  url: string,
  options?: ApiRequestOptions,
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...(options?.headers ?? {}),
    },
  });

  return parseApiResponse<T>(response);
};

