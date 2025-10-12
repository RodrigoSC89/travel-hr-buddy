# Assistant Logs API Implementation

## Overview
This implementation adds an API endpoint to retrieve logs saved by the AI Assistant for display in the history panel.

## Files Created

### 1. Database Migration
**File:** `supabase/migrations/20251012055318_create_assistant_logs.sql`

Creates the `assistant_logs` table with:
- `id` (UUID, primary key)
- `question` (TEXT, not null) - User's question
- `answer` (TEXT, not null) - Assistant's answer
- `user_id` (UUID, not null) - References auth.users
- `created_at` (TIMESTAMP, default now())

**Security (RLS Policies):**
- ✅ Users can view their own logs
- ✅ Admins can view all logs (using `role = 'admin'` from profiles table)
- ✅ Authenticated users can insert their own logs
- ✅ Admins can update/delete all logs

**Indexes:**
- `idx_assistant_logs_user_id` - For filtering by user
- `idx_assistant_logs_created_at` - For ordering by date

### 2. Supabase Edge Function
**File:** `supabase/functions/assistant-logs/index.ts`

**Endpoint:** `GET /functions/v1/assistant-logs`

**Features:**
- ✅ Requires authentication (Authorization header)
- ✅ Validates user session
- ✅ Checks user role from profiles table
- ✅ Returns up to 1000 most recent logs
- ✅ Joins with profiles table to include user email
- ✅ Filters results based on role:
  - Regular users: only their own logs
  - Admins: all logs
- ✅ CORS enabled for frontend access

**Response Format:**
```json
[
  {
    "id": "uuid",
    "question": "string",
    "answer": "string",
    "created_at": "timestamp",
    "user_id": "uuid",
    "user_email": "user@example.com"
  }
]
```

### 3. Next.js API Route (Reference)
**File:** `pages/api/assistant/logs/index.ts`

This is a reference implementation showing how the endpoint would work in a Next.js environment. The actual implementation uses the Supabase Edge Function above.

## Security Features

### Authentication
- ✅ Authorization header required
- ✅ Valid user session verified via `supabase.auth.getUser()`
- ✅ Returns 401 if unauthenticated

### Authorization
- ✅ Role-based access control using `profiles.role`
- ✅ Regular users filtered to only see their own logs
- ✅ Admins can view all logs

### Data Privacy
- ✅ RLS policies enforce data access at database level
- ✅ Queries respect user authentication context
- ✅ Email addresses only visible to admins or log owners

## Usage

### From Frontend
```typescript
import { supabase } from "@/lib/supabase";

async function fetchAssistantLogs() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/assistant-logs`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch logs");
  }

  return response.json();
}
```

### Response Examples

**Regular User:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "question": "Quantas tarefas pendentes?",
    "answer": "📋 Você tem 3 tarefas pendentes.",
    "created_at": "2025-10-12T05:30:00Z",
    "user_id": "user-uuid",
    "user_email": "user@example.com"
  }
]
```

**Admin User:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "question": "Quantas tarefas pendentes?",
    "answer": "📋 Você tem 3 tarefas pendentes.",
    "created_at": "2025-10-12T05:30:00Z",
    "user_id": "user1-uuid",
    "user_email": "user1@example.com"
  },
  {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "question": "Documentos recentes",
    "answer": "📑 Últimos documentos:\n📄 Report Q4...",
    "created_at": "2025-10-12T05:25:00Z",
    "user_id": "user2-uuid",
    "user_email": "user2@example.com"
  }
]
```

## Error Handling

### 401 Unauthorized
- Missing Authorization header
- Invalid session token
- Expired session

### 500 Internal Server Error
- Database query errors
- Profile fetch errors
- Unexpected errors

All errors return JSON with an `error` field:
```json
{
  "error": "Error message"
}
```

## Testing

### Manual Testing with curl
```bash
# Get your session token from Supabase
TOKEN="your-session-token"

# Call the edge function
curl -X GET \
  "${SUPABASE_URL}/functions/v1/assistant-logs" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json"
```

### Integration with AI Assistant

To save logs when the assistant responds, modify the assistant query function to insert into `assistant_logs`:

```typescript
// After getting the answer from the assistant
await supabase
  .from("assistant_logs")
  .insert({
    question: userQuestion,
    answer: assistantAnswer,
    user_id: user.id,
  });
```

## Database Migration

To apply the migration:

```bash
# Using Supabase CLI
supabase db push

# Or apply directly to your Supabase project
# The migration is idempotent and safe to run multiple times
```

## Deployment

The Supabase Edge Function is automatically deployed when pushed to the repository if you have Supabase CLI configured with:

```bash
supabase functions deploy assistant-logs
```

## Backward Compatibility

- ✅ No breaking changes
- ✅ New table and function only
- ✅ Doesn't affect existing functionality
- ✅ Uses existing profiles.role field

## Next Steps

1. **Deploy the migration** to create the `assistant_logs` table
2. **Deploy the edge function** to make the API available
3. **Update the AI Assistant** to save logs when responding to queries
4. **Create frontend component** to display the logs history
5. **Add pagination** if more than 1000 logs are needed

## Related Files

- `supabase/functions/assistant-query/index.ts` - AI Assistant implementation
- `PROFILES_ROLE_IMPLEMENTATION.md` - Role system documentation
- `RESTORE_LOGS_API_IMPLEMENTATION.md` - Similar logs pattern for document restore

## Security Notes

1. ✅ RLS is enabled on assistant_logs table
2. ✅ Users can only view their own logs (unless admin)
3. ✅ Admins are identified by `profiles.role = 'admin'`
4. ✅ Database policies enforce access at the lowest level
5. ✅ Session validation prevents unauthorized access
6. ✅ Error messages don't expose sensitive information
