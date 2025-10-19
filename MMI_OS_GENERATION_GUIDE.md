# MMI OS Generation - Complete Implementation Guide

## Overview

This implementation provides a complete system for generating Work Orders (Ordem de Serviço - OS) directly from AI-generated maintenance forecasts in the MMI module.

## Problem Statement

The MMI system generates AI-powered maintenance forecasts, but there was no way to convert these forecasts into actionable work orders. This created a gap where users had to manually create orders based on AI recommendations.

## Solution Components

### 1. Database Schema

#### `mmi_orders` Table
Stores work orders generated from forecasts with the following structure:

```sql
- id: UUID (Primary Key)
- forecast_id: UUID (Foreign Key to mmi_forecasts)
- vessel_name: TEXT (Vessel name)
- system_name: TEXT (System name)
- description: TEXT (Detailed description)
- status: TEXT (pendente|em_andamento|concluido|cancelado)
- priority: TEXT (baixa|normal|alta|crítica)
- created_by: UUID (User who created the order)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Features:**
- Row Level Security (RLS) enabled
- Full CRUD policies for authenticated users
- Optimized indexes for performance
- Auto-updating `updated_at` trigger

#### Migration Files
1. `20251019180000_create_mmi_orders.sql` - Creates the orders table
2. `20251019180001_insert_sample_forecasts.sql` - Adds sample data for testing

### 2. API Endpoint

**Route:** `POST /api/os/create`

**Request Body:**
```json
{
  "forecast_id": "uuid",
  "vessel_name": "FPSO Alpha",
  "system_name": "Sistema Hidráulico",
  "description": "Detailed maintenance description",
  "priority": "alta"
}
```

**Priority Values:**
- `baixa` - Low priority (🟢)
- `normal` - Normal priority (🟡)
- `alta` - High priority (🟠)
- `crítica` - Critical priority (🔴)

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "forecast_id": "uuid",
    "vessel_name": "FPSO Alpha",
    "system_name": "Sistema Hidráulico",
    "description": "...",
    "status": "pendente",
    "priority": "alta",
    "created_by": "user_uuid",
    "created_at": "2025-10-19T...",
    "updated_at": "2025-10-19T..."
  }
}
```

**Authentication:**
- Requires valid Supabase session
- Returns 401 if unauthorized
- User ID automatically captured from session

**Validation:**
- All fields except priority are required
- Priority defaults to 'normal' if not provided
- Priority must be one of: baixa, normal, alta, crítica

### 3. User Interface

**Page:** `/admin/mmi/forecast/history`

**Component:** `ForecastHistoryPanel` (ForecastHistory.tsx)

**Features:**
- Displays all AI-generated forecasts
- Color-coded priority badges:
  - 🔴 Crítica (Critical)
  - 🟠 Alta (High)
  - 🟡 Normal (Medium)
  - 🟢 Baixa (Low)
- "📄 Gerar Ordem de Serviço" button on each forecast
- Loading states during OS generation
- Toast notifications for success/error feedback
- Responsive card layout
- Shows vessel, system, hourmeter, and maintenance history

**User Flow:**
1. Navigate to `/admin/mmi/forecast/history`
2. View list of AI-generated forecasts
3. Click "📄 Gerar Ordem de Serviço" on desired forecast
4. System creates order and shows success notification
5. Order is saved with link to original forecast

### 4. Data Flow

```
User Action → API Call → Authentication → Validation → 
Database Insert → Response → UI Update → Toast Notification
```

**Detailed Steps:**
1. User clicks "Gerar OS" button
2. Frontend calls `/api/os/create` with forecast data
3. API authenticates user via Supabase session
4. API validates request fields and priority value
5. API inserts order into `mmi_orders` table
6. Database returns created order with ID
7. API sends success response
8. UI shows success toast notification
9. Order is now available in database with audit trail

## Security

### Authentication
- All API endpoints require authentication
- Bearer token authentication via Supabase
- User authorization checks before database operations

