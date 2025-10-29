# analytics Module Documentation
**Module Path:** `/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/analytics`
**Last Updated:** 2025-10-29T02:02:50.478Z
---
## 📋 Overview
The analytics module provides [functionality description here].
## 🚀 Setup
### Installation
```bash
npm install
```
### Configuration
No specific configuration required for this module.
## 🧩 Components
This module contains 3 component(s):
- `AnalyticsCore.tsx`
- `components/AnalyticsQueryBuilder.tsx`
- `validation/AnalyticsCoreValidation.tsx`

## 🔧 Services
This module contains 5 service(s):
- `services/ai-insights.ts`
- `services/analytics-dashboard-service.ts`
- `services/data-collector.ts`
- `services/event-tracking.ts`
- `services/export-service.ts`

## 🔌 API Endpoints
### GET /api/analytics
Retrieves analytics data.

**Response:**
```json
{
  "status": "success",
  "data": {}
}
```
## 🗄️ Database Schema
### `voice_analytics` Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar | Field description |
| `analytics_date` | varchar | Field description |
| `total_commands` | varchar | Field description |
| `successful_commands` | varchar | Field description |
| `failed_commands` | varchar | Field description |

### `analytics_events` Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar | Field description |
| `event_type` | varchar | Field description |
| `'user_action'` | varchar | Field description |
| `'api_call'` | varchar | Field description |
| `'error'` | varchar | Field description |

### `analytics_metrics` Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar | Field description |
| `metric_name` | varchar | Field description |
| `metric_type` | varchar | Field description |
| `'gauge'` | varchar | Field description |
| `'histogram'` | varchar | Field description |

### `analytics_alerts` Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar | Field description |
| `name` | varchar | Field description |
| `description` | varchar | Field description |
| `metric_name` | varchar | Field description |
| `condition` | varchar | Field description |

### `analytics_alert_history` Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar | Field description |
| `alert_id` | varchar | Field description |
| `metric_value` | varchar | Field description |
| `threshold` | varchar | Field description |
| `severity` | varchar | Field description |

### `analytics_dashboards` Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar | Field description |
| `name` | varchar | Field description |
| `description` | varchar | Field description |
| `config` | varchar | Field description |
| `is_realtime` | varchar | Field description |

### `analytics_sessions` Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar | Field description |
| `session_id` | varchar | Field description |
| `user_id` | varchar | Field description |
| `started_at` | varchar | Field description |
| `ended_at` | varchar | Field description |

## 📡 Events
### Emitted Events
- `analytics:created` - Fired when a new item is created
- `analytics:updated` - Fired when an item is updated
- `analytics:deleted` - Fired when an item is deleted

### Consumed Events
- `system:ready` - Module initializes when system is ready
## 💡 Usage Examples
```typescript
import { Analytics } from '@/modules/analytics';

// Example usage
const component = new Analytics();
```
## 🧪 Testing
```bash
npm test -- analytics
```
