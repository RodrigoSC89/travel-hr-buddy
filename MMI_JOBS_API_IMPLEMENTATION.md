# 🔧 MMI Jobs API Implementation

## Overview

Implementation of the MMI Jobs API endpoint for analyzing maintenance job postponement decisions using AI.

## ✅ Implementation Status

- [x] Supabase Edge Function created at `/supabase/functions/mmi-jobs-postpone/index.ts`
- [x] POST endpoint accepting job ID
- [x] GPT-4 integration for risk assessment
- [x] Mock job data implementation
- [x] Retry logic with exponential backoff
- [x] CORS support
- [x] Comprehensive error handling
- [x] Documentation and testing guide

## 📍 Endpoint Details

### URL
```
POST /functions/v1/mmi-jobs-postpone
```

### Request Body
```json
{
  "id": "job-123"
}
```

### Response
```json
{
  "message": "✅ Pode postergar com risco baixo",
  "timestamp": "2025-10-14T21:51:11.057Z",
  "jobId": "job-123"
}
```

## 🎯 Features

1. **AI-Powered Analysis**: Uses GPT-4 to evaluate postponement risk
2. **Multi-Factor Assessment**: Considers:
   - Usage hours vs. historical average
   - Stock availability
   - Mission status
   - Maintenance history
3. **Robust Error Handling**: 
   - Automatic retry (up to 3 attempts)
   - Exponential backoff
   - Timeout protection (30s)
4. **CORS Enabled**: Cross-origin requests supported
5. **Structured Responses**: Consistent JSON format with timestamps

## 🔍 Analysis Factors

The GPT-4 model evaluates the following information:

```typescript
{
  id: jobId,
  title: 'Troca de filtro hidráulico',
  component: 'Bomba hidráulica popa',
  usage_hours: 241,
  avg_usage: 260,
  stock: true,
  mission_active: true,
  history: '3 trocas nos últimos 90 dias'
}
```

## 🧪 Testing

See [test-example.md](./supabase/functions/mmi-jobs-postpone/test-example.md) for comprehensive testing instructions.

### Quick Test
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/mmi-jobs-postpone \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"id": "job-001"}'
```

## 📝 Implementation Notes

### Architecture
- **Runtime**: Deno (Supabase Edge Functions)
- **AI Model**: GPT-4 with temperature 0.2
- **Pattern**: Follows existing Supabase function patterns in the codebase
- **Data**: Currently uses mock data; ready for Supabase integration

### Code Structure
```
supabase/functions/mmi-jobs-postpone/
├── index.ts           # Main function implementation
├── README.md          # API documentation
└── test-example.md    # Testing guide
```

### Key Implementation Details

1. **Retry Logic**: Implements exponential backoff with jitter
   - Max retries: 3
   - Initial delay: 1s
   - Max delay: 10s
   - Request timeout: 30s

2. **Error Handling**: Comprehensive error responses
   - 405: Method not allowed
   - 500: Server/API errors
   - Descriptive error messages

3. **System Prompt**: Specialized for maritime engineering context
   ```typescript
   "Você é um engenheiro embarcado que avalia risco de postergação."
   ```

4. **Response Format**: Controlled output
   - ✅ Pode postergar com risco baixo
   - ❌ Não é recomendável postergar

## 🚀 Deployment

### Supabase CLI
```bash
supabase functions deploy mmi-jobs-postpone
```

### Environment Variables
Required:
- `OPENAI_API_KEY`: Your OpenAI API key

## 🔄 Future Enhancements

- [ ] Replace mock data with real Supabase queries
- [ ] Add database schema for maintenance jobs
- [ ] Implement job history tracking
- [ ] Add authentication/authorization
- [ ] Create frontend UI component
- [ ] Add response caching for repeated queries
- [ ] Implement job postponement action in database

## 🎨 Integration Example

```typescript
import { supabase } from '@/lib/supabase';

async function analyzeJobPostponement(jobId: string) {
  const { data, error } = await supabase.functions.invoke('mmi-jobs-postpone', {
    body: { id: jobId }
  });
  
  if (error) {
    console.error('Error:', error);
    return null;
  }
  
  return data;
}

// Usage
const result = await analyzeJobPostponement('job-001');
console.log(result.message); // ✅ Pode postergar com risco baixo
```

## 📚 Related Documentation

- [Main README](./README.md)
- [API Validation Guide](./API_VALIDATION_GUIDE.md)
- [Supabase Functions Documentation](https://supabase.com/docs/guides/functions)

## 🏆 Success Criteria

✅ Endpoint responds to POST requests  
✅ Validates required job ID parameter  
✅ Integrates with GPT-4 successfully  
✅ Returns formatted AI analysis  
✅ Handles errors gracefully  
✅ Implements retry logic  
✅ Supports CORS  
✅ Includes comprehensive documentation  

---

**Status**: ✅ Implementation Complete  
**Created**: 2025-10-14  
**Type**: Supabase Edge Function
