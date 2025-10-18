# Stage 34 - Tactical Navigation with AI + Audit Predictability

## Overview

This feature implements a comprehensive AI-powered tactical risk management system with audit predictability capabilities for offshore vessel operations. The system enables proactive risk management by anticipating technical failures 15 days in advance and simulating audit outcomes before they occur.

## Architecture

### Database Schema

#### Tables

1. **tactical_risks**
   - Stores AI-predicted operational risks by vessel and system
   - Risk scoring (0-100) with automatic classification (Critical/High/Medium/Low)
   - Tracks risk types: Failure, Intermittency, Delay, Degradation, Normal
   - 15-day validity with automatic status management
   - User assignment and action tracking
   - Row Level Security (RLS) enabled

2. **audit_predictions**
   - Stores AI-generated audit simulations
   - Supports 6 audit types: Petrobras, IBAMA, ISO, IMCA, ISM, SGSO
   - Expected scores (0-100) with probability (Alta/Média/Baixa)
   - Identifies specific weaknesses and generates actionable recommendations
   - 30-day validity period
   - Row Level Security (RLS) enabled

#### Helper Functions

1. **get_vessel_risk_summary(vessel_id?)** - Aggregates risk metrics by vessel
2. **get_latest_audit_predictions(vessel_id?)** - Retrieves current predictions
3. **get_audit_readiness_summary(vessel_id?)** - Overall readiness assessment

### Backend APIs

#### POST /api/ai/forecast-risks

Generates risk predictions using OpenAI GPT-4o-mini with intelligent fallback.

**Request Body:**
```json
{
  "vessel_id": "uuid" // optional, if omitted generates for all vessels
}
```

**Features:**
- Analyzes 60 days of operational data (DP incidents, SGSO practices, safety incidents)
- Processes single vessel or all active vessels
- Stores results in tactical_risks table
- Automatically marks old risks as resolved
- Falls back to rule-based logic if AI unavailable

**Response:**
```json
{
  "success": true,
  "message": "Generated risk forecasts for X vessel(s)",
  "results": [
    {
      "vessel_id": "uuid",
      "vessel_name": "Vessel Name",
      "risks_generated": 6,
      "risks": [...]
    }
  ]
}
```

#### POST /api/audit/score-predict

Simulates audit outcomes using AI analysis.

**Request Body:**
```json
{
  "vessel_id": "uuid",
  "audit_type": "Petrobras|IBAMA|ISO|IMCA|ISM|SGSO"
}
```

**Features:**
- Analyzes 6 months of compliance data
- Generates score, probability, weaknesses, and recommendations
- Fallback calculation based on compliance metrics
- Stores results in audit_predictions table

**Response:**
```json
{
  "success": true,
  "message": "Generated audit prediction",
  "prediction": {
    "id": "uuid",
    "vessel_id": "uuid",
    "audit_type": "IMCA",
    "expected_score": 85,
    "probability": "Alta",
    "confidence_level": 0.87,
    "weaknesses": ["..."],
    "recommendations": ["..."],
    "compliance_areas": {
      "Documentation": 90,
      "Training": 85,
      "Safety": 80,
      "Equipment": 88,
      "Procedures": 82
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
- Calls the /api/ai/forecast-risks endpoint for each vessel

**Location:** `supabase/functions/forecast-risks-cron/index.ts`

### Frontend Dashboard

**Route:** `/admin/risk-audit`

#### Tab 1: Riscos Táticos (Tactical Risks)

- Visual risk map with summary cards per vessel
- Detailed risk list with scores, systems, and suggested actions
- "Gerar Previsões" button for on-demand risk generation
- Vessel filtering capability
- Real-time risk distribution (Critical/High/Medium/Low)

**Component:** `src/components/admin/risk-audit/TacticalRiskPanel.tsx`

#### Tab 2: Simulador de Auditoria (Audit Simulator)

- Vessel and audit type selection
- AI-powered prediction generation
- Expected score, probability, and confidence levels
- Compliance areas breakdown
- Detailed weaknesses and recommendations

**Component:** `src/components/admin/risk-audit/AuditSimulator.tsx`

#### Tab 3: Ações Recomendadas (Recommended Actions)

- Consolidated list of actions from risks and audits
- Automatic prioritization (High/Medium/Low)
- User assignment workflow with dropdown selection
- Status tracking and completion marking
- Real-time action count and priority distribution

**Component:** `src/components/admin/risk-audit/RecommendedActions.tsx`

#### Tab 4: Scores Normativos (Normative Scores)

- Compliance scoring by standard (IMCA, SGSO, ISM, ISO, Petrobras, IBAMA)
- Visual progress bars showing current scores
- Probability distribution (Alta/Média/Baixa)
- Overall readiness summary
- Grouped view by audit type with filtering

**Component:** `src/components/admin/risk-audit/NormativeScores.tsx`

## AI Integration

### Model Configuration

- **Model:** OpenAI GPT-4o-mini
- **Temperature:** 0.3 (predictable, consistent outputs)
- **Max Tokens:** 2000
- **Fallback:** Rule-based analysis when AI unavailable
- **JSON Validation:** Robust extraction and validation of AI responses

### Data Flow

```
Operational Data (60-180 days)
  ↓
