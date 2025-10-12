import { ApiResponse, PaginatedResponse } from '@/lib/types';

// Function to get the base URL from health monitor settings
export const getBaseURLFromHealthMonitor = (): string => {
  if (typeof window === 'undefined') {
    return 'http://localhost:8000'; // Default for SSR
  }

  try {
    const selectedUrlId = localStorage.getItem('healthMonitorSelectedUrl');
    const savedUrls = localStorage.getItem('healthMonitorUrls');

    if (selectedUrlId && savedUrls) {
      const urls = JSON.parse(savedUrls);
      const selectedUrl = urls.find((url: any) => url.id === selectedUrlId);
      return selectedUrl.url;
    }
  } catch (error) {
    console.warn('Failed to get base URL from health monitor:', error);
  }

  // Fallback to default
  return 'http://localhost:8000';
};

// Function to get basic auth credentials from health monitor settings
const getBasicAuthFromHealthMonitor = (): {
  username: string;
  password: string;
} | null => {
  if (typeof window === 'undefined') {
    console.log('[Auth] Window undefined (SSR)');
    return null;
  }

  try {
    const selectedUrlId = localStorage.getItem('healthMonitorSelectedUrl');
    const savedUrls = localStorage.getItem('healthMonitorUrls');

    console.log('[Auth] localStorage check:', {
      selectedUrlId,
      hasSavedUrls: !!savedUrls,
    });

    if (selectedUrlId && savedUrls) {
      const urls = JSON.parse(savedUrls);
      const selectedUrl = urls.find((url: any) => url.id === selectedUrlId);

      console.log('[Auth] Selected URL:', {
        found: !!selectedUrl,
        hasUsername: !!selectedUrl?.username,
        hasPassword: !!selectedUrl?.password,
        username: selectedUrl?.username,
      });

      if (selectedUrl?.username && selectedUrl?.password) {
        return {
          username: selectedUrl.username,
          password: selectedUrl.password,
        };
      }
    }
  } catch (error) {
    console.warn('Failed to get basic auth from health monitor:', error);
  }

  // Fallback to stored credentials
  console.log(
    '[Auth] No credentials from health monitor, checking stored credentials'
  );
  try {
    const stored = localStorage.getItem('basicAuthCredentials');
    if (stored) {
      const credentials = JSON.parse(stored);
      console.log('[Auth] Using stored credentials as fallback');
      return credentials;
    }
  } catch (error) {
    console.warn('[Auth] Failed to get stored credentials:', error);
  }

  console.log('[Auth] No credentials found');
  return null;
};

// Function to store basic auth credentials in localStorage
export const storeBasicAuthCredentials = (
  username: string,
  password: string
): void => {
  if (typeof window === 'undefined') {
    console.warn('[Auth] Cannot store credentials - window undefined (SSR)');
    return;
  }

  try {
    const credentials = { username, password };
    localStorage.setItem('basicAuthCredentials', JSON.stringify(credentials));
    console.log('[Auth] Stored basic auth credentials to localStorage');
  } catch (error) {
    console.error('[Auth] Failed to store credentials:', error);
  }
};

// Function to get basic auth credentials from localStorage (fallback)
export const getStoredBasicAuthCredentials = (): {
  username: string;
  password: string;
} | null => {
  if (typeof window === 'undefined') {
    console.log('[Auth] Window undefined (SSR)');
    return null;
  }

  try {
    const stored = localStorage.getItem('basicAuthCredentials');
    if (stored) {
      const credentials = JSON.parse(stored);
      console.log('[Auth] Retrieved stored basic auth credentials');
      return credentials;
    }
  } catch (error) {
    console.warn('[Auth] Failed to get stored credentials:', error);
  }

  console.log('[Auth] No stored credentials found');
  return null;
};

// Function to clear stored basic auth credentials
export const clearStoredBasicAuthCredentials = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('basicAuthCredentials');
    console.log('[Auth] Cleared stored basic auth credentials');
  } catch (error) {
    console.error('[Auth] Failed to clear stored credentials:', error);
  }
};

// API Configuration
export const API_CONFIG = {
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL || getBaseURLFromHealthMonitor(),
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request Configuration
export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retryAttempts?: number;
}

// Custom Error Types
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
  }
}

// Auth Token Management
class TokenManager {
  private token: string | null = null;
  private refreshToken: string | null = null;

