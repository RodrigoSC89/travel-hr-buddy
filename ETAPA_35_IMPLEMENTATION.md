# ETAPA 35 - Complete Implementation Guide

## Overview

This document provides detailed implementation information for ETAPA 35, which includes:
1. Automated Testing Infrastructure (E2E + Unit tests)
2. External Auditor Certification Viewer
3. AI-Powered Quiz System

## 1. Automated Testing Infrastructure

### 1.1 Playwright E2E Testing

**Installation**:
```bash
npm install -D @playwright/test@latest
```

**Configuration** (`playwright.config.ts`):
- Test directory: `./e2e`
- Base URL: `http://localhost:5173`
- Parallel execution enabled
- Retry on CI: 2 attempts
- Screenshots on failure
- HTML reporter

**Test Suites**:

#### Login Tests (11 tests)
- Location: `e2e/login.spec.ts`
- Coverage:
  - Login page display
  - Email validation
  - Invalid credentials handling
  - Password visibility toggle
  - Keyboard navigation
  - Network error handling

#### Document Management Tests (12 tests)
- Location: `e2e/documents.spec.ts`
- Coverage:
  - Document list display
  - Search functionality
  - Filter options
  - CRUD operations
  - Pagination
  - Metadata display

#### SGSO System Tests (13 tests)
- Location: `e2e/sgso.spec.ts`
- Coverage:
  - Dashboard display
  - Incident management
  - Risk metrics
  - AI classification
  - Action plans
  - Report export

#### Audit Simulation Tests (16 tests)
- Location: `e2e/audit.spec.ts`
- Coverage:
  - Audit dashboard
  - Audit creation
  - Type filtering
  - Status tracking
  - Comments
  - Risk alerts
  - Report export

#### Template Operations Tests (16 tests)
- Location: `e2e/templates.spec.ts`
- Coverage:
  - Template list
  - Search and filter
  - CRUD operations
  - Preview functionality
  - AI generation
  - Version history

### 1.2 Unit Testing

**SGSO AI Helpers Tests** (`src/tests/sgso-ai-helpers.test.ts`):
- 28 comprehensive tests
- 100% function coverage
- Test categories:
  - Incident classification (5 tests)
  - Risk forecasting (6 tests)
  - Corrective actions (5 tests)
  - Non-conformity processing (6 tests)
  - Pattern analysis (6 tests)

**Running Tests**:
```bash
# Unit tests only
npm run test:unit

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e:ui

# E2E in headed mode
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# All tests
npm run test:all
```

## 2. SGSO AI Helper Functions

### 2.1 Implementation Details

**Location**: `src/lib/sgso-ai-helpers.ts`

#### Function: `classifyIncidentWithAI`

**Purpose**: Automatically categorizes incidents with severity analysis

**Parameters**:
- `incident: Incident` - Incident data including description

**Returns**: `IncidentClassification` object with:
- `category` - Incident category (Fire Safety, Working at Heights, etc.)
- `severity` - Risk level (low, medium, high, critical)
- `riskLevel` - Numeric score (0-100)
- `confidence` - AI confidence level (0-1)
- `reasoning` - Explanation of classification

**Example**:
```typescript
const incident = {
  id: '123',
  description: 'Fire broke out in engine room',
  severity: 'high'
};

const classification = await classifyIncidentWithAI(incident);
// Returns: { category: 'Fire Safety', severity: 'high', riskLevel: 75, ... }
```

#### Function: `forecastRisk`

**Purpose**: Analyzes historical incidents to predict risk trends

**Parameters**:
- `incidents: Incident[]` - Array of historical incidents

**Returns**: `RiskForecast` object with:
- `riskScore` - Overall risk score (0-100)
- `trend` - Direction (increasing, stable, decreasing)
- `factors` - Risk contributing factors
- `recommendations` - Suggested actions
- `confidenceLevel` - Forecast confidence (0-1)

**Example**:
```typescript
const forecast = await forecastRisk(historicalIncidents);
// Returns: { riskScore: 65, trend: 'increasing', ... }
```

#### Function: `generateCorrectiveAction`

**Purpose**: Creates detailed action plans for incidents

**Parameters**:
- `incident: Incident` - The incident requiring action
- `classification?: IncidentClassification` - Optional classification data

**Returns**: `CorrectiveAction` object with:
- `title` - Action plan title
- `description` - Detailed description
- `priority` - Urgency level
- `estimatedDuration` - Expected completion time
- `resources` - Required resources
- `steps` - Step-by-step action items

