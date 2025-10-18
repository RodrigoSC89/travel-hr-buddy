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

**Response:**
```json
{
  "success": true,
  "risks_generated": 15,
  "vessels_processed": 3,
  "risks": [...]
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

**Response:**
```json
{
  "success": true,
  "prediction": {
    "vessel_id": "vessel-123",
    "audit_type": "petrobras",
    "predicted_score": 82,
    "pass_probability": 0.87,
    "readiness_level": "high",
    "weaknesses": [...],
    "recommendations": [...],
    "compliance_gaps": [...]
  }
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

**Actions:**
- Run AI Forecast
- Update status (pending → assigned → in_progress → mitigated → closed)
- Filter by vessel
- Refresh data

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

**Stats:**
- Total actions
- Pending count
- In progress count
- Completed count

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

### 4. Verify Cron Job

- Check Supabase dashboard
- Navigate to Edge Functions → Cron Jobs
- Verify `forecast-risks-cron` is scheduled for 06:00 UTC daily

### 5. Build Frontend

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
6. View results:
   - Predicted score
   - Pass probability
   - Readiness level
   - Weaknesses
   - Recommendations
   - Compliance gaps

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

## Data Flow

### Risk Forecasting Flow

```
1. Edge Function (06:00 UTC) OR Manual Trigger
   ↓
2. POST /api/ai/forecast-risks
   ↓
3. Fetch operational data (60 days)
   ↓
4. AI Analysis (GPT-4o-mini) OR Rule-based
   ↓
5. Generate risk forecasts
   ↓
6. Insert into tactical_risks table
   ↓
7. Display in TacticalRiskPanel
```

### Audit Prediction Flow

```
1. User selects vessel + audit type
   ↓
2. POST /api/audit/score-predict
   ↓
3. Fetch compliance data (6 months)
   ↓
4. AI Analysis (GPT-4o-mini) OR Rule-based
   ↓
5. Generate audit prediction
   ↓
6. Insert into audit_predictions table
   ↓
7. Display in AuditSimulator
```

## Troubleshooting

### AI Forecast Not Working

**Symptom:** Forecast fails or returns no results

**Solutions:**
1. Check OPENAI_API_KEY is set correctly
2. Verify API key has sufficient credits
3. Check fallback rule-based logic is working
4. Review logs in Edge Function dashboard

### Edge Function Not Running

**Symptom:** No automated forecasts at 06:00 UTC

**Solutions:**
1. Verify function is deployed: `supabase functions list`
2. Check cron.yaml is correct
3. Verify API_BASE_URL is set
4. Review function logs for errors

### Low Prediction Scores

**Symptom:** All audit predictions show low scores

**Solutions:**
1. Ensure compliance data exists in database
2. Check incident count in last 6 months
3. Verify action plans are being completed
4. Review actual historical audit results

### Missing Data

**Symptom:** No risks or predictions displayed

**Solutions:**
1. Run manual forecast/simulation first
2. Check vessel exists and is active
3. Verify RLS policies allow data access
4. Check browser console for errors

## API Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| 400 | Missing required parameters | Check request body |
| 405 | Method not allowed | Use POST method |
| 500 | AI/Database error | Check logs, verify API keys |

## Performance Considerations

- Risk forecasting: ~5-10 seconds per vessel
- Audit simulation: ~3-5 seconds per prediction
- Batch processing: Processes all vessels sequentially
- Database queries: Optimized with indexes

## Security

- Row Level Security (RLS) enabled on all tables
- API endpoints require authentication
- Edge Function uses service role key
- Environment variables stored securely

## Future Enhancements

- [ ] Multi-language support
- [ ] Email notifications for critical risks
- [ ] Risk trend analysis charts
- [ ] Audit preparation checklist generator
- [ ] Integration with external audit systems
- [ ] Mobile app support
- [ ] Risk correlation analysis
- [ ] Predictive maintenance integration

## Support

For issues or questions:
1. Check troubleshooting section
2. Review logs in Supabase dashboard
3. Check API response errors
4. Contact development team

---

**Version:** 1.0.0
**Last Updated:** October 2025
**Status:** ✅ Production Ready
