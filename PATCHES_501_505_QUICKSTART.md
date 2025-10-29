# PATCHES 501-505 Quick Start Guide

**Maritime Operations Modules - Ready to Use!**

---

## 🚀 Quick Start

### Prerequisites

Make sure these environment variables are set in your `.env` file:

```bash
# Required for all modules
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

# Required for Satellite Tracker & Route Planner
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Required for Route Planner AI (dev only - see security notes)
VITE_OPENAI_API_KEY=your_openai_key

# Required for Weather features
VITE_OPENWEATHER_API_KEY=your_openweather_key
```

---

## 📦 Usage Examples

### 1. Satellite Tracker 🛰️

```typescript
import { SatelliteDashboard } from '@/modules/satellite-tracker';

function SatelliteTrackerPage() {
  return <SatelliteDashboard />;
}
```

**Features:**
- Real-time satellite tracking
- Interactive global map
- Orbit visualization
- Coverage area display
- Automated alerts

**Route**: `/satellite-tracker`

---

### 2. Route Planner with AI 🗺️

```typescript
import { routeAIService } from '@/modules/route-planner/services/routeAIService';

// Get AI-powered route suggestions
async function planRoute() {
  const suggestions = await routeAIService.generateRouteSuggestions({
    origin: "Port of Santos",
    destination: "Port of Rotterdam",
    distance: 5800,
    weatherConditions: [/* weather data */],
    currentSpeed: 15,
    fuelConsumption: 50
  });

  console.log('Recommended speed:', suggestions.recommendedSpeed);
  console.log('Fuel optimization:', suggestions.fuelOptimization);
  console.log('Safety recommendations:', suggestions.safetyRecommendations);
}
```

**Features:**
- AI-powered optimization
- Weather impact analysis
- Fuel savings calculator
- Safety recommendations
- Alternative routes

**Route**: `/route-planner`

---

### 3. Drone Commander 🚁

```typescript
import { DroneControlPanel } from '@/modules/drone-commander/components/DroneControlPanel';

function DroneCommanderPage() {
  const handleCommand = (droneId: string, command: string) => {
    console.log(`Executing ${command} on drone ${droneId}`);
  };

  return (
    <DroneControlPanel
      drones={drones}
      selectedDrone={selectedDroneId}
      onCommand={handleCommand}
      onSelectDrone={setSelectedDroneId}
    />
  );
}
```

**Commands:**
- `takeoff` - Launch drone
- `land` - Land drone
- `patrol` - Start patrol mission
- `return` - Return to base
- `emergency` - Emergency landing

**Route**: `/drone-commander`

---

### 4. Navigation Copilot 🧭

```typescript
import { enhancedNavigationService } from '@/modules/navigation-copilot/services/enhancedNavigationService';

// Text command
async function handleTextCommand(text: string) {
  const response = await enhancedNavigationService.processCommand({
    command: text,
    type: 'text',
    timestamp: new Date()
  });

  console.log('Response:', response.text);
  
  if (response.action) {
    // Navigate or perform action
    navigate(response.action.target);
  }
}

// Voice command
async function handleVoiceCommand() {
  try {
    const transcript = await enhancedNavigationService.startVoiceRecognition();
    const response = await enhancedNavigationService.processCommand({
      command: transcript,
      type: 'voice',
      timestamp: new Date()
    });

    // Speak response
    await enhancedNavigationService.speakResponse(response.text);
  } catch (error) {
    console.error('Voice recognition failed:', error);
  }
}
```

**Supported Commands:**
- "Planejar nova rota"
- "Exibir previsão climática"
- "Abrir satélites"
- "Controle de missão"
- "Comandar drones"

**Route**: `/navigation-copilot`

---

### 5. Mission Control 🎯

```typescript
import { MissionControlConsolidation } from '@/modules/mission-control/components/MissionControlConsolidation';

function MissionControlPage() {
  return <MissionControlConsolidation />;
}
```

**Features:**
- Unified dashboard with 4 tabs
- Mission workflows
- Real-time logs
- AI autonomy engine
- Tactical analysis
- PDF report export

**Tabs:**
1. **Workflows** - Mission planning and execution
2. **Logs** - Real-time operation logs
3. **AI Autonomy** - Autonomous operations
4. **Analytics** - Performance metrics

**Route**: `/mission-control`

---

## 🎨 UI Components

### Statistics Cards

