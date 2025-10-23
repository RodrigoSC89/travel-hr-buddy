# Nautilus One - Module Index

**Last Updated**: 2025-01-24  
**Total Modules**: 48 registered modules  
**PATCH**: 68.0 - Module Consolidation

---

## 📚 Module Categories

### Core (3 modules)
Essential system modules and shared components.

- **core.dashboard** - Main application dashboard
- **core.shared** - Shared components and utilities
- **ui** - User interface components

### Operations (4 modules)
Operational management and crew coordination.

- **operations.crew** - Crew management and assignments
- **operations.fleet** - Fleet and vessel management
- **operations.performance** - Performance monitoring
- **operations.crew-wellbeing** - Crew health and wellbeing

### Compliance (3 modules)
Regulatory compliance and audit management.

- **compliance.reports** - Compliance reports generation
- **compliance.audit-center** - Audit management center
- **compliance.hub** - Central compliance hub

### Intelligence (3 modules)
AI-powered insights and automation.

- **intelligence.ai-insights** - AI insights and analytics
- **intelligence.analytics** - Core analytics engine
- **intelligence.automation** - Intelligent automation

### Emergency (4 modules)
Emergency response and risk management.

- **emergency.response** - Emergency response system
- **emergency.mission-control** - Mission control center
- **emergency.mission-logs** - Mission logging
- **emergency.risk-management** - Risk assessment

### Logistics (3 modules)
Supply chain and logistics management.

- **logistics.hub** - Central logistics hub
- **logistics.fuel-optimizer** - Fuel optimization
- **logistics.satellite-tracker** - Satellite tracking

### Planning (1 module)
Route and voyage planning.

- **planning.voyage** - Voyage planner

### HR (2 modules)
Human resources and training.

- **hr.training** - Training academy
- **hr.peo-dp** - PEO-DP integration

### Maintenance (1 module)
Maintenance planning and tracking.

- **maintenance.planner** - Maintenance planner

### Connectivity (3 modules)
Communication and integration.

- **connectivity.channel-manager** - Channel management
- **connectivity.api-gateway** - API gateway
- **connectivity.notifications** - Notification center

### Workspace (1 module)
Collaborative workspaces.

- **workspace.realtime** - Real-time workspace

### Assistants (1 module)
AI assistants and automation.

- **assistants.voice** - Voice assistant

### Finance (1 module)
Financial management.

- **finance.hub** - Finance hub

### Documents (2 modules)
Document management and reporting.

- **documents.ai** - AI document management
- **documents.incident-reports** - Incident reports

### Configuration (2 modules)
System configuration and user management.

- **config.settings** - Application settings
- **config.user-management** - User management

### Features (11 modules)
Specialized features and tools.

- **features.price-alerts** - Price monitoring
- **features.smart-checklists** - Smart checklists
- **features.communication** - Communication platform
- **features.employee-portal** - Employee portal
- **features.bookings** - Booking system
- **features.maritime-system** - Maritime operations
- **features.travel** - Travel management
- **features.vault-ai** - AI vault
- **features.weather** - Weather dashboard
- **features.task-automation** - Task automation
- **features.project-timeline** - Project timeline
- **features.smart-workflow** - Smart workflow (Beta)

---

## 🔍 Module Status

- **Active**: 47 modules
- **Beta**: 1 module (smart-workflow)
- **Deprecated**: 0 modules (check archive/)
- **Experimental**: 0 modules

---

## 📖 Usage

### Import from Registry

```typescript
import { MODULE_REGISTRY, getModule } from '@/modules/registry';

// Get specific module
const dashboardModule = getModule('core.dashboard');

// Get modules by category
const operationsModules = getModulesByCategory('operations');

// Get all active modules
const activeModules = getActiveModules();
```

### Load Module

```typescript
import { loadModule } from '@/modules/loader';

// Lazy load module
const DashboardComponent = loadModule('core.dashboard');

// Use in React
<Suspense fallback={<Loading />}>
  <DashboardComponent />
</Suspense>
```

### Preload Module

```typescript
import { preloadModule } from '@/modules/loader';

// Preload for better performance
await preloadModule('core.dashboard');
```

---

## 🏗️ Module Structure

All modules follow this standard structure:

```
src/modules/[category]/[module-name]/
├── components/          # Module-specific components
├── hooks/               # Module-specific hooks
├── services/            # Business logic and API calls
├── types/               # TypeScript types
├── utils/               # Utility functions
├── index.ts             # Main export
└── README.md            # Module documentation
```

---

## 🔗 Navigation

- **Module Registry**: `src/modules/registry.ts`
- **Module Loader**: `src/modules/loader.ts`
- **Documentation**: `docs/INTEGRATION-GUIDE.md`

---

## 📝 Adding New Modules

1. Create module in appropriate category folder
2. Register in `src/modules/registry.ts`
3. Add route if applicable
4. Document in module README
5. Update this INDEX.md

---

## 🚨 Deprecated Modules

Check `archive/deprecated-modules-patch66/` for deprecated modules.

---

**For detailed documentation, see**:
- [Integration Guide](../../docs/INTEGRATION-GUIDE.md)
- [Module Registry](./registry.ts)
- [Module Loader](./loader.ts)
- [PATCH 68.0 Documentation](../../docs/PATCH-68.0-MODULE-CONSOLIDATION.md)
