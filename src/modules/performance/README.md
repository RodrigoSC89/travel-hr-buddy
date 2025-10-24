# Performance Dashboard Module - PATCH 95.0

## 📊 Overview

The Performance Dashboard is a comprehensive operational analytics module that provides real-time KPI monitoring, AI-powered insights, and performance tracking for maritime operations. This module integrates with Supabase for data storage and the AI Kernel for intelligent analysis.

## 🎯 Features

### KPI Monitoring
- **Fuel Efficiency**: Real-time tracking of fuel consumption efficiency across missions
- **Navigation Hours**: Total hours navigated with mission count
- **Productivity**: Overall operational productivity percentage
- **Downtime**: Fleet downtime percentage with cause breakdown

### AI-Powered Analysis
- Intelligent performance evaluation using the AI Kernel
- Automatic status classification (Optimal/Average/Critical)
- Contextual insights and recommendations
- Confidence scores for AI predictions

### Data Visualization
- **Fuel Efficiency Chart** (Bar Chart): Efficiency by mission with status labels
- **Productivity Trend Chart** (Line Chart): Navigation hours over time periods
- **Downtime Analysis Chart** (Pie Chart): Breakdown of downtime by cause

### Advanced Filtering
- **Period Filter**: 7, 30, or 90 days
- **Vessel Filter**: All vessels or specific vessel selection
- **Mission Type Filter**: All types or specific mission categories

### PDF Export
- One-click PDF report generation
- Professional formatting with branded styling
- Includes all KPIs, charts data, and AI insights
- Color-coded status indicators

## 📁 File Structure

```
src/
├── modules/
│   └── performance/
│       └── PerformanceDashboard.tsx    # Main dashboard component
├── lib/
│   ├── insights/
│   │   └── performance.ts              # Performance evaluation helpers
│   └── pdf/
│       └── performance-report.ts       # PDF export utility
└── tests/
    └── performance-dashboard.test.ts   # Test suite (17 tests)
```

## 🚀 Usage

### Basic Implementation

```tsx
import PerformanceDashboard from '@/modules/performance/PerformanceDashboard';

function App() {
  return <PerformanceDashboard />;
}
```

### Using Performance Helpers

```typescript
import {
  getPerformanceStatus,
  getPerformanceAnalysis,
  comparePerformance,
  calculateKPIScore
} from '@/lib/insights/performance';

// Evaluate performance status
const metrics = {
  fuelEfficiency: 94.2,
  navigationHours: 156,
  productivity: 87.5,
  downtime: 4.3,
  totalMissions: 23
};

const status = getPerformanceStatus(metrics);
// Returns: 'optimal' | 'average' | 'critical'

// Get detailed analysis
const analysis = getPerformanceAnalysis(metrics);
// Returns: { status, issues, recommendations, metrics, timestamp }

// Compare with historical data
const trends = comparePerformance(currentMetrics, historicalMetrics);
// Returns: { fuelEfficiency, productivity, downtime } with trends

// Calculate KPI score
const score = calculateKPIScore(metrics);
// Returns: number (0-100)
```

### AI Integration

```typescript
import { runAIContext } from '@/ai/kernel';

const aiResponse = await runAIContext({
  module: 'operations.performance',
  action: 'analyze',
  context: {
    metrics: performanceMetrics,
    period: '7'
  }
});

console.log(aiResponse.message); // AI-generated insight
console.log(aiResponse.confidence); // Confidence score
```

### PDF Export

```typescript
import { exportPerformancePDF } from '@/lib/pdf/performance-report';

await exportPerformancePDF({
  metrics,
  fuelData,
  productivityData,
  downtimeData,
  aiInsight,
  performanceStatus,
  period: '7',
  vessel: 'all',
  missionType: 'all'
});
```

## 📊 Data Models

### PerformanceMetrics

```typescript
interface PerformanceMetrics {
  fuelEfficiency: number;      // Percentage (0-100)
  navigationHours: number;     // Total hours
  productivity: number;        // Percentage (0-100)
  downtime: number;           // Percentage (0-100)
  totalMissions: number;      // Count
}
```

### ChartData

```typescript
interface ChartData {
  name: string;    // Label for the data point
  value: number;   // Numerical value
  label?: string;  // Optional status label
}
```

## 🔧 Configuration

### Performance Thresholds

The module uses configurable thresholds for status evaluation:

