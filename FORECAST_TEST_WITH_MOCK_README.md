# Forecast Test With Mock - Implementation Guide

## Overview

This implementation provides a development endpoint to test AI-powered job forecasting with mock data. The system analyzes historical job completion trends and generates predictions for the next 2 months.

## Files Created

1. **Mock Data**: `/lib/dev/mocks/jobsForecastMock.ts`
   - Contains 26 sample job records across 4 months (January-April 2025)
   - 3 different components for realistic trend analysis
   - All jobs have completed status with dates in YYYY-MM-DD format

2. **API Endpoint**: `/pages/api/dev/test-forecast-with-mock.ts`
   - Uses OpenAI GPT-4 for AI-powered forecasting
   - Analyzes job trends by component and month
   - Automatically saves forecast to `forecast_history` table
   - Returns forecast as JSON response

3. **Database Migration**: `/supabase/migrations/20251015224400_create_forecast_history.sql`
   - Creates `forecast_history` table
   - Includes indexes for performance
   - Implements Row Level Security (RLS)
   - Policies for authenticated users and service role

4. **TypeScript Types**: Updated `src/integrations/supabase/types.ts`
   - Added type definitions for `forecast_history` table
   - Includes Row, Insert, and Update types

5. **Tests**: `/src/tests/jobs-forecast-mock.test.ts`
   - 17 comprehensive tests for mock data structure
   - Tests for trend data generation
   - Tests for API compatibility

## Database Schema

The `forecast_history` table has the following structure:

```sql
CREATE TABLE forecast_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  forecast_summary TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### Fields

- **id**: Unique identifier for each forecast record (UUID)
- **source**: Source of the forecast (e.g., 'dev-mock', 'cron-job', 'manual')
- **forecast_summary**: AI-generated forecast text with predictions and recommendations
- **created_by**: User or system that generated the forecast
- **created_at**: Timestamp when the forecast was created (ISO 8601 format)

## Usage

### 1. Deploy the Database Migration

First, apply the migration to create the `forecast_history` table:

```bash
# Using Supabase CLI
supabase db push

# Or manually apply the SQL file in Supabase Dashboard
```

### 2. Set Up Environment Variables

Ensure you have the following environment variables configured:

```env
OPENAI_API_KEY=your_openai_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 3. Call the API Endpoint

**Endpoint**: `POST /api/dev/test-forecast-with-mock`

**Request**: No body required (uses mock data)

**Response**:
```json
{
  "forecast": "AI-generated forecast text..."
}
```

### Example with cURL

```bash
curl -X POST http://localhost:5173/api/dev/test-forecast-with-mock \
  -H "Content-Type: application/json"
```

### Example with JavaScript/TypeScript

```typescript
async function testForecast() {
  const response = await fetch('/api/dev/test-forecast-with-mock', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log('Forecast:', data.forecast);
}
```

## How It Works

1. **Mock Data Processing**: The endpoint loads mock job data from `jobsForecastMock.ts`

2. **Trend Analysis**: Groups jobs by component and month:
   ```typescript
   {
     "comp-001": ["2025-01", "2025-01", "2025-02", ...],
     "comp-002": ["2025-01", "2025-02", ...],
     "comp-003": ["2025-01", "2025-02", ...]
   }
   ```

3. **AI Forecast Generation**: Sends the trend data to OpenAI GPT-4 with a prompt asking for:
   - Predictions for the next 2 months
   - Critical components that need attention
   - Preventive recommendations

4. **Database Persistence**: Saves the forecast to `forecast_history` with:
   - `source`: 'dev-mock'
   - `forecast_summary`: AI-generated text
   - `created_by`: 'dev'
   - `created_at`: Current timestamp

5. **Response**: Returns the forecast as JSON

## Testing

Run the tests to verify the mock data structure:

```bash
npm test -- jobs-forecast-mock.test.ts
```

This runs 17 tests that verify:
- Mock data structure and types
- Date format validation
- Multiple components and time periods
- JSON serialization compatibility
- Sufficient data for trend analysis

## Mock Data Details

The mock data includes:

- **January 2025**: 5 jobs across 3 components
- **February 2025**: 6 jobs across 3 components
- **March 2025**: 7 jobs across 3 components
- **April 2025**: 8 jobs across 3 components

This provides realistic data for trend analysis showing:
- Increasing job volume over time
- Different maintenance patterns per component
- Sufficient historical data for forecasting

## Development Tips

### Viewing Saved Forecasts

Query the `forecast_history` table to see all saved forecasts:

```sql
SELECT * FROM forecast_history 
WHERE source = 'dev-mock' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Customizing Mock Data

Edit `/lib/dev/mocks/jobsForecastMock.ts` to add more jobs or change the patterns:

```typescript
export const mockJobs: MockJob[] = [
  { id: "27", component_id: "comp-001", completed_at: "2025-05-05", status: "completed" },
  // Add more jobs...
];
```

### Adjusting the AI Prompt

Edit the prompt in `/pages/api/dev/test-forecast-with-mock.ts`:

```typescript
const prompt = `Você é uma IA embarcada de manutenção. 
Abaixo estão os dados de jobs por componente (por mês):
${JSON.stringify(trendByComponent, null, 2)}

Gere uma previsão detalhada para os próximos 2 meses...`;
```

## Production Considerations

⚠️ **This is a development endpoint**. For production:

1. **Authentication**: Add authentication middleware
2. **Rate Limiting**: Implement rate limiting for OpenAI API calls
3. **Error Handling**: Add comprehensive error handling
4. **Logging**: Add structured logging for monitoring
5. **Caching**: Cache forecasts to reduce API costs
6. **Real Data**: Replace mock data with actual database queries

## Troubleshooting

### "OpenAI API Key not found"

Make sure `OPENAI_API_KEY` is set in your environment variables.

### "Cannot read property 'content' of undefined"

The OpenAI API call failed. Check:
- API key is valid
- You have OpenAI API credits
- Network connectivity

### "Permission denied for table forecast_history"

The database user doesn't have permissions. Check:
- RLS policies are applied
- User is authenticated
- Supabase service role key is correct

## Next Steps

- [ ] Add endpoint to retrieve forecast history
- [ ] Create dashboard to display forecasts
- [ ] Implement real-time data integration
- [ ] Add export functionality (PDF/CSV)
- [ ] Create scheduled cron job for automatic forecasts
- [ ] Add email notifications for critical forecasts

## Related Documentation

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## Support

For issues or questions about this implementation:

1. Check the test file for usage examples
2. Review the API endpoint code for implementation details
3. Verify database schema and permissions
4. Check environment variables are set correctly