### Row Level Security (RLS)
- Enabled on `mmi_orders` table
- Policies:
  - SELECT: All authenticated users
  - INSERT: All authenticated users
  - UPDATE: All authenticated users
  - DELETE: All authenticated users

### Input Validation
- Required field validation
- Priority value validation
- SQL injection prevention via parameterized queries

### Audit Trail
- `created_by` field captures user ID
- `created_at` and `updated_at` timestamps
- Link to original forecast via `forecast_id`

## Testing

### Sample Data
The migration `20251019180001_insert_sample_forecasts.sql` includes:
- 4 sample forecasts with different priorities
- Various vessel names (FPSO Alpha, Beta, Gamma, Delta)
- Different system types
- Realistic maintenance scenarios

### Manual Testing Steps
1. Apply database migrations: `supabase db push`
2. Start development server: `npm run dev`
3. Navigate to `/admin/mmi/forecast/history`
4. Verify sample forecasts are displayed
5. Click "Gerar OS" on a forecast
6. Verify success toast notification
7. Check database for created order:
   ```sql
   SELECT * FROM mmi_orders ORDER BY created_at DESC LIMIT 1;
   ```

## Deployment

### Prerequisites
- Supabase project configured
- Environment variables set:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`

### Steps
1. Apply database migrations:
   ```bash
   supabase db push
   ```

2. Build application:
   ```bash
   npm run build
   ```

3. Deploy to production environment

4. Verify routes are accessible:
   - `/admin/mmi/forecast/history` - Forecast history page
   - `/api/os/create` - Order creation endpoint

### Database Migration Order
1. `20251019170000_create_mmi_forecasts.sql` (already exists)
2. `20251019180000_create_mmi_orders.sql` (new)
3. `20251019180001_insert_sample_forecasts.sql` (new - optional)

## Future Enhancements

### Phase 2 - Orders Dashboard
- Dashboard showing all created orders
- Filtering by status, priority, vessel, system
- Search functionality
- Bulk operations

### Phase 3 - Workflow Management
- Status transitions (pendente → em_andamento → concluido)
- Technician assignment
- Time tracking
- Comments and attachments

### Phase 4 - Notifications
- Email notifications for critical orders
- Slack/Teams integration
- Mobile push notifications
- Scheduled reminders

### Phase 5 - Analytics
- Order completion metrics
- Response time analysis
- Maintenance effectiveness tracking
- Predictive analytics integration

## Files Created/Modified

### New Files
1. `/supabase/migrations/20251019180000_create_mmi_orders.sql`
2. `/supabase/migrations/20251019180001_insert_sample_forecasts.sql`
3. `/pages/api/os/create/route.ts`
4. `/MMI_OS_GENERATION_GUIDE.md` (this file)

### Modified Files
1. `/src/pages/admin/mmi/forecast/ForecastHistory.tsx`
   - Added priority display
   - Implemented order creation functionality
   - Added loading states and error handling
   - Integrated toast notifications

## API Reference

### Create Work Order
```typescript
POST /api/os/create

Headers:
  Content-Type: application/json
  Authorization: Bearer <supabase_session_token>

Body:
{
  forecast_id: string,      // Required
  vessel_name: string,      // Required
  system_name: string,      // Required
  description: string,      // Required
  priority?: 'baixa' | 'normal' | 'alta' | 'crítica'  // Optional, defaults to 'normal'
}

Response (200):
{
  success: true,
  order: { /* order object */ }
}

Response (400):
{
  error: "Missing required fields: ..."
}

Response (401):
{
  error: "Unauthorized"
}

Response (500):
{
  error: "Failed to create order",
  details: "..."
}
```

## Support

For issues or questions:
1. Check logs in browser console
2. Verify database migrations are applied
3. Confirm Supabase connection
4. Review API endpoint responses
5. Check RLS policies in Supabase dashboard

## Version History

- **v1.0.0** (2025-10-19): Initial implementation
  - Database schema creation
  - API endpoint implementation
  - UI integration
  - Sample data migration
  - Complete documentation
