# ETAPA 35: Automated Testing + Certification Viewer + AI Quiz System - Implementation Guide

## Overview

This document provides a comprehensive guide to the implementation of ETAPA 35, which adds three major features to the Nautilus One system:

1. **Automated Testing Infrastructure** with Playwright E2E and Vitest Unit Tests
2. **External Auditor Certification Viewer** for token-based read-only access
3. **AI-Powered Quiz System** for compliance assessment and certification

## 1. Automated Testing Infrastructure

### 1.1 Playwright E2E Testing

**Files Created:**
- `playwright.config.ts` - Playwright configuration
- `e2e/login.spec.ts` - Authentication flow tests (11 tests)
- `e2e/documents.spec.ts` - Document management tests (12 tests)
- `e2e/sgso.spec.ts` - SGSO system tests (13 tests)
- `e2e/audit.spec.ts` - Audit simulation tests (16 tests)
- `e2e/templates.spec.ts` - Template operations tests (16 tests)

**Total: 68 E2E tests covering critical user flows**

**Running E2E Tests:**
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed
```

**Key Features:**
- Comprehensive authentication testing
- Document lifecycle management
- SGSO safety system validation
- Audit workflow verification
- Template operations testing

### 1.2 SGSO AI Helpers Unit Tests

**Files Created:**
- `src/lib/sgso-ai-helpers.ts` - AI helper functions library
- `src/tests/sgso-ai-helpers.test.ts` - Unit tests (30 tests, 100% passing)

**Functions Implemented:**

1. **classifyIncidentWithAI(incident)**
   - Classifies incident severity (low, medium, high, critical)
   - Returns confidence score and reasoning
   - Analyzes incident descriptions for risk indicators

2. **forecastRisk(incidents, timeframe)**
   - Forecasts risk trends based on historical data
   - Predicts future incidents
   - Provides actionable recommendations
   - Returns risk level and confidence metrics

3. **generateCorrectiveAction(incident)**
   - Generates detailed corrective action plans
   - Assigns priority and responsible parties
   - Provides implementation timeline
   - Sets expected outcomes

4. **processNonConformity(description, standard)**
   - Analyzes non-conformity reports
   - Identifies severity (minor, major, critical)
   - Determines if immediate action is required
   - Suggests corrective actions

5. **analyzeIncidentPatterns(incidents)**
   - Identifies common incident types
   - Finds hotspot locations
   - Detects time-based patterns
   - Provides trend-based recommendations

**Running Unit Tests:**
```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run all tests (unit + e2e)
npm run test:all
```

## 2. External Auditor Certification Viewer

### 2.1 Database Schema

**Migration File:** `supabase/migrations/20251018214757_b77335a3-327e-4853-a659-e2ca5a3dcf5d.sql`

**Table: cert_view_tokens**
```sql
- id: UUID (primary key)
- token: UUID (unique, auto-generated)
- vessel_id: UUID (references vessels)
- organization_id: UUID (references organizations)
- expires_at: TIMESTAMP
- view_count: INTEGER
- last_accessed_at: TIMESTAMP
- permissions: JSONB (view_audits, view_documents, view_metrics)
- created_at: TIMESTAMP
- created_by: UUID (references auth.users)
- revoked: BOOLEAN
- revoked_at: TIMESTAMP
- revoked_by: UUID
- notes: TEXT
```

**Functions:**

1. **create_cert_token(vessel_id, organization_id, expires_in_days, permissions, notes)**
   - Creates a new certification token
   - Sets expiration date (default 7 days)
   - Configures granular permissions
   - Requires admin/manager role

2. **validate_cert_token(token)**
   - Validates token authenticity and expiration
   - Increments view count
   - Updates last accessed timestamp
   - Returns vessel and organization information

3. **revoke_cert_token(token)**
   - Revokes an active token
   - Records revocation details
   - Requires admin/manager role

### 2.2 Frontend Implementation

**File:** `src/pages/cert/CertViewer.tsx`

**Features:**
- Token validation on page load
- Display organization and vessel information
- Show permissions granted
- Read-only access to:
  - Recent audits
  - Safety metrics
  - Compliance data
- Access tracking (view count)
- Error handling for invalid/expired tokens

**Route:** `/cert/:token`

**Usage Example:**
```typescript
// Generate token
const { data } = await supabase.rpc('create_cert_token', {
  p_vessel_id: 'vessel-uuid',
  p_organization_id: 'org-uuid',
  p_expires_in_days: 7
});

