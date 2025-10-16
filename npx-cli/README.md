# 🐦 Hummingbot Dashboard (Beta)

Professional TradingView-style market data visualization dashboard for Hummingbot trading bots.

## Features

- 📊 **TradingView-style Charts**: Interactive candlestick and line charts using lightweight-charts v5.0.9
- 🔄 **Real-time Data**: Live market data from multiple connectors (Binance, Hyperliquid, etc.)
- 📈 **Technical Analysis**: Comprehensive market statistics and insights
- 🎨 **Modern UI**: Beautiful, responsive design with dark mode support built on React 19 + Next.js 15
- ⚡ **Fast**: Optimized with TanStack React Query for efficient data fetching and caching
- 🔍 **Smart Startup**: Automatic API connectivity check, colorful status messages, and graceful error handling

## Quick Start

```bash
npx hummingbot-dashboard
```

The dashboard will:
- Display a startup banner with version info
- Check Hummingbot API connectivity
- Show configuration details
- Start the server on `http://localhost:3002`

## Requirements

- Node.js >= 18.0.0
- Hummingbot instance running with API enabled (default: localhost:8000)

## Configuration

### Custom Port

```bash
npx hummingbot-dashboard --port=4000
```

### Custom Hummingbot API

```bash
npx hummingbot-dashboard --api-url=http://192.168.1.100:9000
```

### More Examples

```bash
# Show help
npx hummingbot-dashboard --help

# Custom port
npx hummingbot-dashboard --port=4000

# Custom API URL
npx hummingbot-dashboard --api-url=http://localhost:9000

# Custom port and API URL
npx hummingbot-dashboard --port=4000 --api-url=http://api.example.com:8080
```

## Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--port=<number>` | Port to run dashboard | 3002 |
| `--api-url=<url>` | Hummingbot API URL | http://localhost:8000 |
| `--help`, `-h` | Show help message | - |

## Usage

1. **Start Hummingbot** with API enabled (default: http://localhost:8000)
2. **Run the dashboard**: `npx hummingbot-dashboard`
3. The dashboard will automatically check API connectivity and start
4. **Open your browser** to `http://localhost:3002`
5. **Navigate to Market page** for historical data analysis
6. **Select connector and trading pair** to view interactive charts

## Features in Detail

### Market Data Page (`/market`)
- **Dynamic Configuration**: Select from multiple connectors and trading pairs
- **Professional Charts**: TradingView-style candlestick visualization with zoom, pan, and crosshair
- **Flexible Timeframes**: Choose from 1m to 1d intervals with custom date/time ranges
- **Quick Time Ranges**: 1 hour, 6 hours, 1 day, 7 days shortcut buttons
- **Comprehensive Statistics**: Price changes, volume data, high/low analysis
- **Chart Types**: Toggle between candlestick and line chart views

### API Integration
- **Historical Candles**: `POST /market-data/historical-candles`
- **Connector Discovery**: `GET /connectors/`
- **Trading Rules**: `GET /connectors/{connector}/trading-rules`
- **Error Handling**: Robust error recovery with user feedback
- **Efficient Caching**: React Query for optimized data management

### Technical Architecture
- **Frontend**: React 19 + Next.js 15 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Lightweight Charts (TradingView style)
- **State Management**: TanStack React Query + Zustand
- **UI Components**: Radix UI for accessibility

## Troubleshooting

### Cannot connect to Hummingbot API
The dashboard automatically checks API connectivity on startup and displays helpful status messages. If you see a connection warning:

1. Make sure Hummingbot is running with API enabled
2. Verify the API is accessible:
   ```bash
   curl http://localhost:8000/connectors/
   ```
3. If using a custom API URL:
   ```bash
   npx hummingbot-dashboard --api-url=http://your-hummingbot-host:port
   ```

The dashboard will start regardless, but some features may not work without API access.

### Port already in use
Use a different port:
```bash
npx hummingbot-dashboard --port=4000
```

### No data showing in charts
1. Verify your Hummingbot instance has the selected connector configured
2. Check that the trading pair exists on the selected connector
3. Ensure the time range contains trading activity

## Documentation

For more information and development guides:
- [GitHub Repository](https://github.com/hummingbot/dashboard)
- [Hummingbot Documentation](https://docs.hummingbot.org/)
