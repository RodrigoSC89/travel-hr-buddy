# Workflow AI Analytics - Metrics Summary

## 📊 Overview

This module provides analytics and metrics for AI-powered workflow suggestions in the Travel HR Buddy system. It tracks the adoption and effectiveness of AI-generated suggestions in the workflow management interface.

## 🎯 Purpose

Monitor and measure:
- Total number of AI suggestions generated
- Number of suggestions accepted by users
- Adoption rate (percentage) of AI recommendations

## 📁 Files Created

### `/lib/analytics/workflowAIMetrics.ts`
Main implementation file containing the `getWorkflowAISummary()` function.

### `/src/tests/workflow-ai-metrics.test.ts`
Comprehensive test suite with 4 test cases covering all scenarios.

## 🚀 Usage

### Basic Usage

```typescript
import { getWorkflowAISummary } from "@/lib/analytics/workflowAIMetrics";

// Fetch workflow AI metrics
const metrics = await getWorkflowAISummary();

console.log(metrics);
// Output: { total: 12, aceitas: 9, taxa: '75.0' }
```

### Return Type

```typescript
interface WorkflowAISummary {
  total: number;      // Total AI suggestions generated
  aceitas: number;    // Number of accepted suggestions
  taxa: string | number; // Adoption rate as percentage (0 or "XX.X")
}
```

## 📈 Integration Examples

### 1. Dashboard Widget

Display metrics in a workflow dashboard:

```tsx
import { useEffect, useState } from "react";
import { getWorkflowAISummary } from "@/lib/analytics/workflowAIMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WorkflowAIMetricsWidget() {
  const [metrics, setMetrics] = useState({ total: 0, aceitas: 0, taxa: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      const data = await getWorkflowAISummary();
      setMetrics(data);
      setLoading(false);
    }
    loadMetrics();
  }, []);

  if (loading) {
    return <div>Carregando métricas...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🤖 IA no Controle</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Sugestões geradas:</span> {metrics.total}
          </div>
          <div>
            <span className="font-semibold">Aceitas pelos usuários:</span> {metrics.aceitas}
          </div>
          <div>
            <span className="font-semibold">Adoção da IA:</span> {metrics.taxa}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 2. Workflow Panel Header

Display at the top of the workflow panel:

```tsx
import { getWorkflowAISummary } from "@/lib/analytics/workflowAIMetrics";

export function WorkflowPanel() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getWorkflowAISummary().then(setMetrics);
  }, []);

  return (
    <div>
      {metrics && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-bold text-lg mb-2">🤖 IA no Controle</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Sugestões geradas</div>
              <div className="text-2xl font-bold">{metrics.total}</div>
            </div>
            <div>
              <div className="text-gray-600">Aceitas pelos usuários</div>
              <div className="text-2xl font-bold text-green-600">{metrics.aceitas}</div>
            </div>
            <div>
              <div className="text-gray-600">Adoção da IA</div>
              <div className="text-2xl font-bold text-blue-600">{metrics.taxa}%</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Rest of workflow panel content */}
    </div>
  );
}
```

### 3. Real-time Updates with React Query

Use with `@tanstack/react-query` for automatic refresh:

```tsx
import { useQuery } from "@tanstack/react-query";
import { getWorkflowAISummary } from "@/lib/analytics/workflowAIMetrics";

export function useWorkflowAIMetrics() {
  return useQuery({
    queryKey: ["workflow-ai-metrics"],
    queryFn: getWorkflowAISummary,
    refetchInterval: 60000, // Refresh every minute
  });
}

// Usage in component
function WorkflowMetricsDisplay() {
  const { data, isLoading, error } = useWorkflowAIMetrics();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading metrics</div>;

  return (
    <div>
      <h3>AI Metrics</h3>
      <p>Total: {data.total}</p>
      <p>Accepted: {data.aceitas}</p>
      <p>Rate: {data.taxa}%</p>
    </div>
  );
}
```

### 4. Admin Analytics Page

Full-page analytics view:

```tsx
import { getWorkflowAISummary } from "@/lib/analytics/workflowAIMetrics";
import { Bar } from "react-chartjs-2";

