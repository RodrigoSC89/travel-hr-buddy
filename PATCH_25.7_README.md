# PATCH_25.7 — Realtime Diagnostics & Vercel LogSync

## 🎯 Objective

This patch implements a real-time diagnostic and logging system that:
- Captures build and runtime errors in real-time (Lovable + Vercel)
- Displays logs directly in an internal panel ("System Health" / "DP Intelligence")
- Synchronizes events with Supabase and MQTT
- Ensures automatic detection of preview errors (without relying on console)

## 📦 Implementation Summary

### Files Created

1. **`src/lib/monitoring/logsync.ts`** - Core logging synchronization module
   - Captures runtime errors via `window.addEventListener("error")`
   - Captures promise rejections via `window.addEventListener("unhandledrejection")`
   - Sends logs to Supabase (`system_logs` table)
   - Publishes logs to MQTT broker (`system/logs` topic)

2. **`src/components/SystemHealthPanel.tsx`** - Visual component for log display
   - Subscribes to MQTT `system/logs` topic
   - Displays real-time logs in a scrollable panel
   - Shows up to 50 most recent logs

3. **`scripts/setup-realtime-diagnostics.sh`** - Setup script
   - Creates necessary directories
   - Sets up the logsync module
   - Can be run via `npm run diagnostics:setup`

4. **`supabase/migrations/system_logs_schema.sql`** - Database schema
   - Creates `system_logs` table
   - Adds necessary indexes for performance
   - Sets up Row Level Security (RLS) policies

### Files Modified

1. **`src/main.tsx`** - Added initialization
   ```typescript
   import { initLogSync } from "@/lib/monitoring/logsync";
   initLogSync();
   ```

2. **`package.json`** - Added script
   ```json
   "diagnostics:setup": "bash scripts/setup-realtime-diagnostics.sh"
   ```

## 🔧 Setup Instructions

### 1. Database Setup (Supabase)

Run the SQL migration in your Supabase project:

```sql
-- Execute the contents of supabase/migrations/system_logs_schema.sql
```

Or via Supabase CLI:
```bash
supabase migration new system_logs_schema
# Copy the contents of the migration file
supabase db push
```

### 2. Environment Variables

Ensure these variables are set in your `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt  # or your custom MQTT broker
```

### 3. Run Setup Script

```bash
chmod +x scripts/setup-realtime-diagnostics.sh
npm run diagnostics:setup
```

## 📊 Usage

### Viewing Logs in Real-Time

Add the `SystemHealthPanel` component to any admin or diagnostic page:

```tsx
import SystemHealthPanel from "@/components/SystemHealthPanel";

function AdminPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <SystemHealthPanel />
    </div>
  );
}
```

### Log Types

The system captures the following log types:

- **`startup`** - System initialization successful
- **`runtime_error`** - JavaScript runtime errors
- **`promise_rejection`** - Unhandled promise rejections

### MQTT Integration

Logs are published to the `system/logs` topic. You can subscribe to this topic from any MQTT client to monitor logs in real-time.

### Supabase Integration

All logs are stored in the `system_logs` table with the following structure:

```typescript
{
  id: UUID,
  created_at: TIMESTAMPTZ,
  type: string,
  message: string,
  context: JSONB
}
```

## ✅ Expected Results

| Item | Status |
|------|--------|
| Logs Lovable (runtime/build) | 🟢 Captured and displayed |
| Logs Vercel | 🟢 Synchronized with Supabase |
| MQTT Telemetry | 🟢 Active via "system/logs" |
| Internal "System Health" Panel | 🟢 Functional and real-time |
| White screen / silent errors | 🔴 Eliminated |
| Remote diagnostics (future) | 🧠 Ready for AI Insight Reporter integration |

## 🧪 Testing

To test the implementation:

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the application and verify:
   - No console errors on startup
   - `[startup] ✅ LogSync initialized successfully` appears in console
   - Logs are being sent to Supabase
   - MQTT broker is receiving messages

4. Trigger a test error:
   ```javascript
   // In browser console
   throw new Error("Test error for diagnostics");
   ```

5. Verify the error appears in:
   - Browser console
   - Supabase `system_logs` table
   - SystemHealthPanel component (if visible)

## 🔐 Security Notes

- The system uses anonymous auth for log insertion (to capture client-side errors)
- RLS policies ensure only authenticated users can read logs
- Service role can perform all operations
- Consider implementing log retention policies for production

## 🚀 Future Enhancements

- Integration with AI Insight Reporter for automated error analysis
- Log aggregation and analytics dashboard
- Alert system for critical errors
- Log filtering and search capabilities
- Export functionality for debugging sessions
