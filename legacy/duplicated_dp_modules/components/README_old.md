# DP Intelligence Components

This directory contains components for the DP Intelligence Center module.

## Components

### `dp-intelligence-center.tsx`

Main component for the DP Intelligence Center feature.

**Features:**
- Statistics dashboard showing Total, Analyzed, Pending, and Critical incident counts
- Advanced filtering by DP Class (DP-1, DP-2, DP-3)
- Status filtering (Analyzed/Pending)
- Full-text search across title, vessel, location, and tags
- Color-coded severity badges (Critical, High, Medium, Low)
- Integrated AI analysis modal with 5-tab interface
- Responsive design for mobile, tablet, and desktop

**Usage:**
```tsx
import DPIntelligenceCenter from "@/components/dp-intelligence/dp-intelligence-center";

function MyPage() {
  return <DPIntelligenceCenter />;
}
```

**API Integration:**
- Fetches incidents from `/functions/v1/dp-intel-feed`
- Calls AI analysis via `/functions/v1/dp-intel-analyze`
- Falls back to demo data if API unavailable

**State Management:**
- Uses React hooks (useState, useEffect)
- No external state management required
- Fully self-contained

## Testing

Tests are located in `src/tests/components/dp-intelligence/`

Run tests:
```bash
npm test src/tests/components/dp-intelligence
```

## Documentation

- **Implementation Guide:** `DP_INTELLIGENCE_CENTER_IMPLEMENTATION_COMPLETE.md`
- **Visual Guide:** `DP_INTELLIGENCE_CENTER_VISUAL_GUIDE.md`
- **Quick Reference:** `DP_INTELLIGENCE_CENTER_QUICKREF.md`

## Related Components

- `/components/dp/IncidentAiModal.tsx` - Legacy modal used by PEOTRAM module
- `/components/dp/IncidentCards.tsx` - Alternative card display (not used in Intelligence Center)

## Version

Current version: 2.0.0  
Last updated: October 15, 2025
