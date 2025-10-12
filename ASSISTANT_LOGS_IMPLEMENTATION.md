# Assistant Logs Implementation

## Overview
This document describes the implementation of comprehensive logging for AI Assistant interactions in the Travel HR Buddy system.

## Database Schema

### Table: `assistant_logs`
```sql
CREATE TABLE assistant_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  origin VARCHAR(50) DEFAULT 'assistant',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes
- `idx_assistant_logs_user_id` - Fast lookup by user
- `idx_assistant_logs_created_at` - Efficient date-based queries
- `idx_assistant_logs_origin` - Filter by interaction source

### Row Level Security (RLS)
Three policies ensure data privacy:

1. **Users can view their own logs**: Users can only see their own interaction history
2. **Admin users can view all logs**: Admin role has full access for monitoring
3. **Users can insert their own logs**: Allows automatic logging during API calls

## API Enhancement

### File: `/pages/api/assistant-query.ts`

Added functionality:
- Supabase client initialization for database access
- `logAssistantInteraction()` helper function
- `extractUserId()` helper to parse JWT tokens
- Automatic logging for all interaction types:
  - Predefined commands
  - AI-generated responses
  - Fallback responses
  - Error responses

The logging is non-blocking and gracefully handles failures without interrupting the main assistant functionality.

## User Interface

### File: `/src/pages/admin/assistant-logs.tsx`

Features implemented:

#### 1. Data Display
- Clean card-based layout with user/bot avatars
- Pagination (10 items per page)
- Real-time data from Supabase
- Formatted timestamps with date-fns

#### 2. Filtering
- **Keyword Search**: Search across questions and answers
- **Date Range**: Filter by start and end dates
- **Clear Filters**: Quick reset button
- Real-time filter application

#### 3. Export
- CSV export with UTF-8 BOM for Excel compatibility
- Proper character escaping for special characters
- HTML tag removal from answers
- Timestamped filenames

#### 4. Summary Statistics
- Total interaction count
- Date range of available data
- Empty state handling

## Navigation

### Added to `/src/pages/admin/assistant.tsx`
- "Ver Histórico" (View History) button in the header
- Uses History icon from lucide-react
- Navigates to `/admin/assistant/logs`

### Route Configuration in `/src/App.tsx`
- Added lazy-loaded component import
- Added route: `/admin/assistant/logs`

## Testing

### File: `/src/tests/pages/admin/assistant-logs.test.tsx`

Test coverage:
1. Page title rendering
2. Filter controls rendering
3. Back button navigation
4. Loading state display
5. Export button presence
6. Supabase query execution

All tests use proper mocking for:
- React Router navigation
- Supabase client
- Async data fetching

## Security Considerations

1. **Authentication Required**: All API calls require valid JWT token
2. **Row Level Security**: Database enforces access control
3. **XSS Prevention**: HTML is escaped in CSV export
4. **Data Privacy**: Users only see their own logs (unless admin)
5. **Secure Tokens**: JWT parsing with error handling

## Performance Optimization

1. **Database Indexes**: Fast queries on user_id and created_at
2. **Pagination**: Limits initial data load to 10 items
3. **Lazy Loading**: Component loaded on demand
4. **Client-side Filtering**: Instant filter results without server calls
5. **Non-blocking Logging**: API logging doesn't slow down responses

## Usage

### For Users
1. Navigate to `/admin/assistant`
2. Click "Ver Histórico" button
3. View your conversation history
4. Use filters to find specific interactions
5. Export to CSV for record-keeping

### For Administrators
- Access all logs across all users
- Monitor system-wide usage
- Identify common questions
- Debug issues with responses
- Analyze usage patterns

## Migration

Run the migration file to create the database schema:
```bash
supabase migration apply 20251012043900_create_assistant_logs.sql
```

## Future Enhancements

Potential improvements:
- Analytics dashboard showing usage trends
- Most common questions report
- Response quality metrics
- Integration with external analytics tools
- Bulk export for all users (admin only)