AI Analysis (GPT-4o-mini) or Fallback
  ↓
Risk/Audit Predictions
  ↓
Database Storage
  ↓
Dashboard Display
  ↓
User Actions (assign, resolve, track)
```

## Security

- Row Level Security (RLS) enabled on all tables
- Authenticated user access only
- Service role keys for backend operations
- Secure API endpoints with proper authentication

## Usage Guide

### Generating Risk Forecasts

1. Navigate to `/admin/risk-audit`
2. Click "Gerar Previsões" button in Riscos Táticos tab
3. Wait for AI analysis to complete
4. Review generated risks and assign to team members

### Simulating Audits

1. Navigate to Simulador de Auditoria tab
2. Select vessel and audit type
3. Click "Simular Auditoria"
4. Review predicted score and recommendations
5. Take action on identified weaknesses

### Managing Actions

1. Navigate to Ações Recomendadas tab
2. Review prioritized action list
3. Assign actions to team members
4. Mark actions as complete when resolved
5. Monitor unassigned and high-priority actions

### Monitoring Compliance

1. Navigate to Scores Normativos tab
2. Review overall readiness statistics
3. Click on audit type cards for detailed view
4. Identify vessels needing attention
5. Track improvement over time

## Environment Variables

Required environment variables:

```env
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key  # Optional, fallback used if not provided
API_BASE_URL=your_api_base_url  # For Edge Function
```

## Database Migrations

The following migrations need to be applied:

1. `20251018180000_create_tactical_risks.sql` - Creates tactical_risks table
2. `20251018180100_create_audit_predictions.sql` - Creates audit_predictions table
3. `20251018180200_create_helper_functions.sql` - Creates helper functions

Run migrations:
```bash
supabase db push
```

## Cron Configuration

The Edge Function is configured in `supabase/functions/cron.yaml`:

```yaml
forecast-risks-cron:
  schedule: '0 6 * * *'  # Daily at 06:00 UTC (03:00 BRT)
  endpoint: '/forecast-risks-cron'
  method: POST
```

## Testing

### Manual Testing

1. **Test Risk Generation:**
   ```bash
   curl -X POST https://your-domain.com/api/ai/forecast-risks \
     -H "Content-Type: application/json" \
     -d '{"vessel_id": "uuid"}'
   ```

2. **Test Audit Prediction:**
   ```bash
   curl -X POST https://your-domain.com/api/audit/score-predict \
     -H "Content-Type: application/json" \
     -d '{"vessel_id": "uuid", "audit_type": "IMCA"}'
   ```

3. **Test Edge Function:**
   ```bash
   curl -X POST https://your-supabase-url.com/functions/v1/forecast-risks-cron \
     -H "Authorization: Bearer your_anon_key"
   ```

## Troubleshooting

### Common Issues

1. **AI Analysis Fails**
   - Check OPENAI_API_KEY is set correctly
   - Verify OpenAI account has credits
   - Fallback logic will automatically engage

2. **No Risks Generated**
   - Ensure vessels table has active vessels
   - Check operational data exists (dp_incidents, sgso_practices, etc.)
   - Review API logs for errors

3. **Cron Job Not Running**
   - Verify cron.yaml configuration
   - Check Edge Function logs in Supabase dashboard
   - Ensure API_BASE_URL is set correctly

4. **RLS Permission Errors**
   - Verify user is authenticated
   - Check RLS policies are correctly applied
   - Ensure service role key is used for backend operations

## Performance Considerations

- Risk generation processes vessels sequentially (not concurrent)
- AI requests timeout after 30 seconds
- Database queries use indexes for optimal performance
- Frontend components use React.lazy for code splitting
- Cron job processes all vessels but with error handling

## Future Enhancements

Potential improvements:

1. Multi-language support for AI prompts
2. Historical trend analysis and charts
3. Email notifications for critical risks
4. Export functionality for reports
5. Mobile app integration
6. Real-time WebSocket updates
7. Custom risk scoring algorithms
8. Integration with external audit systems

## Support

For issues or questions:
- Check database migrations are applied
- Review Supabase logs
- Verify environment variables
- Check API endpoint responses
- Review browser console for frontend errors
