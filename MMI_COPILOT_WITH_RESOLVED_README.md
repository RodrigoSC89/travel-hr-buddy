# MMI Copilot with Resolved Actions

## Overview

The MMI (Maritime Maintenance Intelligence) Copilot with Resolved Actions is an AI-powered system that learns from historical maintenance actions to provide better recommendations. It combines OpenAI's GPT-4 with a historical database of effective maintenance actions.

## Features

✅ **Historical Learning**: Queries past resolved maintenance actions for the same component
✅ **AI Recommendations**: Uses GPT-4 to provide context-aware suggestions
✅ **Streaming Support**: Real-time streaming of AI responses for better UX
✅ **Self-Improving**: System improves as more actions are recorded
✅ **Component-Specific**: Learns patterns specific to each component

## Architecture

### Database
- **Table**: `mmi_os_ia_feed`
- **Location**: `/supabase/migrations/20251015000000_create_mmi_os_ia_feed.sql`
- **Fields**:
  - `componente`: Component name
  - `acao_realizada`: Action performed
  - `duracao_execucao`: Execution duration
  - `efetiva`: Was the action effective?
  - `observacoes`: Additional observations
  - `data_execucao`: Execution date

### Edge Function
- **Name**: `mmi-copilot-with-resolved`
- **Location**: `/supabase/functions/mmi-copilot-with-resolved/index.ts`
- **Endpoint**: `POST /functions/v1/mmi-copilot-with-resolved`

### Client Service
- **Location**: `/src/services/mmi/copilotApi.ts`
- **Functions**:
  - `getCopilotRecommendation()`: Get AI recommendation
  - `getCopilotRecommendationStreaming()`: Stream AI responses
  - `getHistoricalActions()`: Query historical data
  - `addResolvedAction()`: Record new actions

## Usage Examples

### Basic Recommendation
```typescript
import { getCopilotRecommendation } from "@/services/mmi/copilotApi";

const recommendation = await getCopilotRecommendation({
  prompt: "Manutenção preventiva necessária",
  componente: "Sistema Hidráulico Principal"
});

console.log(recommendation);
```

### Streaming Recommendation
```typescript
import { getCopilotRecommendationStreaming } from "@/services/mmi/copilotApi";

await getCopilotRecommendationStreaming(
  {
    prompt: "Inspeção de válvulas de segurança",
    componente: "Sistema de Segurança"
  },
  (chunk) => {
    // Update UI with each chunk
    console.log(chunk);
  }
);
```

### Query Historical Actions
```typescript
import { getHistoricalActions } from "@/services/mmi/copilotApi";

const history = await getHistoricalActions("Motor Principal", 5);
console.log(`Found ${history.length} previous actions`);
```

### Add New Action
```typescript
import { addResolvedAction } from "@/services/mmi/copilotApi";

await addResolvedAction({
  componente: "Motor Principal",
  acao_realizada: "Substituição de filtros de óleo",
  duracao_execucao: "2 horas",
  efetiva: true,
  observacoes: "Filtros saturados. Troca preventiva conforme manual."
});
```

## How It Works

1. **Request**: User submits a maintenance job with component name
2. **Query History**: System queries `mmi_os_ia_feed` for past effective actions on that component
3. **Enrich Prompt**: Original prompt is enriched with historical context
4. **AI Processing**: GPT-4 processes the enriched prompt
5. **Stream Response**: AI response is streamed back to the user
6. **Learn**: User records the outcome, improving future recommendations

## Sample Components

The system includes sample data for common maritime components:

- **Sistema Hidráulico Principal**: Hydraulic system maintenance
- **Motor Principal**: Main engine maintenance  
- **Sistema de Segurança**: Safety system checks
- **Sistema de Monitoramento**: Monitoring system calibration

## API Request Format

### Request
```json
{
  "prompt": "Realizar manutenção preventiva",
  "componente": "Sistema Hidráulico Principal"
}
```

### Response (Streaming)
OpenAI SSE format:
```
data: {"choices":[{"delta":{"content":"Baseado"}}]}

data: {"choices":[{"delta":{"content":" no"}}]}

data: {"choices":[{"delta":{"content":" histórico..."}}]}
```

## Benefits

### For Engineers
- **Faster Decisions**: Quick access to proven solutions
- **Better Outcomes**: Learn from past successes
- **Time Estimates**: Realistic duration based on history
- **Risk Reduction**: Avoid ineffective approaches

### For System
- **Continuous Learning**: Improves with each recorded action
- **Knowledge Retention**: Never lose institutional knowledge
- **Pattern Recognition**: Identifies what works for each component
- **Quality Improvement**: Tracks action effectiveness

## Testing

Run the test suite:
```bash
npm test src/tests/mmi-copilot-with-resolved.test.ts
```

The test suite covers:
- Request/response validation
- Error handling
- Streaming functionality
- Component examples
- Edge cases

## Security

- **Row Level Security (RLS)**: Enabled on `mmi_os_ia_feed` table
- **Authentication**: Requires valid Supabase auth token
- **Authorization**: Users can only insert their own actions
- **Read Access**: All users can view resolved actions (for learning)

## Environment Variables

Required in Supabase Edge Functions:
```bash
OPENAI_API_KEY=sk-proj-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## Future Enhancements

- [ ] Multi-language support
- [ ] Image analysis for visual inspections
- [ ] Predictive maintenance scheduling
- [ ] Integration with IoT sensors
- [ ] Mobile app support
- [ ] Voice input for hands-free operation
- [ ] Export recommendations to PDF
- [ ] Collaborative annotations on recommendations

## Troubleshooting

### No Historical Data
If no historical actions are found, the AI will still provide recommendations but without historical context. Add more actions to improve future results.

### Streaming Issues
If streaming doesn't work, check:
1. Browser supports ReadableStream API
2. Network allows SSE connections
3. OPENAI_API_KEY is configured correctly

### Authentication Errors
Ensure user is authenticated:
```typescript
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  // Redirect to login
}
```

## Related Documentation

- [OpenAI Streaming API](https://platform.openai.com/docs/api-reference/streaming)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [MMI Jobs API](./src/services/mmi/jobsApi.ts)

## Support

For issues or questions:
1. Check the test suite for usage examples
2. Review Edge Function logs in Supabase dashboard
3. Inspect database records in `mmi_os_ia_feed` table
