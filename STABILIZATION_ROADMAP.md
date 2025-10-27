# 🔴 System Stabilization Roadmap - Implementation Guide
## Weeks 1-4: Complete Stabilization Plan

This document provides the complete implementation guide for stabilizing the Nautilus One system over 4 weeks.

---

## 📊 Current Status

### ✅ Completed
- **PATCH 241.3**: Winston logging system with Supabase integration
- **PATCH 242**: Finance Hub database schema and TypeScript types
- Build system validated and working
- React Query, Vitest, Playwright, Sentry already installed

### ⚙️ In Progress
- **PATCH 242**: Finance Hub UI components and hooks
- **PATCH 241.1**: TypeScript cleanup (216 files with @ts-nocheck to address)

### 🔜 Remaining
- All other patches from Week 1-4

---

## 🎯 Week 1: Core Stabilization

### PATCH 241.1 - Regenerate Supabase Types & TypeScript Cleanup
**Priority**: HIGH  
**Effort**: Large (216 files)

#### Approach
Since full Supabase type regeneration requires authentication, and there are 216 files with `@ts-nocheck`:

1. **Phase 1: Critical Files** (Focus on services and hooks)
   - Remove @ts-nocheck from `src/services/`
   - Remove @ts-nocheck from `src/hooks/`
   - Fix type errors incrementally

2. **Phase 2: Component Files**
   - Target pages with most traffic
   - Fix admin dashboard files
   - Address main navigation components

3. **Phase 3: Remaining Files**
   - Lower priority pages
   - Example components
   - Utility files

#### Commands
```bash
# Find files with @ts-nocheck
grep -r "@ts-nocheck" src/ --include="*.ts" --include="*.tsx" -l

# Test build after each fix
npm run build

# Run type check
npm run type-check
```

### PATCH 241.2 - Connect Dashboard to Real Data
**Priority**: HIGH  
**Effort**: Medium

#### Current State
Many dashboards use mocked data. Need to identify and replace with:
- Real Supabase queries
- React Query hooks
- Loading states
- Error boundaries

#### Implementation
1. **Audit Dashboards**: Find components with mock data
2. **Create Hooks**: Use React Query for each data source
3. **Add Loading States**: Skeleton screens
4. **Error Handling**: Toast notifications + retry logic
5. **Cache Strategy**: Optimize staleTime and cacheTime

---

## 🎯 Week 2: Module Completion

### PATCH 242 - Finance Hub Complete
**Status**: Schema ✅ | Types ✅ | Hooks 🔜 | UI 🔜

See `FINANCE_HUB_README.md` for complete guide.

**Remaining Tasks**:
1. Create React Query hooks (`src/hooks/finance/useFinanceData.ts`)
2. Build Invoice Generator component
3. Build Payment Tracker component
4. Build Budget Reports with charts
5. Add PDF export for invoices
6. Write tests

### PATCH 243 - Voice Assistant Real
**Priority**: MEDIUM  
**Effort**: Medium

#### Technologies
- Web Speech API (built into browsers)
- Speech Synthesis API (text-to-speech)
- Supabase for conversation storage

#### Implementation
```typescript
// Voice Input Component
const VoiceInput: React.FC = () => {
  const [recognition] = useState(() => new (window as any).webkitSpeechRecognition());
  
  const startListening = () => {
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      // Process command
    };
  };
};

// Voice Output
const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
};
```

