# PATCH 655 - Dynamic Navigation & Module Control

## Overview
This patch implements a dynamic navigation system with module status indicators, a control panel for module activation, and an AI prompt helper for LLM integration.

## Changes Implemented

### 1. Navigation Structure Hook

#### `src/hooks/useNavigationStructure.ts`
A comprehensive hook for managing navigation based on module status and user roles.

**Features:**
- Dynamic module filtering by status (production, development, experimental, deprecated)
- Role-based access control
- Category grouping
- Status badges (✅ Production, ⚠️ Development, 🧪 Experimental, ❌ Deprecated)
- Statistics tracking
- Icon mapping for categories

**Usage:**
```typescript
const {
  modules,
  getModulesByCategory,
  getModulesByStatus,
  getModulesByRole,
  getNavigationGroups,
  getStatusBadge,
  statistics
} = useNavigationStructure({
  includeProduction: true,
  includeDevelopment: true,
  includeExperimental: false,
  includeDeprecated: false
});
```

### 2. Module Control Panel

#### `src/pages/admin/module-control.tsx`
Administrative interface for managing module activation.

**Features:**
- Toggle modules ON/OFF dynamically
- View module status and metadata
- Filter by category and status
- Search functionality
- Statistics dashboard
- Activation history (ready for implementation)
- Tab-based organization

**Access:** `/admin/module-control`

#### `src/components/ui/ModuleToggleCard.tsx`
Reusable card component for module controls.

**Features:**
- Status badges
- AI-enabled indicator
- Role requirements display
- Toggle switch
- Action menu (navigate, view history)
- Responsive design

### 3. LLM Prompt Helper

#### `src/pages/admin/module-llm-helper.tsx`
Tool for generating AI prompts for each module.

**Features:**
- Automatic prompt generation per module
- Copy to clipboard
- Send to AI API (ready for integration)
- Export to Markdown
- Export to JSON
- Search and filter
- Usage examples
- Batch export

**Access:** `/admin/module-llm-helper`

#### `src/lib/utils/modulePromptGenerator.ts`
Utility for generating contextual AI prompts.

**Features:**
- Context-aware prompt generation
- Category-specific actions
- Role-based instructions
- Portuguese language support
- Usage examples
- Batch processing
- Multiple export formats

## Module Status System

### Status Types
- **✅ Production**: Stable, ready for production use
- **⚠️ Development**: In active development, may have bugs
- **🧪 Experimental**: Early stage, experimental features
- **❌ Deprecated**: No longer maintained, will be removed

### Status Icons in Navigation
All navigation items now show their status:
```
✅ Dashboard (Production)
⚠️ New Feature (Development)
🧪 Beta Module (Experimental)
```

## Integration with Existing System

### Module Registry
Uses existing `modules-registry.json` and `nautilus-modules-status.json` files:
- No database changes required
- Reads from existing data structures
- Compatible with current module system

### Role System
Integrates with existing `usePermissions` hook:
- Respects current role definitions
- Works with existing permission system
- No authentication changes

## API Integration (Ready)

### Module Control API (To Implement)
```typescript
POST /api/modules/:moduleId/toggle
Body: { active: boolean }

GET /api/modules/:moduleId/history
Response: ActivationLog[]
```

### LLM Prompt API (To Implement)
```typescript
POST /api/llm/prompt
Body: { prompt: string, moduleId: string }
Response: { result: string, status: string }
```

## Files Created
- `/src/hooks/useNavigationStructure.ts`
- `/src/pages/admin/module-control.tsx`
- `/src/pages/admin/module-llm-helper.tsx`
- `/src/components/ui/ModuleToggleCard.tsx`
- `/src/lib/utils/modulePromptGenerator.ts`
- `/docs/patches/655-navigation-dynamic.md` (this file)

## Routes to Add

Add to your router configuration:
```typescript
{
  path: '/admin/module-control',
  element: <ModuleControl />
},
{
  path: '/admin/module-llm-helper',
  element: <ModuleLLMHelper />
}
```

## Usage Examples

### Generate Prompt for Crew Module
1. Navigate to `/admin/module-llm-helper`
2. Search for "Crew Management"
3. Click to generate prompt
4. Copy or send to AI

Example generated prompt:
```
🔧 Módulo: Crew Management
✅ Status: PRODUCTION
📂 Categoria: Operações Marítimas
🧠 IA: Habilitado
🔐 Roles: admin, auditor

🎯 Prompt para IA:
"Ative o modo de monitoramento marítimo para o módulo Crew Management. 
Liste os perfis da tripulação pendentes e inicie o fluxo de integração com RH.
Considere os níveis de acesso: admin, auditor."
```

### Control Module Activation
1. Navigate to `/admin/module-control`
2. Filter by status or category
3. Toggle modules ON/OFF
4. View activation statistics

## Statistics Dashboard

The module control panel displays:
- Total modules: Count of all modules
- Production: Stable modules count
- Development: In-progress modules
- Experimental: Beta features
- AI Enabled: Modules with AI capabilities

## Export Functionality

### Markdown Export
Generates comprehensive documentation:
```markdown
# Nautilus One - AI Module Prompts

## 1. Dashboard
```prompt
[Generated prompt]
```

### Exemplos de Uso:
- "IA, ative o módulo Dashboard..."
```

### JSON Export
Structured data for programmatic use:
```json
{
  "generated": "2025-11-04T23:00:00.000Z",
  "system": "Nautilus One",
  "totalPrompts": 45,
  "prompts": [...]
}
```

## Customization

### Add Custom Status
Edit `useNavigationStructure.ts`:
```typescript
const STATUS_ICONS: Record<ModuleStatus, string> = {
  production: '✅',
  development: '⚠️',
  experimental: '🧪',
  deprecated: '❌',
  custom: '🎯' // Add your status
};
```

### Customize Prompts
Edit `modulePromptGenerator.ts`:
```typescript
const getModuleAction = (category: string) => {
  // Add custom actions per category
};
```

## Performance Considerations
- All filtering done in memory (fast)
- Memoized calculations
- Lazy loading ready
- No API calls for navigation
- Client-side sorting

## Security
- Role-based access control
- Permission checks before module access
- Deprecated modules blocked
- Admin-only pages

## Browser Compatibility
- Modern browsers (ES6+)
- Clipboard API for copy function
- Download API for exports

## Next Steps
1. Add routes to main router
2. Implement activation history storage
3. Connect LLM API
4. Add module activation logs to database
5. Implement real-time status updates

## Support
For implementation details, see:
- `/src/hooks/useNavigationStructure.ts`
- `/src/pages/admin/module-control.tsx`
- `/src/pages/admin/module-llm-helper.tsx`
