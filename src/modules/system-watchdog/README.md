# System Watchdog Module - PATCH 93.0

## Overview

The System Watchdog module provides autonomous monitoring, AI-based error detection, and auto-healing capabilities for the Travel HR Buddy platform.

## Features

### 🔍 Real-time Health Monitoring
- **Supabase Connectivity**: Monitors database connection health with latency measurements
- **AI Service Health**: Checks AI kernel availability and response times
- **Route Validation**: Ensures active routes are properly configured
- **Configurable Intervals**: Default 30-second check intervals (customizable)

### 🧠 AI-Powered Diagnostics
- Integration with existing AI kernel for intelligent error analysis
- Automated system diagnosis based on recent error patterns
- Context-aware recommendations for issue resolution

### 🔁 Auto-Healing Actions
- **Module Restart**: Automatically restart failed modules
- **Cache Clearing**: Clear module-specific or global cache to resolve issues
- **Route Rebuilding**: Force route re-navigation for broken routes
- **Event Logging**: All actions logged to Supabase for audit trail

### 📊 Comprehensive Dashboard
- Overall system status with color-coded indicators
- Service-by-service health monitoring
- Real-time event timeline (last 5 events)
- Manual diagnostic trigger
- Auto-refresh toggle
- Professional UI with Lucide icons

## Installation

The module is automatically registered in the module registry and available at:

```
/dashboard/system-watchdog
```

## Usage

### Accessing the Dashboard

Navigate to `/dashboard/system-watchdog` to view the monitoring dashboard.

### Programmatic Access

```typescript
import { watchdogService } from '@/modules/system-watchdog';

// Start monitoring
watchdogService.start();

// Run health checks
const results = await watchdogService.runFullHealthCheck();

// Run AI diagnosis
const diagnosis = await watchdogService.runDiagnosis();

// Auto-healing actions
await watchdogService.autoRestartModule('module-name');
await watchdogService.clearCache('module-name');
await watchdogService.rebuildRoute('/some-route');

// Get events
const recentEvents = watchdogService.getRecentEvents(5);
const allEvents = watchdogService.getAllEvents();

// Stop monitoring
watchdogService.stop();
```

## API Reference

### WatchdogService

#### Methods

- `start()`: Start the monitoring service
- `stop()`: Stop the monitoring service
- `runFullHealthCheck()`: Execute all health checks
- `checkSupabase()`: Check Supabase connectivity
- `checkAIService()`: Check AI service availability
- `checkRouting()`: Validate current route
- `autoRestartModule(moduleName)`: Restart a module
- `clearCache(moduleName?)`: Clear cache (module-specific or global)
- `rebuildRoute(route)`: Force route rebuild
- `runDiagnosis()`: Run AI-powered system diagnosis
- `getRecentEvents(count)`: Get recent events
- `getAllEvents()`: Get all events
- `clearEvents()`: Clear event history
- `getStatus()`: Get service status

### Types

```typescript
interface HealthCheckResult {
  service: string;
  status: 'online' | 'offline' | 'degraded';
  latency?: number;
  message?: string;
  timestamp: Date;
}

interface WatchdogEvent {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  service: string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

## Database Schema

Events are logged to the `watchdog_events` table:

```sql
CREATE TABLE watchdog_events (
  id uuid PRIMARY KEY,
  event_id text UNIQUE,
  event_type text CHECK (event_type IN ('error', 'warning', 'info', 'success')),
  service_name text,
  message text,
  metadata jsonb,
  created_at timestamptz
);
```

## Testing

Run tests with:

```bash
npm run test tests/modules/system-watchdog.test.ts
```

Test coverage includes:
- Service lifecycle management
- Health check functionality
- Auto-healing actions
- AI diagnosis
- Event management
- Status tracking

## Configuration

Default configuration:
- Check interval: 30 seconds
- Max events stored: 100
- Services monitored: Supabase, AI, Routing

## Troubleshooting

### Service Not Starting
Ensure the AI kernel is properly initialized before starting the watchdog.

### Health Checks Failing
Check network connectivity and Supabase configuration in environment variables.

### Events Not Logging
Verify Supabase permissions and table migration has been applied.

## Contributing

When extending the watchdog:

1. Add new health check methods following the existing pattern
2. Update the `runFullHealthCheck()` method to include new checks
3. Add corresponding tests
4. Update this README with new features

## Version History

- **93.0** (2025-10-24): Initial implementation
  - Real-time health monitoring
  - AI-powered diagnostics
  - Auto-healing capabilities
  - Comprehensive UI dashboard
  - Full test coverage

## License

Part of the Travel HR Buddy platform.
