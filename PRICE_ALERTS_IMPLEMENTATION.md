# Price Alerts UI Implementation Guide

## Overview
Complete implementation of the Price Alerts UI with database integration, automatic notifications, and full CRUD operations.

## Features Implemented

### 1. Database Schema
- **Enhanced `price_alerts` table** with:
  - `route` field for travel routes (e.g., "São Paulo - Rio de Janeiro")
  - `travel_date` field for target travel dates
  - Notification preference fields (email, push, frequency)
  - Proper indexes for performance

- **Automatic Notification System**:
  - Database triggers that create notifications when prices change
  - Configurable notification frequency (immediate, daily, weekly)
  - Prevents duplicate notifications within 1 hour

### 2. Service Layer (`src/services/price-alerts-service.ts`)
Complete API for managing price alerts:
- `getAlerts()` - Fetch all user alerts
- `getAlert(id)` - Get single alert details
- `createAlert(input)` - Create new alert
- `updateAlert(id, input)` - Update existing alert
- `deleteAlert(id)` - Delete alert
- `toggleAlert(id, isActive)` - Activate/deactivate alert
- `getPriceHistory(alertId)` - Get price history
- `getNotifications()` - Get user notifications
- `markNotificationAsRead(id)` - Mark notification as read

### 3. React Hooks (`src/hooks/use-price-alerts.ts`)
State management hooks:
- `usePriceAlerts()` - Main hook for alert management
- `usePriceHistory(alertId)` - Price history tracking
- `usePriceNotifications()` - Notifications management

### 4. UI Components

#### Alert Table (`price-alerts-table.tsx`)
- Sortable columns (product, price, date, etc.)
- Filter by status (active/inactive)
- Search by product name or route
- Inline toggle for activation
- Action menu (view, edit, delete)
- Price trend indicators

#### Alert Form (`alert-form.tsx`)
- Product name and URL
- Route and travel date selection
- Target price and current price
- Notification preferences
- Form validation
- Create/Edit modes

#### Notifications Panel (`notifications-panel.tsx`)
- Real-time notification display
- Unread badge counter
- Mark as read functionality
- Mark all as read
- Scrollable list

#### Main Dashboard (`price-alerts-dashboard-integrated.tsx`)
- Statistics cards (active alerts, triggered alerts, potential savings)
- Tabbed interface (Alerts, Notifications)
- Integrated alert management
- Refresh functionality

### 5. Database Migrations

**Migration: `20251028060000_price_alerts_enhancements.sql`**
- Adds route, travel_date, and notification fields
- Creates indexes for performance
- Adds column documentation

**Migration: `20251028070000_price_alerts_notifications.sql`**
- Creates `check_price_alerts()` function
- Creates `notify_on_price_change()` trigger function
- Sets up automatic notification triggers

## Usage

### Accessing the UI
Navigate to `/price-alerts` or `/alertas-precos` in the application menu under "Comunicação & Alertas".

### Creating an Alert
1. Click "New Alert" button
2. Fill in the form:
   - Product Name (required)
   - Route (optional)
   - Travel Date (optional)
   - Target Price (required)
   - Current Price (optional)
   - Product URL (required)
   - Notification preferences
3. Click "Create Alert"

### Managing Alerts
- **Toggle Active/Inactive**: Use the switch in the table
- **Edit**: Click the action menu (⋮) and select "Edit"
- **Delete**: Click the action menu (⋮) and select "Delete"
- **View Details**: Click the action menu (⋮) and select "View Details"

### Notifications
- Automatic notifications are created when:
  - Current price reaches or falls below target price
  - Price history is updated with a price at/below target
- Notifications appear in the "Notifications" tab
- Click "Mark as read" to mark individual notifications
- Click "Mark all as read" to mark all notifications

## API Examples

### Creating an Alert Programmatically

\`\`\`typescript
import { priceAlertsService } from '@/services/price-alerts-service';

const newAlert = await priceAlertsService.createAlert({
  product_name: 'Flight to New York',
  target_price: 500,
  current_price: 650,
  product_url: 'https://example.com/flight',
  route: 'São Paulo - New York',
  travel_date: '2025-12-25',
  notification_email: true,
  notification_push: true,
  notification_frequency: 'immediate'
});
\`\`\`

### Using the React Hook

\`\`\`typescript
import { usePriceAlerts } from '@/hooks/use-price-alerts';

function MyComponent() {
  const { alerts, loading, createAlert, deleteAlert } = usePriceAlerts();
  
  // Create alert
  const handleCreate = async () => {
    await createAlert({
      product_name: 'Hotel in Paris',
      target_price: 200,
      product_url: 'https://example.com/hotel',
    });
  };
  
  // Delete alert
  const handleDelete = async (id: string) => {
    await deleteAlert(id);
  };
  
  return (
    <div>
      {loading ? 'Loading...' : \`\${alerts.length} alerts\`}
    </div>
  );
}
\`\`\`

## Testing

Tests are located in `src/tests/price-alerts-service.test.ts`.

Run tests:
\`\`\`bash
npm test src/tests/price-alerts-service.test.ts
\`\`\`

## Database Schema

### price_alerts Table
\`\`\`sql
- id: UUID (PK)
- user_id: UUID (FK to auth.users)
- product_name: TEXT
- target_price: DECIMAL(10,2)
- current_price: DECIMAL(10,2)
- product_url: TEXT
- route: TEXT (new)
- travel_date: DATE (new)
- is_active: BOOLEAN
- notification_email: BOOLEAN (new)
- notification_push: BOOLEAN (new)
- notification_frequency: TEXT (new)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- last_checked_at: TIMESTAMPTZ
\`\`\`

### price_history Table
\`\`\`sql
- id: UUID (PK)
- alert_id: UUID (FK to price_alerts)
- price: DECIMAL(10,2)
- checked_at: TIMESTAMPTZ
\`\`\`

### price_notifications Table
\`\`\`sql
- id: UUID (PK)
- user_id: UUID (FK to auth.users)
- alert_id: UUID (FK to price_alerts)
- message: TEXT
- is_read: BOOLEAN
- created_at: TIMESTAMPTZ
\`\`\`

## Security

All tables have Row Level Security (RLS) enabled:
- Users can only access their own alerts
- Users can only view their own notifications
- System can create notifications for any user (for automatic triggers)

## Performance

Indexes created for optimal query performance:
- `idx_price_alerts_user_id` on user_id
- `idx_price_alerts_is_active` on is_active
- `idx_price_alerts_route` on route
- `idx_price_alerts_travel_date` on travel_date
- `idx_price_history_alert_id` on alert_id
- `idx_price_notifications_user_id` on user_id
- `idx_price_notifications_is_read` on is_read

## Future Enhancements

- [ ] Email notifications integration
- [ ] Push notifications via mobile app
- [ ] Price trend analysis and predictions
- [ ] Bulk alert creation
- [ ] Alert templates
- [ ] Price comparison across providers
- [ ] Historical price charts
- [ ] Export alerts to CSV/Excel