// Access via: https://your-domain.com/cert/{token}
```

## 3. AI-Powered Quiz System

### 3.1 Database Schema

**Migration File:** `supabase/migrations/20251018214800_449e8f51-011d-4e48-81ad-58fd7f7d9239.sql`

**Table: quiz_templates**
```sql
- id: UUID
- organization_id: UUID
- title: TEXT
- description: TEXT
- standard: TEXT (SGSO, IMCA, ISO, ANP, ISM Code, ISPS Code)
- difficulty: TEXT (Basic, Intermediate, Advanced)
- questions: JSONB (question array)
- passing_score: INTEGER (default 70)
- time_limit_minutes: INTEGER (default 30)
- created_by: UUID
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- is_active: BOOLEAN
- tags: TEXT[]
```

**Table: quiz_results**
```sql
- id: UUID
- user_id: UUID
- organization_id: UUID
- vessel_id: UUID
- quiz_template_id: UUID
- standard: TEXT
- difficulty: TEXT
- questions: JSONB
- answers: JSONB
- score: INTEGER (percentage)
- passed: BOOLEAN
- time_taken_minutes: INTEGER
- started_at: TIMESTAMP
- completed_at: TIMESTAMP
- certificate_url: TEXT
- certificate_generated: BOOLEAN
- certificate_generated_at: TIMESTAMP
- notes: TEXT
- metadata: JSONB
```

**Functions:**

1. **get_user_quiz_stats(user_id)**
   - Returns total quizzes taken
   - Calculates pass/fail counts
   - Computes average score
   - Lists recent quiz attempts

2. **get_org_quiz_stats(organization_id)**
   - Aggregates organization-wide statistics
   - Breaks down by standard and difficulty
   - Calculates pass rates
   - Tracks user engagement

3. **generate_quiz_certificate(quiz_result_id)**
   - Generates certificate for passed quizzes
   - Creates certificate URL
   - Updates certificate metadata

### 3.2 Edge Function

**File:** `supabase/functions/generate-quiz/index.ts`

**Features:**
- GPT-4 integration for question generation
- Fallback to template-based questions
- Supports 6 maritime standards:
  - SGSO
  - IMCA
  - ISO
  - ANP
  - ISM Code
  - ISPS Code
- 3 difficulty levels:
  - Basic
  - Intermediate
  - Advanced
- Multilingual support (pt-BR, en)
- Auto-saves generated quizzes as templates

**Fallback Templates:**
The system includes pre-defined question banks for each standard and difficulty level, ensuring quizzes can be generated even when AI is unavailable.

### 3.3 Frontend Implementation

**File:** `src/pages/admin/quiz/QuizPage.tsx`

**Features:**

1. **Quiz Setup:**
   - Select standard/norm
   - Choose difficulty level
   - View quiz parameters (10 questions, 70% passing score)

2. **Quiz Taking:**
   - Progress indicator
   - Single-question view
   - Multiple-choice answers
   - Category labels per question

3. **Results Display:**
   - Score percentage
   - Pass/fail status
   - Detailed review of all questions
   - Correct answer explanations
   - Certificate generation for passed quizzes

**Route:** `/admin/quiz`

**Workflow:**
1. User selects standard and difficulty
2. System generates 10 questions via AI
3. User answers questions one by one
4. System calculates score and saves result
5. User reviews answers and explanations
6. Certificate generated if score ≥ 70%

## 4. Installation and Setup

### 4.1 Dependencies

The following packages were added:
```json
{
  "devDependencies": {
    "@playwright/test": "^1.x.x"
  }
}
```

### 4.2 Database Setup

Run the migrations in order:
```bash
# Apply certification viewer migration
supabase migration up 20251018214757_b77335a3-327e-4853-a659-e2ca5a3dcf5d

# Apply quiz system migration
supabase migration up 20251018214800_449e8f51-011d-4e48-81ad-58fd7f7d9239
```

### 4.3 Edge Function Deployment

```bash
# Deploy generate-quiz function
supabase functions deploy generate-quiz

