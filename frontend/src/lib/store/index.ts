import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  Portfolio,
  BotInstance,
  MarketData,
  SystemStatus,
  User,
} from '@/lib/types';

// Portfolio Store
interface PortfolioState {
  portfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface PortfolioActions {
  setPortfolio: (portfolio: Portfolio) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearPortfolio: () => void;
}

export const usePortfolioStore = create<PortfolioState & PortfolioActions>()(
  subscribeWithSelector((set) => ({
    // State
    portfolio: null,
    loading: false,
    error: null,
    lastUpdated: null,

    // Actions
    setPortfolio: (portfolio) =>
      set({ portfolio, lastUpdated: new Date(), error: null }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error, loading: false }),
    clearPortfolio: () =>
      set({ portfolio: null, error: null, lastUpdated: null }),
  }))
);

// Bots Store
interface BotsState {
  bots: BotInstance[];
  loading: boolean;
  error: string | null;
}

interface BotsActions {
  setBots: (bots: BotInstance[]) => void;
  addBot: (bot: BotInstance) => void;
  updateBot: (botId: string, updates: Partial<BotInstance>) => void;
  removeBot: (botId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBotsStore = create<BotsState & BotsActions>()(
  subscribeWithSelector((set, get) => ({
    // State
    bots: [],
    loading: false,
    error: null,

    // Actions
    setBots: (bots) => set({ bots, error: null }),
    addBot: (bot) => set((state) => ({ bots: [...state.bots, bot] })),
    updateBot: (botId, updates) =>
      set((state) => ({
        bots: state.bots.map((bot) =>
          bot.id === botId ? { ...bot, ...updates } : bot
        ),
      })),
    removeBot: (botId) =>
      set((state) => ({
        bots: state.bots.filter((bot) => bot.id !== botId),
      })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error, loading: false }),
  }))
);

// Market Data Store
interface MarketState {
  marketData: Record<string, MarketData>;
  loading: boolean;
  error: string | null;
  selectedSymbol: string;
}

interface MarketActions {
  setMarketData: (symbol: string, data: MarketData) => void;
  setSelectedSymbol: (symbol: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMarketData: () => void;
}

export const useMarketStore = create<MarketState & MarketActions>()(
  subscribeWithSelector((set) => ({
    // State
    marketData: {},
    loading: false,
    error: null,
    selectedSymbol: 'BTCUSDT',

    // Actions
    setMarketData: (symbol, data) =>
      set((state) => ({
        marketData: { ...state.marketData, [symbol]: data },
        error: null,
      })),
    setSelectedSymbol: (selectedSymbol) => set({ selectedSymbol }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error, loading: false }),
    clearMarketData: () => set({ marketData: {} }),
  }))
);

// User Preferences Store
interface UserState {
  user: User | null;
  theme: 'light' | 'dark';
  currency: string;
  refreshInterval: number;
}

interface UserActions {
  setUser: (user: User) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrency: (currency: string) => void;
  setRefreshInterval: (interval: number) => void;
  updatePreferences: (preferences: Partial<UserState>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState & UserActions>()(
  subscribeWithSelector((set) => ({
    // State
    user: null,
    theme: 'dark',
    currency: 'USD',
    refreshInterval: 5,

    // Actions
    setUser: (user) => set({ user }),
    setTheme: (theme) => set({ theme }),
    setCurrency: (currency) => set({ currency }),
    setRefreshInterval: (refreshInterval) => set({ refreshInterval }),
    updatePreferences: (preferences) =>
      set((state) => ({ ...state, ...preferences })),
    clearUser: () => set({ user: null }),
  }))
);

// System Status Store
interface SystemState {
  status: SystemStatus | null;
  loading: boolean;
  error: string | null;
}

interface SystemActions {
  setStatus: (status: SystemStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSystemStore = create<SystemState & SystemActions>()(
  subscribeWithSelector((set) => ({
    // State
    status: null,
    loading: false,
    error: null,

    // Actions
    setStatus: (status) => set({ status, error: null }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error, loading: false }),
  }))
);

// Global App State Store
interface AppState {
  isInitialized: boolean;
  sidebarOpen: boolean;
  lastUpdated: Date;
  notifications: Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: Date;
  }>;
}

interface AppActions {
  setInitialized: (initialized: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  updateTimestamp: () => void;
  addNotification: (
    notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState & AppActions>()(
  subscribeWithSelector((set) => ({
    // State
    isInitialized: false,
    sidebarOpen: true,
    lastUpdated: new Date(),
    notifications: [],

    // Actions
    setInitialized: (isInitialized) => set({ isInitialized }),
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    updateTimestamp: () => set({ lastUpdated: new Date() }),
    addNotification: (notification) =>
      set((state) => ({
        notifications: [
          ...state.notifications,
          {
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
          },
        ],
      })),
    removeNotification: (id) =>
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),
    clearNotifications: () => set({ notifications: [] }),
  }))
);

// Store Selectors (computed values)
export const getPortfolioSummary = (state: PortfolioState) => {
  if (!state.portfolio) return null;

  return {
    totalValue: state.portfolio.totalBalance,
    totalPnL: state.portfolio.totalPnL,
    totalPnLPercent: state.portfolio.totalPnLPercentage,
    assetCount: state.portfolio.assetDistribution.length,
    lastUpdated: state.lastUpdated,
  };
};

export const getActiveBots = (state: BotsState) => {
  return state.bots.filter((bot) => bot.status === 'running');
};

export const getBotsByStatus = (
  state: BotsState,
  status: BotInstance['status']
) => {
  return state.bots.filter((bot) => bot.status === status);
};

// Store persistence helpers
if (typeof window !== 'undefined') {
  // Persist theme preference
  useUserStore.subscribe(
    (state) => state.theme,
    (theme) => {
      localStorage.setItem('theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  );

  // Persist sidebar state
  useAppStore.subscribe(
    (state) => state.sidebarOpen,
    (sidebarOpen) => {
      localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
    }
  );

  // Initialize from localStorage
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  if (savedTheme) {
    useUserStore.getState().setTheme(savedTheme);
  }

  const savedSidebarState = localStorage.getItem('sidebarOpen');
  if (savedSidebarState) {
    useAppStore.getState().setSidebarOpen(JSON.parse(savedSidebarState));
  }
}
