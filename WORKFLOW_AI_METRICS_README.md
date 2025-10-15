# Workflow AI Analytics Summary Metrics

## Overview

This module provides analytics metrics for AI-assisted workflow decisions, tracking how AI suggestions are generated and adopted through the Kanban workflow system.

## Features

✅ **Metrics Tracked:**
- 📊 Total AI suggestions generated
- ✅ Accepted suggestions (via Kanban with origem='Copilot')
- 📈 AI adoption rate percentage

## Implementation

### Function: `getWorkflowAISummary()`

**Location:** `/lib/analytics/workflowAIMetrics.ts`

**Returns:** `Promise<WorkflowAISummary>`

```typescript
interface WorkflowAISummary {
  total: number;      // Total AI suggestions generated
  aceitas: number;    // Accepted suggestions (origem='Copilot')
  taxa: string | number;  // Adoption rate percentage
}
```

### Example Usage

```typescript
import { getWorkflowAISummary } from '@/lib/analytics/workflowAIMetrics';

// Fetch the metrics
const metrics = await getWorkflowAISummary();

console.log(metrics);
// Output: { total: 12, aceitas: 9, taxa: '75.0' }
```

## Integration Example

### Display in Workflow Dashboard

Here's how you can integrate this into your workflow dashboard:

```tsx
import { useEffect, useState } from 'react';
import { getWorkflowAISummary, WorkflowAISummary } from '@/lib/analytics/workflowAIMetrics';
import { Card } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export function WorkflowAIDashboard() {
  const [metrics, setMetrics] = useState<WorkflowAISummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const data = await getWorkflowAISummary();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching AI metrics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  if (loading) return <div>Carregando métricas...</div>;
  if (!metrics) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          🤖 IA no Controle
        </h3>
      </div>
      
      <div className="space-y-2 text-gray-700">
        <div className="flex justify-between">
          <span>Sugestões geradas:</span>
          <span className="font-bold">{metrics.total}</span>
        </div>
        <div className="flex justify-between">
          <span>Aceitas pelos usuários:</span>
          <span className="font-bold text-green-600">{metrics.aceitas}</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span>Adoção da IA:</span>
          <span className="font-bold text-blue-600">{metrics.taxa}%</span>
        </div>
      </div>
    </Card>
  );
}
```

### Minimal Integration (Top of Workflow Panel)

```tsx
import { getWorkflowAISummary } from '@/lib/analytics/workflowAIMetrics';

// Inside your workflow component
const [aiMetrics, setAIMetrics] = useState(null);

useEffect(() => {
  getWorkflowAISummary().then(setAIMetrics);
}, []);

// Display at the top of your workflow panel
{aiMetrics && (
  <div className="bg-blue-50 p-4 rounded-lg mb-4">
    <h4 className="font-semibold mb-2">🤖 IA no Controle:</h4>
    <p>Sugestões geradas: <strong>{aiMetrics.total}</strong></p>
    <p>Aceitas pelos usuários: <strong>{aiMetrics.aceitas}</strong></p>
    <p>Adoção da IA: <strong>{aiMetrics.taxa}%</strong></p>
  </div>
)}
```

## Database Schema

The function queries the `workflow_ai_suggestions` table with the following structure:

- **All suggestions:** `SELECT * FROM workflow_ai_suggestions`
- **Accepted suggestions:** `SELECT etapa FROM workflow_ai_suggestions WHERE origem = 'Copilot'`

## Error Handling

The function includes comprehensive error handling:
- Returns `{ total: 0, aceitas: 0, taxa: 0 }` on error
- Logs errors to console for debugging
- Handles both query errors and unexpected exceptions

## Testing

Tests are located in `/src/tests/workflow-ai-metrics.test.ts`

Run tests with:
```bash
npm run test -- src/tests/workflow-ai-metrics.test.ts
```

## Next Steps

1. ✅ **Metrics function created** - Ready to use
2. 🔜 **Visual integration** - Add to workflow dashboard UI
3. 🔜 **Real-time updates** - Consider adding Supabase realtime subscriptions
4. 🔜 **Historical tracking** - Track adoption trends over time

## Notes

- The adoption rate (`taxa`) is returned as a string with one decimal place (e.g., "75.0")
- When there are no suggestions, `taxa` is returned as `0` (number)
- The function is async and should be called with `await` or `.then()`
