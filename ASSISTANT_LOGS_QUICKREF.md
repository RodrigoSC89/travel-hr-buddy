# Assistant Logs - Quick Reference Guide

## 🎯 Quick Links
- **View Logs**: `/admin/assistant/logs`
- **Assistant**: `/admin/assistant`
- **Database Table**: `assistant_logs`
- **Migration File**: `supabase/migrations/20251012043900_create_assistant_logs.sql`

## 📦 What Was Implemented

### 1. Database Schema
```sql
assistant_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  origin VARCHAR(50) DEFAULT 'assistant',
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

### 2. Key Features
✅ **Automatic Logging** - All assistant interactions are logged automatically  
✅ **Row Level Security** - Users see only their own logs (admins see all)  
✅ **Keyword Search** - Filter logs by text in questions or answers  
✅ **Date Range Filter** - Filter by start and end dates  
✅ **CSV Export** - Export filtered logs with proper UTF-8 encoding  
✅ **Pagination** - 10 items per page for performance  
✅ **User-Friendly UI** - Card-based layout with avatars  

### 3. File Changes
- `pages/api/assistant-query.ts` - Added logging logic (+65 lines)
- `src/pages/admin/assistant.tsx` - Added "Ver Histórico" button
- `src/App.tsx` - Added route for logs page
- `src/pages/admin/assistant-logs.tsx` - New logs viewer (330 lines)
- `src/tests/pages/admin/assistant-logs.test.tsx` - Test suite (6 tests)

## 🚀 How to Use

### For End Users
1. Navigate to `/admin/assistant`
2. Click "Ver Histórico" button
3. View your interaction history
4. Use filters to find specific conversations
5. Export to CSV if needed

### For Administrators
1. Navigate to `/admin/assistant/logs`
2. View all system interactions
3. Filter by keywords or dates
4. Export data for analysis or compliance

## 🔒 Security

### Authentication
- JWT token required in Authorization header
- User ID extracted from token payload
- Service role key used for server-side logging

### Row Level Security (RLS)
```sql
-- Users see only their own logs
WHERE auth.uid() = user_id

-- Admins see all logs
WHERE EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.role = 'admin'
)
```

## 📊 API Logging Flow

```
User Request
    ↓
Extract user_id from JWT
    ↓
Process question
    ↓
Generate answer
    ↓
Log to database (async, non-blocking)
    ↓
Return response
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
- ✅ Page rendering
- ✅ Filter controls
- ✅ Navigation functionality
- ✅ Loading states
- ✅ Export button presence
- ✅ Back button navigation

### Test Results
- **Total Tests**: 139 passing
- **New Tests**: 6 for assistant logs
- **Build Time**: ~38 seconds
- **All TypeScript**: ✅ No errors

## 📝 Environment Variables

### Required for Logging
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Optional
```env
OPENAI_API_KEY=sk-... # For AI-generated responses
```

## 🎨 UI Components

### Filter Bar
- 🔍 Keyword search input
- 📅 Start date picker
- 📅 End date picker
- ❌ Clear filters button

### Log Card
- 👤 User avatar + question
- 🤖 Bot avatar + answer
- 📅 Timestamp
- 🏷️ Origin tag

### Actions
- [Exportar CSV] - Download filtered logs
- [Anterior] [Próxima] - Pagination
- [←] - Back to assistant

## 📈 Performance

### Database Indexes
```sql
idx_assistant_logs_user_id      -- Fast user-specific queries
idx_assistant_logs_created_at   -- Fast date range queries
idx_assistant_logs_origin       -- Fast origin filtering
```

### Frontend Optimization
- Lazy loading of logs page component
- Client-side filtering for instant results
- Pagination (10 items per page)
- Efficient React state management

## 🐛 Debugging

### Check if Logging Works
```sql
SELECT * FROM assistant_logs 
WHERE user_id = 'your-user-id' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Common Issues
1. **No logs appearing**: Check SUPABASE_SERVICE_ROLE_KEY is set
2. **Permission denied**: Verify RLS policies are applied
3. **JWT decode error**: Ensure Authorization header format is correct
4. **CSV export fails**: Check browser console for errors

## 📚 Documentation Files
- `ASSISTANT_LOGS_IMPLEMENTATION.md` - Detailed technical docs
- `ASSISTANT_LOGS_VISUAL_SUMMARY.md` - Visual diagrams and flows
- `ASSISTANT_LOGS_QUICKREF.md` - This quick reference

## ✅ Verification Checklist

- [x] Database migration created and ready
- [x] API route enhanced with logging
- [x] Logs page created with all features
- [x] Routing configured
- [x] History button added to assistant page
- [x] Tests created and passing (6 tests)
- [x] Build successful (no TypeScript errors)
- [x] Documentation complete
- [x] All 139 tests passing

## 🎯 Success Metrics

- **Test Coverage**: 139 tests passing (+6 new)
- **Build Time**: 37-38 seconds
- **TypeScript Errors**: 0
- **Code Quality**: Follows existing patterns
- **Documentation**: Comprehensive (3 docs)

## 🔗 Related Features

- **AI Assistant**: `/admin/assistant`
- **Execution Logs**: `/admin/automation/execution-logs`
- **Report Logs**: `/admin/reports/logs`
- **Documents**: `/admin/documents`

## 💡 Future Enhancements

- Real-time updates via Supabase subscriptions
- Advanced analytics dashboard
- Sentiment analysis on interactions
- Usage heatmaps
- Custom date range presets
- Bulk operations
- Advanced search with operators
