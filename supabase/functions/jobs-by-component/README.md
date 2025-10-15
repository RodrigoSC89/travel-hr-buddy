# Jobs By Component BI API

> ⚠️ **DEPRECATED**: This endpoint is superseded by `/bi-jobs-by-component` which provides comprehensive analytics including component names, average execution times, and status breakdowns. Consider migrating to the new endpoint for enhanced functionality.

## Endpoint

`/jobs-by-component`

## Description

This endpoint provides basic Business Intelligence (BI) data about completed jobs grouped by component. It returns only the count of completed jobs per component_id.

**For comprehensive analytics with component names, execution times, and status breakdowns, use `/bi-jobs-by-component` instead.**

## What it does

1. Queries all jobs with status "completed" from the `mmi_jobs` table
2. Groups the results by `component_id`
3. Returns the count of completed jobs for each component

## Request

**Method:** GET

**Headers:**
- `Authorization: Bearer <your-supabase-anon-key>`
- `apikey: <your-supabase-anon-key>`

## Response

**Success Response (200 OK):**

```json
[
  {
    "component_id": "uuid-of-component-1",
    "count": 15
  },
  {
    "component_id": "uuid-of-component-2",
    "count": 8
  },
  {
    "component_id": null,
    "count": 3
  }
]
```

**Error Response (500 Internal Server Error):**

```json
{
  "error": "Error message"
}
```

## Usage Example

```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/jobs-by-component`, {
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'apikey': SUPABASE_ANON_KEY
  }
});

const data = await response.json();
console.log('Jobs by component:', data);
```

## Use Cases

- Dashboard widgets showing job distribution by component
- Analytics reports for component performance
- Visual charts displaying completed work breakdown
- Performance metrics for different system components

## Notes

- Only jobs with status 'completed' are counted
- Jobs without a component_id are grouped as `null`
- The endpoint uses CORS headers allowing access from any origin
- Results are cached according to the default Edge Function cache settings
