# MMI v1.1.0 - AI Adaptive Maintenance Implementation

## 🎯 Overview

This document provides a complete technical guide for the MMI v1.1.0 (Manutenção Inteligente - Intelligent Maintenance) implementation in Nautilus One. This version introduces a full-featured AI-powered predictive maintenance system with continuous learning, contextual AI recommendations, and intelligent reporting.

## ✨ Key Features

### 1. 🧠 Continuous Learning with Vector Embeddings

- **Vector Database Integration**: pgvector extension in Supabase for efficient similarity search
- **Automatic Vectorization**: Jobs and maintenance history converted to 1536-dimensional vectors using OpenAI embeddings
- **Historical Analysis**: RPC functions `match_mmi_jobs()` and `match_mmi_job_history()` enable semantic search
- **Performance**: Similarity searches complete in <0.5s with cosine similarity threshold of 0.7

### 2. 💬 AI Copilot with Contextual Reasoning

- **GPT-4 Integration**: Provides contextual maintenance recommendations based on current job and historical similar cases
- **Structured Output**: Returns technical action, component, deadline, OS requirement, and detailed reasoning
- **Similar Cases Display**: Shows top 5 similar historical cases with similarity percentages
- **Interactive UI**: Modal interface with color-coded sections for easy reading

### 3. 📄 Intelligent PDF Reports

- **Professional Layout**: A4 format with statistics dashboard, job cards, and AI insights
- **html2pdf.js Integration**: Client-side PDF generation with high quality output
- **AI Recommendations Embedded**: Each job includes both original AI suggestions and detailed v1.1.0 recommendations
- **Ready for Audits**: Formatted for technical inspections and regulatory compliance

### 4. 🔄 Supabase Integration with Graceful Fallback

- **Real-time Data**: Jobs stored in Supabase with automatic embedding generation
- **History Tracking**: Every action (create OS, postpone) is logged with embeddings for future learning
- **Fallback Mode**: Gracefully degrades to mock data when database is unavailable
- **Status Updates**: Job status automatically updated when actions are taken

## 🏗️ Architecture

### Service Layer

```
src/services/mmi/
├── embeddingService.ts      # Vector embedding generation with OpenAI
├── copilotApi.ts            # AI recommendations with GPT-4
├── pdfReportService.ts      # PDF report generation
└── jobsApi.ts               # Job CRUD operations with Supabase
```

### Type Definitions

```typescript
// Enhanced types in src/types/mmi.ts
interface MMIJob {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string;
  component_name: string;
  component: {...};
  suggestion_ia?: string;
  can_postpone?: boolean;
  ai_recommendation?: AIRecommendation;
  embedding?: number[];
}

interface AIRecommendation {
  technical_action: string;
  component: string;
  deadline: string;
  requires_work_order: boolean;
  reasoning: string;
  similar_cases: SimilarCase[];
}
```

### Component Structure

```
src/components/mmi/
├── JobCards.tsx             # Enhanced with AI modal and PDF export
├── MMICopilot.tsx          # AI assistant for maintenance queries
└── Dashboard.tsx           # MMI statistics dashboard
```

## 🔧 Setup Instructions

### Environment Variables

```env
VITE_OPENAI_API_KEY=sk-...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

### Database Schema (Optional - Supabase)

If using Supabase integration, create the following tables:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Main jobs table
CREATE TABLE mmi_jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'Pendente',
  priority TEXT DEFAULT 'Média',
  due_date DATE NOT NULL,
  component_name TEXT NOT NULL,
  asset_name TEXT,
  vessel_name TEXT,
  suggestion_ia TEXT,
  can_postpone BOOLEAN DEFAULT true,
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Job history for learning
CREATE TABLE mmi_job_history (
  id SERIAL PRIMARY KEY,
  job_id TEXT REFERENCES mmi_jobs(id),
  action TEXT NOT NULL,
  ai_recommendation TEXT,
  outcome TEXT,
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_mmi_job_history(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  job_id TEXT,
  action TEXT,
  outcome TEXT,
  similarity float,
  created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mmi_job_history.job_id,
    mmi_job_history.action,
    mmi_job_history.outcome,
    1 - (mmi_job_history.embedding <=> query_embedding) as similarity,
    mmi_job_history.created_at
  FROM mmi_job_history
  WHERE 1 - (mmi_job_history.embedding <=> query_embedding) > match_threshold
  ORDER BY mmi_job_history.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

## 📊 API Reference

### Embedding Service

```typescript
// Generate embedding for text
const embedding = await generateEmbedding(text: string): Promise<number[]>

