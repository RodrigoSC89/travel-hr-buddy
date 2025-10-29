# satcom Module Documentation
**Module Path:** `/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/satcom`
**Last Updated:** 2025-10-29T02:02:50.475Z
---
## 📋 Overview
The satcom module provides [functionality description here].
## 🚀 Setup
### Installation
```bash
npm install
```
### Configuration
No specific configuration required for this module.
## 🧩 Components
This module contains 11 component(s):
- `components/CommunicationHistory.tsx`
- `components/ConnectivityPanel.tsx`
- `components/DiagnosticPanel.tsx`
- `components/FallbackSimulator.tsx`
- `components/FallbackStatus.tsx`
- `components/SatcomStatus.tsx`
- `components/SatcomTerminal.tsx`
- `components/SignalHistory.tsx`
- `index.tsx`
- `validation/Patch476Validation.tsx`
- ... and 1 more

## 🔧 Services
This module contains 2 service(s):
- `services/failover-service.ts`
- `services/ping-service.ts`

## 🔌 API Endpoints
### GET /api/satcom
Retrieves satcom data.

**Response:**
```json
{
  "status": "success",
  "data": {}
}
```
## 🗄️ Database Schema
### `satcom_failover_logs` Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar | Field description |
| `vessel_id` | varchar | Field description |
| `event_type` | varchar | Field description |
| `'fallback_completed'` | varchar | Field description |
| `'recovery_initiated'` | varchar | Field description |

### `satcom_connection_status` Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar | Field description |
| `vessel_id` | varchar | Field description |
| `connection_id` | varchar | Field description |
| `provider` | varchar | Field description |
| `'Starlink'` | varchar | Field description |

### `satcom_communication_logs` Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar | Field description |
| `vessel_id` | varchar | Field description |
| `connection_id` | varchar | Field description |
| `provider` | varchar | Field description |
| `'Starlink'` | varchar | Field description |

## 📡 Events
### Emitted Events
- `satcom:created` - Fired when a new item is created
- `satcom:updated` - Fired when an item is updated
- `satcom:deleted` - Fired when an item is deleted

### Consumed Events
- `system:ready` - Module initializes when system is ready
## 💡 Usage Examples
```typescript
import { Satcom } from '@/modules/satcom';

// Example usage
const component = new Satcom();
```
## 🧪 Testing
```bash
npm test -- satcom
```
