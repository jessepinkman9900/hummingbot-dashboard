# Data Model: Hummingbot Dashboard Frontend

**Date**: October 12, 2025  
**Feature**: Hummingbot Dashboard Frontend

## Core Entities

### User
Represents the authenticated dashboard user.

**Fields**:
- `id: string` - Unique user identifier
- `email: string` - User email address
- `preferences: UserPreferences` - Dashboard configuration preferences
- `createdAt: Date` - Account creation timestamp
- `lastLoginAt: Date` - Last login timestamp

**Relationships**:
- One-to-many with ExchangeAccount
- One-to-many with BotInstance

**Validation Rules**:
- Email must be valid format
- ID must be unique across system

### UserPreferences
User-specific dashboard configuration and settings.

**Fields**:
- `theme: 'light' | 'dark'` - UI theme selection
- `currency: string` - Default display currency (USD, BTC, etc.)
- `refreshInterval: number` - Data refresh frequency in seconds
- `notificationSettings: NotificationSettings` - Alert preferences
- `dashboardLayout: DashboardLayout` - Widget positions and sizes

**Validation Rules**:
- refreshInterval must be between 1-300 seconds
- currency must be valid currency code

### Portfolio
Aggregated financial state across all user accounts and exchanges.

**Fields**:
- `userId: string` - Owner user ID
- `totalBalance: number` - Total portfolio value in base currency
- `totalPnL: number` - Total profit/loss amount
- `totalPnLPercentage: number` - Total profit/loss percentage
- `assetDistribution: AssetBalance[]` - Breakdown by asset
- `lastUpdated: Date` - Timestamp of last update

**Relationships**:
- Belongs-to User
- Calculated from ExchangeAccount balances

**State Transitions**:
- Updates in real-time as bot trades execute
- Recalculated when exchange accounts change

**Validation Rules**:
- Balance values must be non-negative
- Percentages must be valid decimal values

### BotInstance
Individual trading bot with configuration and operational state.

**Fields**:
- `id: string` - Unique bot identifier
- `name: string` - User-defined bot name
- `strategy: string` - Trading strategy type
- `status: BotStatus` - Current operational status
- `config: BotConfig` - Bot configuration parameters
- `performance: PerformanceMetrics` - Trading performance data
- `createdAt: Date` - Bot creation timestamp
- `lastActiveAt: Date` - Last activity timestamp

**Relationships**:
- Belongs-to User
- One-to-one with TradingPair
- One-to-many with TradeHistory

**State Transitions**:
- `stopped` → `starting` → `running`
- `running` → `stopping` → `stopped`
- `running` → `error` → `stopped`

**Validation Rules**:
- Name must be unique per user
- Strategy must be valid Hummingbot strategy
- Config must pass strategy-specific validation

### ExchangeAccount
Connection configuration for a specific exchange integration.

**Fields**:
- `id: string` - Account identifier
- `userId: string` - Owner user ID
- `exchange: string` - Exchange name (binance, coinbase, etc.)
- `name: string` - User-defined account name
- `credentials: EncryptedCredentials` - API credentials (encrypted)
- `status: ConnectionStatus` - Connection health status
- `balance: AssetBalance[]` - Current account balances
- `lastSyncAt: Date` - Last successful sync timestamp

**Relationships**:
- Belongs-to User
- One-to-many with BotInstance

**Validation Rules**:
- Exchange must be supported by Hummingbot
- Credentials must be valid for the exchange
- Name must be unique per user

### TradingPair
Market configuration for bot trading operations.

**Fields**:
- `symbol: string` - Trading pair symbol (BTC-USDT)
- `baseAsset: string` - Base currency (BTC)
- `quoteAsset: string` - Quote currency (USDT)
- `exchange: string` - Exchange name
- `minTradeSize: number` - Minimum order size
- `tickSize: number` - Price increment precision
- `isActive: boolean` - Whether pair is tradeable

**Validation Rules**:
- Symbol must follow exchange format conventions
- Sizes must be positive numbers
- Assets must be valid currency codes

### MarketData
Real-time and historical market information.

**Fields**:
- `symbol: string` - Trading pair symbol
- `price: number` - Current market price
- `volume24h: number` - 24-hour trading volume
- `priceChange24h: number` - 24-hour price change
- `priceChangePercent24h: number` - 24-hour price change percentage
- `orderBook: OrderBook` - Current order book data
- `recentTrades: Trade[]` - Recent trade history
- `timestamp: Date` - Data timestamp

**Validation Rules**:
- Price must be positive
- Volume must be non-negative
- Timestamp must be recent (within 1 minute)

### PerformanceMetrics
Trading statistics and performance data for bots.

**Fields**:
- `botId: string` - Associated bot ID
- `totalTrades: number` - Number of completed trades
- `totalVolume: number` - Total trading volume
- `totalPnL: number` - Total profit/loss
- `totalPnLPercentage: number` - Total profit/loss percentage
- `winRate: number` - Percentage of profitable trades
- `averageTradeSize: number` - Average order size
- `maxDrawdown: number` - Maximum loss from peak
- `sharpeRatio: number` - Risk-adjusted return ratio

**Validation Rules**:
- Counts must be non-negative integers
- Ratios must be valid decimal values
- PnL calculations must be precise to prevent trading errors

## Supporting Types

### BotStatus
```typescript
type BotStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error'
```

### ConnectionStatus
```typescript
type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'authenticating'
```

### AssetBalance
```typescript
interface AssetBalance {
  asset: string
  available: number
  locked: number
  total: number
}
```

### BotConfig
```typescript
interface BotConfig {
  strategy: string
  tradingPair: string
  exchange: string
  parameters: Record<string, any>
}
```

### OrderBook
```typescript
interface OrderBook {
  bids: [number, number][]  // [price, quantity]
  asks: [number, number][]  // [price, quantity]
  timestamp: Date
}
```

### Trade
```typescript
interface Trade {
  id: string
  price: number
  quantity: number
  side: 'buy' | 'sell'
  timestamp: Date
}
```

## Data Flow

1. **Authentication**: User credentials validated through Hummingbot API
2. **Account Setup**: ExchangeAccount credentials stored securely
3. **Bot Configuration**: BotInstance created with validated TradingPair
4. **Real-time Updates**: WebSocket feeds update MarketData and Portfolio
5. **Performance Tracking**: PerformanceMetrics calculated from trade execution
6. **State Persistence**: User preferences and configuration stored locally