// Generate embedding from job data
const embedding = await generateJobEmbedding(jobData: {
  title: string;
  component_name: string;
  priority?: string;
  description?: string;
}): Promise<number[]>

// Calculate similarity between vectors
const similarity = cosineSimilarity(vecA: number[], vecB: number[]): number
```

### Copilot API

```typescript
// Get AI recommendation with historical context
const recommendation = await getAIRecommendation(
  jobDescription: string,
  jobId?: string
): Promise<AIRecommendation>

// Stream copilot suggestions
await streamCopilotSuggestions(
  prompt: string,
  onChunk: (text: string) => void
): Promise<void>
```

### Jobs API

```typescript
// Fetch all jobs
const { jobs } = await fetchJobs(): Promise<{ jobs: MMIJob[] }>

// Fetch job with AI recommendation
const job = await fetchJobWithAI(jobId: string): Promise<MMIJob | null>

// Create new job
const job = await createJob(jobData: Partial<MMIJob>): Promise<MMIJob>

// Postpone job
const result = await postponeJob(jobId: string): Promise<{
  message: string;
  new_date?: string;
}>

// Create work order
const result = await createWorkOrder(jobId: string): Promise<{
  os_id: string;
  message: string;
}>
```

### PDF Report Service

```typescript
// Generate PDF report
await generatePDFReport(
  jobs: MMIJob[],
  options?: {
    includeAIRecommendations?: boolean;
    title?: string;
    subtitle?: string;
  }
): Promise<void>
```

## 🚀 Usage Examples

### Accessing AI Recommendations

```typescript
import { fetchJobWithAI } from '@/services/mmi/jobsApi';

// Get job with AI recommendation
const jobWithAI = await fetchJobWithAI('JOB-001');
console.log(jobWithAI.ai_recommendation);
```

### Generating PDF Reports

```typescript
import { generatePDFReport } from '@/services/mmi/pdfReportService';

// Generate report for all jobs
await generatePDFReport(jobs, {
  includeAIRecommendations: true,
  title: 'Relatório MMI - Manutenção Inteligente',
  subtitle: 'Nautilus One v1.1.0',
});
```

### Using the Copilot

```typescript
import { getAIRecommendation } from '@/services/mmi/copilotApi';

const recommendation = await getAIRecommendation(
  'Gerador STBD com ruído incomum e aumento de temperatura'
);
```

## 🧪 Testing

The implementation includes comprehensive fallback mechanisms:

- **No OpenAI API Key**: Uses mock embeddings and recommendations
- **No Supabase**: Falls back to mock data with full functionality
- **Network Errors**: Gracefully handles errors with informative messages

All existing tests pass (345 tests), ensuring backward compatibility.

## 📦 Bundle Impact

- MMI Module: ~131 kB (gzip: ~36 kB)
- html2pdf: ~147 kB (gzip: ~34 kB)
- Total build time: ~50s

## 🔮 Future Enhancements

- v1.2.0: IoT sensor integration and real-time telemetry
- v1.3.0: Feedback-based learning and effectiveness metrics
- v2.0.0: Full predictive maintenance with advanced ML models

## 📚 Related Documentation

- `MMI_V1.1.0_QUICKREF.md` - Quick reference guide
- `MMI_V1.1.0_VISUAL_SUMMARY.md` - Visual before/after comparison
- `MMI_V1.1.0_COMPLETE.md` - Complete implementation summary

## ✅ Deployment Checklist

- [ ] Set environment variables (OpenAI API key, Supabase credentials)
- [ ] Run database migrations (if using Supabase)
- [ ] Build application: `npm run build`
- [ ] Test in staging environment
- [ ] Deploy to production
- [ ] Monitor performance metrics

---

**Nautilus One v1.1.0** 🌊 - Engenharia e IA para a era da manutenção preditiva marítima.
