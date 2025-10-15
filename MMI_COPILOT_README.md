# MMI Copilot - AI-Powered Maintenance Assistant

## Overview

The MMI (Maritime Maintenance Intelligence) Copilot is an AI-powered assistant that provides intelligent maintenance suggestions based on historical data. It uses vector similarity search to find similar past maintenance cases and generates actionable recommendations using GPT-4.

## Architecture

### Database Layer
- **Table**: `mmi_jobs` with vector embeddings (pgvector extension)
- **Function**: `match_mmi_jobs` for similarity search using cosine distance
- **Embeddings**: 1536-dimensional vectors from OpenAI text-embedding-ada-002

### Backend (Supabase Edge Function)
- **Endpoint**: `/functions/v1/mmi-copilot`
- **Method**: POST
- **Request Body**: `{ prompt: string }`
- **Response**: Streaming text response

### Frontend
- **Service**: `src/services/mmi/copilotApi.ts`
- **Service**: `src/services/mmi/reportGenerator.ts` (PDF generation)
- **Component**: `src/components/mmi/MMICopilot.tsx`
- **Component**: `src/components/mmi/JobCards.tsx` (with PDF report button)
- **Integration**: MMIJobsPanel page

## Features

### 🔍 Intelligent Search
- Converts user descriptions into embeddings
- Searches for similar historical maintenance cases
- Uses vector similarity with configurable threshold (default: 0.78)

### 🤖 AI-Powered Suggestions
- Enriches prompts with historical context
- Generates technical recommendations using GPT-4
- Provides specific details: component, timeline, OS recommendation

### 📊 Historical Context
- References up to 3 similar past cases
- Includes case titles and descriptions
- Helps identify patterns and best practices

### ⚡ Streaming Response
- Real-time text streaming for better UX
- Progressive display of suggestions
- Handles long responses efficiently

### 📄 PDF Report Generation
- One-click PDF report generation for any job
- Includes job details, component information, and AI suggestions
- Formatted suggestions with historical context
- Automatic timestamp and metadata inclusion
- Supports both single job and batch report generation

## Usage

### Example Input
```
Gerador STBD com ruído incomum e aumento de temperatura
```

### Example Output
```
Caso 1: Falha no gerador STBD — Gerador STBD apresentando ruído incomum 
e aumento de temperatura durante operação...

✅ Ação sugerida: Criar job para inspeção do ventilador do gerador STBD. 
Se for identificado desgaste, abrir OS para substituição. 
Prazo: 2 dias. Impacto: moderado.
```

## API Reference

### POST /functions/v1/mmi-copilot

**Request:**
```json
{
  "prompt": "Description of maintenance issue"
}
```

**Response:** Text stream with AI-generated suggestions

**Headers:**
- `Authorization`: Bearer token or API key
- `Content-Type`: application/json

## Database Schema

### mmi_jobs Table
```sql
CREATE TABLE mmi_jobs (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT,
  priority TEXT,
  component TEXT,
  asset_name TEXT,
  vessel TEXT,
  due_date DATE,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### match_mmi_jobs Function
```sql
FUNCTION match_mmi_jobs(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  priority TEXT,
  component TEXT,
  asset_name TEXT,
  vessel TEXT,
  similarity float
)
```

## Configuration

### Environment Variables

Required for Supabase Edge Function:
- `OPENAI_API_KEY`: OpenAI API key for embeddings and chat
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database access

Required for Frontend:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

## Testing

Run the test suite:
```bash
# Test MMI Copilot API
npm test src/tests/mmi-copilot-api.test.ts

# Test PDF Report Generator
npm test src/tests/mmi-report-generator.test.ts
```

Tests cover:
- Function invocation with correct parameters
- Error handling
- Response format validation
- Streaming support
- Input validation
- Callback handling
- PDF generation with various options
- Single job and batch report generation
- AI suggestion inclusion/exclusion
- Error handling in PDF generation

## Deployment

1. **Database Migration**
   ```bash
   # Apply the migration to create tables and functions
   supabase db push
   ```

2. **Edge Function**
   ```bash
   # Deploy the edge function
   supabase functions deploy mmi-copilot
   ```

3. **Frontend**
   ```bash
   # Build and deploy the frontend
   npm run build
   ```

## Performance Considerations

- **Embeddings Cache**: Consider caching embeddings for frequently queried descriptions
- **Similarity Threshold**: Adjust `match_threshold` (0.0-1.0) based on precision/recall needs
- **Result Limit**: Adjust `match_count` to balance context vs. token usage
- **Streaming**: Reduces perceived latency for long responses

## Recent Enhancements

- ✅ PDF report generation with jsPDF
- ✅ Single job and batch report generation
- ✅ AI suggestions included in PDF reports
- ✅ Comprehensive test coverage (20 tests total)

## Future Enhancements

- [ ] Add feedback mechanism to improve suggestions
- [ ] Implement embedding caching
- [ ] Support multi-language descriptions
- [ ] Add voice input support
- [ ] Integrate with work order creation workflow
- [ ] Track suggestion acceptance rate
- [ ] Add cost tracking for OpenAI API usage
- [ ] Email PDF reports directly from the interface
- [ ] Custom PDF report templates

## Troubleshooting

### No similar cases found
- Check if embeddings are properly generated for historical jobs
- Verify vector extension is installed (`CREATE EXTENSION vector;`)
- Adjust similarity threshold

### Streaming not working
- Verify CORS headers are set correctly
- Check browser console for errors
- Ensure authentication tokens are valid

### Slow responses
- Check OpenAI API status
- Verify database index on embedding column
- Consider reducing `match_count`

## Support

For issues or questions:
1. Check the logs in Supabase Dashboard > Edge Functions
2. Review browser console for frontend errors
3. Verify environment variables are set correctly
4. Test the endpoint directly using curl or Postman
