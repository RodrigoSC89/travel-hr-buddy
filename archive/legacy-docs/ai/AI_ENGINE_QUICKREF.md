# AI Engine Quick Reference

## Installation & Setup

```bash
# 1. Set environment variable
echo "VITE_OPENAI_API_KEY=your_key_here" >> .env

# 2. Import in your component
import { useAIAssistant } from '@/ai/hooks/useAIAssistant';
```

## Common Use Cases

### 1. Add AI Assistant to Any Component

```typescript
const { ask, loading, error } = useAIAssistant('module-name');

const handleAsk = async () => {
  const response = await ask('Your question here');
  console.log(response);
};
```

### 2. Analyze Incidents Automatically

```typescript
import { analyzeIncident, storeIncidentAnalysis } from '@/ai/services/incidentAnalyzer';

const analysis = await analyzeIncident(incidentDescription, {
  vessel: 'MV-001',
  severity: 'Alta'
});

await storeIncidentAnalysis(incidentId, analysis);
```

### 3. Auto-fill Checklists

```typescript
import { autoFillChecklist } from '@/ai/services/checklistAutoFill';

const result = await autoFillChecklist(
  checklistId,
  'safety-inspection',
  currentItems,
  { vessel: 'MV-001' }
);
```

### 4. Monitor System Health

```typescript
import { analyzeSystemLogs } from '@/ai/services/logsAnalyzer';

const health = await analyzeSystemLogs(24); // last 24 hours
console.log('Status:', health.overallHealth);
console.log('Issues:', health.anomalies.length);
```

## API Reference

### useAIAssistant Hook

```typescript
const {
  ask,           // (input: string) => Promise<string>
  loading,       // boolean
  error,         // string | null
  response,      // string | null
  clearError     // () => void
} = useAIAssistant('module-name', {
  userId: 'user-id',
  additionalContext: { key: 'value' },
  model: 'gpt-4o-mini', // optional
  temperature: 0.7       // optional
});
```

### Core Engine Functions

```typescript
// Direct OpenAI call
import { runOpenAI } from '@/ai/engine';

const response = await runOpenAI({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: 'System prompt' },
    { role: 'user', content: 'User message' }
  ],
  temperature: 0.7,
  maxTokens: 1000
});
```

### Context Management

```typescript
import { 
  getModuleContext, 
  updateModuleContext,
  clearModuleContext 
} from '@/ai/contexts/moduleContext';

// Get context
const context = getModuleContext('module-name', userId);

// Update context
updateModuleContext('module-name', userId, {
  state: { key: 'value' }
});

// Clear context
clearModuleContext('module-name', userId);
```

## Configuration Options

### Models
- `gpt-4o-mini` - Fast, cost-effective (default)
- `gpt-4o` - More powerful, higher cost
- `gpt-3.5-turbo` - Fastest, lowest cost

### Temperature
- `0.0-0.3` - Deterministic, consistent (for analysis)
- `0.4-0.7` - Balanced (default)
- `0.8-1.0` - Creative, varied

### Max Tokens
- `500` - Short responses
- `1000` - Standard (default)
- `2000` - Detailed responses

## Error Handling

```typescript
try {
  const response = await ask('question');
} catch (error) {
  console.error('AI Error:', error.message);
  // Fallback logic here
}
```

## Best Practices

✅ **DO:**
- Provide relevant context in additionalContext
- Use lower temperature for consistent analysis
- Handle errors gracefully with fallbacks
- Clear contexts when module unmounts
- Monitor API usage and costs

❌ **DON'T:**
- Expose API keys in client code
- Make concurrent requests without rate limiting
- Store sensitive data in context
- Ignore error responses
- Use high temperature for critical analysis

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "API key not configured" | Set `VITE_OPENAI_API_KEY` in `.env` |
| Generic responses | Add more context to request |
| High costs | Use `gpt-4o-mini`, reduce `maxTokens` |
| Memory issues | Context auto-cleans every 30min |
| Slow responses | Reduce `maxTokens`, use faster model |

## Module Names Convention

Use dot notation for hierarchical modules:
- `mission-control` - Main mission control
- `operations.fleet` - Fleet operations
- `operations.crew` - Crew management
- `compliance.checklist` - Compliance checklists
- `emergency.response` - Emergency response
- `sgso.incidents` - SGSO incidents

## Support & Documentation

- Full guide: `AI_ENGINE_IMPLEMENTATION_GUIDE.md`
- Code examples: `src/components/mission-control/MissionCopilotPanel.tsx`
- Services: `src/ai/services/`
- Core engine: `src/ai/engine.ts`

## Quick Commands

```bash
# Build
npm run build

# Lint
npm run lint:fix

# Test
npm test

# Check types
npm run type-check
```

---

**Version:** PATCH 131.0-135.0  
**Last Updated:** 2025-01-24  
**Status:** ✅ Production Ready
