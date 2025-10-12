# AI Assistant History - Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERACTION                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND: /admin/assistant                            │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  - Chat interface with quick commands                             │  │
│  │  - "Ver Histórico" button → Navigate to logs page                 │  │
│  │  - Sends questions to assistant-query Edge Function               │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              EDGE FUNCTION: assistant-query                              │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  1. Receive question from user                                    │  │
│  │  2. Process query:                                                │  │
│  │     - Check for database queries (tasks, documents)               │  │
│  │     - Match predefined commands                                   │  │
│  │     - Use OpenAI for general questions                            │  │
│  │  3. Generate response                                             │  │
│  │  4. Call logInteraction() [NON-BLOCKING]                          │  │
│  │  5. Return response to user                                       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴──────────────┐
                    ▼                              ▼
┌───────────────────────────────┐  ┌──────────────────────────────────┐
│   LOGGING (Async)             │  │   USER RESPONSE (Immediate)      │
│  ┌─────────────────────────┐  │  │  ┌────────────────────────────┐  │
│  │ logInteraction()        │  │  │  │ Return JSON response:      │  │
│  │ - user_id               │  │  │  │ {                          │  │
│  │ - question              │  │  │  │   "answer": "...",         │  │
│  │ - answer                │  │  │  │   "action": "...",         │  │
│  │ - origin: "assistant"   │  │  │  │   "timestamp": "..."       │  │
│  │ → INSERT into DB        │  │  │  │ }                          │  │
│  └─────────────────────────┘  │  │  └────────────────────────────┘  │
└───────────────────────────────┘  └──────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    DATABASE: assistant_logs                              │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  TABLE assistant_logs                                             │  │
│  │  - id (UUID)                                                      │  │
│  │  - user_id (UUID) → REFERENCES auth.users                        │  │
│  │  - question (TEXT)                                                │  │
│  │  - answer (TEXT)                                                  │  │
│  │  - origin (VARCHAR) DEFAULT 'assistant'                           │  │
│  │  - created_at (TIMESTAMPTZ)                                       │  │
│  │                                                                   │  │
│  │  INDEXES:                                                         │  │
│  │  - idx_assistant_logs_user_id                                     │  │
│  │  - idx_assistant_logs_created_at (DESC)                           │  │
│  │  - idx_assistant_logs_origin                                      │  │
│  │                                                                   │  │
│  │  RLS POLICIES:                                                    │  │
│  │  ✓ Users view own logs                                            │  │
│  │  ✓ Admins view all logs                                           │  │
│  │  ✓ Users insert own logs                                          │  │
│  │  ✓ Admins update all logs                                         │  │
│  │  ✓ Admins delete all logs                                         │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│           ADMIN FEATURE: View History                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Admin clicks "Ver Histórico" button                              │  │
│  │              ▼                                                    │  │
│  │  Navigate to /admin/assistant/logs                                │  │
│  │              ▼                                                    │  │
│  │  Frontend calls assistant-logs Edge Function                      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              EDGE FUNCTION: assistant-logs                               │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  1. Verify authentication (JWT token)                            │  │
│  │  2. Fetch user profile to check role                             │  │
│  │  3. Query database:                                               │  │
│  │     - If ADMIN: SELECT all logs with profiles.email              │  │
│  │     - If USER: SELECT only user's own logs                        │  │
│  │  4. Transform data (add user_email field)                         │  │
│  │  5. Return JSON array of logs                                     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              FRONTEND: /admin/assistant/logs                             │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Display Features:                                                │  │
│  │  ✓ Card-based layout with user/bot avatars                       │  │
│  │  ✓ Real-time keyword search                                       │  │
│  │  ✓ Date range filters (start/end)                                 │  │
│  │  ✓ Clear filters button                                           │  │
│  │  ✓ Pagination (10 items/page)                                     │  │
│  │  ✓ CSV Export with UTF-8 BOM                                      │  │
│  │  ✓ Loading states                                                 │  │
│  │  ✓ Empty states                                                   │  │
│  │  ✓ Responsive design                                              │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   ADMIN ACTIONS:     │
                         │  - View all logs     │
                         │  - Search & Filter   │
                         │  - Export to CSV     │
                         └──────────────────────┘
```

## Key Design Principles

### 1. **Non-Blocking Logging**
```
User Question → Response Generated → Returned to User
                       ↓
                [Async Logging]
                       ↓
                  Database
```
- Logging happens asynchronously
- User experience never blocked by logging failures
- Fast response times maintained

### 2. **Multi-Layer Security**
```
Database Layer (RLS) → Application Layer (Edge Function) → Frontend Layer (Route)
        ↓                          ↓                              ↓
    Policies               Admin Role Check              Protected Routes
```

### 3. **Data Flow**
```
Frontend → Edge Function → Database → Edge Function → Frontend
   │            │              │            │            │
  Send        Process        Store       Retrieve     Display
Question     & Log          Securely     Filtered     Results
```

### 4. **Access Control**
```
                    Database Query
                         │
                    Check Role
                    /        \
            Admin               User
              │                  │
        SELECT * FROM      SELECT * FROM
        assistant_logs     assistant_logs
                          WHERE user_id = 
                          auth.uid()
```

## Performance Optimizations

1. **Indexes**: Fast queries on user_id, created_at, origin
2. **Limit**: Maximum 1000 logs returned
3. **Client-side Filtering**: Search and filters applied in browser
4. **Lazy Loading**: Pages load only visible components
5. **Non-blocking**: Logging doesn't impact response time

## Scalability Considerations

- Logs table can grow indefinitely
- Consider adding:
  - Archive old logs (>90 days)
  - Partition by month
  - Add retention policies
  - Implement log rotation

---

**Architecture Version**: 1.0.0
**Last Updated**: October 12, 2025
