# MMI OS (Ordem de Serviço) Generation Feature

## Overview
This feature allows users to generate work orders (Ordem de Serviço - OS) directly from AI-generated maintenance forecasts in the MMI (Manutenção e Manutenibilidade Industrial) system.

## Database Schema

### 1. `mmi_forecasts` Table
Stores AI-generated maintenance forecasts with the following structure:

```sql
CREATE TABLE mmi_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_name TEXT NOT NULL,
  system_name TEXT NOT NULL,
  forecast_text TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('baixa', 'normal', 'alta', 'critica')),
  suggested_date DATE,
  component_id UUID REFERENCES mmi_components(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. `mmi_orders` Table
Stores work orders generated from forecasts:

```sql
CREATE TABLE mmi_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_id UUID REFERENCES mmi_forecasts(id),
  vessel_name TEXT NOT NULL,
  system_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluido', 'cancelado')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('baixa', 'normal', 'alta', 'critica')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Endpoint

### POST `/api/os/create`

Creates a new work order from a forecast.

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "forecast_id": "uuid-string (optional)",
  "vessel_name": "FPSO Alpha",
  "system_name": "Sistema hidráulico do guindaste",
  "description": "Detailed work order description",
  "priority": "alta" // "baixa" | "normal" | "alta" | "critica"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "forecast_id": "uuid-string",
    "vessel_name": "FPSO Alpha",
    "system_name": "Sistema hidráulico",
    "description": "Work order details",
    "status": "pendente",
    "priority": "alta",
    "created_by": "user-uuid",
    "created_at": "2025-10-19T17:30:00Z"
  }
}
```

**Response (Error - 400/401/500):**
```json
{
  "error": "Error message"
}
```

## UI Components

### ForecastHistoryPanel Component

Located at: `src/components/mmi/ForecastHistoryPanel.tsx`

**Features:**
- Displays all AI-generated forecasts from `mmi_forecasts` table
- Shows forecast details including vessel name, system name, priority, and suggested date
- Includes a "📄 Gerar Ordem de Serviço" button for each forecast
- Handles authentication and authorization automatically
- Shows loading states and error feedback

**Props:**
```typescript
interface ForecastHistoryPanelProps {
  vesselFilter?: string; // Optional filter by vessel name
}
```

### Page Route

The forecast history is accessible at: `/mmi/forecast-history`

Page component: `src/pages/MMIForecastHistory.tsx`

## Usage Flow

1. **View Forecasts:**
   - Navigate to `/mmi/forecast-history`
   - View all AI-generated maintenance forecasts

2. **Generate Work Order:**
   - Click the "📄 Gerar Ordem de Serviço" button on any forecast
   - The system automatically:
     - Authenticates the user
     - Creates a new entry in `mmi_orders` table
     - Links the order to the original forecast
     - Shows success/error feedback

3. **View Work Orders:**
   - Access the orders dashboard (future implementation)
   - Filter by status, system, vessel, or priority
   - Track order completion

## Integration with Existing System

This feature integrates with:
- **MMI Components:** References `mmi_components` table for component data
- **Authentication:** Uses Supabase auth for user management
- **Authorization:** Implements Row Level Security (RLS) policies
- **MMI OS System:** Can be extended to work with the existing `mmi_os` table

## Future Enhancements

Potential improvements:
1. Dashboard for viewing and managing work orders
2. Status transitions (pendente → em_andamento → concluido)
3. Assignment of orders to technicians
4. Integration with the existing `mmi_os` table for full work order lifecycle
5. Notifications when orders are created
6. Reports and analytics on orders by system, vessel, and priority

## Testing

Test file: `src/tests/mmi-os-create-api.test.ts`

Run tests:
```bash
npm run test -- src/tests/mmi-os-create-api.test.ts
```

## Migration Files

- `supabase/migrations/20251019170000_create_mmi_forecasts.sql`
- `supabase/migrations/20251019170100_create_mmi_orders.sql`

Apply migrations using Supabase CLI or dashboard.
