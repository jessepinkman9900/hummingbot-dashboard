// Core Entity Types
export interface User {
  id: string;
  email: string;
  preferences: UserPreferences;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  currency: string;
  refreshInterval: number;
  notificationSettings: NotificationSettings;
  dashboardLayout: DashboardLayout;
}

export interface NotificationSettings {
  enablePush: boolean;
  enableEmail: boolean;
  enableSound: boolean;
  alertThresholds: {
    priceChange: number;
    portfolioChange: number;
    botStatus: boolean;
  };
}

export interface DashboardLayout {
  widgets: WidgetConfig[];
  layout: 'grid' | 'list';
}

export interface WidgetConfig {
  id: string;
  type: 'portfolio' | 'bots' | 'market' | 'charts';
  position: { x: number; y: number; width: number; height: number };
  visible: boolean;
}

// Portfolio Types
export interface Portfolio {
  userId: string;
  totalBalance: number;
  totalPnL: number;
  totalPnLPercentage: number;
  assetDistribution: AssetBalance[];
  lastUpdated: Date;
}

export interface AssetBalance {
  symbol: string;
  balance: number;
  value: number;
  percentage: number;
  exchange: string;
  available: number;
  locked: number;
}

export interface PortfolioSnapshot {
  timestamp: Date;
  totalBalance: number;
  totalPnL: number;
  totalPnLPercentage: number;
}

// Bot Types
export interface BotInstance {
  id: string;
  name: string;
  strategy: string;
  status: BotStatus;
  config: BotConfig;
  performance: PerformanceMetrics;
  createdAt: Date;
  lastActiveAt: Date;
}

export type BotStatus =
  | 'stopped'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'error';

export interface BotConfig {
  strategyName: string;
  tradingPair: TradingPair;
  exchange: string;
  parameters: Record<string, any>;
}

export interface PerformanceMetrics {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  totalPnLPercentage: number;
  avgTradeSize: number;
  maxDrawdown: number;
}

export interface TradingPair {
  base: string;
  quote: string;
  symbol: string;
}

// Exchange Account Types
export interface ExchangeAccount {
  id: string;
  userId: string;
  exchange: string;
  name: string;
  credentials: EncryptedCredentials;
  status: ConnectionStatus;
  balances: AssetBalance[];
  createdAt: Date;
  lastSyncAt: Date;
}

export type ConnectionStatus =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'testing';

export interface EncryptedCredentials {
  apiKeyHash: string;
  secretHash: string;
  passphraseHash?: string;
}

// Market Data Types
export interface MarketData {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
  lastUpdated: Date;
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdated: Date;
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

export interface TradeHistory {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  timestamp: Date;
  exchange: string;
  botId?: string;
}

// System Types
export interface SystemStatus {
  overallStatus: 'healthy' | 'warning' | 'error';
  services: ServiceStatus[];
  lastUpdated: Date;
}

export interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  lastCheck: Date;
  errorMessage?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication Types
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
}

export interface WebSocketConnection {
  id: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  url: string;
  lastPing?: Date;
}

// Chart Data Types
export interface ChartDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface PriceChartData {
  symbol: string;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '7d' | '30d';
  data: OHLCV[];
}

export interface OHLCV {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Form Types
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

// Common Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface TimeRange {
  start: Date;
  end: Date;
}
