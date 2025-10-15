# MMI Jobs Quick Reference

## 🎯 Quick Start

### Search for Similar Jobs
```typescript
const { data } = await supabase.functions.invoke('mmi-jobs-similar', {
  body: { query: "hydraulic maintenance", match_threshold: 0.7, match_count: 10 }
});
```

### Add Job with Embedding
```typescript
// 1. Generate embedding
const response = await fetch('https://api.openai.com/v1/embeddings', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${OPENAI_KEY}` },
  body: JSON.stringify({ model: 'text-embedding-ada-002', input: text })
});
const embedding = (await response.json()).data[0].embedding;

// 2. Insert job
await supabase.from('mmi_jobs').insert([{ title, description, embedding }]);
```

## 📊 Database

### Table: `mmi_jobs`
```sql
-- Key columns
id              uuid PRIMARY KEY
title           text NOT NULL
description     text NOT NULL
embedding       vector(1536)
status          text  -- 'pending', 'in_progress', 'completed', 'awaiting_parts'
priority        text  -- 'low', 'medium', 'high', 'critical'
```

### Function: `match_mmi_jobs`
```sql
SELECT * FROM match_mmi_jobs(
  query_embedding,    -- vector(1536)
  match_threshold,    -- 0.7 recommended
  match_count         -- max results
);
```

## 🌐 API Endpoint

### POST `/mmi-jobs-similar`

**Request:**
```json
{
  "query": "string (required)",
  "match_threshold": 0.7,  // optional
  "match_count": 10        // optional
}
```

**Response:**
```json
{
  "data": [
    { "id": "uuid", "title": "...", "description": "...", "similarity": 0.92 }
  ],
  "meta": { "query": "...", "results_count": 5, "timestamp": "..." }
}
```

## 🧪 Testing

```bash
# Run similarity tests
npm run test -- src/tests/mmi-jobs-similarity.test.ts

# Run all MMI tests
npm run test -- src/tests/mmi-jobs-*.test.ts
```

## 🚀 Deployment

```bash
# 1. Apply migration
supabase db push

# 2. Deploy function
supabase functions deploy mmi-jobs-similar

# 3. Set OpenAI key
supabase secrets set OPENAI_API_KEY=your_key
```

## 📈 Performance Tips

- **Threshold**: Start with 0.7, adjust based on results
- **Count**: Limit to 10-20 for best performance
- **Index**: IVFFlat with 100 lists (optimal for <100K jobs)
- **Caching**: Cache embeddings for repeated queries

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| No results | Lower match_threshold |
| Slow queries | Rebuild vector index |
| Dimension error | Use text-embedding-ada-002 (1536) |
| Extension error | Enable pgvector in migration |

## 💰 Costs

- **Per embedding**: ~$0.00001
- **1K jobs indexed**: ~$0.01
- **10K searches/month**: ~$0.10

## 📚 Files

```
supabase/
  migrations/20251015000000_create_mmi_jobs_with_pgvector.sql
  functions/mmi-jobs-similar/
    index.ts
    README.md

src/
  tests/mmi-jobs-similarity.test.ts
  services/mmi/jobsApi.ts
  components/mmi/JobCards.tsx
  pages/MMIJobsPanel.tsx

docs/
  MMI_JOBS_IMPLEMENTATION_COMPLETE.md
  MMI_JOBS_QUICKREF.md (this file)
```

## ✅ Checklist

- [x] SQL function `match_mmi_jobs` created
- [x] pgvector extension enabled
- [x] API endpoint `/mmi-jobs-similar` deployed
- [x] OpenAI embeddings integration
- [x] Tests passing (20 tests)
- [x] Documentation complete
- [ ] Historical jobs imported
- [ ] Frontend integration
- [ ] AI Copilot integration

## 🔗 Quick Links

- [Full Documentation](./MMI_JOBS_IMPLEMENTATION_COMPLETE.md)
- [API README](./supabase/functions/mmi-jobs-similar/README.md)
- [pgvector Docs](https://github.com/pgvector/pgvector)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)

---
**Status**: ✅ Ready for Integration | **Version**: 1.0.0
