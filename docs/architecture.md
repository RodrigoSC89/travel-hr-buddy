# Nautilus One - System Architecture
**Version:** 177.0  
**Last Updated:** 2025-10-25  
**Status:** Production Ready

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Nautilus One Platform                    │
│                   Maritime Operations System                 │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
        ┌───────▼────────┐         ┌───────▼────────┐
        │  Frontend SPA  │         │  Backend APIs  │
        │   React + TS   │         │ (Future/TBD)   │
        └───────┬────────┘         └───────┬────────┘
                │                           │
    ┌───────────┼───────────┬───────────────┤
    │           │           │               │
┌───▼───┐  ┌───▼───┐  ┌───▼────┐    ┌────▼─────┐
│ Core  │  │ Ops   │  │ Intel  │    │ Database │
│Modules│  │Modules│  │Modules │    │(Supabase)│
└───────┘  └───────┘  └────────┘    └──────────┘
```

---

## 📦 Module Architecture

### Core System Layers

```
┌──────────────────────────────────────────────────────┐
│                    Presentation Layer                 │
│  - React Components (pages/, components/)             │
│  - Dynamic Navigation (DynamicNavigation.tsx)         │
│  - Lazy Loading (React.lazy)                          │
└──────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────┐
│                     Module Layer                      │
│  - Mission Control (PATCH 177.0)                      │
│  - DP Intelligence, Control Hub, BridgeLink           │
│  - Maintenance, Maritime, Compliance                  │
│  - Module Registry (registry.ts)                      │
└──────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────┐
│                    Service Layer                      │
│  - AI Services (mock, future: OpenAI)                 │
│  - Data Services (future: Supabase clients)           │
│  - API Clients (future: REST/GraphQL)                 │
└──────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────┐
│                      Data Layer                       │
│  - Supabase (PostgreSQL) - future                     │
│  - Local Storage (PWA cache)                          │
│  - Mock Data (development)                            │
└──────────────────────────────────────────────────────┘
```

---

## 🗂️ Directory Structure

```
src/
├── pages/                      # Page-level components
│   ├── Dashboard.tsx           # Main dashboard
│   ├── Maritime.tsx            # Maritime operations
│   ├── Maintenance.tsx         # Maintenance planning
│   └── ...
│
├── modules/                    # Feature modules
│   ├── mission-control/        # PATCH 177.0
│   │   ├── index.tsx          # Main component
│   │   └── components/
│   │       ├── AICommander.tsx         # AI interface
│   │       ├── KPIDashboard.tsx        # KPI metrics
│   │       └── SystemLogs.tsx          # Activity logs
│   │
│   ├── intelligence/           # Intelligence modules
│   │   └── dp-intelligence/   # DP Intelligence Center
│   │
│   ├── control/               # Control modules
│   │   ├── control-hub/       # Control Hub
│   │   ├── bridgelink/        # BridgeLink
│   │   └── forecast-global/   # Global Forecast
│   │
│   ├── emergency/             # Emergency response
│   ├── satellite/             # Satellite tracking
│   ├── weather-dashboard/     # Weather monitoring
│   ├── operations/            # Operations modules
│   ├── compliance/            # Compliance & audits
│   ├── logs-center/           # Centralized logging
│   ├── system-watchdog/       # System monitoring
│   │
│   └── registry.ts            # Module registry (PATCH 176.0)
│
├── components/
│   ├── layout/
│   │   ├── DynamicNavigation.tsx  # PATCH 178.0
│   │   └── SmartSidebar.tsx       # Legacy (deprecated)
│   │
│   └── ui/                    # Shadcn/UI components
│       ├── card.tsx
│       ├── button.tsx
│       └── ...
│
├── lib/                       # Utilities
│   └── utils.ts               # Utility functions
│
├── hooks/                     # Custom React hooks
├── contexts/                  # React contexts
├── services/                  # API services (future)
├── types/                     # TypeScript types
├── AppRouter.tsx              # Main routing (PATCH 176.0)
└── main.tsx                   # App entry point
```

---

## 🧩 Module Registry System

### Purpose
Centralized module management and metadata storage.

### Key Features
- **Status Tracking:** active, deprecated, beta, experimental, incomplete
- **Completeness:** 100%, partial, broken, deprecated
- **Dynamic Loading:** Lazy imports via registry
- **Route Management:** Automatic route generation
- **Category Grouping:** Modules organized by function

### Usage
```typescript
import { getActiveModules, getRoutableModules } from '@/modules/registry';

// Get all active modules
const activeModules = getActiveModules();

// Get modules with routes
const routableModules = getRoutableModules();

// Get modules by category
const opsModules = getModulesByCategory('operations');
```

---

## 🎯 Mission Control Architecture (PATCH 177.0)

### Components

```
MissionControl/
  ├── index.tsx              # Main orchestrator
  ├── components/
  │   ├── AICommander        # Natural language interface
  │   ├── KPIDashboard       # Real-time KPIs
  │   └── SystemLogs         # Activity monitoring
  └── [Future]
      ├── FleetPanel         # Fleet management
      ├── EmergencyPanel     # Emergency response
      ├── SatellitePanel     # Satellite comms
      └── WeatherPanel       # Weather monitoring