  setTokens(token: string, refreshToken: string) {
    this.token = token;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  getRefreshToken(): string | null {
    if (!this.refreshToken && typeof window !== 'undefined') {
      this.refreshToken = localStorage.getItem('refresh_token');
    }
    return this.refreshToken;
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const tokenManager = new TokenManager();

// Retry Logic
async function withRetry<T>(
  fn: () => Promise<T>,
  attempts: number = API_CONFIG.retryAttempts,
  delay: number = API_CONFIG.retryDelay
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) throw error;

    // Don't retry on 4xx errors (except 429)
    if (
      error instanceof ApiError &&
      error.status >= 400 &&
      error.status < 500 &&
      error.status !== 429
    ) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
    return withRetry(fn, attempts - 1, delay * 1.5); // Exponential backoff
  }
}

// API Client Class
export class ApiClient {
  constructor() {}

  private getBaseURL(): string {
    return (
      process.env.NEXT_PUBLIC_API_BASE_URL || getBaseURLFromHealthMonitor()
    );
  }

  private async makeRequest<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = API_CONFIG.timeout,
      retryAttempts = API_CONFIG.retryAttempts,
    } = config;

    const url = `${this.getBaseURL()}${endpoint}`;

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add Basic Auth if credentials are available from health monitor
    const basicAuth = getBasicAuthFromHealthMonitor();
    if (basicAuth) {
      const credentials = btoa(`${basicAuth.username}:${basicAuth.password}`);
      requestHeaders.Authorization = `Basic ${credentials}`;
      console.log(`[API Client] Adding Basic Auth for ${endpoint}:`, {
        username: basicAuth.username,
        hasPassword: !!basicAuth.password,
        authHeader: `Basic ${credentials.substring(0, 10)}...`,
      });
    } else {
      console.log(
        `[API Client] No Basic Auth credentials found for ${endpoint}`
      );
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout),
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    // Make request with retry logic
    return withRetry(async () => {
      try {
        const response = await fetch(url, requestOptions);

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          console.error(
            `[API Client] Invalid content type for ${endpoint}:`,
            contentType
          );
          throw new ApiError(
            'Invalid response format',
            response.status,
            'INVALID_RESPONSE_FORMAT'
          );
        }

        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error(
            `[API Client] Failed to parse JSON for ${endpoint}:`,
            parseError
          );
          throw new ApiError(
            'Invalid JSON response',
            response.status,
            'INVALID_JSON'
          );
        }

        if (!response.ok) {
          console.error(`[API Client] HTTP error for ${endpoint}:`, {
            status: response.status,
            data,
          });
          throw new ApiError(
            data.message || `HTTP ${response.status}`,
            response.status,
            data.code,
            data.details
          );
        }

        console.log(`[API Client] Successful response for ${endpoint}:`, {
          status: response.status,
          dataType: typeof data,
          dataLength: Array.isArray(data) ? data.length : undefined,
        });

        // Wrap the response data in ApiResponse format
        return {
          data: data as T,
          status: response.status,
          message: 'Success',
          timestamp: new Date(),
        } as ApiResponse<T>;
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new NetworkError('Network connection failed');
        }

        if (error instanceof Error && error.name === 'AbortError') {
          throw new TimeoutError();
        }

        throw error;
      }
    }, retryAttempts);
  }

  // HTTP Methods
  async get<T>(
    endpoint: string,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    config?: Omit<RequestConfig, 'method'>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'POST', body });
  }

  async put<T>(
    endpoint: string,
    body?: any,
    config?: Omit<RequestConfig, 'method'>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'PUT', body });
  }

  async delete<T>(
    endpoint: string,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'DELETE' });
  }

  async patch<T>(
    endpoint: string,
    body?: any,
    config?: Omit<RequestConfig, 'method'>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'PATCH', body });
  }

  // Paginated requests
  async getPaginated<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const url = searchParams.toString()
      ? `${endpoint}?${searchParams.toString()}`
      : endpoint;

    const response = await this.get<PaginatedResponse<T>>(url);
    return response.data;
  }

  // Token refresh
  async refreshAuthToken(): Promise<void> {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new ApiError('No refresh token available', 401, 'NO_REFRESH_TOKEN');
    }

    try {
      const response = await this.post<{ token: string; refreshToken: string }>(
        '/auth/refresh',
        {
          refreshToken,
        }
      );

      tokenManager.setTokens(response.data.token, response.data.refreshToken);
    } catch (error) {
      tokenManager.clearTokens();
      throw error;
    }
  }
}

// Default API client instance
export const apiClient = new ApiClient();

// For now, disable auth interceptor since Hummingbot API uses Basic Auth
// TODO: Implement proper Basic Auth handling when credentials are available
// The Hummingbot API uses HTTP Basic Authentication, not JWT tokens