All modules include statistics cards:

```typescript
<Card>
  <CardHeader>
    <CardTitle>Active Satellites</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{count}</div>
  </CardContent>
</Card>
```

### Interactive Maps

Satellite Tracker and Route Planner use Mapbox:

```typescript
<SatelliteMap satellite={selectedSatellite} />
```

### Real-time Updates

Updates happen automatically every 30 seconds:

```typescript
useEffect(() => {
  const interval = setInterval(updatePositions, 30000);
  return () => clearInterval(interval);
}, []);
```

---

## 🗄️ Database Queries

### Fetch Satellites

```typescript
import { supabase } from '@/integrations/supabase/client';

const { data: satellites } = await supabase
  .from('satellites')
  .select('*')
  .eq('is_active', true)
  .order('name');
```

### Log AI Command

```typescript
await supabase.from('ai_commands').insert({
  command_text: 'Planejar nova rota',
  command_type: 'voice',
  user_id: user.id,
  executed_at: new Date().toISOString()
});
```

### Get Mission Statistics

```typescript
const { data: missions } = await supabase
  .from('missions')
  .select('status')
  .eq('user_id', user.id);

const stats = {
  total: missions.length,
  active: missions.filter(m => m.status === 'active').length,
  completed: missions.filter(m => m.status === 'completed').length
};
```

---

## 🔧 Customization

### Change Update Interval

```typescript
// In SatelliteDashboard.tsx
const interval = setInterval(updatePositions, 60000); // 1 minute
```

### Customize Map Style

```typescript
// In SatelliteMap.tsx
style: 'mapbox://styles/mapbox/dark-v11'
```

### Add Custom Mission Types

```typescript
// In MissionControlConsolidation.tsx
<Card className="p-4 hover:bg-muted/50 cursor-pointer">
  <h3 className="font-semibold mb-2">Custom Mission</h3>
  <p className="text-sm text-muted-foreground">
    Your custom mission description
  </p>
</Card>
```

---

## 📊 Export Reports

### PDF Export

```typescript
import jsPDF from 'jspdf';

const exportReport = () => {
  const doc = new jsPDF();
  doc.text('Mission Report', 20, 20);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
  doc.save('mission-report.pdf');
};
```

### CSV Export

```typescript
const exportCSV = (data: any[]) => {
  const csv = data.map(row => Object.values(row).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.csv';
  a.click();
};
```

---

## 🐛 Troubleshooting

### Maps Not Loading?

Check Mapbox token:
```typescript
console.log('Mapbox token:', import.meta.env.VITE_MAPBOX_ACCESS_TOKEN);
```

### AI Not Responding?

1. Check OpenAI API key is set
2. Verify API quota hasn't been exceeded
3. Check browser console for errors

### Voice Recognition Not Working?

1. Grant microphone permissions
2. Use HTTPS (required for Web Speech API)
3. Check browser compatibility:
   - Chrome ✅
   - Edge ✅
   - Firefox ⚠️ (limited support)
   - Safari ⚠️ (limited support)

### Real-time Updates Not Working?

Check Supabase connection:
```typescript
const { error } = await supabase
  .from('satellites')
  .select('*')
  .limit(1);

if (error) console.error('Supabase error:', error);
```

---

## 📱 Mobile Support

All modules are responsive and work on mobile devices:

```css
/* Responsive grid */
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
```

For best mobile experience:
- Use in landscape mode for maps
- Voice commands work great on mobile
- Touch gestures supported on all maps

---

## 🔒 Security Notes

### Production Deployment

⚠️ **Important**: Before deploying to production:

1. Move OpenAI API calls to backend
2. Implement rate limiting
3. Set up monitoring and alerts
4. Review all RLS policies

See `PATCHES_501_505_SECURITY_REVIEW.md` for details.

---

## 📚 More Information

- Full Implementation: `PATCHES_501_505_MARITIME_OPERATIONS_COMPLETE.md`
- Security Review: `PATCHES_501_505_SECURITY_REVIEW.md`
- API Documentation: Individual module READMEs

---

## ✅ Checklist for First Use

- [ ] Set all environment variables
- [ ] Verify Supabase connection
- [ ] Test Mapbox integration
- [ ] Try voice commands (if needed)
- [ ] Check browser console for errors
- [ ] Test on different screen sizes

---

**Ready to sail! 🚢**

For support, check the full documentation files or open an issue.
