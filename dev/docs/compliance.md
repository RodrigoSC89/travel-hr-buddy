# compliance Module Documentation
**Module Path:** `/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/compliance`
**Last Updated:** 2025-10-29T02:02:50.476Z
---
## 📋 Overview
The compliance module provides [functionality description here].
## 🚀 Setup
### Installation
```bash
npm install
```
### Configuration
No specific configuration required for this module.
## 🧩 Components
This module contains 11 component(s):
- `audit-center/index.tsx`
- `compliance-checklist/index.tsx`
- `compliance-hub/index.tsx`
- `compliance-reports/components/ScheduledReports.tsx`
- `compliance-reports/index.tsx`
- `reports/index.tsx`
- `sgso/SGSOSystem.tsx`
- `sgso/components/ActionsList.tsx`
- `sgso/components/CreatePlanDialog.tsx`
- `sgso/components/PlansList.tsx`
- ... and 1 more

## 🔧 Services
This module contains 1 service(s):
- `sgso/services/generateSgsoReportPDF.ts`

## 🔌 API Endpoints
### GET /api/compliance
Retrieves compliance data.

**Response:**
```json
{
  "status": "success",
  "data": {}
}
```
## 🗄️ Database Schema
### `compliance_audit_logs` Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar | Field description |
| `timestamp` | varchar | Field description |
| `score` | varchar | Field description |
| `level` | varchar | Field description |
| `'Risco'` | varchar | Field description |

### `compliance_records` Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar | Field description |
| `checklist_name` | varchar | Field description |
| `checklist_type` | varchar | Field description |
| `'ISPS'` | varchar | Field description |
| `'IMCA'` | varchar | Field description |

## 📡 Events
### Emitted Events
- `compliance:created` - Fired when a new item is created
- `compliance:updated` - Fired when an item is updated
- `compliance:deleted` - Fired when an item is deleted

### Consumed Events
- `system:ready` - Module initializes when system is ready
## 💡 Usage Examples
```typescript
import { Compliance } from '@/modules/compliance';

// Example usage
const component = new Compliance();
```
## 🧪 Testing
```bash
npm test -- compliance
```