#### Database Schema
```sql
CREATE TABLE voice_conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  transcript TEXT,
  response TEXT,
  intent TEXT,
  confidence DECIMAL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

### PATCH 244 - Mission Control Final
**Priority**: HIGH  
**Effort**: Large

#### Modules to Connect
- Autonomy System
- Workflow Engine
- Tactical Operations

#### Features
- Mission planning interface
- Active mission visualization
- Module integration dashboard
- Real-time mission status

---

## 🎯 Week 3: Real-time Intelligence

### PATCH 245 - Supabase Realtime in Context Mesh
**Priority**: HIGH  
**Effort**: Medium

#### Implementation
```typescript
// Context Mesh Realtime
const useContextMeshRealtime = () => {
  useEffect(() => {
    const channel = supabase
      .channel('context_mesh_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'context_mesh'
      }, (payload) => {
        // Update local state
      })
      .on('broadcast', { event: 'sync' }, ({ payload }) => {
        // Sync across tabs
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
};
```

#### Broadcast Channels
```typescript
// Tab synchronization
const channel = supabase.channel('app-sync');
channel.send({
  type: 'broadcast',
  event: 'state-update',
  payload: { /* data */ }
});
```

### PATCH 246 - Analytics Core Real
**Priority**: MEDIUM  
**Effort**: Large

#### Pipeline Architecture
```
Raw Data → Views → Materialized Views → Dashboard
```

#### Components
1. **Data Collection**: Log events to analytics tables
2. **Processing**: Scheduled functions to aggregate data
3. **Visualization**: Charts using recharts
4. **Export**: CSV/PDF reports

### PATCH 247 - Add WebSockets
**Priority**: MEDIUM  
**Effort**: Medium

Uses Supabase Realtime (WebSocket-based)

#### Channels
- Crew communications
- Notifications
- Incident tracking

---

## 🎯 Week 4: UI, Performance & Tests

### PATCH 248 - Add Automated Tests
**Priority**: HIGH  
**Effort**: Large

#### Test Strategy
```typescript
// Unit Tests (Vitest)
describe('Finance Hub', () => {
  it('calculates invoice totals correctly', () => {
    // Test
  });
});

// Integration Tests (Playwright)
test('create and pay invoice flow', async ({ page }) => {
  // E2E test
});
```

#### Coverage Targets
- Finance Hub: 80%+
- Mission Planning: 70%+
- Notifications: 70%+

### PATCH 249 - Performance & Monitoring
**Priority**: HIGH  
**Effort**: Medium

#### Already Installed
- ✅ Sentry (error tracking)
- ✅ Vite (fast builds)

#### To Add
1. **Code Splitting**
```typescript
// Lazy load heavy components
const FinanceHub = lazy(() => import('@/pages/finance'));
const MissionControl = lazy(() => import('@/pages/mission'));
```

2. **Web Vitals**
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
// Send to analytics
```

3. **React Profiler**
```typescript
<Profiler id="Dashboard" onRender={onRenderCallback}>
  <Dashboard />
</Profiler>
```

### PATCH 250 - Trust Score + Real Agents
**Priority**: LOW  
**Effort**: Large

#### Approach
Replace simulated scoring with basic ML:

```typescript
// Simple weighted scoring algorithm
const calculateTrustScore = (metrics: Metrics) => {
  const weights = {
    reliability: 0.3,
    performance: 0.25,
    compliance: 0.25,
    communication: 0.2
  };
  
  return Object.entries(weights).reduce((score, [key, weight]) => {
    return score + (metrics[key] * weight);
  }, 0);
};
```

#### Real Agent 1: Route Analysis
Analyze maritime routes and provide optimization recommendations.

---

## 📋 Implementation Priority Order

### Phase 1: Foundation (Days 1-3)
1. ✅ Logging system (PATCH 241.3)
2. ✅ Finance Hub schema (PATCH 242)
3. Complete Finance Hub hooks and basic UI
4. Fix critical TypeScript errors (top 20 files)

### Phase 2: Core Features (Days 4-7)
1. Connect dashboards to real data (PATCH 241.2)
2. Voice Assistant basic implementation (PATCH 243)
3. Mission Control integration (PATCH 244)

### Phase 3: Real-time & Performance (Days 8-14)
1. Supabase Realtime setup (PATCH 245)
2. Analytics pipelines (PATCH 246)
3. WebSocket integration (PATCH 247)
4. Code splitting and lazy loading (PATCH 249)

### Phase 4: Quality & Testing (Days 15-21)
1. Write automated tests (PATCH 248)
2. Performance monitoring (PATCH 249)
3. Trust scoring improvements (PATCH 250)
4. Fix remaining TypeScript issues (PATCH 241.1)

---

## 🚀 Quick Start Commands

```bash
# Development
npm run dev

# Build (verify no errors)
npm run build

# Type Check
npm run type-check

# Run Tests
npm run test           # Unit tests
npm run test:e2e       # Integration tests
npm run test:coverage  # Coverage report

# Linting
npm run lint
npm run lint:fix

# Database Migrations
# Apply migrations via Supabase dashboard or CLI
# Files in: supabase/migrations/
```

---

## 📈 Success Metrics

### Week 1
- ✅ Build succeeds without errors
- ✅ Logging system operational
- 🔜 Top 50 TypeScript errors fixed
- 🔜 At least 3 dashboards using real data

### Week 2
- Finance Hub 80% functional
- Voice Assistant MVP working
- Mission Control integrated

### Week 3
- Real-time updates working
- Analytics dashboard live
- WebSocket performance < 100ms latency

### Week 4
- Test coverage > 60%
- Core Web Vitals in green
- TypeScript errors < 50
- All critical features deployed

---

## 📞 Support & Resources

### Documentation
- [Finance Hub Guide](./FINANCE_HUB_README.md)
- [TypeScript Best Practices](./docs/typescript.md)
- [Testing Guide](./docs/testing.md)

### Tools
- TypeScript: `npm run type-check`
- Linter: `npm run lint`
- Tests: `npm run test`
- Build: `npm run build`

---

**Last Updated**: 2025-01-27  
**Status**: Week 1 in progress - 30% complete  
**Next Milestone**: Complete Finance Hub UI (ETA: 2 days)