```

### Data Flow

```
User Input (AI Commander)
         │
         ▼
  Query Processing (Mock AI)
         │
         ▼
  Response Generation
         │
         ▼
  Display to User

[Future: Real AI]
User Input → OpenAI API → Context Analysis → Action Dispatch → UI Update
```

---

## 🔧 Dynamic Navigation System (PATCH 178.0)

### Architecture

```
DynamicNavigation Component
         │
         ├─> Module Registry Reader
         │        │
         │        ├─> Filter by Status
         │        ├─> Group by Category
         │        └─> Map to UI Elements
         │
         └─> UI Renderer
                  │
                  ├─> Collapsible Sections
                  ├─> Status Indicators
                  ├─> Filter Controls
                  └─> Active Route Highlighting
```

### Status Icons
- ✅ **Green (CheckCircle):** 100% complete, fully functional
- 🟡 **Yellow (AlertCircle):** Partial implementation
- ❌ **Red (XCircle):** Incomplete or broken

---

## 🚀 Routing Architecture

### Implementation
- **Router:** React Router v6
- **Strategy:** Lazy loading with React.lazy()
- **Structure:** Flat routes with path-based navigation

### Route Examples
```typescript
<Route path="/" element={<Dashboard />} />
<Route path="/mission-control" element={<MissionControl />} />
<Route path="/dp-intelligence" element={<DPIntelligenceCenter />} />
```

### Ghost Routes Removed (PATCH 176.0)
- `/fleet-management` ❌
- `/route-optimizer` ❌
- `/weather-station` ❌
- `/maintenance-engine` ❌
- `/access-control` ❌
- `/communication-gateway` ❌
- `/offline-cache` ❌

---

## 🔌 Integration Points

### Current
- **PWA:** Service worker for offline capability
- **Local Storage:** Client-side state persistence
- **Mock APIs:** Development/testing

### Future/Pending
- **Supabase:** PostgreSQL database, auth, storage
- **OpenAI:** GPT-4 for AI Commander
- **Edge Functions:** Serverless compute
- **Real-time:** WebSocket for live updates
- **MQTT:** IoT device integration (maritime sensors)

---

## 🛡️ Security Architecture

### Frontend
- Environment variables for sensitive config
- No hardcoded credentials
- CSP headers (to be configured)
- XSS protection via React

### Backend (Future)
- Row-Level Security (RLS) in Supabase
- JWT authentication
- API rate limiting
- Role-based access control (RBAC)

---

## 📊 State Management

### Current
- React useState for local state
- React Context for shared state (limited use)
- URL state for routing

### Future Considerations
- Zustand or Redux for complex global state
- React Query for server state
- Supabase real-time subscriptions

---

## 🧪 Testing Strategy

### Current
- Build validation (`npm run build`)
- TypeScript type checking
- Visual inspection

### Recommended
- Unit tests (Vitest)
- Integration tests (React Testing Library)
- E2E tests (Playwright)
- Load testing (k6)

---

## 📈 Performance Optimization

### Implemented
- Code splitting via lazy loading
- Tree shaking via Vite
- PWA caching strategy
- Gzip compression

### Future
- Image optimization
- CDN integration
- Bundle analysis and optimization
- Database query optimization

---

## 🚢 Deployment Architecture

### Build
```
npm run build
  └─> Vite build process
       └─> dist/ folder
            ├── index.html
            ├── assets/ (chunks)
            └── sw.js (service worker)
```

### Hosting Options
1. **Vercel** (recommended for Next.js/React)
2. **Netlify** (static hosting)
3. **AWS S3 + CloudFront** (enterprise)
4. **Self-hosted** (Docker + Nginx)

### CI/CD
- GitHub Actions (future)
- Automated testing pipeline
- Staging → Production promotion

---

## 📝 Module Development Guidelines

### Adding a New Module

1. **Create module directory:**
   ```
   src/modules/my-module/
   ├── index.tsx
   ├── components/
   └── types.ts
   ```

2. **Add to registry:**
   ```typescript
   "category.my-module": {
     id: "category.my-module",
     name: "My Module",
     category: "operations",
     path: "modules/my-module",
     description: "Module description",
     status: "active",
     completeness: "100%",
     route: "/my-module",
     icon: "IconName",
     lazy: true,
   }
   ```

3. **Add route to AppRouter:**
   ```typescript
   const MyModule = React.lazy(() => import("@/modules/my-module"));
   // ...
   <Route path="/my-module" element={<MyModule />} />
   ```

4. **Build and test**

---

## 🔄 Versioning

### Current: v177.0
- **PATCH 176.0:** Route cleanup
- **PATCH 177.0:** Mission Control
- **PATCH 178.0:** Dynamic Navigation

### Planned
- **PATCH 179.0:** Integrity sweep (current)
- **PATCH 180.0:** Sonar AI module

---

## 📞 Technical Contacts

- **Architecture Owner:** TBD
- **Module Maintainers:** See module registry
- **DevOps:** TBD
- **Security:** TBD

---

**Document Status:** ✅ Current  
**Last Reviewed:** 2025-10-25  
**Next Review:** Post-PATCH 180.0
