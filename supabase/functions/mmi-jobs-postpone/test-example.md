# Testing the MMI Jobs Postpone API

## Manual Testing Instructions

### Prerequisites
1. Ensure the function is deployed to Supabase
2. Have your Supabase project URL and anon key ready
3. Ensure OPENAI_API_KEY environment variable is set in Supabase

### Test Case 1: Valid Job ID
```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/mmi-jobs-postpone \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{"id": "job-001"}'
```

**Expected Response:**
```json
{
  "message": "✅ Pode postergar com risco baixo" or "❌ Não é recomendável postergar",
  "timestamp": "2025-10-14T21:51:11.057Z",
  "jobId": "job-001"
}
```

### Test Case 2: Missing Job ID
```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/mmi-jobs-postpone \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{}'
```

**Expected Response:**
```json
{
  "error": "Job ID is required",
  "timestamp": "2025-10-14T21:51:11.057Z"
}
```

### Test Case 3: Wrong HTTP Method
```bash
curl -X GET https://YOUR_PROJECT_ID.supabase.co/functions/v1/mmi-jobs-postpone \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

**Expected Response:**
```json
{
  "error": "Method not allowed. Use POST.",
  "timestamp": "2025-10-14T21:51:11.057Z"
}
```

### Test Case 4: CORS Preflight
```bash
curl -X OPTIONS https://YOUR_PROJECT_ID.supabase.co/functions/v1/mmi-jobs-postpone \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```

**Expected Response:**
- Status: 200
- Headers should include CORS headers

## Testing with JavaScript

```javascript
// Example usage in a React/Vue/vanilla JS app
async function postponeJob(jobId) {
  try {
    const response = await fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/mmi-jobs-postpone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
      },
      body: JSON.stringify({ id: jobId })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('AI Analysis:', data.message);
      return data;
    } else {
      console.error('Error:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

// Usage
postponeJob('job-001')
  .then(result => console.log('Result:', result))
  .catch(error => console.error('Failed:', error));
```

## Local Testing with Supabase CLI

If you have Supabase CLI installed:

```bash
# Start local Supabase
supabase start

# Deploy function locally
supabase functions deploy mmi-jobs-postpone --no-verify-jwt

# Test locally
curl -X POST http://localhost:54321/functions/v1/mmi-jobs-postpone \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_LOCAL_ANON_KEY" \
  -d '{"id": "job-001"}'
```

## Monitoring

Check Supabase function logs to see:
- Request processing
- AI API calls
- Retry attempts (if any)
- Response generation

## Notes

- The function uses mock data currently, so all requests will analyze the same job data
- AI responses may vary slightly even with the same input due to GPT-4's nature
- The temperature is set to 0.2 for more consistent responses
- Response time depends on OpenAI API latency (typically 2-5 seconds)
