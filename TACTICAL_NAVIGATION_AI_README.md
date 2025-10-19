# Tactical Navigation with AI + Audit Predictability

## Overview

This module implements a comprehensive AI-powered tactical risk management system with audit predictability capabilities for offshore vessel operations. It provides:

- **AI-powered risk forecasting**: 15-day advance tactical risk predictions
- **Audit outcome simulation**: Predict audit scores and readiness levels
- **Interactive dashboard**: 4-tab interface for complete risk and audit management
- **Automated updates**: Daily risk forecasting via Supabase Edge Function
- **Action tracking**: Workflow for assigning and managing mitigation actions
- **Compliance scoring**: Normative scores by audit standard (Petrobras, IBAMA, ISO, IMCA, ISM, SGSO)

## Architecture

### Database Layer

#### Tables

**1. tactical_risks**
- Stores AI-generated risk forecasts
- Fields: vessel_id, risk_type, severity, probability, forecast_date, status, recommended_action
- RLS enabled for security
- Indexed on vessel_id, forecast_date, severity, status

**2. audit_predictions**
- Stores audit simulation results
- Fields: vessel_id, audit_type, predicted_score, pass_probability, readiness_level, weaknesses, recommendations
- RLS enabled for security
- Indexed on vessel_id, audit_type, audit_date

#### Helper Functions

**1. get_vessel_risk_summary(vessel_id)**
- Aggregates risk metrics by vessel
- Returns counts by severity and status
- Calculates average confidence score

**2. get_latest_audit_predictions(vessel_id)**
- Retrieves most recent predictions for each audit type
- Returns complete prediction details

**3. get_audit_readiness_summary(vessel_id)**
- Provides overall audit readiness assessment
- Returns average scores and readiness levels
- Includes scores by audit type

### Backend APIs

#### POST /api/ai/forecast-risks

Generates tactical risk forecasts using AI or rule-based fallback.

**Request Body:**
```json
{
  "vessel_id": "vessel-123",  // optional if process_all is true
  "process_all": true         // process all active vessels
}
```

**Features:**
- Uses OpenAI GPT-4o-mini (temperature: 0.3, max_tokens: 2000)
- Analyzes 60 days of operational data
- Intelligent fallback to rule-based logic if AI unavailable
- Processes single vessel or all active vessels

#### POST /api/audit/score-predict

Simulates audit outcomes and generates predictions.

**Request Body:**
```json
{
  "vessel_id": "vessel-123",
  "audit_type": "petrobras",  // petrobras|ibama|iso|imca|ism|sgso
  "audit_date": "2025-12-01"  // optional
}
```

**Features:**
- Supports 6 audit types
- Analyzes 6 months of compliance data
- Generates score, probability, weaknesses, recommendations
- AI-powered with rule-based fallback

### Edge Function

#### forecast-risks-cron

Automated daily risk forecasting function.

**Schedule:** Daily at 06:00 UTC

**Function:** Calls `/api/ai/forecast-risks` with `process_all: true`

**Environment Variables:**
- `API_BASE_URL`: Base URL for API calls
- `VITE_APP_URL`: Alternative URL if API_BASE_URL not set

### Frontend Components

#### 1. Main Dashboard (/admin/risk-audit)

Four-tab interface:
- **Tactical Risks**: View and manage forecasted risks
- **Audit Simulator**: Run audit predictions
- **Recommended Actions**: Track mitigation actions
- **Normative Scores**: View compliance scores by standard

#### 2. TacticalRiskPanel

**Features:**
- View risks table with filtering
- Run AI forecast on-demand
- Update risk status
- Assign risks to users
- Sort by severity, date, vessel

#### 3. AuditSimulator

**Features:**
- Select vessel and audit type
- Run simulation
- View predicted score (0-100)
- View pass probability
- View readiness level
- View weaknesses and recommendations
- View compliance gaps

**Audit Types:**
- Petrobras (HSE & Operational)
- IBAMA (Environmental)
- ISO (Quality Management)
- IMCA (Marine Standards)
- ISM (Safety Management)
- SGSO (QSMS)

#### 4. RecommendedActions

**Features:**
- Aggregated action items from risks and audits
- Filter by vessel and status
- Track action completion
- Priority-based sorting
- Assignment tracking

#### 5. NormativeScores

**Features:**
- View scores by audit type
- Visual score cards with trends
- Pass probability indicators
- Readiness level badges
- Last update timestamps

**Score Interpretation:**
- 85-100: Excellent (green)
- 75-84: High (blue)
- 60-74: Medium (yellow)
- 0-59: Low (red)

## Installation & Deployment

### 1. Apply Database Migrations

```bash
# Navigate to project root
cd /path/to/travel-hr-buddy

# Apply migrations
supabase db push
```

### 2. Set Environment Variables

Required variables:
```env
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key  # optional, fallback available
API_BASE_URL=your_api_url
VITE_APP_URL=your_app_url       # fallback for API_BASE_URL
```

### 3. Deploy Edge Function

```bash
# Deploy forecast-risks-cron function
supabase functions deploy forecast-risks-cron
```

### 4. Build Frontend

```bash
npm run build
```

## Usage Guide

### Running Risk Forecast

**Manual (via UI):**
1. Navigate to `/admin/risk-audit`
2. Select "Tactical Risks" tab
3. Select vessel or "All Vessels"
4. Click "Run AI Forecast"
5. Wait for completion
6. View generated risks in table

**Automated:**
- Runs daily at 06:00 UTC via Edge Function
- Processes all active vessels
- Results viewable in dashboard

### Running Audit Simulation

1. Navigate to `/admin/risk-audit`
2. Select "Audit Simulator" tab
3. Select vessel
4. Select audit type
5. Click "Run Simulation"
6. View results

### Managing Actions

1. Navigate to "Recommended Actions" tab
2. Filter by vessel/status
3. View action items from both risks and audits
4. Update status as needed
5. Track completion progress

### Viewing Compliance Scores

1. Navigate to "Normative Scores" tab
2. Select vessel
3. View scores for all audit types
4. Check pass probabilities
5. Review readiness levels

## Key Features

✅ AI-powered risk forecasting (15 days in advance)
✅ Audit outcome simulation (6 types: Petrobras, IBAMA, ISO, IMCA, ISM, SGSO)
✅ Interactive 4-tab dashboard interface
✅ Automated daily risk updates via Edge Function (06:00 UTC)
✅ User assignment and action tracking workflow
✅ Compliance scoring by standard
✅ Smart fallback logic when AI unavailable
✅ Row Level Security on all database tables

## Security

- Row Level Security (RLS) enabled on all tables
- API endpoints require authentication
- Edge Function uses service role key
- Environment variables stored securely

## Deployment Ready

All components are production-ready and fully tested. No breaking changes to existing functionality.

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Status:** ✅ Production Ready
