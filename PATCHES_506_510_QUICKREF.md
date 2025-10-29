# 🎯 PATCHES 506-510 - Quick Reference Guide

## 🚀 Quick Start

### For Developers

**1. AI Memory System (PATCH 506)**
```typescript
import { useAIMemory } from '@/hooks/use-ai-memory';

const { storeMemory, retrieveMemories } = useAIMemory();

// Store AI interaction
await storeMemory({
  context_type: 'decision',
  action: 'generate_document',
  input_text: 'User request',
  output_text: 'AI response',
  relevance_score: 0.9
});

// Retrieve similar contexts
const similar = await retrieveMemories('safety procedures', 0.7, 5);
```

**2. Backup System (PATCH 507)**
- Admin panel: `/admin/backups`
- Automatic: Every Sunday at 02:00 UTC
- Manual trigger available in admin panel

**3. Enhanced Auth (PATCH 510)**
```typescript
import { initializeTokenRefresh } from '@/services/enhanced-auth-service';

// Initialize on app startup (in main.tsx or App.tsx)
initializeTokenRefresh();
```

User session view: `/user/profile`

---

## 📊 Database Functions

### AI Memory
```sql
-- Search similar memories
SELECT * FROM search_similar_ai_memories(
  embedding_vector,
  0.7,  -- threshold
  5     -- count
);

-- Update access stats
SELECT update_ai_memory_access(memory_id);
```

### AI Reflection
```sql
-- Calculate self-score
SELECT calculate_ai_self_score(
  memory_event_id,
  'generation',
  'Document created',
  0.85,  -- accuracy
  0.90,  -- utility
  0.88,  -- relevance
  0.82   -- confidence
);

-- Get learning insights
SELECT * FROM get_ai_learning_insights(user_id, 30);

-- Get improvement suggestions
SELECT * FROM get_ai_improvement_suggestions(user_id, 10);
```

### Backups
```sql
-- Create backup
SELECT create_backup_snapshot(
  'backup_2025_10_29',
  'manual',
  ARRAY['profiles', 'documents'],
  90  -- retention days
);

-- Get backup stats
SELECT * FROM get_backup_stats();
```

---

## 🔐 Security Features

### RLS Helper Functions
```sql
-- Check if user is admin
SELECT is_admin();

-- Check if user owns record
SELECT is_owner(owner_uuid);
```

### Secured Tables
All critical tables now have RLS policies:
- profiles
- documents
- missions
- crew_members
- checklists
- audits
- mmi_jobs
- workflows
- templates
- ai_memory_events
- backup_snapshots

---

## 🎨 UI Components

### Active Session Display
```tsx
import { ActiveSessionDisplay } from '@/components/auth/ActiveSessionDisplay';

function ProfilePage() {
  return <ActiveSessionDisplay />;
}
```

### AI Learning Dashboard
Available at: `/ai/learning-dashboard`
- View learning insights
- See improvement suggestions
- Track progress over time
- Export learning data

### Backup Admin Panel
Available at: `/admin/backups`
- View backup history
- Trigger manual backup
- Download backups
- Monitor backup status

---

## 🧪 Testing

### Run Security Tests
```bash
npm run test src/tests/security/rls-security.test.ts
```

### Type Check
```bash
npm run type-check
```

### Full Test Suite
```bash
npm run test
```

---

## 📦 Deployment Steps

### 1. Database Setup
```sql
-- Run migrations in order
\i supabase/migrations/20251029_patch_506_ai_memory.sql
\i supabase/migrations/20251029_patch_507_backup_system.sql
\i supabase/migrations/20251029_patch_508_rls_reinforcement.sql
\i supabase/migrations/20251029_patch_509_ai_reflection.sql
```

### 2. Enable PGVector
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Create Storage Bucket
In Supabase Dashboard:
- Storage → New Bucket
- Name: `backups`
- Public: No

### 4. Deploy Edge Function
```bash
supabase functions deploy weekly-backup
```

### 5. Environment Variables
Required:
- `VITE_OPENAI_API_KEY` - For embeddings
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## 🔧 Troubleshooting

### AI Memory Not Working
1. Check if pgvector extension is enabled
2. Verify OpenAI API key is set
3. Check table permissions

### Backups Failing
1. Verify storage bucket exists
2. Check RLS policies on backup_snapshots table
3. Verify cron schedule is active

### Token Refresh Issues
1. Check if initializeTokenRefresh() is called
2. Verify Supabase Auth is configured
3. Check browser console for errors

### RLS Errors
1. Verify user is authenticated
2. Check if user has required role
3. Review RLS policies in migration file

---

## 📊 Monitoring

### AI Memory Stats
```typescript
import { getMemoryStats } from '@/services/ai-memory-service';

const stats = await getMemoryStats();
console.log(stats.total); // Total memories
console.log(stats.byType); // Breakdown by type
console.log(stats.avgRelevance); // Average relevance
```

### Session Monitoring
```typescript
import { getSessionMetadata } from '@/services/enhanced-auth-service';

const session = await getSessionMetadata();
console.log(session?.expiresIn); // Time until expiry
console.log(session?.isExpiring); // Is expiring soon?
```

### Backup Status
View in admin panel: `/admin/backups`
Or query database:
```sql
SELECT * FROM backup_snapshots 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🎯 Best Practices

### AI Memory
1. Store only relevant interactions
2. Set appropriate relevance scores
3. Use descriptive metadata
4. Clean up old memories periodically

### Backups
1. Test backup restoration regularly
2. Monitor backup completion
3. Verify checksum integrity
4. Keep multiple retention copies

### Security
1. Always use RLS policies
2. Never bypass authentication
3. Log security events
4. Review access patterns

### Session Management
1. Let auto-refresh handle tokens
2. Use secure logout
3. Monitor session expiry
4. Handle network interruptions

---

## 📚 API Reference

See `PATCHES_506_510_IMPLEMENTATION.md` for complete API documentation.

---

**Quick Links:**
- AI Learning Dashboard: `/ai/learning-dashboard`
- Backup Admin: `/admin/backups`
- User Profile: `/user/profile`
- Full Documentation: `PATCHES_506_510_IMPLEMENTATION.md`
