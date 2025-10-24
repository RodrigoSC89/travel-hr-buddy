# System Watchdog UI Visual Guide - PATCH 93.0

## Dashboard Layout

The System Watchdog dashboard is accessible at `/dashboard/system-watchdog` and provides a comprehensive view of system health.

## UI Components

### 1. Header Section
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔴 System Watchdog                    [Auto-Refresh On]  [🔄]  │
│ Autonomous monitoring with AI-based diagnostics                 │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Activity icon and title
- Description text
- Auto-refresh toggle button
- Manual refresh button

### 2. Overall Status Card
```
┌─────────────────────────────────────────────────────────────────┐
│ ✅ System Status                                                │
│ Overall health of monitored services                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ All Systems Operational                         [ ONLINE ]      │
│ Last checked: 5:39:45 PM                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**States:**
- 🟢 **ONLINE**: All systems operational (green badge)
- 🟡 **DEGRADED**: Some services degraded (yellow badge)
- 🔴 **OFFLINE**: Critical services offline (red badge)

### 3. Service Health Checks
```
┌─────────────────────────────────────────────────────────────────┐
│ Service Health Checks                                           │
│ Real-time status of core system components                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🗄️  Supabase                                    25ms     ✅    │
│     Database connection active                                  │
│                                                                 │
│ 🧠 AI Service                                   150ms    ✅    │
│                                                                 │
│ 🛤️  Routing                                     5ms      ✅    │
│     Current route is valid                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**For Each Service:**
- Icon representing the service type
- Service name
- Status message (if any)
- Response latency in milliseconds
- Status indicator (✅ online, ⚠️ degraded, ❌ offline)

### 4. AI System Diagnosis
```
┌─────────────────────────────────────────────────────────────────┐
│ 🧠 AI System Diagnosis                                          │
│ Run AI-powered analysis of system logs and errors               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [ ⚡ Run Diagnostic Now ]              [ Clear Cache ]         │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🧠 AI Analysis: System appears healthy. No critical errors  │ │
│ │    detected in recent logs.                                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Primary action button to run diagnosis
- Quick cache clear button
- AI analysis results displayed in an alert box
- Loading state while diagnosis runs

### 5. Recent Events Timeline
```
┌─────────────────────────────────────────────────────────────────┐
│ Recent Events                                                   │
│ Last 5 system events and notifications                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [SUCCESS]  auto-heal                                            │
│            Cache cleared for test-module                        │
│            10/24/2025, 5:39:45 PM                              │
│                                                                 │
│ [INFO]     diagnosis                                            │
│            AI Diagnosis completed: System appears healthy       │
│            10/24/2025, 5:38:30 PM                              │
│                                                                 │
│ [WARNING]  health-check                                         │
│            AI service response time elevated                    │
│            10/24/2025, 5:37:15 PM                              │
│                                                                 │
│ [ERROR]    routing                                              │
│            Route /invalid-path may be invalid                   │
│            10/24/2025, 5:36:00 PM                              │
│                                                                 │
│ [SUCCESS]  auto-heal                                            │
│            Module dp-intelligence restarted successfully        │
│            10/24/2025, 5:35:45 PM                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Event Types:**
- 🟢 **SUCCESS**: Green badge - successful operations
- 🔵 **INFO**: Blue badge - informational events
- 🟡 **WARNING**: Yellow badge - warnings
- 🔴 **ERROR**: Red badge - error events

**Each Event Shows:**
- Badge with event type
- Service name
- Event message
- Timestamp

### 6. Auto-Healing Actions Panel
```
┌─────────────────────────────────────────────────────────────────┐
│ ⚡ Auto-Healing Actions                                         │
│ Available automatic recovery operations                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│ │ Module      │  │ Cache       │  │ Route       │            │
│ │ Restart     │  │ Clearing    │  │ Rebuild     │            │
│ │             │  │             │  │             │            │
│ │ Auto restart│  │ Clear cache │  │ Rebuild     │            │
│ │ failed      │  │ to resolve  │  │ broken      │            │
│ │ modules     │  │ issues      │  │ routes      │            │
│ │             │  │             │  │ auto        │            │
│ │ [Active]    │  │ [Active]    │  │ [Active]    │            │
│ └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Auto-Healing Capabilities:**
1. **Module Restart**: Automatically restarts modules that fail
2. **Cache Clearing**: Clears module-specific or global cache
3. **Route Rebuild**: Forces navigation to rebuild broken routes

## Color Scheme

The UI uses a clean, modern design with:
- **Primary**: Blue accent colors for interactive elements
- **Success**: Green for healthy states and successful operations
- **Warning**: Yellow/Orange for degraded states
- **Error**: Red for offline states and errors
- **Info**: Blue for informational messages
- **Neutral**: Gray tones for backgrounds and borders

## Responsive Design

The dashboard is fully responsive:
- **Desktop**: Full width with multi-column layouts
- **Tablet**: Adjusted columns, maintained functionality
- **Mobile**: Stacked layout, touch-friendly buttons

## Interactive Features

1. **Real-time Updates**: Auto-refresh every 10 seconds (when enabled)
2. **Manual Refresh**: Click refresh button anytime
3. **Toggle Auto-refresh**: Enable/disable automatic updates
4. **Run Diagnostics**: Trigger AI analysis on demand
5. **Clear Cache**: One-click cache clearing

## Accessibility

- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast ratios for text
- Clear status indicators with icons and text

## Performance

- Lazy loading of components
- Efficient state management
- Minimal re-renders
- Debounced health checks
- Optimized for production builds