**Example**:
```typescript
const action = await generateCorrectiveAction(incident, classification);
// Returns: { title: 'Fire Safety Enhancement', priority: 'high', ... }
```

#### Function: `processNonConformity`

**Purpose**: Analyzes non-conformities and generates remediation plans

**Parameters**:
- `nonConformity: NonConformity` - Non-conformity details

**Returns**: `NonConformityProcessing` object with:
- `analysis` - Detailed analysis
- `rootCause` - Identified root causes
- `impact` - Impact assessment
- `correctiveActions` - Multiple action plans
- `preventiveActions` - Prevention measures
- `timeline` - Implementation timeline

**Example**:
```typescript
const processing = await processNonConformity(nonConformity);
// Returns: { analysis: '...', rootCause: [...], ... }
```

#### Function: `analyzeIncidentPatterns`

**Purpose**: Identifies recurring patterns in incident data

**Parameters**:
- `incidents: Incident[]` - Historical incident data

**Returns**: `IncidentPattern[]` - Array of patterns with:
- `pattern` - Pattern description
- `frequency` - Occurrence count
- `commonFactors` - Shared characteristics
- `affectedAreas` - Locations/departments
- `recommendations` - Suggested improvements
- `trendAnalysis` - Trend description

**Example**:
```typescript
const patterns = await analyzeIncidentPatterns(incidents);
// Returns: [{ pattern: 'Recurring at Engine Room', frequency: 5, ... }]
```

## 3. External Auditor Certification Viewer

### 3.1 Database Schema

**Table**: `cert_view_tokens`

```sql
CREATE TABLE cert_view_tokens (
  id UUID PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  vessel_id UUID REFERENCES vessels(id),
  organization_id UUID REFERENCES organizations(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  can_view_audits BOOLEAN DEFAULT true,
  can_view_documents BOOLEAN DEFAULT true,
  can_view_metrics BOOLEAN DEFAULT true,
  notes TEXT,
  auditor_name TEXT,
  auditor_email TEXT,
  ip_addresses TEXT[],
  user_agents TEXT[]
);
```

### 3.2 SQL Functions

#### Create Token
```sql
SELECT * FROM create_cert_token(
  p_vessel_id := 'vessel-uuid',
  p_organization_id := 'org-uuid',
  p_expires_in_days := 7,
  p_auditor_name := 'John Doe',
  p_auditor_email := 'auditor@example.com',
  p_notes := 'Annual audit access'
);
```

Returns: `{ token, expires_at }`

#### Validate Token
```sql
SELECT * FROM validate_cert_token(
  p_token := 'token-string',
  p_ip_address := '192.168.1.1',
  p_user_agent := 'Mozilla/5.0...'
);
```

Returns: Token validation data with permissions

#### Revoke Token
```sql
SELECT revoke_cert_token('token-string');
```

Returns: `true` if successful

### 3.3 Component Usage

**CertViewer Component** (`src/components/cert/CertViewer.tsx`):

Features:
- Automatic token validation on load
- Permission-based tab display
- Access tracking (IP, user agent, count)
- Expiration warnings
- Read-only data display

**Route**: `/cert/:token`

**Integration**:
```typescript
// App.tsx
<Route path="/cert/:token" element={<CertViewer />} />
```

### 3.4 Row-Level Security

RLS Policies implemented:
1. Users can view their own tokens
2. Users can create tokens for their organization
3. Users can update (revoke) their own tokens
4. Public access through validate_cert_token function

## 4. AI-Powered Quiz System

### 4.1 Database Schema

#### Table: `quiz_templates`
```sql
CREATE TABLE quiz_templates (
  id UUID PRIMARY KEY,
  standard TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  category TEXT,
  created_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0
);
```

#### Table: `quiz_results`
```sql
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID,
  standard TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  questions JSONB NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  certificate_url TEXT,
  certificate_id TEXT UNIQUE,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  ai_generated BOOLEAN DEFAULT false
);
```

### 4.2 Edge Function

**Function**: `generate-quiz`
**Location**: `supabase/functions/generate-quiz/index.ts`

**Endpoint**: `POST /functions/v1/generate-quiz`

**Request**:
```json
{
  "standard": "SGSO",
  "difficulty": "Intermediate",
  "count": 10
}
```

**Response**:
```json
{
  "questions": [...],
  "source": "ai" | "templates" | "fallback"
}
```

**Logic Flow**:
1. Try fetching from `quiz_templates`
2. If insufficient, try GPT-4 generation
3. Fall back to programmatic generation

### 4.3 Quiz Page Component

