# Stage 34 - Tactical Navigation with AI + Audit Predictability

## Overview

This implementation provides a comprehensive AI-powered tactical risk management system with audit predictability capabilities for offshore vessel operations. The system enables proactive risk management by anticipating technical failures 15 days in advance and simulating audit outcomes before they occur.

## Architecture

### Database Layer

#### Tables

1. **tactical_risks**
   - Stores AI-predicted operational risks by vessel and system
   - Risk categories: DP, Energia, SGSO, Comunicações, Navegação, Máquinas, Segurança
   - Risk types: Failure, Intermittency, Delay, Degradation, Normal
   - Risk scoring (0-100) with automatic classification (Critical/High/Medium/Low)
   - 15-day validity with automatic status management
   - User assignment and action tracking
   - Row Level Security enabled

2. **audit_predictions**
   - Stores AI-generated audit simulations
   - Supports 6 audit types: Petrobras, IBAMA, ISO, IMCA, ISM, SGSO
   - Expected scores (0-100) with probability of passing (Alta/Média/Baixa)
   - Identifies specific weaknesses and generates actionable recommendations
   - 30-day validity period
   - Row Level Security enabled

#### Helper Functions

1. **get_vessel_risk_summary(p_vessel_id)**
   - Aggregates risk metrics by vessel
   - Returns: total_risks, critical_risks, high_risks, medium_risks, low_risks, active_risks, avg_risk_score, last_prediction_date

2. **get_latest_audit_predictions(p_vessel_id)**
   - Retrieves current valid predictions
   - Returns the latest prediction for each vessel and audit type combination

3. **get_audit_readiness_summary()**
   - Overall readiness assessment across all vessels
   - Groups by audit type with statistics on probability distribution and vessel readiness

### Backend APIs

#### POST /api/ai/forecast-risks

**Purpose:** AI-powered risk forecasting for operational risks

**Request Body:**
```json
{
  "vessel_id": "uuid" // Optional. If omitted, processes all active vessels
}
```

**Features:**
- Uses OpenAI GPT-4o-mini (temperature: 0.3, max_tokens: 2000)
- Analyzes 60 days of operational data (DP incidents, SGSO practices, safety incidents)
- Intelligent fallback to rule-based logic when AI unavailable
- Stores results in tactical_risks table
- Automatically marks expired risks as resolved

**Response:**
```json
{
  "success": true,
  "message": "Generated 12 risk forecasts for 4 vessel(s)",
  "forecasts": [
    {
      "vessel_id": "uuid",
      "risk_category": "DP",
      "risk_type": "Intermittency",
      "risk_score": 75,
      "description": "...",
      "predicted_date": "2025-10-18T21:00:00Z",
      "recommended_actions": ["..."]
    }
  ]
}
```

#### POST /api/audit/score-predict

**Purpose:** Audit outcome simulation

**Request Body:**
```json
{
  "vessel_id": "uuid",
  "audit_type": "Petrobras" // One of: Petrobras, IBAMA, ISO, IMCA, ISM, SGSO
}
```

**Features:**
- Uses OpenAI GPT-4o-mini for AI-powered predictions
- Analyzes 6 months of compliance data (incidents, certificates, training records, SGSO practices)
- Generates score, probability, weaknesses, recommendations
- Rule-based fallback calculation when AI unavailable
- Stores results in audit_predictions table

**Response:**
```json
{
  "success": true,
  "prediction": {
    "vessel_id": "uuid",
    "audit_type": "Petrobras",
    "expected_score": 78,
    "pass_probability": "Alta",
    "confidence_level": 85,
    "weaknesses": ["..."],
    "recommendations": ["..."],
    "compliance_areas": {
      "documentation": 85,
      "safety_procedures": 90,
      "crew_training": 75,
      "equipment_maintenance": 80,
      "environmental_compliance": 88
    }
  }
}
```

### Automation Layer

#### Supabase Edge Function: forecast-risks-cron

**Schedule:** Daily at 06:00 UTC (03:00 BRT)

**Features:**
- Automatically generates risk forecasts for all active vessels
- Marks expired predictions as resolved
- Comprehensive logging for monitoring
- Calls the forecast-risks API internally

**Location:** `supabase/functions/forecast-risks-cron/index.ts`

**Configuration:** `supabase/functions/cron.yaml`

### Frontend Dashboard: /admin/risk-audit

#### Tab 1: Riscos Táticos (Tactical Risks)

**Component:** `TacticalRiskPanel.tsx`

**Features:**
- Visual risk map with summary cards per vessel
- Risk distribution (Critical/High/Medium/Low)
- Detailed risk list with filtering
- On-demand forecast generation
- Real-time statistics

**Key Capabilities:**
- View all active risks or filter by vessel
- See risk scores, categories, and types
- View recommended actions
- Track risk validity periods

#### Tab 2: Simulador de Auditoria (Audit Simulator)

**Component:** `AuditSimulator.tsx`

**Features:**
- Vessel and audit type selection
- AI-powered prediction generation
- Score, probability, and confidence display
- Compliance areas breakdown with progress bars
- Weaknesses and recommendations

**Key Capabilities:**
- Generate new predictions on-demand
- View existing predictions
- Compare compliance across different areas
- Export recommendations for action planning

#### Tab 3: Ações Recomendadas (Recommended Actions)

**Component:** `RecommendedActions.tsx`

**Features:**
- Consolidated actions from risks and audits
- Priority-based sorting
- User assignment workflow
- Status tracking and completion marking
- Real-time statistics

**Key Capabilities:**
- Assign actions to team members
- Mark actions as completed
- Filter by priority and status
- View source of each action (risk or audit)

