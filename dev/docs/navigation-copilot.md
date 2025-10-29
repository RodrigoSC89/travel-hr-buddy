# navigation-copilot Module Documentation
**Module Path:** `/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/navigation-copilot`
**Last Updated:** 2025-10-29T02:02:50.479Z
---
## 📋 Overview
The navigation-copilot module provides [functionality description here].
## 🚀 Setup
### Installation
```bash
npm install
```
### Configuration
No specific configuration required for this module.
## 🧩 Components
This module contains 6 component(s):
- `NavigationCopilotPage.tsx`
- `components/NavigationCopilotPanel.tsx`
- `components/NavigationMap.tsx`
- `validation/NavigationCopilotV2Validation.tsx`
- `validation/NavigationCopilotValidation.tsx`
- `validation/Patch456Validation.tsx`

## 🔧 Services
This module contains 2 service(s):
- `services/navigationAILogsService.ts`
- `services/routeSuggestionService.ts`

## 🔌 API Endpoints
### GET /api/navigation-copilot
Retrieves navigation-copilot data.

**Response:**
```json
{
  "status": "success",
  "data": {}
}
```
## 📡 Events
### Emitted Events
- `navigation-copilot:created` - Fired when a new item is created
- `navigation-copilot:updated` - Fired when an item is updated
- `navigation-copilot:deleted` - Fired when an item is deleted

### Consumed Events
- `system:ready` - Module initializes when system is ready
## 💡 Usage Examples
```typescript
import { NavigationCopilot } from '@/modules/navigation-copilot';

// Example usage
const component = new NavigationCopilot();
```
## 🧪 Testing
```bash
npm test -- navigation-copilot
```