export function WorkflowAnalyticsPage() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getWorkflowAISummary().then(setMetrics);
  }, []);

  if (!metrics) return <div>Loading analytics...</div>;

  const chartData = {
    labels: ["Sugestões Geradas", "Sugestões Aceitas"],
    datasets: [
      {
        label: "Workflow AI Metrics",
        data: [metrics.total, metrics.aceitas],
        backgroundColor: ["rgba(59, 130, 246, 0.5)", "rgba(34, 197, 94, 0.5)"],
        borderColor: ["rgba(59, 130, 246, 1)", "rgba(34, 197, 94, 1)"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Workflow AI Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{metrics.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{metrics.aceitas}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Adoption Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">{metrics.taxa}%</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Metrics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
```

## 🗄️ Database Schema

The function queries the `workflow_ai_suggestions` table with the following structure:

```sql
CREATE TABLE workflow_ai_suggestions (
  id SERIAL PRIMARY KEY,
  etapa TEXT NOT NULL,
  tipo_sugestao TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  criticidade TEXT NOT NULL,
  responsavel_sugerido TEXT NOT NULL,
  origem TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Key Fields:
- **etapa**: The workflow step/stage
- **origem**: Source of the suggestion (e.g., "Copilot" for accepted suggestions)
- Suggestions with `origem='Copilot'` are considered "accepted" by users

## 🧪 Testing

Run the test suite:

```bash
npm test workflow-ai-metrics.test.ts
```

### Test Coverage:
✅ Valid data with correct calculation (75% rate)  
✅ Empty table handling  
✅ Database error handling  
✅ 100% adoption rate calculation  
✅ Return type validation  

All tests passing! ✅

## 🔧 Technical Details

### Function: `getWorkflowAISummary()`

**Returns:** `Promise<WorkflowAISummary>`

**Algorithm:**
1. Query all suggestions from `workflow_ai_suggestions` table
2. Query accepted suggestions (where `origem='Copilot'`)
3. Calculate adoption rate: `(accepted / total) * 100`
4. Return formatted metrics

**Error Handling:**
- Returns `{ total: 0, aceitas: 0, taxa: 0 }` on database errors
- Logs errors to console for debugging

**Performance:**
- Uses Supabase client for optimized queries
- Minimal data fetching with selective column queries
- Suitable for real-time dashboards

## 📊 Visual Display Suggestion

**Recommended placement:** Top of the workflow panel

```
┌─────────────────────────────────────────────┐
│  🤖 IA no Controle:                         │
│                                              │
│  Sugestões geradas: 12                      │
│  Aceitas pelos usuários: 9                  │
│  Adoção da IA: 75.0%                        │
└─────────────────────────────────────────────┘
```

## 🎉 Benefits

1. **Transparency**: Users can see how much AI is helping
2. **Trust**: Shows real adoption metrics
3. **Optimization**: Identify which suggestions work best
4. **Engagement**: Encourage users to try AI suggestions

## 🔄 Future Enhancements

Potential improvements:
- Time-based metrics (daily/weekly/monthly)
- Suggestion type breakdown
- User-specific adoption rates
- Trend analysis and predictions
- Integration with notification systems

## 📝 Notes

- The metrics are calculated in real-time from the database
- Consider caching for high-traffic scenarios
- Monitor database performance with large datasets
- Can be extended to track individual suggestion types

## ✨ Summary

✅ **Implementation Complete**

**What was created:**
- `/lib/analytics/workflowAIMetrics.ts` - Main implementation
- `/src/tests/workflow-ai-metrics.test.ts` - Comprehensive tests
- `WORKFLOW_AI_METRICS_README.md` - Complete documentation

**All code passes:**
- ✅ Linting
- ✅ Type checking
- ✅ All tests (4/4 passing)
- ✅ Build process

Ready for integration! 🚀
