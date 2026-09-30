import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { supabaseBrowser } from './supabase-browser';

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  details?: unknown;
  path?: string;
  timestamp?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorData: ApiErrorResponse,
  ) {
    const msg = Array.isArray(errorData?.message)
      ? errorData.message.join('; ')
      : errorData?.message || 'API request failed';
    super(msg);
    this.name = 'ApiError';
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: Attach Supabase Bearer token via SDK session
apiClient.interceptors.request.use(async (config) => {
  try {
    const { data } = await supabaseBrowser.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Proceed without authorization header if session resolution fails
  }
  return config;
});

// Response interceptor: Unwrap payload and map errors with StatusCodes
apiClient.interceptors.response.use(
  (response) => {
    if (response.status === StatusCodes.NO_CONTENT) {
      return {};
    }
    return response.data;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const { status, data } = error.response;
      const message = typeof data?.message === 'string' ? data.message : '';

      // Global safety net: If account has no laboratory registered in database, clear cookie & redirect to onboarding
      if (
        status === StatusCodes.FORBIDDEN &&
        message.includes('No laboratory associated with this account')
      ) {
        if (typeof document !== 'undefined') {
          document.cookie = 'x-lab-id=; path=/; max-age=0';
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/onboarding')) {
            window.location.href = '/onboarding';
          }
        }
      }

      return Promise.reject(new ApiError(status, data));
    }
    const fallbackStatus = error.status || StatusCodes.INTERNAL_SERVER_ERROR;
    return Promise.reject(
      new ApiError(fallbackStatus, {
        statusCode: fallbackStatus,
        message: error.message || 'Network or connection failure',
      }),
    );
  },
);

// Ergonomic, type-safe API helper methods returning unwrapped Promise<T>
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.get(url, config).then((res) => res as unknown as T),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.post(url, data, config).then((res) => res as unknown as T),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.put(url, data, config).then((res) => res as unknown as T),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.patch(url, data, config).then((res) => res as unknown as T),
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.delete(url, config).then((res) => res as unknown as T),
};