# Set environment variables
supabase secrets set OPENAI_API_KEY=your-api-key
```

### 4.4 Environment Variables

Ensure the following environment variables are set:
- `OPENAI_API_KEY` - For AI quiz generation
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key

## 5. Testing

### 5.1 Unit Tests
- 30 tests for SGSO AI helpers
- 100% pass rate
- Coverage for all AI functions

### 5.2 E2E Tests
- 68 tests across 5 test suites
- Covers critical user journeys
- Authentication, documents, SGSO, audits, templates

### 5.3 Integration Tests
- Edge function testing
- Database function verification
- RLS policy validation

## 6. Security Considerations

### 6.1 Certification Viewer
- Token-based authentication
- Time-limited access (configurable expiration)
- Granular permissions (audits, documents, metrics)
- Read-only access enforced
- Automatic access tracking
- Row-level security policies

### 6.2 Quiz System
- User authentication required
- Organization-level isolation
- Results tied to authenticated users
- Certificate generation requires passing score
- RLS policies enforce data access rules

## 7. Performance Optimizations

- Database indexes on frequently queried columns
- Edge function for serverless quiz generation
- Lazy loading of React components
- Efficient query patterns
- Cached quiz templates

## 8. Future Enhancements

1. **Testing:**
   - Visual regression testing
   - Performance testing
   - Load testing for edge functions

2. **Certification Viewer:**
   - Custom branding per auditor
   - PDF export of certification data
   - Multi-language support
   - Advanced analytics dashboard

3. **Quiz System:**
   - Adaptive difficulty (AI-adjusted)
   - Video-based questions
   - Practical scenario simulations
   - Peer review system
   - Gamification elements

## 9. Troubleshooting

### Quiz Generation Fails
- Check OPENAI_API_KEY is set
- Verify edge function deployment
- System will fallback to templates automatically

### Token Validation Errors
- Ensure token hasn't expired
- Check if token was revoked
- Verify vessel and organization exist

### Test Failures
- Run `npm run test:unit` separately from `npm run test:e2e`
- Playwright tests need browser installation: `npx playwright install`
- Check environment variables are set correctly

## 10. API Reference

### Certification Viewer

```typescript
// Create token
const { data } = await supabase.rpc('create_cert_token', {
  p_vessel_id: string,
  p_organization_id: string,
  p_expires_in_days?: number, // default 7
  p_permissions?: jsonb, // optional custom permissions
  p_notes?: string
});

// Validate token
const { data } = await supabase.rpc('validate_cert_token', {
  p_token: string
});

// Revoke token
const { data } = await supabase.rpc('revoke_cert_token', {
  p_token: string
});
```

### Quiz System

```typescript
// Generate quiz
const { data } = await supabase.functions.invoke('generate-quiz', {
  body: {
    standard: 'SGSO' | 'IMCA' | 'ISO' | 'ANP' | 'ISM Code' | 'ISPS Code',
    difficulty: 'Basic' | 'Intermediate' | 'Advanced',
    questionCount: number, // default 10
    language: 'pt-BR' | 'en' // default 'pt-BR'
  }
});

// Get user stats
const { data } = await supabase.rpc('get_user_quiz_stats', {
  p_user_id?: string // optional, defaults to current user
});

// Get org stats
const { data } = await supabase.rpc('get_org_quiz_stats', {
  p_organization_id: string
});

// Generate certificate
const { data } = await supabase.rpc('generate_quiz_certificate', {
  p_quiz_result_id: string
});
```

## 11. Compliance Standards Supported

1. **SGSO** - Sistema de Gestão de Segurança Operacional
2. **IMCA** - International Marine Contractors Association
3. **ISO** - International Standards Organization
4. **ANP** - Agência Nacional do Petróleo
5. **ISM Code** - International Safety Management Code
6. **ISPS Code** - International Ship and Port Facility Security Code

## Conclusion

ETAPA 35 successfully implements comprehensive automated testing, external auditor access, and AI-powered assessment capabilities for the Nautilus One system. All components are production-ready with proper security, documentation, and testing in place.
