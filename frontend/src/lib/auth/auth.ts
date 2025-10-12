import { User, AuthResponse, LoginRequest } from '@/lib/types';
import { apiClient, tokenManager } from '@/lib/api/client';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  };
  private listeners: Array<(state: AuthState) => void> = [];

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.authState));
  }

  private updateState(updates: Partial<AuthState>): void {
    this.authState = { ...this.authState, ...updates };
    this.notifyListeners();
  }

  getState(): AuthState {
    return { ...this.authState };
  }

  // Initialize auth state from stored tokens
  async initialize(): Promise<void> {
    this.updateState({ loading: true, error: null });

    try {
      if (tokenManager.isAuthenticated()) {
        // Verify token and get user info
        const response = await apiClient.get<User>('/user/profile');
        this.updateState({
          isAuthenticated: true,
          user: response.data,
          loading: false,
        });
      } else {
        this.updateState({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
      }
    } catch (error) {
      // Token might be invalid, clear it
      tokenManager.clearTokens();
      this.updateState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      });
    }
  }

  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    this.updateState({ loading: true, error: null });

    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/login',
        credentials
      );
      const authData = response.data;

      // Store tokens
      tokenManager.setTokens(authData.token, authData.refreshToken);

      this.updateState({
        isAuthenticated: true,
        user: authData.user,
        loading: false,
      });

      return authData;
    } catch (error) {
      this.updateState({
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    this.updateState({ loading: true });

    try {
      // Call logout endpoint to invalidate token on server
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if server call fails
      console.warn('Server logout failed:', error);
    } finally {
      // Clear local state regardless of server response
      tokenManager.clearTokens();
      this.updateState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    }
  }

  // Refresh authentication token
  async refreshToken(): Promise<void> {
    try {
      await apiClient.refreshAuthToken();
      // Token manager handles storing new tokens
      this.updateState({ error: null });
    } catch (error) {
      await this.logout();
      throw error;
    }
  }

  // Update user preferences
  async updateUserPreferences(
    preferences: Partial<User['preferences']>
  ): Promise<User> {
    try {
      const response = await apiClient.put<User>('/user/profile', {
        preferences,
      });
      const updatedUser = response.data;

      this.updateState({
        user: updatedUser,
      });

      return updatedUser;
    } catch (error) {
      this.updateState({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update preferences',
      });
      throw error;
    }
  }

  // Check if user has required permissions
  hasPermission(permission: string): boolean {
    // Placeholder for future role-based access control
    return this.authState.isAuthenticated;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.authState.user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  // Get auth token for manual API calls
  getToken(): string | null {
    return tokenManager.getToken();
  }
}

// Create singleton instance
export const authService = AuthService.getInstance();

// Utility hooks for React components (to be used with React context)
export interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updatePreferences: (
    preferences: Partial<User['preferences']>
  ) => Promise<User>;
  hasPermission: (permission: string) => boolean;
}

// Auth guard utility
export function requireAuth(): boolean {
  const isAuth = authService.isAuthenticated();
  if (!isAuth && typeof window !== 'undefined') {
    window.location.href = '/login';
  }
  return isAuth;
}

// Role guard utility
export function requirePermission(permission: string): boolean {
  if (!authService.hasPermission(permission)) {
    if (typeof window !== 'undefined') {
      window.location.href = '/unauthorized';
    }
    return false;
  }
  return true;
}

// Password validation utility
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Email validation utility
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Session timeout handler
class SessionManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes

  startSession(): void {
    this.resetTimeout();
  }

  resetTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      authService.logout();
    }, this.TIMEOUT_DURATION);
  }

  clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

export const sessionManager = new SessionManager();

// Activity tracker for session management
if (typeof window !== 'undefined') {
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

  events.forEach((event) => {
    document.addEventListener(
      event,
      () => {
        if (authService.isAuthenticated()) {
          sessionManager.resetTimeout();
        }
      },
      { passive: true }
    );
  });
}
