# PATCH 89.0 - Dashboard Consolidation Analysis

## Date: 2025-10-24

## Existing Dashboards Inventory

### Dashboard Pages (src/pages/)

1. **Dashboard.tsx**
   - Location: `src/pages/Dashboard.tsx`
   - Component: `StrategicDashboard`
   - Route: `/dashboard`
   - Purpose: Strategic dashboard with KPIs and insights
   - Status: ✅ Active
   - Decision: **CONSOLIDATE into operations-dashboard**

2. **ExecutiveDashboard.tsx**
   - Location: `src/pages/ExecutiveDashboard.tsx`
   - Purpose: Executive KPI overview, revenue, costs
   - Status: ✅ Active
   - Decision: **CONSOLIDATE into operations-dashboard**

3. **FleetDashboard.tsx**
   - Location: `src/pages/FleetDashboard.tsx`
   - Components: VesselManagement, VesselTracking, FleetAnalytics
   - Route: `/fleet-dashboard`
   - Purpose: Fleet management and tracking
   - Status: ✅ Active
   - Decision: **CONSOLIDATE into operations-dashboard**

4. **EnhancedMetrics.tsx**
   - Location: `src/pages/EnhancedMetrics.tsx`
   - Component: `EnhancedMetricsDashboard`
   - Purpose: Enhanced metrics visualization
   - Status: ✅ Active
   - Decision: **CONSOLIDATE into operations-dashboard**

5. **PerformanceOptimizer.tsx**
   - Location: `src/pages/PerformanceOptimizer.tsx`
   - Purpose: Performance optimization dashboard
   - Status: ✅ Active
   - Decision: **CONSOLIDATE into operations-dashboard**

6. **MMIDashboard.tsx**
   - Location: `src/pages/MMIDashboard.tsx`
   - Purpose: MMI-specific dashboard
   - Status: ✅ Active
   - Decision: **KEEP SEPARATE** (domain-specific)

7. **TestingDashboard.tsx**
   - Location: `src/pages/TestingDashboard.tsx`
   - Purpose: Testing/development dashboard
   - Status: ✅ Active
   - Decision: **KEEP SEPARATE** (development tool)

8. **Patch66Dashboard.tsx**
   - Location: `src/pages/Patch66Dashboard.tsx`
   - Purpose: Legacy patch dashboard
   - Status: ⚠️ Legacy
   - Decision: **MOVE to legacy/**

### Dashboard Modules (src/modules/)

9. **weather-dashboard**
   - Location: `src/modules/weather-dashboard/`
   - Route: `/weather-dashboard`
   - Registry: `features.weather`
   - Purpose: Weather monitoring and forecasting
   - Status: ✅ Active
   - AI Features: ❌ None currently
   - Decision: **KEEP and ENHANCE with AI**

10. **insight-dashboard**
    - Location: `src/pages/mission-control/insight-dashboard.tsx`
    - Route: `/mission-control/insight-dashboard`
    - Registry: `intelligence.ai-insights`
    - Purpose: AI-powered insights, logs analysis, metrics
    - Status: ✅ Active
    - AI Features: ✅ Yes (logs, metrics, system status)
    - Decision: **RENAME to ai-insights and MOVE to proper location**

### Dashboard Components (src/components/dashboard/)

Multiple reusable dashboard components exist:
- business-kpi-dashboard.tsx
- dashboard-analytics.tsx
- dashboard-widgets.tsx
- enhanced-dashboard.tsx
- enhanced-unified-dashboard.tsx
- executive-dashboard.tsx
- global-dashboard.tsx
- interactive-dashboard.tsx
- modern-executive-dashboard.tsx
- responsive-dashboard.tsx
- strategic-dashboard.tsx
- unified-dashboard.tsx

**Decision:** These are reusable components - will be imported by the 3 core dashboards as needed.

## Target Architecture

### 3 Core Dashboard Modules

#### 1. operations-dashboard ✨ NEW
**Location:** `src/modules/operations-dashboard/`
**Route:** `/operations-dashboard`
**Purpose:** Central operations dashboard consolidating:
- Fleet management (from FleetDashboard)
- Crew management
- Performance metrics (from PerformanceOptimizer)
- KPIs and analytics (from Dashboard, ExecutiveDashboard, EnhancedMetrics)
- Mission tracking

**Key Features:**
- Real-time fleet status
- Crew wellbeing monitoring
- Performance optimization
- KPI tracking
- Analytics and reports
- Supabase integration
- AI-powered recommendations

**Components to Reuse:**
- VesselManagement
- VesselTracking
- FleetAnalytics
- StrategicDashboard elements
- EnhancedMetricsDashboard elements

#### 2. ai-insights 🔄 RENAMED
**Location:** `src/modules/ai-insights/` (moved from mission-control)
**Route:** `/ai-insights`
**Purpose:** AI-powered operational insights
- System logs analysis
- Performance predictions
- Failure detection
- Recommendations engine
- AI context: `runAIContext('ai-insights')`

**Key Features:**
- Real-time logs monitoring (LogsEngine)
- Metrics analysis (MetricsDaemon)
- System watchdog (SystemWatchdog)
- AI report generation
- Predictive analytics
- Alert management

**Current Implementation:**
- Already has AI capabilities
- Uses Supabase for data
- Has time-series analysis
- Generates AI reports

#### 3. weather-dashboard ✅ ENHANCED
**Location:** `src/modules/weather-dashboard/` (existing)
**Route:** `/weather-dashboard`
**Purpose:** Weather monitoring + AI decision support

**Enhancements Needed:**
- Add weather API integration
- Add forecast data
- Add risk assessment
- Add route impact analysis
- Add AI suggestions: `runAIContext('weather-insights')`
- Add DP (Dynamic Positioning) impact analysis
- Add alert system

**Key Features to Add:**
- Real-time weather data
- Route-specific forecasts
- Severe weather alerts
- Historical weather analysis
- AI-powered route recommendations
- DP operation risk assessment

## Modules to Archive

Move to `legacy/duplicated_dashboards/`:
1. Patch66Dashboard.tsx

## Impact Analysis

### Files to Update:
- [ ] `src/App.tsx` - Update routes
- [ ] `src/modules/registry.ts` - Update module definitions
- [ ] `src/config/navigation.ts` - Update navigation
- [ ] `src/components/layout/app-sidebar.tsx` - Update sidebar links
- [ ] `src/components/layout/SmartSidebar.tsx` - Update sidebar
- [ ] `src/components/CommandPalette.tsx` - Update commands
- [ ] `src/lib/registry/modules-definition.ts` - Update module definitions
- [ ] `src/hooks/use-sidebar-actions.ts` - Update actions

### Routes Changes:
- `/dashboard` → `/operations-dashboard` (redirect)
- `/fleet-dashboard` → `/operations-dashboard` (redirect)
- `/mission-control/insight-dashboard` → `/ai-insights` (redirect)
- `/weather-dashboard` → `/weather-dashboard` (keep, enhanced)

### Tests to Update:
- [ ] Look for tests referencing old dashboard routes
- [ ] Update imports in test files
- [ ] Create tests for new consolidated dashboards

## Success Metrics

- ✅ 8+ dashboard variations reduced to 3 core modules
- ✅ All functionality preserved
- ✅ AI embedded in all 3 modules
- ✅ Routes properly redirected
- ✅ Navigation updated
- ✅ Build passes without errors
- ✅ No broken imports
