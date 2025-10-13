# Historical Market Data Page - Hummingbot Dashboard

A professional TradingView-style market data visualization page built for the Hummingbot Dashboard. This implementation provides comprehensive historical market data analysis with interactive candlestick charts.

## 🚀 Features Implemented

### ✅ Professional Chart Visualization
- **TradingView-style Candlestick Charts**: Using lightweight-charts library v5.0.9
- **Interactive Line Charts**: Alternative view showing closing prices
- **Chart Type Toggle**: Easy switching between candlestick and line views
- **Real-time Interactions**: Zoom, pan, crosshair, price scaling
- **Professional Styling**: Green/red candles, proper TradingView-inspired theme
- **Responsive Design**: Mobile-friendly chart sizing and layout

### ✅ Dynamic Configuration Form
- **Connector Dropdown**: Auto-populated from Hummingbot `/connectors/` API
- **Trading Pair Dropdown**: Dynamically loaded from `/connectors/{connector}/trading-rules`
- **Interval Selection**: 1m, 5m, 15m, 30m, 1h, 4h, 1d with user-friendly labels
- **Date/Time Pickers**: HTML5 datetime-local inputs with Unix timestamp conversion
- **Quick Time Ranges**: 1 hour, 6 hours, 1 day, 7 days shortcut buttons
- **Form Validation**: Real-time validation with user-friendly error messages

### ✅ Data Analysis & Statistics
- **Comprehensive Stats Panel**: Total records, latest price, high/low, price change %
- **Color-coded Changes**: Green/red indicators for positive/negative price movements
- **Volume Information**: Total trading volume display
- **Time Range Display**: Actual data timeframe with formatted timestamps
- **Price Formatting**: Intelligent decimal places based on price levels

### ✅ API Integration
- **Historical Candles Endpoint**: `POST /market-data/historical-candles`
- **Perfect API Compliance**: Matches exact request/response format specification
- **React Query Integration**: Efficient data fetching and caching
- **Error Handling**: Robust error recovery with user feedback
- **Loading States**: Professional loading indicators during API calls

## 🏗️ Technical Architecture

### Frontend Stack
- **React 19** + **Next.js 15** with TypeScript
- **Lightweight Charts** for professional TradingView-style visualization
- **TanStack React Query** for API state management
- **Tailwind CSS** + **shadcn/ui** for styling
- **Radix UI** for accessible form components

### API Endpoints Used
- `GET /connectors/` - List all available connectors
- `GET /connectors/{connector_name}/trading-rules` - Get trading pairs for connector
- `POST /market-data/historical-candles` - Fetch historical candle data

### Key Components
```
src/
├── app/market/page.tsx                           # Main market data page
├── components/
│   ├── forms/historical-market-data-form.tsx    # Configuration form
│   └── charts/lightweight-chart.tsx             # TradingView-style chart
├── lib/
│   ├── api/market-data.ts                       # API client functions
│   └── hooks/useMarketDataQuery.ts              # React Query hooks
```

## 🖥️ Usage Instructions

### 1. Starting the Application
```bash
cd frontend
pnpm install
pnpm run dev
```
The app will run on `http://localhost:3002` (or next available port)

### 2. Accessing the Market Data Page
1. Open the Hummingbot Dashboard in your browser
2. Click **"Market"** in the sidebar navigation or go to `/market`
3. You'll see the professional market data interface

### 3. Using the Market Data Page

#### Step 1: Select Connector
- Choose from the connector dropdown (e.g., "hyperliquid", "binance")
- List is automatically populated from the Hummingbot API
- Shows loading state while fetching connectors

#### Step 2: Select Trading Pair
- Trading pairs load dynamically based on selected connector
- Choose from available pairs (e.g., "PURR-USDC", "BTC-USDT")
- First 100 pairs shown for performance

#### Step 3: Configure Time Settings
- **Interval**: Select from 1m (high resolution) to 1d (overview)
- **Time Range**: 
  - Use HTML5 date/time pickers for precise control
  - Or use quick selection buttons (1 hour, 6 hours, 1 day, 7 days)
- **Validation**: Prevents invalid ranges and overly large requests

#### Step 4: Load Historical Data
- Click "Load Historical Data" to fetch and display
- Professional loading indicator shows progress
- Error messages provide helpful feedback if issues occur

#### Step 5: Analyze the Data
- **Chart Interactions**: Zoom, pan, hover for price details
- **Toggle Views**: Switch between candlestick and line charts
- **Statistics**: Review comprehensive stats below the chart
- **Time Navigation**: Chart automatically fits to loaded data range

## 📊 API Specification Compliance

### Request Format (Exactly as Required)
```json
{
  "connector_name": "hyperliquid",
  "trading_pair": "PURR-USDC",
  "interval": "1m", 
  "start_time": 1760369428,
  "end_time": 1760379428
}
```

