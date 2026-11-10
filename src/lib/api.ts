import { notFound } from 'next/navigation';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7777';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export function isApiErrorWithStatus(error: unknown, status: number): error is ApiError {
  return error instanceof ApiError && error.status === status;
}

export function isApiErrorWithCode(error: unknown, code: string): error is ApiError {
  return error instanceof ApiError && error.code === code;
}

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, token, signal }: ApiRequestOptions = {},
): Promise<T> {
  let response: Response;
  const isJson = body !== undefined && !(body instanceof FormData);

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(isJson ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: isJson ? JSON.stringify(body) : (body as FormData | undefined),
      cache: 'no-store',
      signal,
    });
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    throw new ApiError(
      'Não foi possível conectar ao servidor. Tente novamente em instantes.',
      0,
      'NETWORK_ERROR',
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const { error } = (data ?? {}) as ApiErrorBody;

    throw new ApiError(
      error?.message ?? 'Ocorreu um erro inesperado. Tente novamente.',
      response.status,
      error?.code ?? 'UNKNOWN_ERROR',
    );
  }

  return data as T;
}

export function getRecordOrNotFound<T>(path: string, token: string): Promise<T> {
  return apiRequest<T>(path, { token }).catch((error: unknown) => {
    if (isApiErrorWithStatus(error, 404) || isApiErrorWithStatus(error, 400)) {
      notFound();
    }

    throw error;
  });
}
