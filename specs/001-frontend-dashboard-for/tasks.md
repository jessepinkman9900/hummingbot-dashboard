# Tasks: Hummingbot Dashboard Frontend

**Input**: Design documents from `/specs/001-frontend-dashboard-for/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include Playwright end-to-end tests as requested in spec.md: "Implement each feature end to end and write tests using playwright to test the user flows"

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Next.js 15 project with TypeScript and pnpm at repository root /frontend
- [x] T002 [P] Install core dependencies: React 18+, Next.js 15, TypeScript, Tailwind CSS
- [x] T003 [P] Install UI dependencies: shadcn/ui, Lucide React icons
- [x] T004 [P] Install state management: Zustand, React Query (TanStack Query)
- [x] T005 [P] Install chart libraries: Recharts, Chart.js with react-chartjs-2
- [x] T006 [P] Install testing dependencies: Playwright, Vitest, React Testing Library
- [x] T007 Configure Next.js 15 with app router in `next.config.js`
- [x] T008 Setup Tailwind CSS configuration in `tailwind.config.ts`
- [x] T009 Install and configure shadcn/ui Kodama Grove theme: `pnpm dlx shadcn@latest add https://tweakcn.com/r/themes/kodama-grove.json`
- [x] T010 [P] Setup TypeScript configuration in `tsconfig.json`
- [x] T011 [P] Configure Playwright for E2E testing in `playwright.config.ts`
- [x] T012 [P] Configure Vitest for unit testing in `vitest.config.ts`
- [x] T013 [P] Setup ESLint and Prettier configuration
- [x] T014 Create project directory structure per plan.md layout

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T015 Create TypeScript type definitions in `src/lib/types/index.ts`
- [x] T016 [P] Setup API client configuration in `src/lib/api/client.ts`
- [x] T017 [P] Implement authentication utilities in `src/lib/auth/auth.ts`
- [x] T018 [P] Setup Zustand store structure in `src/lib/store/index.ts`
- [x] T019 [P] Configure React Query provider in `src/lib/providers/query-provider.tsx`
- [x] T020 Create base layout components in `src/components/layout/main-layout.tsx`
- [x] T021 [P] Setup navigation components in `src/components/layout/navigation.tsx`
- [x] T022 [P] Create error boundary component in `src/components/error-boundary.tsx`
- [x] T023 [P] Setup WebSocket connection utility in `src/lib/websocket/connection.ts`
- [ ] T024 Create global styles and theme configuration in `src/styles/globals.css`
- [ ] T025 Setup environment configuration in `src/lib/config/env.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Real-time Portfolio Visualization (Priority: P1) 🎯 MVP

**Goal**: Display real-time portfolio overview with balance, PnL, and asset distribution charts

**Independent Test**: Portfolio dashboard loads within 3 seconds and displays mock portfolio data with interactive charts

### Tests for User Story 1

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T026 [P] [US1] E2E test for portfolio dashboard loading in `tests/e2e/portfolio.spec.ts`
- [ ] T027 [P] [US1] E2E test for portfolio real-time updates in `tests/e2e/portfolio-realtime.spec.ts`
- [ ] T028 [P] [US1] Unit test for portfolio API client in `tests/unit/api/portfolio.test.ts`
- [ ] T029 [P] [US1] Unit test for portfolio store in `tests/unit/store/portfolio.test.ts`

### Implementation for User Story 1

- [ ] T030 [P] [US1] Create Portfolio types in `src/lib/types/portfolio.ts`
- [ ] T031 [P] [US1] Create AssetBalance types in `src/lib/types/asset.ts`
- [ ] T032 [US1] Implement portfolio API client in `src/lib/api/portfolio.ts`
- [ ] T033 [US1] Create portfolio Zustand store in `src/lib/store/portfolio-store.ts`
- [ ] T034 [P] [US1] Create portfolio overview component in `src/components/portfolio/portfolio-overview.tsx`
- [ ] T035 [P] [US1] Create asset distribution chart component in `src/components/charts/asset-distribution-chart.tsx`
- [ ] T036 [P] [US1] Create PnL chart component in `src/components/charts/pnl-chart.tsx`
- [ ] T037 [P] [US1] Create portfolio metrics component in `src/components/portfolio/portfolio-metrics.tsx`
- [ ] T038 [US1] Create portfolio dashboard page in `src/app/dashboard/page.tsx`
- [ ] T039 [US1] Integrate real-time WebSocket updates for portfolio data
- [ ] T040 [US1] Add loading states and error handling for portfolio components
- [ ] T041 [US1] Implement empty state for no active connections

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Bot Configuration Management (Priority: P2)

**Goal**: Create, configure, and manage trading bots through intuitive interface with validation

**Independent Test**: Bot configuration wizard guides user through setup and validates parameters

### Tests for User Story 2

- [ ] T042 [P] [US2] E2E test for bot creation wizard in `tests/e2e/bot-configuration.spec.ts`
- [ ] T043 [P] [US2] E2E test for bot management operations in `tests/e2e/bot-management.spec.ts`
- [ ] T044 [P] [US2] Unit test for bot configuration validation in `tests/unit/validation/bot-config.test.ts`
- [ ] T045 [P] [US2] Unit test for bot API client in `tests/unit/api/bots.test.ts`

### Implementation for User Story 2

- [ ] T046 [P] [US2] Create BotInstance and BotConfig types in `src/lib/types/bot.ts`
- [ ] T047 [P] [US2] Create TradingPair types in `src/lib/types/trading-pair.ts`
- [ ] T048 [US2] Implement bots API client in `src/lib/api/bots.ts`
- [ ] T049 [US2] Create bots Zustand store in `src/lib/store/bots-store.ts`
- [ ] T050 [P] [US2] Create bot configuration form components in `src/components/forms/bot-config-form.tsx`
- [ ] T051 [P] [US2] Create bot configuration wizard in `src/components/bots/bot-wizard.tsx`
- [ ] T052 [P] [US2] Create bot management list component in `src/components/bots/bot-list.tsx`
- [ ] T053 [P] [US2] Create bot status indicator component in `src/components/bots/bot-status.tsx`
- [ ] T054 [P] [US2] Create bot performance metrics component in `src/components/bots/bot-metrics.tsx`
- [ ] T055 [US2] Create bot management page in `src/app/bots/page.tsx`
- [ ] T056 [US2] Create individual bot detail page in `src/app/bots/[botId]/page.tsx`
- [ ] T057 [US2] Implement bot start/stop controls with status management
- [ ] T058 [US2] Add form validation with clear error messaging
- [ ] T059 [US2] Integrate bot status updates via WebSocket

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Market Data Analysis (Priority: P2)

**Goal**: Interactive charts showing price movements, order book depth, and trading history

**Independent Test**: Market analysis page displays charts that update with real-time data

### Tests for User Story 3

- [x] T060 [P] [US3] E2E test for market data visualization in `tests/e2e/market-analysis.spec.ts` - **COMPLETED** (Basic form and page tests)
- [ ] T061 [P] [US3] E2E test for chart interactions in `tests/e2e/chart-interactions.spec.ts`
- [ ] T062 [P] [US3] Unit test for market data API client in `tests/unit/api/market-data.test.ts`
- [ ] T063 [P] [US3] Unit test for chart components in `tests/unit/components/charts.test.ts`

### Implementation for User Story 3

- [x] T064 [P] [US3] Create MarketData types in `src/lib/types/market-data.ts` - **COMPLETED** (Created CandleData types in API client)
- [ ] T065 [P] [US3] Create OrderBook types in `src/lib/types/order-book.ts`
- [x] T066 [US3] Implement market data API client in `src/lib/api/market-data.ts` - **COMPLETED** (Includes getCandles API integration)
- [ ] T067 [US3] Create market data Zustand store in `src/lib/store/market-store.ts`
- [x] T068 [P] [US3] Create price chart component using lightweight-charts in `src/components/charts/lightweight-chart.tsx` - **COMPLETED** (Modified to use lightweight-charts instead of Recharts per user request)
- [ ] T069 [P] [US3] Create order book visualization using Chart.js in `src/components/charts/order-book-chart.tsx`
- [ ] T070 [P] [US3] Create volume chart component in `src/components/charts/volume-chart.tsx`
- [ ] T071 [P] [US3] Create trading history component in `src/components/market/trade-history.tsx`
- [x] T072 [P] [US3] Create market selector component in `src/components/forms/market-data-form.tsx` - **COMPLETED** (Combined market selector with configuration form)
- [x] T073 [US3] Create market analysis page in `src/app/market/page.tsx` - **COMPLETED** (Full featured market data page with form and chart)
- [ ] T074 [US3] Integrate real-time market data updates via WebSocket
- [ ] T075 [US3] Add chart zoom and pan interactions
- [x] T076 [US3] Implement chart time frame selection (1h, 4h, 1d, 7d, 30d) - **COMPLETED** (Available in form dropdown)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Account and Exchange Management (Priority: P3)

**Goal**: Manage multiple exchange connections and API credentials securely

**Independent Test**: Users can add, test, and manage exchange account connections

### Tests for User Story 4

- [x] T077 [P] [US4] E2E test for exchange account setup in `tests/e2e/account-management.spec.ts` - **COMPLETED** (Created comprehensive portfolio-management.spec.ts)
- [x] T078 [P] [US4] E2E test for credential validation in `tests/e2e/credential-validation.spec.ts` - **COMPLETED** (Integrated into portfolio-management.spec.ts)
- [ ] T079 [P] [US4] Unit test for accounts API client in `tests/unit/api/accounts.test.ts`
- [ ] T080 [P] [US4] Unit test for credential encryption in `tests/unit/security/encryption.test.ts`

### Implementation for User Story 4

- [x] T081 [P] [US4] Create ExchangeAccount types in `src/lib/types/exchange-account.ts` - **COMPLETED** (Added portfolio response types to main types file)
- [x] T082 [P] [US4] Create connection status types in `src/lib/types/connection.ts` - **COMPLETED** (Already in main types file)
- [x] T083 [US4] Implement accounts API client in `src/lib/api/accounts.ts` - **COMPLETED** (Full API client with accounts, portfolio, and connectors endpoints)
- [x] T084 [US4] Create accounts Zustand store in `src/lib/store/accounts-store.ts` - **COMPLETED** (Complete store with all account management functionality)
- [x] T085 [P] [US4] Create account setup form in `src/components/forms/account-setup-form.tsx` - **COMPLETED** (AddAccountDialog component created)
- [x] T086 [P] [US4] Create account list component in `src/components/accounts/account-list.tsx` - **COMPLETED** (PortfolioOverview component with account list)
- [x] T087 [P] [US4] Create connection status component in `src/components/accounts/connection-status.tsx` - **COMPLETED** (Integrated into PortfolioOverview and AccountSettings)
- [x] T088 [P] [US4] Create credential validation component in `src/components/accounts/credential-validator.tsx` - **COMPLETED** (Integrated into AccountSettings component)
- [x] T089 [US4] Create account management page in `src/app/accounts/page.tsx` - **COMPLETED** (Full portfolio page at /app/portfolio/page.tsx with all functionality)
- [x] T090 [US4] Implement secure credential storage (server-side only) - **COMPLETED** (Uses existing API endpoints)
- [x] T091 [US4] Add connection testing functionality - **COMPLETED** (Integrated into credential management)
- [x] T092 [US4] Implement account deletion with confirmation - **COMPLETED** (With confirmation dialog)

**Checkpoint**: At this point, User Stories 1-4 should all work independently

---

## Phase 7: User Story 5 - System Monitoring and Alerts (Priority: P3)

**Goal**: Monitor system health and receive notifications about important events

**Independent Test**: System status page displays health indicators and notification management works

### Tests for User Story 5

- [ ] T093 [P] [US5] E2E test for system status monitoring in `tests/e2e/system-status.spec.ts`
- [ ] T094 [P] [US5] E2E test for notification management in `tests/e2e/notifications.spec.ts`
- [ ] T095 [P] [US5] Unit test for system status API in `tests/unit/api/system-status.test.ts`
- [ ] T096 [P] [US5] Unit test for notification system in `tests/unit/notifications/notifications.test.ts`

### Implementation for User Story 5

- [ ] T097 [P] [US5] Create SystemStatus types in `src/lib/types/system-status.ts`
- [ ] T098 [P] [US5] Create Notification types in `src/lib/types/notification.ts`
- [ ] T099 [US5] Implement system status API client in `src/lib/api/system-status.ts`
- [ ] T100 [US5] Create notifications Zustand store in `src/lib/store/notifications-store.ts`
- [ ] T101 [P] [US5] Create system health dashboard in `src/components/system/health-dashboard.tsx`
- [ ] T102 [P] [US5] Create notification center component in `src/components/notifications/notification-center.tsx`
- [ ] T103 [P] [US5] Create alert configuration component in `src/components/notifications/alert-config.tsx`
- [ ] T104 [P] [US5] Create system status indicators in `src/components/system/status-indicators.tsx`
- [ ] T105 [US5] Create system monitoring page in `src/app/system/page.tsx`
- [ ] T106 [US5] Implement real-time system status updates via WebSocket
- [ ] T107 [US5] Add notification toast system
- [ ] T108 [US5] Implement alert preference management

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T109 [P] Create comprehensive navigation menu in `src/components/layout/sidebar.tsx`
- [ ] T110 [P] Implement responsive design optimizations for mobile/tablet
- [ ] T111 [P] Add dark/light theme toggle functionality
- [ ] T112 [P] Create user preferences management in `src/app/settings/page.tsx`
- [ ] T113 [P] Add comprehensive error handling and user feedback
- [ ] T114 [P] Implement loading skeletons for all data components
- [ ] T115 [P] Add data export functionality for trading reports
- [ ] T116 [P] Optimize chart performance for real-time updates
- [ ] T117 [P] Add search and filtering capabilities
- [ ] T118 [P] Create onboarding flow for new users
- [ ] T119 [P] Add comprehensive documentation in `README.md`
- [ ] T120 Security hardening and credential validation
- [ ] T121 Performance optimization across all components
- [ ] T122 Run quickstart.md validation scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 for portfolio updates
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent of other stories
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Required by US1 and US2 for account data
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Monitors components from all other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Types before API clients
- API clients before stores
- Stores before components
- Components before pages
- Core implementation before WebSocket integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Types and API clients within a story marked [P] can run in parallel
- Components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "E2E test for portfolio dashboard loading in tests/e2e/portfolio.spec.ts"
Task: "E2E test for portfolio real-time updates in tests/e2e/portfolio-realtime.spec.ts"
Task: "Unit test for portfolio API client in tests/unit/api/portfolio.test.ts"
Task: "Unit test for portfolio store in tests/unit/store/portfolio.test.ts"

# Launch all types for User Story 1 together:
Task: "Create Portfolio types in src/lib/types/portfolio.ts"
Task: "Create AssetBalance types in src/lib/types/asset.ts"

# Launch all components for User Story 1 together:
Task: "Create portfolio overview component in src/components/portfolio/portfolio-overview.tsx"
Task: "Create asset distribution chart component in src/components/charts/asset-distribution-chart.tsx"
Task: "Create PnL chart component in src/components/charts/pnl-chart.tsx"
Task: "Create portfolio metrics component in src/components/portfolio/portfolio-metrics.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Portfolio Visualization)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo portfolio dashboard

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Bot Management)
4. Add User Story 3 → Test independently → Deploy/Demo (Market Analysis)
5. Add User Story 4 → Test independently → Deploy/Demo (Account Management)
6. Add User Story 5 → Test independently → Deploy/Demo (System Monitoring)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Portfolio)
   - Developer B: User Story 2 (Bots)
   - Developer C: User Story 3 (Market Data)
   - Developer D: User Story 4 (Accounts)
   - Developer E: User Story 5 (Monitoring)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Special requirement: Use shadcn Kodama Grove theme as requested
- Playwright tests are mandatory per spec.md requirements
- Focus on financial data precision and real-time updates
- Ensure responsive design for desktop/tablet/mobile