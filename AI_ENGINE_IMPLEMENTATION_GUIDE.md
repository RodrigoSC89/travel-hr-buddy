# AI Engine with Module Context - Implementation Guide

## Overview

This implementation provides a comprehensive AI engine with module-specific context awareness across the Nautilus One platform. The engine integrates OpenAI's GPT models with intelligent context management, enabling AI-powered features across all modules.

## Patches Implemented

### PATCH 131.0 - Core AI Engine + Context Awareness

**Location:** `src/ai/engine.ts`, `src/ai/contexts/moduleContext.ts`, `src/ai/hooks/useAIAssistant.ts`

**Features:**
- Centralized OpenAI integration with configurable models (gpt-4o-mini, gpt-4o, gpt-3.5-turbo)
- Module-specific context management with automatic session tracking
- In-memory context store with automatic cleanup (1-hour TTL)
- React hook for easy component integration
- Conversation history tracking (last 50 interactions per module)

**Usage Example:**
```typescript
import { useAIAssistant } from '@/ai/hooks/useAIAssistant';

function MyComponent() {
  const { ask, loading, error, response } = useAIAssistant('my-module', {
    userId: currentUser.id,
    additionalContext: { vessel: 'MV-001' }
  });

  const handleQuestion = async () => {
    const answer = await ask('What is the current status?');
    console.log(answer);
  };

  return (
    <div>
      <button onClick={handleQuestion} disabled={loading}>
        Ask AI
      </button>
      {response && <p>{response}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### PATCH 132.0 - Mission Copilot (Operational Assistant)

**Location:** `src/components/mission-control/MissionCopilotPanel.tsx`

**Features:**
- Interactive chat interface for mission operations
- Suggested actions (status check, start/stop mission, create log, send alert)
- AI-powered mission summary generation
- Real-time operational assistance with context awareness

**Usage Example:**
```typescript
import MissionCopilotPanel from '@/components/mission-control/MissionCopilotPanel';

function MissionControl() {
  const missionStatus = {
    active: true,
    name: 'Operation Alpha',
    startTime: '2025-01-24T10:00:00Z',
    incidents: 2,
    alerts: 5
  };

  const handleAction = (action: string) => {
    console.log('Action triggered:', action);
    // Handle mission actions
  };

  return (
    <div className="h-screen">
      <MissionCopilotPanel 
        missionStatus={missionStatus}
        onAction={handleAction}
      />
    </div>
  );
}
```

### PATCH 133.0 - AI-based Incident Analyzer

**Location:** `src/ai/services/incidentAnalyzer.ts`

**Features:**
- Automated incident diagnosis with probable cause analysis
- Risk level assessment (baixo, moderado, alto, crítico)
- Suggested corrective actions and preventive measures
- Compliance references (IMCA, ISM, ISPS, NORMAM)
- Integration with existing incident management (dp_incidents table)

**Usage Example:**
```typescript
import { analyzeIncident, storeIncidentAnalysis } from '@/ai/services/incidentAnalyzer';

async function analyzeNewIncident(incident: DPIncident) {
  const analysis = await analyzeIncident(
    incident.description,
    {
      vessel: incident.vessel,
      location: incident.location,
      severity: incident.severity,
      tags: incident.tags
    }
  );

  console.log('Probable Cause:', analysis.probableCause);
  console.log('Risk Level:', analysis.riskLevel);
  console.log('Suggested Actions:', analysis.suggestedActions);
  console.log('Confidence:', analysis.confidence);

  // Store analysis in database
  await storeIncidentAnalysis(incident.id, analysis);
}
```

### PATCH 134.0 - Checklist Autocompletion with AI

**Location:** `src/ai/services/checklistAutoFill.ts`

**Features:**
- AI-powered auto-fill based on historical patterns
- Pattern recognition from previous completions
- Confidence scoring for suggestions
- Fallback to pattern-based completion when AI unavailable
- User review and edit capability before saving

**Usage Example:**
```typescript
import { autoFillChecklist, saveChecklistCompletion } from '@/ai/services/checklistAutoFill';

async function handleAutoFill(checklistId: string, checklistType: string) {
  const currentItems: ChecklistItem[] = [
    { id: '1', label: 'Verificação de equipamentos', checked: false },
    { id: '2', label: 'Inspeção de segurança', checked: false },
    { id: '3', label: 'Documentação completa', checked: false }
  ];

  const result = await autoFillChecklist(
    checklistId,
    checklistType,
    currentItems,
    { vessel: 'MV-001', user: currentUser.id }
  );

  console.log('Auto-filled items:', result.items);
  console.log('Confidence:', result.confidence);
  console.log('Source:', result.source); // 'ai', 'pattern', or 'manual'
  console.log('Suggestions:', result.suggestions);

  // User can review and edit before saving
  if (userConfirmed) {
    await saveChecklistCompletion(checklistType, result.items, {
      vessel: 'MV-001',
      userId: currentUser.id
    });
  }
}
```

### PATCH 135.0 - AI Self-Healing + Logs Analyzer

**Location:** `src/ai/services/logsAnalyzer.ts`

**Features:**
- System log anomaly detection
- Recurring failure pattern recognition
- Authentication error tracking
- Module stability monitoring
- AI-generated recommendations with auto-fix preview
- Manual steps for complex issues
- Auto-fix history tracking

**Usage Example:**
```typescript
import { 
  analyzeSystemLogs, 
  previewAutoFix, 
  storeAutoFixHistory 
} from '@/ai/services/logsAnalyzer';

