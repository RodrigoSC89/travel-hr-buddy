# Assistant Logs API Route - Next.js App Router Implementation

## Overview
This directory contains a **reference implementation** of the Assistant Logs API using Next.js 13+ App Router conventions with the `@supabase/ssr` package.

## Important Note
⚠️ **This is not the active implementation.** This project uses Vite + React with Supabase Edge Functions.

The **active implementation** is located at:
- **Edge Function**: `supabase/functions/assistant-logs/index.ts`
- **Reference API Route (Pages Router)**: `pages/api/assistant/logs/index.ts`

## Purpose
This file demonstrates how to implement the Assistant Logs API in a Next.js 13+ environment using:
- Next.js App Router (`app/` directory structure)
- `@supabase/ssr` package for server-side authentication
- Server Components and Route Handlers

## File Structure
```
app/
└── api/
    └── assistant/
        └── logs/
            └── route.ts          # This file - GET endpoint
```

## API Specification

### Endpoint
```
GET /api/assistant/logs
```

### Query Parameters
- `start` (optional): Start date for filtering logs (format: YYYY-MM-DD)
- `end` (optional): End date for filtering logs (format: YYYY-MM-DD)
- `email` (optional, admin only): Filter logs by user email (case-insensitive partial match)

### Response Format
```typescript
[
  {
    id: string;
    question: string;
    answer: string;
    created_at: string;
    user_id: string;
    user_email: string;  // User's email or "Anônimo"
    profiles: {
      email: string;
    }
  }
]
```

### Security Features

#### Authentication
- ✅ Requires valid Supabase session via cookies
- ✅ Returns 401 if user is not authenticated
- ✅ Uses `@supabase/ssr` for secure server-side authentication

#### Authorization
- ✅ **Regular Users**: Can only view their own logs
- ✅ **Admin Users** (`role = 'admin'` in profiles table):
  - Can view all logs
  - Can filter logs by email address

#### Data Filtering
- ✅ Date range filtering (start/end dates)
- ✅ Email filtering (admin only, case-insensitive)
- ✅ Returns up to 1000 most recent logs
- ✅ Ordered by `created_at` (most recent first)

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage Example

### From Client Component
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

async function fetchLogs(start?: string, end?: string, email?: string) {
  const params = new URLSearchParams();
  if (start) params.set('start', start);
  if (end) params.set('end', end);
  if (email) params.set('email', email);

  const response = await fetch(`/api/assistant/logs?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch logs');
  }
  
  return response.json();
}

// Example: Fetch logs from the last 7 days
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split('T')[0];
const today = new Date().toISOString().split('T')[0];

const logs = await fetchLogs(sevenDaysAgo, today);
```

### From Server Component
```typescript
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

async function AssistantLogsPage() {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Fetch logs directly from the database
  const { data: logs } = await supabase
    .from('assistant_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div>
      {logs?.map(log => (
        <div key={log.id}>
          <p><strong>Q:</strong> {log.question}</p>
          <p><strong>A:</strong> {log.answer}</p>
        </div>
      ))}
    </div>
  );
}
```

## Migration Guide

If you're migrating this Vite project to Next.js:

### Step 1: Install Next.js and Dependencies
```bash
npm install next@latest react@latest react-dom@latest
npm install @supabase/ssr @supabase/supabase-js
```

### Step 2: Update Project Structure
```
# Move files from src/ to app/
src/pages/     → app/
src/components/ → components/ (or app/components/)
```

### Step 3: Replace Edge Functions
Instead of calling Supabase Edge Functions, use Next.js API routes:
```typescript
// Before (Vite + Edge Function)
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/assistant-logs`,
  {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  }
);

// After (Next.js)
const response = await fetch('/api/assistant/logs');
```

### Step 4: Update Authentication
Replace client-side Supabase calls with server-side authentication:
```typescript
// In Route Handler (route.ts)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  // ... rest of your logic
}
```

## Database Schema

The API expects the following database structure:

### Table: `assistant_logs`
```sql
CREATE TABLE assistant_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_assistant_logs_user_id ON assistant_logs(user_id);
CREATE INDEX idx_assistant_logs_created_at ON assistant_logs(created_at DESC);
```

### Table: `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  -- other fields...
);
```

### Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE assistant_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view own logs"
  ON assistant_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all logs
CREATE POLICY "Admins can view all logs"
  ON assistant_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Users can insert their own logs
CREATE POLICY "Users can insert own logs"
  ON assistant_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Testing

### Test Authentication
```bash
curl -X GET http://localhost:3000/api/assistant/logs \
  -H "Cookie: sb-access-token=your_session_token"
```

### Test Date Filtering
```bash
curl -X GET "http://localhost:3000/api/assistant/logs?start=2025-10-01&end=2025-10-12"
```

### Test Email Filtering (Admin Only)
```bash
curl -X GET "http://localhost:3000/api/assistant/logs?email=john@example.com"
```

## Performance Considerations

- **Limit**: Returns maximum 1000 logs per request
- **Indexing**: Ensure indexes exist on `user_id` and `created_at`
- **Caching**: Consider implementing Redis caching for frequently accessed logs
- **Pagination**: For production, implement cursor-based pagination

## Security Best Practices

1. ✅ Always validate user authentication before querying logs
2. ✅ Check user role before allowing email filtering
3. ✅ Use parameterized queries (Supabase handles this automatically)
4. ✅ Implement rate limiting to prevent abuse
5. ✅ Log all access attempts for audit trails
6. ✅ Use RLS policies as a second layer of security

## Related Documentation

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase SSR Package](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Active Edge Function Implementation](../../../supabase/functions/assistant-logs/index.ts)

## Support

For issues or questions:
1. Check the active Edge Function implementation
2. Review Supabase authentication documentation
3. Verify environment variables are set correctly
4. Check browser console and server logs for errors
