# 🧩 Nautilus One - Component Library

> Design system and component documentation

## Quick Start

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
```

---

## 📦 Core UI Components

### Button
Primary action trigger with multiple variants.

```tsx
<Button variant="default">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="secondary">Secondary</Button>
```

**Props:**
| Prop | Type | Default |
|------|------|---------|
| variant | `default` \| `outline` \| `ghost` \| `destructive` \| `secondary` | `default` |
| size | `default` \| `sm` \| `lg` \| `icon` | `default` |
| disabled | boolean | false |
| asChild | boolean | false |

---

### Card
Container for grouped content.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

---

### Badge
Status indicators and labels.

```tsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Error</Badge>
```

---

## 🎨 Design Tokens

### Colors (HSL)
```css
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--primary: 221.2 83.2% 53.3%;
--secondary: 210 40% 96.1%;
--muted: 210 40% 96.1%;
--accent: 210 40% 96.1%;
--destructive: 0 84.2% 60.2%;
```

### Dark Mode
```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
}
```

---

## 🧭 Maritime Components

### VesselCard
Displays vessel information with status.

```tsx
import { VesselCard } from "@/components/maritime/VesselCard";

<VesselCard
  vessel={{
    id: "1",
    name: "MV Nautilus",
    type: "cargo",
    status: "active",
    position: { lat: -23.55, lng: -46.63 }
  }}
  onSelect={handleSelect}
/>
```

---

### WeatherWidget
Real-time weather display for maritime ops.

```tsx
import { WeatherWidget } from "@/components/weather/WeatherWidget";

<WeatherWidget
  location={{ lat: -23.55, lng: -46.63 }}
  compact={false}
/>
```

---

### CrewMemberCard
Crew information display.

```tsx
import { CrewMemberCard } from "@/components/crew/CrewMemberCard";

<CrewMemberCard
  member={{
    id: "1",
    name: "John Doe",
    role: "Captain",
    certifications: ["STCW", "MLC"],
    status: "on_duty"
  }}
/>
```

---

## 🤖 AI Components

### GlobalVoiceButton
Voice interaction trigger (always visible).

```tsx
import { GlobalVoiceButton } from "@/components/ai/GlobalVoiceButton";

// Automatically added to layout
<GlobalVoiceButton />
```

---

### AIChatPanel
AI assistant chat interface.

```tsx
import { AIChatPanel } from "@/components/ai/AIChatPanel";

<AIChatPanel
  contextType="vessel"
  contextId="vessel-123"
  onInsight={handleInsight}
/>
```

---

### CognitiveDashboard
AI metrics and decisions visualization.

```tsx
import { CognitiveDashboard } from "@/components/ai/CognitiveDashboard";

<CognitiveDashboard showDecisions showMemory />
```

---

## 📊 Data Visualization

### MetricsCard
KPI display with trend indicators.

```tsx
import { MetricsCard } from "@/components/dashboard/MetricsCard";

<MetricsCard
  title="Active Vessels"
  value={42}
  trend={+5.2}
  icon={Ship}
/>
```

---

### RiskGauge
Risk level visualization.

```tsx
import { RiskGauge } from "@/components/risk/RiskGauge";

<RiskGauge
  level="medium"
  score={65}
  factors={["weather", "maintenance"]}
/>
```

---

## ♿ Accessibility

All components follow WCAG 2.1 AA guidelines:

- ✅ Minimum contrast ratio 4.5:1
- ✅ Keyboard navigation support
- ✅ ARIA labels on interactive elements
- ✅ Focus indicators
- ✅ Screen reader compatibility

---

## 📱 Responsive Design

Components adapt to screen sizes:

| Breakpoint | Size |
|------------|------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

---

## 🚀 Storybook (Coming Soon)

Interactive component explorer at:
```
npm run storybook
```

---

*Documentation generated: 2025-12-28*