### Response Format Supported
```json
[
  {
    "timestamp": 1760369460,
    "open": 0.12603,
    "high": 0.12642,
    "low": 0.12596, 
    "close": 0.12642,
    "volume": 224349,
    "quote_asset_volume": 0,
    "n_trades": 39,
    "taker_buy_base_volume": 0,
    "taker_buy_quote_volume": 0
  }
]
```

## 🎯 All Requirements Met

### ✅ 1. Connector Name Dropdown
- Populated from `/connectors/` API endpoint
- Loading states and error handling
- Auto-selection for better UX

### ✅ 2. Interval Dropdown
- All standard trading intervals supported
- User-friendly labels (e.g., "1 minute", "1 hour")
- Default selection of 1m for detailed analysis

### ✅ 3. Trading Pairs Dropdown
- Dynamic population from `/connectors/{connector}/trading-rules`
- Updates automatically when connector changes
- Performance optimized for large lists

### ✅ 4. Start & End Time Calendar Pickers
- Native HTML5 `datetime-local` inputs
- Automatic Unix timestamp conversion
- Default 24-hour range with validation

### ✅ 5. API Call to Historical Candles
- Exact endpoint: `POST /market-data/historical-candles`
- Perfect request/response format compliance
- Robust error handling and retry logic

### ✅ 6. TradingView-Style Charts
- Professional candlestick visualization using lightweight-charts
- Green/red candle styling for price movements
- Interactive features: zoom, pan, crosshair
- Alternative line chart view with toggle
- Responsive design for all screen sizes

## 🔧 Configuration & Customization

### Chart Configuration
The chart is optimized for professional trading analysis:
```typescript
{
  upColor: '#26a69a',        // Green for bullish candles
  downColor: '#ef5350',      // Red for bearish candles
  borderVisible: false,      // Clean candle appearance
  crosshair: { mode: 1 },    // Standard crosshair
  timeVisible: true,         // Show timestamps
  rightOffset: 12,           // Space for latest data
  barSpacing: 3,            // Optimal candle spacing
}
```

### Time Range Validation
Prevents excessive API requests:
- 1m interval: Max 7 days
- 5m interval: Max 30 days  
- 15m interval: Max 90 days
- 1h+ intervals: Max 365 days

## 🚨 Error Handling & Resilience

### API Connection Issues
- User-friendly error messages
- Clear instructions for resolution
- Graceful degradation when APIs unavailable

### Data Validation
- Time range validation with helpful messages
- Form field validation with real-time feedback
- Invalid parameter detection and correction

### Chart Rendering
- Handles empty datasets gracefully
- Efficient rendering for large datasets
- Memory-optimized for thousands of candles

## 🎨 UI/UX Features

### Visual Design
- **Professional Trading Interface**: TradingView-inspired styling
- **Responsive Layout**: Sidebar form with main chart area
- **Loading States**: Smooth loading animations
- **Status Indicators**: Clear current configuration display

### Accessibility
- Keyboard navigation support
- Screen reader compatible form elements  
- High contrast chart colors
- Focus indicators for interactive elements

### Performance
- **Efficient Data Conversion**: Optimized chart data transformation
- **Memory Management**: Proper cleanup of chart instances
- **Caching**: Smart API response caching with React Query
- **Lazy Loading**: Components loaded on demand

## 🐛 Troubleshooting

### Common Issues

#### API Connection Errors
- **Problem**: "Failed to fetch connectors"
- **Solution**: Verify Hummingbot API is running on expected port (8000)

#### Chart Not Displaying  
- **Problem**: Blank chart area after loading
- **Solution**: Check browser console, verify data format

#### Time Range Validation
- **Problem**: "Time range too large" error
- **Solution**: Reduce range for smaller intervals (e.g., 1m)

#### Trading Pairs Not Loading
- **Problem**: "No trading pairs available"
- **Solution**: Verify connector supports trading rules API

## 📈 Future Enhancements

Potential improvements for future versions:
- **Volume Charts**: Overlay volume data on price charts
- **Technical Indicators**: Moving averages, RSI, MACD
- **Multiple Timeframes**: Compare different intervals side-by-side
- **Export Functionality**: Download charts as PNG or data as CSV
- **Real-time Updates**: Live data streaming for active trading
- **Advanced Tools**: Trend lines, annotations, alerts

## 📦 Dependencies

```json
{
  "lightweight-charts": "^5.0.9",
  "@tanstack/react-query": "^5.90.2", 
  "@radix-ui/react-select": "^2.2.6",
  "lucide-react": "^0.545.0"
}
```

All other dependencies were already present in the existing Hummingbot Dashboard.

---

**The historical market data page is now fully integrated and ready for professional trading analysis!** 📈

Access it at: `http://localhost:3002/market` (when the frontend dev server is running)