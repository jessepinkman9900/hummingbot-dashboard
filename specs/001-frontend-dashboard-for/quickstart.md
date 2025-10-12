# Quickstart: Hummingbot Dashboard Frontend

**Date**: October 12, 2025  
**Feature**: Hummingbot Dashboard Frontend  
**Prerequisites**: Node.js 24.x LTS, pnpm 19, Hummingbot API running

## Development Setup

### 1. Initialize Next.js Project

```bash
# Create Next.js project with TypeScript
npx create-next-app@latest hummingbot-dashboard \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd hummingbot-dashboard
```

### 2. Install Core Dependencies

```bash
# UI and styling
pnpm add @radix-ui/react-slot class-variance-authority clsx tailwind-merge
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select
pnpm add @radix-ui/react-switch @radix-ui/react-toast @radix-ui/react-tooltip

# Charts and visualization
pnpm add recharts chart.js react-chartjs-2

# State management and API
pnpm add zustand @tanstack/react-query axios

# Authentication
pnpm add next-auth

# Development dependencies
pnpm add -D @types/node @playwright/test vitest @vitejs/plugin-react
pnpm add -D @testing-library/react @testing-library/jest-dom jsdom
```

### 3. Setup shadcn/ui

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Add essential components
npx shadcn@latest add button card input label
npx shadcn@latest add dialog dropdown-menu select
npx shadcn@latest add switch toast tooltip
npx shadcn@latest add table badge avatar
```

### 4. Project Structure Setup

```bash
# Create directory structure
mkdir -p src/{app,components,lib,hooks,types}
mkdir -p src/components/{ui,charts,forms,layout}
mkdir -p src/lib/{api,auth,utils}
mkdir -p src/app/{dashboard,bots,portfolio,settings}
mkdir -p tests/{e2e,integration,unit}
```

### 5. Environment Configuration

Create `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
HUMMINGBOT_API_URL=http://localhost:8080
NODE_ENV=development
```

### 6. TypeScript Configuration

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 7. Testing Configuration

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Create `tests/setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

Create `playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Core Implementation Files

### 8. API Client Setup

Create `src/lib/api/client.ts`:
```typescript
import axios from 'axios'

const API_BASE_URL = process.env.HUMMINGBOT_API_URL || 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth tokens
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)
```

### 9. Type Definitions

Create `src/types/index.ts`:
```typescript
export interface User {
  id: string
  email: string
  preferences: UserPreferences
  createdAt: Date
  lastLoginAt: Date
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  currency: string
  refreshInterval: number
  notificationSettings: NotificationSettings
}

export interface Portfolio {
  userId: string
  totalBalance: number
  totalPnL: number
  totalPnLPercentage: number
  assetDistribution: AssetBalance[]
  lastUpdated: Date
}

export interface BotInstance {
  id: string
  name: string
  strategy: string
  status: BotStatus
  config: BotConfig
  performance: PerformanceMetrics
  createdAt: Date
  lastActiveAt: Date
}

export type BotStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error'

// ... (additional types from data-model.md)
```

### 10. State Management Setup

Create `src/lib/stores/auth-store.ts`:
```typescript
import { create } from 'zustand'
import { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (user, token) => {
    localStorage.setItem('auth_token', token)
    set({ user, token, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('auth_token')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
```

## Development Workflow

### 11. Start Development

```bash
# Run development server
pnpm dev

# Run tests in watch mode
pnpm test:unit

# Run Playwright tests
pnpm test:e2e

# Type checking
pnpm type-check

# Linting
pnpm lint
```

### 12. Package.json Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test:unit": "vitest",
    "test:unit:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## Implementation Priority

1. **Authentication & Layout** (User Story foundation)
   - NextAuth configuration
   - Layout components with navigation
   - Authentication pages and flows

2. **Portfolio Dashboard** (User Story 1 - P1)
   - Portfolio overview page
   - Real-time data display
   - Chart components with Recharts

3. **Bot Management** (User Story 2 - P2)
   - Bot list and detail pages
   - Configuration forms
   - Start/stop controls

4. **Market Data** (User Story 3 - P2)
   - Market analysis page
   - Advanced charts
   - Real-time market data

5. **Settings & Accounts** (User Stories 4-5 - P3)
   - Exchange account management
   - System monitoring
   - User preferences

## Testing Strategy

- **Unit Tests**: Component logic, utility functions, API clients
- **Integration Tests**: API communication, state management
- **E2E Tests**: Complete user workflows per acceptance scenarios
- **Visual Testing**: Component library and responsive design

## Performance Targets

- Initial page load: <3 seconds
- UI interactions: <200ms response
- Real-time updates: <5 seconds latency
- Bundle size: <500KB gzipped

## Next Steps

1. Implement authentication flow
2. Create layout and navigation components
3. Build portfolio dashboard (User Story 1)
4. Add real-time data updates
5. Implement bot management interface
6. Add comprehensive test coverage