```typescript
const THRESHOLDS = {
  optimal: {
    fuelEfficiency: 90,  // >= 90% is optimal
    productivity: 85,    // >= 85% is optimal
    downtime: 5,        // <= 5% is optimal
  },
  average: {
    fuelEfficiency: 75,  // 75-89% is average
    productivity: 70,    // 70-84% is average
    downtime: 10,       // 5-10% is average
  },
  critical: {
    fuelEfficiency: 60,  // < 75% is critical
    productivity: 60,    // < 70% is critical
    downtime: 20,       // > 10% is critical
  },
};
```

### KPI Scoring Weights

```typescript
const weights = {
  fuelEfficiency: 0.3,  // 30% weight
  productivity: 0.4,    // 40% weight
  downtime: 0.3,       // 30% weight
};
```

## 🗄️ Database Schema

The module queries the following Supabase tables:

### fleet_logs
```sql
- id: uuid
- vessel_id: uuid
- created_at: timestamp
- status: text
- location: text
```

### mission_activities
```sql
- id: uuid
- mission_id: uuid
- created_at: timestamp
- activity_type: text
- duration: integer
```

### fuel_usage
```sql
- id: uuid
- vessel_id: uuid
- created_at: timestamp
- amount: decimal
- efficiency: decimal
```

**Note:** The module includes fallback to simulated data if these tables don't exist.

## 🧪 Testing

Run the test suite:

```bash
npm run test -- src/tests/performance-dashboard.test.ts
```

**Test Coverage:**
- ✅ Performance status evaluation (optimal/average/critical)
- ✅ Detailed analysis with issues and recommendations
- ✅ Trend comparison (improving/stable/declining)
- ✅ KPI score calculation
- ✅ AI integration with mocked responses
- ✅ Data consistency validation
- ✅ PDF export data preparation

**17 tests, all passing ✅**

## 📝 Technical Logging

All operations are logged for audit purposes:

```typescript
// Dashboard access
console.log('[Performance Dashboard] Loading data', {
  period: selectedPeriod,
  vessel: selectedVessel,
  missionType: selectedMissionType,
  timestamp: new Date().toISOString()
});

// Data loaded
console.log('[Performance Dashboard] Data loaded successfully', {
  metricsCount: Object.keys(metrics).length,
  aiConfidence: aiResponse.confidence,
  status
});

// PDF export
console.log('[Performance Dashboard] PDF exported', {
  timestamp: new Date().toISOString()
});
```

## 🎨 UI Components

The dashboard uses the following UI components from the design system:

- `Card`, `CardContent`, `CardHeader`, `CardTitle` - Container components
- `Button` - Action buttons
- `Badge` - Status indicators
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` - Filter controls
- `Recharts` components - Data visualization

## 🔐 Security

- All database queries use parameterized inputs
- User permissions are respected through Supabase RLS
- No sensitive data is logged
- PDF exports are client-side only

## 🚀 Performance

- Lazy loading of chart components
- Memoized calculations for KPI scores
- Debounced filter updates
- Optimized Recharts rendering

## 📚 Dependencies

```json
{
  "recharts": "^2.15.4",
  "html2pdf.js": "^0.12.1",
  "date-fns": "^3.6.0",
  "@supabase/supabase-js": "^2.57.4"
}
```

## 🐛 Troubleshooting

### Dashboard shows "Loading..." indefinitely
- Check Supabase connection
- Verify AI Kernel is running
- Check browser console for errors

### PDF export fails
- Ensure html2pdf.js is properly loaded
- Check if metrics data is available
- Verify browser popup blockers

### Charts not rendering
- Ensure Recharts is installed
- Check if data format matches ChartData interface
- Verify ResponsiveContainer has proper height

## 📖 Related Documentation

- [AI Kernel Documentation](../../../ai/kernel.ts)
- [Supabase Integration](../../../integrations/supabase/client.ts)
- [PDF Export Utilities](../../lib/pdf.ts)

## 🤝 Contributing

When contributing to this module:

1. Run tests before submitting: `npm run test`
2. Ensure TypeScript compilation: `npm run type-check`
3. Follow existing code patterns
4. Update this README if adding new features
5. Add tests for new functionality

## 📄 License

Part of the Nautilus One - Travel HR Buddy project.

---

**PATCH 95.0 Implementation** - Performance Dashboard Module  
Created: 2025-10-24  
Status: ✅ Production Ready
