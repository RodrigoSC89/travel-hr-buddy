# PATCHES 316-320 Quick Reference Guide

## 🚀 Quick Start

### Setup Instructions

1. **Install Dependencies** (if not already done)
```bash
npm install tesseract.js chart.js react-chartjs-2 date-fns
```

2. **Configure Environment Variables**
```bash
# Add to .env.local (DO NOT commit this file to version control!)
VITE_OPENWEATHER_API_KEY=your_openweather_api_key

# Or add to your deployment platform's environment variables (Vercel, etc.)
```

3. **Run Database Migrations**
```bash
# Using Supabase CLI
supabase db push

# Or apply manually via Supabase Dashboard > SQL Editor
```

4. **Create Storage Buckets**
- Go to Supabase Dashboard > Storage
- Create bucket named: `documents`
- Set permissions for authenticated users

---

## 📦 Module Overview

| Patch | Module | Location | Status |
|-------|--------|----------|--------|
| 316 | Fuel Optimizer | `src/components/fuel/fuel-optimizer.tsx` | ✅ Existing |
| 317 | AI Documents Analyzer | `src/components/documents/ai-documents-analyzer.tsx` | ✅ New |
| 318 | Travel Management | `src/components/travel/` | ✅ Existing |
| 319 | Channel Manager | `src/components/communication/channel-manager.tsx` | ✅ Existing |
| 320 | Weather Dashboard | `src/components/weather/weather-dashboard.tsx` | ✅ New |

---

## 🔌 Component Usage

### Fuel Optimizer

```tsx
import { FuelOptimizer } from "@/components/fuel/fuel-optimizer";

function App() {
  return <FuelOptimizer />;
}
```

**Features:**
- Real-time fuel consumption tracking
- Route optimization with AI
- PDF export
- Interactive charts

---

### AI Documents Analyzer

```tsx
import { AIDocumentsAnalyzer } from "@/components/documents/ai-documents-analyzer";

function App() {
  return <AIDocumentsAnalyzer />;
}
```

**Features:**
- Upload PDF/images
- OCR processing with Tesseract.js
- Entity extraction (emails, dates, amounts, phones, IMO numbers)
- Full-text search

**Supported File Types:**
- PDF
- JPG, JPEG, PNG, GIF, BMP, TIFF
- Max size: 10MB

---

### Weather Dashboard

```tsx
import { WeatherDashboard } from "@/components/weather/weather-dashboard";

function App() {
  return <WeatherDashboard />;
}
```

**Features:**
- Real-time weather from OpenWeather API
- Critical weather alerts
- Historical data
- Auto-refresh (5-minute intervals)
- Maritime-specific data (waves, sea state)

---

### Channel Manager

```tsx
import { ChannelManager } from "@/components/communication/channel-manager";

function App() {
  const handleStatsUpdate = (stats) => {
    console.log('Channel stats:', stats);
  };

  return (
    <ChannelManager 
      activeChannels={5}
      onStatsUpdate={handleStatsUpdate}
    />
  );
}
```

**Features:**
- Multi-channel communication
- Role-based permissions
- Message logging
- Channel types: group, department, broadcast, emergency

---

### Travel Management

```tsx
import { TravelBookingSystem } from "@/components/travel/travel-booking-system";
import { TravelApprovalSystem } from "@/components/travel/travel-approval-system";

function App() {
  return (
    <>
      <TravelBookingSystem />
      <TravelApprovalSystem />
    </>
  );
}
```

**Multiple Components Available:**
- `travel-booking-system.tsx`
- `travel-approval-system.tsx`
- `travel-expense-system.tsx`
- `travel-analytics-dashboard.tsx`
- More in `src/components/travel/`

---

## 🗄️ Database Tables

### Fuel Optimizer Tables
```sql
fuel_records           -- Fuel consumption logs
route_consumption      -- Route analysis
fuel_optimization_history -- Optimization records
```

### AI Documents Tables
```sql
ai_documents           -- Document metadata
document_entities      -- Extracted entities
ai_extractions         -- Structured data
document_search_index  -- Search index
```

### Weather Dashboard Tables
```sql
weather_logs           -- Historical observations
weather_predictions    -- Forecasts
weather_events         -- Critical alerts
weather_stations       -- Reference data
```

### Channel Manager Tables
```sql
communication_channels -- Channel definitions
channel_messages       -- Messages
channel_members        -- Membership
communication_logs     -- Event logs
```

### Travel Management Tables
```sql
travel_bookings        -- Bookings
itineraries            -- Travel plans
expense_claims         -- Expense tracking
```

---

## 🔍 Database Queries

### Get Latest Weather for Vessel
```sql
SELECT * FROM get_current_weather(
  p_lat := -23.5505,
  p_lng := -46.6333,
  p_vessel_id := 'vessel-uuid-here'
);
```

### Search Documents
```sql
SELECT * FROM search_documents(
  p_query := 'invoice',
  p_limit := 50
);
```

