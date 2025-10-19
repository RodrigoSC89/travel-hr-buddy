# MMI Orders Management Interface - Implementation Guide

## Overview

This implementation provides a complete Orders Management Interface for the MMI (Manutenção, Modernização e Inspeção) system, enabling comprehensive work order listing, status management, and export functionality.

## Architecture

### Database Layer

**Table: `mmi_orders`**
- Created via migration: `supabase/migrations/20251019180000_create_mmi_orders.sql`
- Schema includes:
  - `id`: UUID primary key
  - `forecast_id`: Reference to mmi_forecasts (optional)
  - `vessel_name`: TEXT (required)
  - `system_name`: TEXT (required)
  - `description`: TEXT
  - `status`: TEXT with CHECK constraint (pendente, em_andamento, concluido, cancelado)
  - `priority`: TEXT with CHECK constraint (baixa, normal, alta, crítica)
  - `created_by`: Reference to auth.users
  - `created_at`: Timestamp with timezone
  - `updated_at`: Timestamp with timezone

**Security: Row Level Security (RLS)**
- Policies enable authenticated users to:
  - View all orders (SELECT)
  - Create new orders (INSERT)
  - Update existing orders (UPDATE)
  - Delete orders (DELETE)

**Performance Optimizations**
- Indexes on commonly queried columns:
  - forecast_id
  - vessel_name
  - system_name
  - status
  - priority
  - created_by
  - created_at (descending)

**Automatic Timestamp Management**
- Trigger: `update_mmi_orders_updated_at`
- Updates `updated_at` column on every UPDATE operation

### API Layer

#### 1. GET /api/os/all

**File:** `pages/api/os/all.ts`

**Purpose:** Lists all work orders sorted by creation date (newest first)

**Authentication:** Required (checks for authenticated user)

**Response Format:**
```typescript
Array<{
  id: string;
  vessel_name: string;
  system_name: string;
  status: string;
  priority: string;
  description: string;
  created_at: string;
  forecast_id?: string;
  created_by?: string;
  updated_at: string;
}>
```

**Error Handling:**
- 405: Method not allowed (non-GET requests)
- 401: Unauthorized (no valid session)
- 500: Server error (database issues)

#### 2. POST /api/os/update

**File:** `pages/api/os/update.ts`

**Purpose:** Updates order status with comprehensive validation

**Authentication:** Required

**Request Body:**
```typescript
{
  id: string;           // Required: Order ID
  status: string;       // Required: One of "pendente", "em_andamento", "concluido", "cancelado"
}
```

**Validation:**
- Required fields validation (id, status)
- Status value validation against allowed values
- Database-level constraint enforcement

**Response Format:**
```typescript
{
  success: boolean;
  order: {
    // Updated order object
  }
}
```

**Error Handling:**
- 405: Method not allowed (non-POST requests)
- 400: Bad request (missing or invalid fields)
- 401: Unauthorized (no valid session)
- 500: Server error (database issues)

### Frontend Layer

#### Admin Interface Component

**File:** `src/pages/admin/mmi/orders.tsx`

**Route:** `/admin/mmi/orders`

**Features:**

1. **Order Listing**
   - Card-based layout for each work order
   - Responsive design
   - Loading and empty states
   - Sorted by creation date (newest first)

2. **Status Management**
   - Visual status badges with color coding:
     - Concluída: Green
     - Em Andamento: Blue
     - Pendente: Gray
     - Cancelada: Red
   - Action buttons:
     - "Iniciar" - Changes status to em_andamento
     - "Concluir" - Changes status to concluido
   - Smart button states (automatically disabled based on current status)

3. **Priority Display**
   - Color-coded priority badges:
     - Crítica: Red
     - Alta: Orange
     - Normal: Yellow
     - Baixa: Green

4. **PDF Export**
   - One-click export per order
   - Includes all order details
   - Professional formatting
   - Uses html2pdf.js library

5. **Real-time Updates**
   - UI immediately reflects status changes
   - Optimistic updates with local state management

6. **Error Handling**
   - Graceful handling of API failures
   - Toast notifications for success and error states
   - User-friendly error messages

**State Management:**
```typescript
const [orders, setOrders] = useState<Order[]>([]);
const [loading, setLoading] = useState(true);
```

**Key Functions:**
- `loadOrders()`: Fetches all orders from API
- `updateStatus(id, status)`: Updates order status
- `exportToPDF(order)`: Generates and downloads PDF
- `getPriorityColor(priority)`: Returns CSS classes for priority badge
- `getStatusColor(status)`: Returns CSS classes for status badge
- `getStatusLabel(status)`: Formats status for display

### Routing Configuration

**File:** `src/App.tsx`

**Changes:**
1. Added lazy import:
   ```typescript
   const MMIOrders = React.lazy(() => import("./pages/admin/mmi/orders"));
   ```

2. Added route:
   ```typescript
   <Route path="/admin/mmi/orders" element={<MMIOrders />} />
   ```

## Testing

**File:** `src/tests/mmi-orders-page.test.tsx`

**Test Coverage:** 14 comprehensive tests

**Test Categories:**

1. **Rendering Tests**
   - Page title rendering
   - Loading state display
   - Empty state display
   - Order details display

2. **Status Update Tests**
   - Start button functionality
   - Complete button functionality
   - Button state management (disabled states)

3. **PDF Export Tests**
   - Export button presence
   - PDF generation functionality

4. **Error Handling Tests**
   - API error handling
   - Update error handling

**Mock Strategy:**
- Mocked `fetch` globally for API calls
- Mocked `sonner` for toast notifications
- Mocked `html2pdf.js` for PDF generation

**Test Results:** ✅ All 14 tests passing

## Dependencies

### Required Libraries
- React 18.3.1
- react-router-dom 6.30.1
- date-fns 3.6.0
- html2pdf.js 0.12.1
- sonner 1.7.4
- lucide-react 0.462.0

### UI Components (shadcn/ui)
- Card, CardContent, CardHeader, CardTitle
- Button
- Badge

## Deployment Checklist

- [x] Database migration created
- [x] API endpoints implemented and tested
- [x] Frontend interface created
- [x] Routing configured
- [x] Tests written and passing
- [x] TypeScript types defined
- [x] Error handling implemented
- [x] Loading states added
- [x] Empty states handled
- [x] Documentation created

## Usage

### Accessing the Interface

Navigate to: `/admin/mmi/orders`

### Creating Work Orders

Work orders are created through the existing `/api/os/create` endpoint (not modified in this implementation).

### Managing Orders

1. View all orders in the main list
2. Click "Iniciar" to start working on an order
3. Click "Concluir" when order is complete
4. Click "Exportar PDF" to download order details

### Status Workflow

```
pendente → em_andamento → concluido
         ↘ cancelado
```

## Security Considerations

1. **Authentication**: All API endpoints require authenticated users
2. **RLS Policies**: Database-level security enforced via Supabase RLS
3. **Input Validation**: Status values validated against allowed list
4. **Error Messages**: No sensitive data exposed in error responses

## Performance Considerations

1. **Database Indexes**: Optimized queries for common operations
2. **Lazy Loading**: Component lazy-loaded for better initial page load
3. **Optimistic Updates**: UI updates immediately without waiting for server response
4. **Efficient Queries**: Single query to fetch all orders sorted at database level

## Future Enhancements

Potential improvements for future versions:
- Pagination for large order lists
- Advanced filtering (by vessel, system, priority, date range)
- Bulk operations (update multiple orders at once)
- Order assignment to specific users
- Due date tracking
- Comments/notes on orders
- Attachment support
- Email notifications on status changes
- Integration with external maintenance systems
