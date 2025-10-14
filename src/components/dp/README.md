# DP Incident Cards Component

## Overview

The DP Incident Cards component displays a grid of incident cards related to Dynamic Positioning (DP) systems in maritime operations. It fetches data from an API endpoint and presents incidents with detailed information including vessel data, classification, location, and tags.

## Features

✅ **API Integration**: Fetches incident data from `/api/dp/intel/feed`
✅ **Responsive Grid Layout**: 1 column on mobile, 2 columns on desktop (md breakpoint)
✅ **Visual Filters**: Displays class, vessel, and location as badge filters
✅ **Tag System**: Shows incident tags with secondary badges
✅ **AI Analysis**: "Analisar com IA" button saves incident data to localStorage
✅ **External Links**: Direct links to IMCA incident reports
✅ **Demo Data**: Includes fallback demo data when API is unavailable

## Component Structure

### Interface

```typescript
interface Incident {
  id: string;
  title: string;
  date: string;
  vessel: string;
  location: string;
  class_dp: string;
  rootCause: string;
  tags: string[];
  summary: string;
  link: string;
}
```

### Card Layout

Each incident card includes:
- **Header**: Title (blue) and date
- **Summary**: Brief description of the incident
- **Badges**: 
  - Outline badges for Class, Vessel, and Location
  - Secondary badges for custom tags
- **Actions**:
  - "Ver relatório" button with external link
  - "Analisar com IA" button that stores incident in localStorage

## Usage

### Basic Usage

```tsx
import IncidentCards from '@/components/dp/IncidentCards';

function MyPage() {
  return (
    <div>
      <h1>DP Incidents</h1>
      <IncidentCards />
    </div>
  );
}
```

### In a Module Page

```tsx
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import IncidentCards from "@/components/dp/IncidentCards";

function DPIncidents() {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={AlertTriangle}
        title="DP Incident Intelligence Feed"
        description="Base de conhecimento de incidentes DP com análise por IA"
        gradient="indigo"
        badges={[
          { icon: Shield, label: "IMCA Database" },
          { icon: FileText, label: "Relatórios Completos" },
          { icon: TrendingUp, label: "Análise IA" }
        ]}
      />
      <div className="container mx-auto p-6">
        <IncidentCards />
      </div>
    </ModulePageWrapper>
  );
}
```

## API Endpoint

The component expects the API endpoint `/api/dp/intel/feed` to return:

```json
{
  "incidents": [
    {
      "id": "1",
      "title": "Incident title",
      "date": "2024-09-15",
      "vessel": "Vessel Name",
      "location": "Location",
      "class_dp": "DP3",
      "rootCause": "Root cause description",
      "tags": ["Tag1", "Tag2"],
      "summary": "Incident summary",
      "link": "https://example.com/report"
    }
  ]
}
```

## Demo Data

When the API is not available, the component automatically falls back to demo data with 4 sample incidents covering various DP classes and scenarios.

## Styling

The component uses:
- **Tailwind CSS** for responsive layout and spacing
- **shadcn/ui** components (Card, Badge, Button)
- **Blue accent** colors for DP-related branding
- **Border-left accent** (blue-600) on each card

## Testing

Unit tests are available in `src/tests/components/IncidentCards.test.tsx` covering:
- ✅ Rendering of incident cards
- ✅ Display of incident details
- ✅ Multiple cards rendering
- ✅ Tag display
- ✅ Button and link attributes
- ✅ AI analysis button functionality

## Route

The component is accessible via the route `/dp-incidents` in the application.

## Dependencies

- React (hooks: useState, useEffect)
- @/components/ui/card
- @/components/ui/badge
- @/components/ui/button

## Browser Compatibility

- Modern browsers with ES6+ support
- localStorage API support required for AI analysis feature