### Get Fuel Statistics
```sql
SELECT * FROM analyze_fuel_consumption(
  p_vessel_id := 'vessel-uuid-here',
  p_days_back := 30
);
```

### Get Critical Weather Events
```sql
SELECT * FROM get_active_weather_events(
  p_severity := 'high'
);
```

---

## 🔐 Row Level Security

All tables have RLS enabled. Sample policies:

```sql
-- Read policy
CREATE POLICY "Authenticated users can read"
  ON table_name FOR SELECT
  TO authenticated
  USING (true);

-- Insert policy
CREATE POLICY "Users can insert their own data"
  ON table_name FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

---

## 🎨 UI Components Used

### Common Components
- `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardDescription`
- `Button`, `Input`, `Label`, `Badge`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
- `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`
- `Progress`, `Switch`, `Textarea`

### Icons (Lucide React)
- Fuel, Cloud, FileText, Ship, AlertTriangle
- Wind, Droplets, Eye, Upload, Download
- Plus, Edit, Trash2, RefreshCw, Search

---

## 📊 Chart Configuration

### Chart.js Setup (Fuel Optimizer)
```tsx
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const data = {
  labels: ['Route 1', 'Route 2', 'Route 3'],
  datasets: [
    {
      label: 'Original Consumption',
      data: [1200, 1500, 1300],
      backgroundColor: 'rgba(239, 68, 68, 0.6)',
    },
    {
      label: 'Optimized Consumption',
      data: [1050, 1300, 1150],
      backgroundColor: 'rgba(34, 197, 94, 0.6)',
    }
  ]
};

<Bar data={data} options={...} />
```

---

## 📝 PDF Export

### Using jsPDF (Fuel Optimizer)
```tsx
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const exportToPDF = () => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Report Title', 14, 20);
  
  (doc as any).autoTable({
    head: [['Column 1', 'Column 2', 'Column 3']],
    body: data,
    theme: 'striped',
  });
  
  doc.save('report.pdf');
};
```

---

## 🔌 API Integration

### OpenWeather API (Weather Dashboard)
```tsx
const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

// Current weather
const response = await fetch(
  `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=pt_br`
);

// Forecast
const forecastResponse = await fetch(
  `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=pt_br`
);
```

---

## 🎯 Common Patterns

### Loading State
```tsx
const [loading, setLoading] = useState(false);

const loadData = async () => {
  setLoading(true);
  try {
    const { data, error } = await supabase.from('table').select('*');
    if (error) throw error;
    setData(data);
  } catch (error) {
    toast({ title: "Error", description: error.message, variant: "destructive" });
  } finally {
    setLoading(false);
  }
};
```

### Toast Notifications
```tsx
import { toast } from "@/hooks/use-toast";

toast({
  title: "Success",
  description: "Operation completed successfully",
});

toast({
  title: "Error",
  description: "Something went wrong",
  variant: "destructive",
});
```

### Supabase Real-time
```tsx
useEffect(() => {
  const channel = supabase
    .channel('table-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'table_name'
    }, (payload) => {
      console.log('Change received:', payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

---

## 🧪 Testing Commands

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e

# Run specific test
npm run test -- fuel-optimizer.test.tsx

# Lint
npm run lint

# Type check
npm run type-check
```

---

## 🐛 Troubleshooting

### OCR Not Working
- Check Tesseract.js installation: `npm install tesseract.js`
- Verify file format is supported
- Check browser console for detailed errors

### Weather API Not Responding
- Verify `VITE_OPENWEATHER_API_KEY` is set
- Check API key is valid at openweathermap.org
- Verify network connectivity
- Check browser console for CORS issues

### Database Connection Issues
- Verify Supabase credentials in `.env`
- Check RLS policies are configured
- Ensure user is authenticated
- Check Supabase project is active

### Build Errors
- Clear cache: `rm -rf node_modules/.vite dist`
- Reinstall: `npm install`
- Rebuild: `npm run build`

---

## 📚 Additional Resources

### Documentation
- Supabase Docs: https://supabase.com/docs
- OpenWeather API: https://openweathermap.org/api
- Tesseract.js: https://tesseract.projectnaptha.com/
- Chart.js: https://www.chartjs.org/docs/latest/
- Radix UI: https://www.radix-ui.com/

### Related Files
- `PATCHES_316_320_IMPLEMENTATION.md` - Full implementation details
- `README.md` - Project overview
- `DEPLOY_CHECKLIST.md` - Deployment guide

---

## 💡 Pro Tips

1. **Performance**: Use pagination for large datasets
2. **Security**: Always validate user input
3. **UX**: Show loading states for async operations
4. **Error Handling**: Provide clear error messages
5. **Testing**: Test with real data scenarios
6. **Mobile**: Test on various screen sizes
7. **Accessibility**: Use semantic HTML and ARIA labels

---

**Last Updated:** October 2025
**Version:** 1.0
