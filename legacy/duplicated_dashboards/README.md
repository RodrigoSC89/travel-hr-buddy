# Duplicated Dashboards - Legacy Archive

## PATCH 89: Dashboard Consolidation

This directory contains dashboard modules that were consolidated into the 3 central dashboard units.

### Archived Dashboards

**Pages:**
- `FleetDashboard.tsx` → Consolidated into `operations-dashboard`
- `ExecutiveDashboard.tsx` → Functionality merged into main Dashboard
- `MMIDashboard.tsx` → Specific features preserved in operations
- `TestingDashboard.tsx` → Developer tools, kept for reference
- `Patch66Dashboard.tsx` → Patch-specific, archived for history

**Reason for Archival:**
These dashboards had overlapping functionality and were consolidated to:
1. Reduce code duplication
2. Improve maintainability
3. Provide a more cohesive user experience
4. Centralize KPIs, status, and visualizations

### Consolidated Structure

**3 Main Dashboards:**
1. **operations-dashboard** - Fleet, crew, performance monitoring
2. **ai-insights** - Logs, alerts, AI analysis with GPT-4o
3. **weather-dashboard** - Climate and environmental risk

### Migration Notes

- All functional logic has been preserved
- AI context functions (runAIContext) were maintained
- Reusable components were extracted to `/components/SharedDashboard/`
- Tests were updated to reflect new structure

### Date: 2025-10-24
### Patch: 89.0
