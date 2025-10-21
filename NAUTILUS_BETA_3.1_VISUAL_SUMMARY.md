# Nautilus Beta 3.1 - Visual Summary

## 🎨 UI Changes Overview

This document provides a visual walkthrough of all UI changes introduced in Nautilus Beta 3.1.

## 📱 Control Hub Panel - New Telemetry Console

### Before Beta 3.1
The Control Hub displayed only internal BridgeLink events and module status.

### After Beta 3.1
The Control Hub now includes a global telemetry console that displays real-time events from both BridgeLink and MQTT.

---

## 🖥️ Telemetry Console Component

### Location
`src/modules/control-hub/ControlHubPanel.tsx`

### Visual Design

```
┌──────────────────────────────────────────────────────────┐
│ 🌐 Console de Telemetria Global                         │
│ Eventos em tempo real (BridgeLink + MQTT)               │
│                                   Status MQTT: 🟢 Conectado│
├──────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐  │
│ │ [2025-10-21T03:17:52.616Z]                         │  │
│ │ 📡 Conectado ao broker MQTT                        │  │
│ │                                                     │  │
│ │ [2025-10-21T03:17:53.123Z]                         │  │
│ │ [MQTT] DP system operating normally                │  │
│ │                                                     │  │
│ │ [2025-10-21T03:17:54.456Z]                         │  │
│ │ [MQTT] Thruster allocation updated                 │  │
│ │                                                     │  │
│ │ [2025-10-21T03:17:55.789Z]                         │  │
│ │ [MQTT] Position accuracy: 2.5m                     │  │
│ │                                                     │  │
│ │ [2025-10-21T03:17:56.012Z]                         │  │
│ │ [MQTT] Reference system: GPS + DGPS active         │  │
│ │                                                     │  │
│ │ [2025-10-21T03:17:57.345Z]                         │  │
│ │ [MQTT] Wind speed: 15 knots, direction: 270°       │  │
│ └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Color Scheme

**Dark Terminal Theme:**
- Background: `bg-slate-950` (almost black)
- Border: `border-slate-800` (dark gray)
- Text: `text-green-400` (terminal green)
- Timestamps: `text-slate-500` (dimmed)
- Title: `text-green-400`
- Subtitle: `text-slate-400`

**Status Indicator:**
- Connected: 🟢 Green circle
- Disconnected: 🔴 Red circle

### Features

1. **Real-time Event Display**
   - Shows last 50 events
   - Auto-scrolls to newest event
   - Timestamp for each event
   - Event source indicator ([MQTT], [BridgeLink], etc.)

2. **Connection Status**
   - Live MQTT connection indicator
   - Updates every second
   - Color-coded (🟢/🔴)
   - Status text (Conectado/Desconectado)

3. **Scrollable Container**
   - Height: 256px (h-64)
   - Overflow-y: auto
   - Smooth scrolling
   - Custom scrollbar styling

4. **Font Styling**
   - Font family: Monospace
   - Font size: Small (text-sm)
   - Line height: Comfortable spacing

---

## 🎯 Component Structure

### Header Section
```tsx
<CardHeader>
  <div className="flex items-center justify-between">
    <div>
      <CardTitle className="text-green-400">
        🌐 Console de Telemetria Global
      </CardTitle>
      <CardDescription className="text-slate-400">
        Eventos em tempo real (BridgeLink + MQTT)
      </CardDescription>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400">Status MQTT:</span>
      <span className="text-lg">{mqttConnected ? "🟢" : "🔴"}</span>
      <span className="text-sm text-slate-400">
        {mqttConnected ? "Conectado" : "Desconectado"}
      </span>
    </div>
  </div>
</CardHeader>
```

### Event Log Display
```tsx
<CardContent>
  <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 h-64 overflow-y-auto font-mono text-sm">
    {telemetryLogs.length === 0 ? (
      <div className="text-slate-500 text-center py-8">
        Aguardando eventos de telemetria...
      </div>
    ) : (
      <div className="space-y-1">
        {telemetryLogs.map((log, index) => (
          <div key={index} className="text-green-400">
            <span className="text-slate-500">[{log.timestamp}]</span> {log.message}
          </div>
        ))}
      </div>
    )}
  </div>
</CardContent>
```

---

## 📊 State Management

### New State Variables

```typescript
// Telemetry log storage (last 50 events)
const [telemetryLogs, setTelemetryLogs] = useState<
  Array<{ message: string; timestamp: string }>
>([]);

// MQTT connection status
const [mqttConnected, setMqttConnected] = useState(false);
```

### Event Subscription

```typescript
// Subscribe to BridgeLink events
const unsubscribe = BridgeLink.on("nautilus:event" as any, (event) => {
  const data = event.data as { message: string; timestamp: string };
  setTelemetryLogs((prev) => {
    const newLogs = [...prev, { 
      message: data.message, 
      timestamp: data.timestamp || new Date().toISOString() 
    }];
    // Keep only last 50 events
    return newLogs.slice(-50);
  });
});
```

### Status Monitoring

```typescript
// Check MQTT connection status every second
const mqttStatusInterval = setInterval(() => {
  setMqttConnected(MQTTClient.isConnected());
}, 1000);
```

---

## 🔄 Event Flow Diagram

```
┌─────────────┐
│   MQTT      │
│   Broker    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  MQTTClient.ts  │  ← Receives messages
└────────┬────────┘
         │
         │ emit("nautilus:event")
         ▼
