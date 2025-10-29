# crew Module Documentation
**Module Path:** `/home/runner/work/travel-hr-buddy/travel-hr-buddy/src/modules/crew`
**Last Updated:** 2025-10-29T02:02:50.475Z
---
## 📋 Overview
The crew module provides [functionality description here].
## 🚀 Setup
### Installation
```bash
npm install
```
### Configuration
No specific configuration required for this module.
## 🧩 Components
This module contains 14 component(s):
- `components/ConsentScreen.tsx`
- `components/CrewCertifications.tsx`
- `components/CrewMembers.tsx`
- `components/CrewOverview.tsx`
- `components/CrewPerformance.tsx`
- `components/CrewRotations.tsx`
- `components/SyncStatus.tsx`
- `copilot/index.tsx`
- `index.tsx`
- `validation/CrewConsolidadoValidation.tsx`
- ... and 4 more

## 🔌 API Endpoints
### GET /api/crew
Retrieves crew data.

**Response:**
```json
{
  "status": "success",
  "data": {}
}
```
## 🗄️ Database Schema
### `crew_members` Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar | Field description |
| `name` | varchar | Field description |
| `position` | varchar | Field description |
| `certifications` | varchar | Field description |
| `health_status` | varchar | Field description |

### `crew_assignments` Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar | Field description |
| `vessel_id` | varchar | Field description |
| `crew_member_id` | varchar | Field description |
| `role` | varchar | Field description |
| `rank` | varchar | Field description |

### `crew_rotations` Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar | Field description |
| `crew_member_id` | varchar | Field description |
| `vessel_id` | varchar | Field description |
| `rotation_type` | varchar | Field description |
| `'disembarkation'` | varchar | Field description |

### `crew_rotation_logs` Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar | Field description |
| `rotation_id` | varchar | Field description |
| `log_type` | varchar | Field description |
| `'notification_sent'` | varchar | Field description |
| `'document_updated'` | varchar | Field description |

### `crew_messages` Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar | Field description |
| `sender_id` | varchar | Field description |
| `recipient_id` | varchar | Field description |
| `vessel_id` | varchar | Field description |
| `channel_id` | varchar | Field description |

### `crew_voice_messages` Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar | Field description |
| `message_id` | varchar | Field description |
| `audio_file_path` | varchar | Field description |
| `duration_seconds` | varchar | Field description |
| `transcription` | varchar | Field description |

### `crew_health_records` Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar | Field description |
| `crew_member_id` | varchar | Field description |
| `vessel_id` | varchar | Field description |
| `record_type` | varchar | Field description |
| `'medical_exam'` | varchar | Field description |

### `crew_health_metrics` Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar | Field description |
| `user_id` | varchar | Field description |
| `mood` | varchar | Field description |
| `'good'` | varchar | Field description |
| `'neutral'` | varchar | Field description |

## 📡 Events
### Emitted Events
- `crew:created` - Fired when a new item is created
- `crew:updated` - Fired when an item is updated
- `crew:deleted` - Fired when an item is deleted

### Consumed Events
- `system:ready` - Module initializes when system is ready
## 💡 Usage Examples
```typescript
import { Crew } from '@/modules/crew';

// Example usage
const component = new Crew();
```
## 🧪 Testing
```bash
npm test -- crew
```