**Location**: `src/pages/admin/QuizPage.tsx`

**Features**:
- Standard and difficulty selection
- 10 questions per quiz
- Real-time progress tracking
- Answer review with explanations
- Automatic certificate generation
- Results persistence

**Route**: `/admin/quiz`

**Passing Requirements**:
- Minimum score: 7/10 (70%)
- Certificate awarded on pass
- Results saved to database

### 4.4 SQL Functions

#### User Statistics
```sql
SELECT * FROM get_user_quiz_stats('user-uuid');
```

Returns:
- Total quizzes taken
- Passed/failed counts
- Average score
- Best score
- Standards completed
- Certificates earned

#### Leaderboard
```sql
SELECT * FROM get_quiz_leaderboard('SGSO', 10);
```

Returns top 10 performers for specified standard

#### Generate Certificate
```sql
SELECT * FROM generate_certificate_id('result-uuid');
```

Generates unique certificate ID: `CERT-{STANDARD}-{YYYYMM}-{RANDOM}`

### 4.5 Sample Quiz Templates

11 sample questions pre-loaded covering all standards:
- SGSO (3 questions)
- IMCA (2 questions)
- ISO (2 questions)
- ANP (1 question)
- ISM Code (2 questions)
- ISPS Code (1 question)

## 5. Testing Strategy

### 5.1 E2E Testing Strategy

**Scope**: Critical user journeys
**Tool**: Playwright
**Execution**: CI/CD pipeline
**Coverage**: Authentication, CRUD operations, workflows

### 5.2 Unit Testing Strategy

**Scope**: Business logic and utilities
**Tool**: Vitest
**Execution**: Pre-commit and CI/CD
**Coverage**: AI helpers, utilities, services

### 5.3 Test Data Management

- Mock Supabase client for unit tests
- Test fixtures in `src/tests/setup.ts`
- Isolated test environment
- Cleanup after each test

## 6. Deployment

### 6.1 Database Migrations

Apply migrations:
```bash
supabase db push
```

Migrations:
- `20251018220000_create_cert_view_tokens.sql`
- `20251018221000_create_quiz_system.sql`

### 6.2 Edge Functions

Deploy:
```bash
supabase functions deploy generate-quiz
```

Set environment variables:
- `OPENAI_API_KEY` - For GPT-4 integration

### 6.3 Frontend Deployment

Build:
```bash
npm run build
```

Preview:
```bash
npm run preview
```

## 7. Monitoring and Maintenance

### 7.1 Token Cleanup

Schedule cron job:
```sql
SELECT cleanup_expired_cert_tokens();
```

### 7.2 Quiz Analytics

Monitor quiz performance:
```sql
SELECT 
  standard,
  difficulty,
  COUNT(*) as attempts,
  AVG(score::float / total_questions * 100) as avg_score,
  COUNT(*) FILTER (WHERE passed) as passed_count
FROM quiz_results
GROUP BY standard, difficulty;
```

### 7.3 Test Maintenance

- Review test results in CI
- Update tests for new features
- Maintain test data fixtures
- Monitor test execution time

## 8. Best Practices

### 8.1 Security

- Never expose tokens in logs
- Rotate tokens regularly
- Monitor access patterns
- Implement rate limiting for quiz attempts

### 8.2 Performance

- Index frequently queried fields
- Cache quiz templates
- Optimize AI API calls
- Lazy load E2E tests

### 8.3 Code Quality

- Maintain test coverage >80%
- Write descriptive test names
- Use TypeScript strict mode
- Follow existing code patterns

## 9. Troubleshooting

### 9.1 Test Failures

**E2E Tests Won't Run**:
- Check Playwright installation
- Verify dev server is running
- Review browser installation

**Unit Tests Failing**:
- Check test isolation
- Verify mock setup
- Review async handling

### 9.2 Quiz System Issues

**Questions Not Generating**:
- Check OpenAI API key
- Verify template availability
- Review edge function logs

**Certificates Not Created**:
- Verify passing score (70%)
- Check database permissions
- Review RLS policies

### 9.3 Certification Viewer

**Token Invalid**:
- Check expiration date
- Verify token not revoked
- Confirm organization match

## 10. Future Enhancements

Potential improvements:
- Mobile quiz app
- Multi-language support
- Advanced analytics dashboard
- Certificate verification portal
- Integration with LMS
- Video-based questions
- Adaptive difficulty
- Gamification elements

---

**Version**: 1.0.0
**Last Updated**: October 18, 2025
**Author**: Travel HR Buddy Team