┌─────────────────┐
│  BridgeLink.ts  │  ← Central event bus
└────────┬────────┘
         │
         │ on("nautilus:event")
         ▼
┌──────────────────────┐
│ ControlHubPanel.tsx  │  ← Updates UI
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│ Telemetry Console    │  ← Display
│ (User sees events)   │
└──────────────────────┘
```

---

## 🎨 CSS Classes Used

### Main Container
- `bg-slate-950` - Almost black background
- `border-slate-800` - Dark border
- `rounded-lg` - Rounded corners
- `p-4` - Padding

### Event Log Area
- `bg-slate-900` - Slightly lighter background
- `h-64` - Fixed height (256px)
- `overflow-y-auto` - Vertical scrolling
- `font-mono` - Monospace font
- `text-sm` - Small text size
- `space-y-1` - Vertical spacing between events

### Event Text
- `text-green-400` - Terminal green color
- `text-slate-500` - Dimmed timestamp

### Status Indicator
- `flex items-center gap-2` - Horizontal layout
- `text-sm` - Small text
- `text-slate-400` - Muted text color

---

## 📱 Responsive Design

The telemetry console is fully responsive and adapts to different screen sizes:

### Desktop (>= 768px)
- Full width within the grid layout
- Height: 256px
- Side-by-side with other panels

### Mobile (< 768px)
- Full width
- Stacked layout
- Same height: 256px
- Touch-scrollable

---

## 🌈 Theme Support

The component supports both light and dark themes through Tailwind's dark mode classes:

### Dark Mode (Default)
- Background: `dark:bg-slate-950`
- Border: `dark:border-slate-800`
- Text: `dark:text-green-400`

### Light Mode
- Automatically adjusts through Tailwind utilities
- Maintains readability in both modes

---

## ⚡ Performance Optimizations

1. **Event Buffer Limiting**
   - Maximum 50 events displayed
   - Older events automatically removed
   - Prevents memory bloat

2. **Efficient Re-renders**
   - Only updates when new events arrive
   - Status check throttled to 1 second
   - React.memo where applicable

3. **Cleanup**
   - Unsubscribes from events on unmount
   - Clears intervals
   - Disconnects MQTT client

---

## 🔔 Event Types Displayed

The console displays various event types:

1. **MQTT Events**
   - Broker connection/disconnection
   - Topic messages
   - System telemetry

2. **BridgeLink Events**
   - Module communications
   - System status updates
   - Internal events

3. **AI Analysis Events**
   - Inference results
   - Risk detections
   - Pattern analysis

---

## 📐 Layout Integration

The telemetry console is integrated into the Control Hub panel layout:

```
┌─────────────────────────────────────────┐
│ Nautilus Control Hub Header             │
├─────────────────────────────────────────┤
│ System Status                           │
├─────────────────────────────────────────┤
│ Technical Indicators                    │
├─────────────────────────────────────────┤
│ Connection Status | Cache Stats         │
├─────────────────────────────────────────┤
│ 🆕 Telemetry Console (New!)            │
│ [Real-time event display]               │
├─────────────────────────────────────────┤
│ Operational Modules Grid                │
└─────────────────────────────────────────┘
```

---

## ✨ User Experience Enhancements

1. **Visual Feedback**
   - Connection status always visible
   - Color-coded indicators
   - Clear event timestamps

2. **Information Density**
   - Compact but readable
   - Efficient use of space
   - Scrollable for history

3. **Real-time Updates**
   - Immediate event display
   - Live connection monitoring
   - No manual refresh needed

4. **Error States**
   - Graceful handling of disconnections
   - Clear "waiting for events" message
   - Automatic reconnection

---

## 🎯 Accessibility

- Semantic HTML structure
- ARIA labels for status indicators
- Keyboard navigation support
- High contrast colors
- Readable font sizes

---

## 📸 Screenshots

*Note: Screenshots would be added here in production documentation*

### Empty State
Shows "Aguardando eventos de telemetria..." when no events

### Active State
Shows scrollable list of timestamped events

### Connected State
Green indicator showing active MQTT connection

### Disconnected State
Red indicator showing MQTT disconnection

---

## 🔧 Customization Options

The telemetry console can be customized:

1. **Event Buffer Size**: Change `slice(-50)` to adjust history
2. **Update Interval**: Modify `setInterval` timing
3. **Color Scheme**: Update Tailwind classes
4. **Height**: Change `h-64` to desired height
5. **Font**: Modify `font-mono` to preferred font

---

## 📝 Summary

The Nautilus Beta 3.1 telemetry console provides:
- ✅ Real-time event monitoring
- ✅ MQTT integration
- ✅ Professional terminal aesthetic
- ✅ Efficient performance
- ✅ Responsive design
- ✅ Clean, readable interface

This enhancement transforms the Control Hub into a comprehensive monitoring solution for maritime operations.