#### Tab 4: Scores Normativos (Normative Scores)

**Component:** `NormativeScores.tsx`

**Features:**
- Compliance scoring by audit standard
- Visual progress bars
- Readiness assessment per vessel
- Overall statistics dashboard

**Key Capabilities:**
- View scores across all audit types
- Compare vessel readiness
- Identify vessels at risk
- Track overall compliance trends

## Environment Variables

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (Optional - system falls back to rule-based logic if not provided)
OPENAI_API_KEY=your_openai_api_key

# API Base URL (for Edge Functions)
API_BASE_URL=https://your-domain.com
```

## Deployment

### 1. Apply Database Migrations

```bash
# Apply all migrations
supabase db push

# Or apply individually
psql -U postgres -d your_database -f supabase/migrations/20251018180000_create_tactical_risks.sql
psql -U postgres -d your_database -f supabase/migrations/20251018180100_create_audit_predictions.sql
psql -U postgres -d your_database -f supabase/migrations/20251018180200_create_helper_functions.sql
```

### 2. Deploy Edge Function

```bash
# Deploy the forecast-risks-cron function
supabase functions deploy forecast-risks-cron

# Verify deployment
supabase functions list
```

### 3. Verify Cron Job Schedule

1. Go to Supabase Dashboard
2. Navigate to Database → Functions
3. Verify that `forecast-risks-cron` is listed
4. Check that it's scheduled to run at 06:00 UTC daily

### 4. Test the System

```bash
# Test risk forecasting API
curl -X POST https://your-domain.com/api/ai/forecast-risks \
  -H "Content-Type: application/json" \
  -d '{}'

# Test audit prediction API
curl -X POST https://your-domain.com/api/audit/score-predict \
  -H "Content-Type: application/json" \
  -d '{"vessel_id": "your-vessel-id", "audit_type": "Petrobras"}'

# Test Edge Function manually
curl -X POST https://your-supabase-url/functions/v1/forecast-risks-cron \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Usage Guide

### Generating Risk Forecasts

1. Navigate to `/admin/risk-audit`
2. Go to the "Riscos Táticos" tab
3. Click "Gerar Previsão" button
4. System will analyze operational data and generate predictions
5. View risks organized by vessel and criticality

### Simulating Audits

1. Navigate to the "Simulador de Auditoria" tab
2. Select a vessel from the dropdown
3. Select an audit type (Petrobras, IBAMA, ISO, IMCA, ISM, SGSO)
4. Click "Simular Auditoria" button
5. Review predicted score, probability, weaknesses, and recommendations

### Managing Actions

1. Navigate to the "Ações Recomendadas" tab
2. View all consolidated actions from risks and audits
3. Filter by priority or status
4. Assign actions to team members using the dropdown
5. Mark actions as completed with the checkbox

### Monitoring Compliance

1. Navigate to the "Scores Normativos" tab
2. View overall statistics across all vessels
3. Check readiness by audit type
4. Review individual vessel scores for each audit standard

## Troubleshooting

### No Forecasts Generated

**Problem:** Risk forecasts are not being generated

**Solutions:**
1. Check if vessels exist and are marked as `status = 'active'`
2. Verify OpenAI API key is set (or ensure fallback logic is working)
3. Check API logs for errors
4. Verify database permissions for service role

### Edge Function Not Running

**Problem:** Cron job is not executing

**Solutions:**
1. Verify Edge Function is deployed: `supabase functions list`
2. Check cron.yaml configuration
3. Review Edge Function logs in Supabase Dashboard
4. Ensure API_BASE_URL environment variable is set correctly

### Audit Predictions Failing

**Problem:** Audit simulations are not working

**Solutions:**
1. Verify vessel_id exists and is active
2. Check audit_type is one of the valid values
3. Ensure compliance data exists (incidents, certificates, training records)
4. Review API logs for specific error messages

### UI Components Not Loading

**Problem:** Dashboard tabs are not rendering

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify Supabase client is properly configured
3. Ensure user has proper authentication
4. Check database RLS policies are correctly configured

## Key Features

- 🎯 **AI Risk Forecasting** - Predicts operational risks 15 days in advance
- 🔍 **Audit Simulation** - Simulates audit outcomes before they occur
- 📊 **4-Tab Dashboard** - Interactive interface for risk and audit management
- 🤖 **Smart Fallback** - Rule-based logic when AI unavailable
- ⚡ **Automated Updates** - Daily cron job keeps data fresh
- 👥 **User Assignment** - Assign and track actions by team member
- 📈 **Compliance Scoring** - Track readiness across 6 audit standards
- 🔒 **Secure** - Row Level Security on all database tables

## Technical Stack

- **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Supabase)
- **AI:** OpenAI GPT-4o-mini
- **Automation:** Supabase Edge Functions (Deno)
- **Scheduling:** Supabase Cron

## Future Enhancements

1. **Email Notifications** - Send alerts for critical risks
2. **Historical Trend Analysis** - Track risk patterns over time
3. **Mobile App** - Native mobile application for field teams
4. **Integration with CMMS** - Connect with maintenance systems
5. **Custom Risk Categories** - User-defined risk categories
6. **Advanced Analytics** - ML-based pattern recognition
7. **Export Capabilities** - PDF/Excel reports
8. **Multi-language Support** - Portuguese, English, Spanish

## Support

For issues or questions:
1. Check this README
2. Review API documentation
3. Check Supabase logs
4. Contact development team

## Version History

- **v1.0.0** (2025-10-18) - Initial release
  - Tactical risk forecasting
  - Audit outcome simulation
  - 4-tab dashboard interface
  - Automated daily updates
  - Complete documentation
