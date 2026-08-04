import type { ApiErrorBody, ApiResponse } from './types';
import { getStoredToken } from '../auth/storage';

function getApiBase(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return '';
}

export async function apiRequest<T = ApiResponse>(
  path: string,
  options?: RequestInit & { auth?: boolean },
): Promise<T> {
  const { auth = false, headers: initHeaders, ...rest } = options ?? {};
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(initHeaders as Record<string, string> | undefined),
  };

  if (auth) {
    const token = getStoredToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${getApiBase()}${path}`, {
    ...rest,
    headers,
  });

  const data: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    const body = data as ApiErrorBody;
    const raw = body.message;
    const message = Array.isArray(raw)
      ? raw.join(', ')
      : typeof raw === 'string'
        ? raw
        : `Ошибка ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

export function getResponseMessage(
  response: ApiResponse,
  fallback: string,
): string {
  return typeof response.message === 'string' ? response.message : fallback;
}

export function flattenApiResponse(response: ApiResponse): Record<string, unknown> {
  const items: Record<string, unknown> = {};

  if (response.message) items['Сообщение'] = response.message;
  if (response.timestamp) items['Время'] = response.timestamp;

  const data = response.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const [key, value] of Object.entries(data)) {
      items[key] = value;
    }
  }

  return items;
}
