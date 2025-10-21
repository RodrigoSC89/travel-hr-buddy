# BridgeLink Integration Core - Implementation Guide

## 📋 Overview

The BridgeLink Integration Core is a real-time communication and synchronization system that integrates MQTT messaging with Supabase real-time capabilities. It provides bidirectional data flow between modules (DP ↔ Forecast ↔ ControlHub) with automatic fallback mechanisms for network resilience.

## 🎯 Features

✅ **Real-time MQTT Communication** - Event publishing and subscription with automatic reconnection
✅ **Supabase Real-time Sync** - Database change listeners with automatic updates
✅ **Manual Sync Control** - Dashboard with diagnostic tools and manual sync triggers
✅ **Network Resilience** - Automatic fallback and reconnection on network issues
✅ **SafeLazyImport Pattern** - Optimized component loading with error handling
✅ **Lovable Preview Style** - Modern UI following project design standards

## 🏗️ Architecture

### Components Structure

```
src/
├── pages/
│   └── BridgeLink.tsx                 # Main page with safeLazyImport
├── components/
│   └── bridgelink/
│       ├── BridgeLinkStatus.tsx       # MQTT connection status monitor
│       ├── BridgeLinkSync.tsx         # Real-time sync component
│       └── BridgeLinkDashboard.tsx    # Diagnostic and control panel
└── lib/
    └── mqtt/
        └── publisher.ts               # MQTT publishing and subscription utilities
```

### Data Flow

```
┌─────────────┐        ┌──────────┐        ┌───────────┐
│   Supabase  │ ──────▶│   MQTT   │ ──────▶│  Modules  │
│  Real-time  │        │  Broker  │        │  (DP/FC)  │
└─────────────┘        └──────────┘        └───────────┘
       │                     │                     │
       │                     │                     │
       └─────────────────────┴─────────────────────┘
                             │
                      BridgeLink Core
```

## 🔧 Implementation Details

### 1. MQTT Publisher (`src/lib/mqtt/publisher.ts`)

Extends the existing MQTT client with specialized subscription handlers:

- **`publishEvent(topic, payload)`** - Publish events to any MQTT topic
- **`subscribeAlerts(callback)`** - Subscribe to system alerts
- **`subscribeBridgeStatus(callback)`** - Monitor BridgeLink connection status
- **`subscribeForecast(callback)`** - Receive forecast telemetry updates

### 2. BridgeLinkStatus Component

Real-time connection monitoring with:
- Online/Offline status
- Latency metrics
- Last synchronization timestamp

Uses MQTT subscription to receive status updates automatically.

### 3. BridgeLinkSync Component

Bidirectional synchronization:
- Listens to Supabase database changes via real-time channel
- Publishes changes to MQTT for module distribution
- Shows sync status for both MQTT and Supabase

### 4. BridgeLinkDashboard Component

Diagnostic and control center:
- Manual sync trigger button
- Event log display
- Diagnostic information

### 5. BridgeLink Page

Main page using safeLazyImport pattern:
- Lazy loads all components with error handling
- Provides loading fallback
- Follows accessibility standards (ARIA)

## 🚀 Usage

### Accessing BridgeLink

Navigate to `/bridgelink` in the application to access the BridgeLink Integration Core dashboard.

### Publishing Events

```typescript
import { publishEvent } from "@/lib/mqtt/publisher";

publishEvent("nautilus/bridgelink/update", {
  type: "status_change",
  data: { ... }
});
```

### Subscribing to Updates

```typescript
import { subscribeBridgeStatus } from "@/lib/mqtt/publisher";

useEffect(() => {
  const client = subscribeBridgeStatus((data) => {
    console.log("Status update:", data);
  });
  
  return () => client.disconnect();
}, []);
```

## 🔐 Environment Variables

Required environment variables for BridgeLink:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt
```

## 🎨 UI Components

All components use the project's design system:
- **Primary color** - `text-primary` for icons and highlights
- **Cards** - Standard `Card`, `CardHeader`, `CardTitle`, `CardContent`
- **Buttons** - Tailwind utility classes with theme colors
- **Icons** - Lucide React icons (Wifi, RefreshCw, Activity, Cloud, Database)

## 📊 MQTT Topics

### Published Topics
- `nautilus/bridgelink/update` - General updates
- `nautilus/bridgelink/manual-sync` - Manual sync triggers

### Subscribed Topics
- `nautilus/bridgelink/status` - Connection status updates
- `nautilus/forecast/telemetry` - Forecast data
- `nautilus/alerts` - System alerts

## 🧪 Testing

The implementation has been verified to:
- ✅ Build successfully with Vite
- ✅ Pass TypeScript type checking
- ✅ Use proper CSS variables from theme
- ✅ Follow safeLazyImport pattern
- ✅ Include proper error handling

## 🔄 Network Resilience

The system includes automatic fallback mechanisms:

1. **MQTT Client**: Automatic reconnection with exponential backoff (up to 5 attempts)
2. **Supabase**: Automatic channel resubscription on reconnection
3. **Component Lifecycle**: Proper cleanup on unmount to prevent memory leaks

## 📈 Future Enhancements

Potential improvements for future versions:

- [ ] Add offline queue for events when network is unavailable
- [ ] Implement data compression for large payloads
- [ ] Add metrics dashboard with historical data
- [ ] Implement custom MQTT broker for better control
- [ ] Add end-to-end encryption for sensitive data
- [ ] Create webhook integration for external systems

## 🐛 Troubleshooting

### MQTT Connection Issues
- Verify `VITE_MQTT_URL` is correctly set
- Check browser console for connection errors
- Ensure firewall allows WebSocket connections

### Supabase Sync Issues
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY`
- Check if the `telemetry` table exists in Supabase
- Verify RLS policies allow real-time subscriptions

### Component Loading Issues
- Check browser console for module loading errors
- Clear browser cache and rebuild
- Verify all component imports are correct

## 📝 Commit Messages

Implementation was committed with:
- `feat: add BridgeLink Integration Core with MQTT + Supabase sync components`
- `fix: update BridgeLink components to use standard CSS variables`

## 👥 Contributors

Implementation completed following Patch 13 specifications for the Nautilus system.

---

**Last Updated**: 2025-10-21
**Version**: 1.0.0
**Status**: ✅ Production Ready
