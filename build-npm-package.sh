#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Building Hummingbot Dashboard for NPM distribution   ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}\n"

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf dist-npm
mkdir -p dist-npm

# Build the frontend with production optimizations
echo -e "\n${YELLOW}📦 Building frontend with production optimizations...${NC}"
cd frontend
pnpm install --frozen-lockfile
NODE_ENV=production pnpm run build
cd ..

echo -e "${GREEN}✅ Frontend build complete${NC}"

# Copy built frontend to dist
echo -e "\n${YELLOW}📋 Copying frontend build...${NC}"
cp -r frontend/.next dist-npm/.next
cp -r frontend/public dist-npm/public
cp frontend/next.config.ts dist-npm/next.config.ts

# Copy source files that Next.js needs
mkdir -p dist-npm/src
cp -r frontend/src dist-npm/

echo -e "${GREEN}✅ Files copied${NC}"

# Create the CLI structure
echo -e "\n${YELLOW}🔧 Creating CLI wrapper...${NC}"
mkdir -p dist-npm/bin
mkdir -p dist-npm/scripts

# Copy the CLI files from npx-cli template
cp npx-cli/bin/cli.js dist-npm/bin/cli.js
cp npx-cli/scripts/postinstall.js dist-npm/scripts/postinstall.js
chmod +x dist-npm/bin/cli.js
chmod +x dist-npm/scripts/postinstall.js

echo -e "${GREEN}✅ CLI wrapper created${NC}"

# Create package.json for npm with proper version
echo -e "\n${YELLOW}📝 Creating package.json...${NC}"
VERSION="${NPM_VERSION:-0.1.0}"

cat > dist-npm/package.json << EOF
{
  "name": "hummingbot-dashboard",
  "version": "${VERSION}",
  "description": "Professional TradingView-style market data visualization dashboard for Hummingbot trading bots",
  "main": "bin/cli.js",
  "bin": {
    "hummingbot-dashboard": "./bin/cli.js",
    "hb-dashboard": "./bin/cli.js"
  },
  "scripts": {
    "start": "node bin/cli.js",
    "postinstall": "node scripts/postinstall.js"
  },
  "keywords": [
    "hummingbot",
    "trading",
    "dashboard",
    "crypto",
    "cryptocurrency",
    "market-data",
    "candlestick-charts",
    "tradingview",
    "technical-analysis",
    "algo-trading"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/hummingbot/dashboard"
  },
  "bugs": {
    "url": "https://github.com/hummingbot/dashboard/issues"
  },
  "homepage": "https://github.com/hummingbot/dashboard#readme",
  "author": "Hummingbot Foundation",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "next": "15.5.4",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@tanstack/react-query": "^5.90.2",
    "lightweight-charts": "^5.0.9",
    "lucide-react": "^0.545.0",
    "next-themes": "^0.4.6",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1",
    "recharts": "^2.15.4",
    "zustand": "^5.0.8"
  },
  "files": [
    "bin/",
    ".next/",
    "public/",
    "src/",
    "scripts/",
    "next.config.ts",
    "README.md"
  ]
}
EOF

echo -e "${GREEN}✅ package.json created${NC}"

# Create a README for npm package
echo -e "\n${YELLOW}📖 Creating README...${NC}"
cat > dist-npm/README.md << 'EOF'
# 🐦 Hummingbot Dashboard

Professional TradingView-style market data visualization dashboard for Hummingbot trading bots.

## Features

- 📊 **TradingView-style Charts**: Interactive candlestick and line charts
- 🔄 **Real-time Data**: Live market data from multiple connectors
- 📈 **Technical Analysis**: Comprehensive market statistics and insights
- 🎨 **Modern UI**: Beautiful, responsive design with dark mode support
- ⚡ **Fast**: Built with Next.js 15 and React 19

## Quick Start

```bash
npx hummingbot-dashboard
```

That's it! The dashboard will start on `http://localhost:3002`

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
HUMMINGBOT_API_HOST=192.168.1.100 HUMMINGBOT_API_PORT=9000 npx hummingbot-dashboard
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Dashboard port | 3002 |
| `HUMMINGBOT_API_HOST` | Hummingbot API host | localhost |
| `HUMMINGBOT_API_PORT` | Hummingbot API port | 8000 |

## Usage

1. **Start Hummingbot** with API enabled
2. **Run the dashboard**: `npx hummingbot-dashboard`
3. **Open your browser** to `http://localhost:3002`
4. **Select a connector** and trading pair
5. **Analyze market data** with interactive charts

## Features in Detail

### Market Data Page
- Select from multiple connectors (Binance, Hyperliquid, etc.)
- Choose trading pairs dynamically
- View historical candlestick data
- Interactive chart controls (zoom, pan, crosshair)
- Real-time statistics and price changes

### Professional Charts
- TradingView-style candlestick visualization
- Alternative line chart view
- Volume data display
- Price scaling and time navigation
- Mobile-responsive design

## Troubleshooting

### Cannot connect to Hummingbot API
Make sure Hummingbot is running and the API is accessible:
```bash
curl http://localhost:8000/connectors/
```

### Port already in use
Use a different port:
```bash
npx hummingbot-dashboard --port=4000
```

## Documentation

For more information, visit: https://github.com/hummingbot/dashboard

## License

MIT
EOF

echo -e "${GREEN}✅ README created${NC}"

# Install production dependencies
echo -e "\n${YELLOW}📦 Installing production dependencies...${NC}"
cd dist-npm
npm install --production --silent
cd ..

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Show package size
PACKAGE_SIZE=$(du -sh dist-npm | cut -f1)

echo -e "\n${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              ✅ Build Complete!                         ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}📦 Package size: ${PACKAGE_SIZE}${NC}"
echo -e "${GREEN}📁 Location: ./dist-npm/${NC}\n"

echo -e "${YELLOW}Next steps:${NC}\n"

echo -e "  ${CYAN}Test locally:${NC}"
echo -e "    cd dist-npm"
echo -e "    npm pack"
echo -e "    npx ./hummingbot-dashboard-${VERSION}.tgz\n"

echo -e "  ${CYAN}Publish to npm:${NC}"
echo -e "    cd dist-npm"
echo -e "    npm publish\n"

echo -e "  ${CYAN}Publish as beta:${NC}"
echo -e "    cd dist-npm"
echo -e "    npm publish --tag beta\n"

echo -e "${GREEN}🎉 Your Hummingbot Dashboard is ready for distribution!${NC}\n"