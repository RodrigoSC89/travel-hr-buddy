# PATCHES 396-400 Quick Reference

**Version**: 1.0.0 | **Date**: 2025-10-28 | **Status**: ✅ Complete

## 🎯 Quick Links

| Patch | Module | Location | Status |
|-------|--------|----------|--------|
| 396 | Mission Control | `src/modules/mission-control/` | ✅ Complete |
| 397 | Document Templates | `src/modules/documents/templates/` | ✅ Complete |
| 398 | Crew Consolidation | `src/modules/crew/` | ✅ Complete |
| 399 | Satellite Tracker | `src/modules/satellite/services/` | ✅ Complete |
| 400 | Navigation Copilot | `src/modules/navigation-copilot/` | ✅ Complete |

---

## 🚀 Quick Start

### 1. Apply Database Migration
```bash
supabase db push
```

### 2. Configure Environment
```env
# .env
VITE_N2YO_API_KEY=your_n2yo_key
VITE_OPENAI_API_KEY=your_openai_key
```

### 3. Create Storage Bucket
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-documents', 'generated-documents', true);
```

### 4. Import and Use
```typescript
// Mission Control
import { missionService, missionSyncService } from '@/modules/mission-control/services';

// Document Templates
import { documentTemplateService } from '@/modules/documents/templates/document-template-service';

// Crew Management
import { CrewManagement } from '@/modules/crew';

// Satellite Tracker
import { satelliteTrackerService } from '@/modules/satellite/services/satellite-tracker-service';

// Navigation Copilot
import { navigationCopilotService } from '@/modules/navigation-copilot/navigation-copilot-service';
```

---

## 📖 Common Operations

### Mission Control

```typescript
// Create mission
const mission = await missionService.createMission({
  code: 'M-001',
  name: 'Platform Inspection',
  type: 'inspection',
  priority: 'high',
  status: 'planned'
});

// Update status
await missionService.updateMissionStatus(mission.id, 'active');

// Assign crew
await missionService.assignCrew(mission.id, [
  { userId: 'u1', role: 'Inspector', name: 'John' }
]);

// Initialize WebSocket
await missionSyncService.initialize();
missionSyncService.subscribe('id', (update) => {
  console.log('Update:', update);
});
```

### Document Templates

```typescript
// Create template
const template = await documentTemplateService.createTemplate({
  name: 'Report',
  category: 'reports',
  templateType: 'report',
  content: { body: 'Name: {{name}}' },
  placeholders: [{ key: 'name', label: 'Name', type: 'text' }]
});

// Generate document
const doc = await documentTemplateService.generateDocument(
  template.id,
  'My Report',
  { name: 'John Doe' }
);

// Generate PDF
const pdfUrl = await documentTemplateService.generatePDF(doc.id);
```

### Satellite Tracker

```typescript
// Track satellite (ISS)
const position = await satelliteTrackerService.trackSatellite(
  '25544',
  -23.5505,
  -46.6333
);

// Get satellites above
const satellites = await satelliteTrackerService.getSatellitesAbove(
  -23.5505,
  -46.6333,
  0,
  70
);

// Get status
const status = await satelliteTrackerService.getSatelliteStatus('25544');
```

### Navigation Copilot

```typescript
// Create route
const route = await navigationCopilotService.createRoute({
  routeCode: 'R-001',
  name: 'Santos to Rio',
  originLat: -23.9608,
  originLng: -46.3339,
  destinationLat: -22.9068,
  destinationLng: -43.1729,
  waypoints: [],
  distanceNm: 185,
  status: 'planned',
  riskScore: 15
});

// Get AI suggestions
const suggestions = await navigationCopilotService.getRouteSuggestions(route.id);

// Accept suggestion
await navigationCopilotService.respondToSuggestion(
  suggestions[0].id,
  true,
  'Accepted'
);
```

---

## 🗂️ Database Tables

### Mission Control
- `missions` - Mission records
- `mission_alerts` - Mission alerts
- `mission_control_logs` - Telemetry logs
- `mission_status_sync` - WebSocket sync

### Document Templates
- `document_templates` - Template definitions
- `document_template_versions` - Version history
- `generated_documents` - Generated docs

### Satellite Tracker
- `satellite_tracking_logs` - Position logs
- `satellite_status` - Status monitoring

### Navigation Copilot
- `navigation_routes` - Route definitions
- `navigation_ai_suggestions` - AI suggestions
- `navigation_context` - Real-time context

---

## 🔑 Key Features

### PATCH 396
- ✅ WebSocket real-time sync
- ✅ Fleet/Crew/Weather integration
- ✅ Comprehensive logging

### PATCH 397
- ✅ Drag & drop editor support
- ✅ Dynamic placeholders
- ✅ PDF generation
- ✅ Version history

### PATCH 398
- ✅ Unified crew module
- ✅ Backward compatibility
- ✅ No duplicate code

### PATCH 399
- ✅ N2YO API integration
- ✅ Real-time tracking
- ✅ TLE data support
- ✅ Mock fallback

### PATCH 400
- ✅ AI route optimization
- ✅ XAI explanations
- ✅ OpenAI integration
- ✅ Rule-based fallback

---

## 🛠️ Troubleshooting

### Mission Sync Not Working
```typescript
// Check WebSocket connection
await missionSyncService.initialize();

// Verify subscription
missionSyncService.subscribe('test', (u) => console.log(u));
```

### PDF Generation Fails
```typescript
// Check storage bucket exists
// Verify jsPDF is installed
npm install jspdf jspdf-autotable
```

### Satellite Tracking Returns Mock Data
```bash
# Add API key to .env
VITE_N2YO_API_KEY=your_key
```

### AI Suggestions Not Generated
```bash
# Add OpenAI key to .env
VITE_OPENAI_API_KEY=your_key

# Or use rule-based fallback (automatic)
```

---

## 📊 Performance Tips

- Enable database indexes (already in migration)
- Use pagination for large result sets
- Cache satellite positions (5-minute intervals)
- Batch AI requests when possible
- Monitor WebSocket connections

---

## 🔒 Security Notes

- All tables have RLS enabled
- API keys in environment only
- User consent tracked (crew)
- Audit logs for all operations
- Encrypted data transmission

---

## 📱 Migration Guide (Crew)

```typescript
// OLD (deprecated)
import CrewModule from '@/modules/operations/crew';

// NEW (recommended)
import { CrewManagement } from '@/modules/crew';
```

All old imports still work due to compatibility layer.

---

## 📚 Full Documentation

See `PATCHES_396_400_IMPLEMENTATION.md` for complete details.

---

**Need Help?**
1. Check service code comments
2. Review database schema
3. Test with examples above
4. Contact dev team

---

**Status**: ✅ All patches complete and tested  
**Type Check**: ✅ No errors  
**Migration**: Ready to deploy