async function runSystemDiagnostics() {
  // Analyze last 24 hours of logs
  const analysis = await analyzeSystemLogs(24);

  console.log('Overall Health:', analysis.overallHealth);
  console.log('Anomalies:', analysis.anomalies);

  // Display recommendations
  analysis.recommendations.forEach(rec => {
    console.log(`Recommendation: ${rec.title}`);
    console.log(`Description: ${rec.description}`);
    console.log(`Auto-fix available: ${rec.autoFixAvailable}`);
    console.log(`Confidence: ${(rec.confidence * 100).toFixed(0)}%`);
    
    if (rec.autoFixAvailable) {
      // Preview the auto-fix
      previewAutoFix(rec.id, rec).then(preview => {
        console.log('Auto-fix preview:', preview);
      });
    } else {
      console.log('Manual steps:', rec.manualSteps);
    }
  });
}
```

## Configuration

### Environment Variables

Required environment variable:
```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### OpenAI Model Configuration

Default model: `gpt-4o-mini` (cost-effective, fast)

Alternative models:
- `gpt-4o` - More powerful, higher cost
- `gpt-3.5-turbo` - Faster, lower cost

Configure in AI engine calls:
```typescript
const response = await runOpenAI({
  model: 'gpt-4o', // or 'gpt-4o-mini', 'gpt-3.5-turbo'
  messages: [...],
  temperature: 0.7,
  maxTokens: 1000
});
```

## Database Schema

### Required Tables

#### checklist_completions
```sql
CREATE TABLE checklist_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_type TEXT NOT NULL,
  items JSONB NOT NULL,
  vessel TEXT,
  user_id UUID,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### autofix_history
```sql
CREATE TABLE autofix_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anomaly_id TEXT NOT NULL,
  applied_fix TEXT NOT NULL,
  result TEXT,
  success BOOLEAN DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### dp_incidents (update existing)
```sql
-- Add gpt_analysis column if not exists
ALTER TABLE dp_incidents 
ADD COLUMN IF NOT EXISTS gpt_analysis JSONB;
```

## Architecture

### Context Management Flow

```
User Request → useAIAssistant Hook → Module Context (in-memory)
                     ↓
              runOpenAI Engine
                     ↓
              OpenAI API (GPT-4o-mini)
                     ↓
              Response Processing
                     ↓
         Context History Update → User Response
```

### Memory Management

- Context stored in-memory with Map structure
- Automatic cleanup every 30 minutes
- 1-hour TTL for inactive contexts
- Last 50 interactions kept per module
- Session-based isolation

## Error Handling

All AI services include comprehensive error handling:

1. **API Key Missing**: Falls back to mock responses with warnings
2. **OpenAI API Errors**: Caught and logged, fallback logic activated
3. **Network Errors**: Graceful degradation with user-friendly messages
4. **Parsing Errors**: Robust JSON extraction and validation

## Performance Considerations

- **Context Cleanup**: Automatic every 30 minutes
- **History Limit**: Maximum 50 interactions per module
- **Model Selection**: Use gpt-4o-mini for cost-effectiveness
- **Temperature**: Lower (0.2-0.3) for consistent analysis, higher (0.7) for creative responses
- **Max Tokens**: Configurable per use case (500-2000)

## Testing

### Manual Testing

1. **Mission Copilot**:
   - Open Mission Control module
   - Add MissionCopilotPanel component
   - Test chat interaction and suggested actions

2. **Incident Analyzer**:
   - Create or select an incident
   - Call analyzeIncident function
   - Verify analysis results and risk levels

3. **Checklist Autocompletion**:
   - Open a checklist
   - Click "Auto-Preencher com IA" button
   - Review and confirm suggestions

4. **Logs Analyzer**:
   - Run analyzeSystemLogs()
   - Review detected anomalies
   - Test auto-fix preview functionality

## Security Considerations

✅ **Implemented:**
- API keys stored as environment variables
- Input validation and sanitization
- Error messages don't expose sensitive data
- Auto-fix scripts run in preview mode by default
- User confirmation required for critical actions

⚠️ **Recommendations:**
- Rate limiting for OpenAI API calls
- User permission checks before AI operations
- Audit logging for all AI interactions
- Regular review of auto-fix history

## Monitoring and Observability

Monitor AI engine health:
```typescript
import { getAllContexts } from '@/ai/contexts/moduleContext';

// Get all active contexts
const contexts = getAllContexts();
console.log(`Active contexts: ${contexts.size}`);

// Monitor per module
contexts.forEach((context, key) => {
  console.log(`Module: ${context.moduleName}`);
  console.log(`Session: ${context.sessionId}`);
  console.log(`History entries: ${context.history?.length || 0}`);
});
```

## Troubleshooting

### Issue: "OpenAI API key not configured"
**Solution:** Set `VITE_OPENAI_API_KEY` in your `.env` file

### Issue: AI responses are generic
**Solution:** Provide more context in additionalContext parameter

### Issue: High API costs
**Solution:** 
- Use gpt-4o-mini instead of gpt-4o
- Reduce maxTokens parameter
- Implement request caching

### Issue: Memory growth
**Solution:** 
- Automatic cleanup is enabled by default
- Manually call `clearModuleContext()` if needed

## Future Enhancements

Potential improvements for future patches:
- Persistent context storage in Supabase
- Multi-language support (currently PT-BR)
- Voice input/output integration
- Advanced analytics dashboard
- A/B testing for different prompts
- Fine-tuned models for specific domains

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in browser console
3. Verify OpenAI API key configuration
4. Check network connectivity to OpenAI API

## License

Part of Nautilus One platform - Internal use only
