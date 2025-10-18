# Live Compliance Module - ETAPA 33

## 📋 Overview

The **Live Compliance Module** (Módulo de Conformidade Viva) is an automated compliance monitoring system that continuously detects, correlates, and automates compliance-related activities in the maritime environment.

### Key Features

- 🚨 **Automatic Non-Conformity Detection** from logs, incidents, and forecasts
- 📚 **AI-Powered Norm Correlation** matching incidents to IMCA, ISO, IBAMA, ANP regulations
- 🎓 **Reactive Training Assignment** automatically assigns training to crew when non-conformities are detected
- 📎 **Evidence Management** for audits with certifiable documentation trail
- ✅ **Audit Verification Support** with automated evidence gathering
- 🔄 **Continuous Monitoring** via scheduled cron jobs

## 🏗️ Architecture

### Database Schema

#### 1. `compliance_non_conformities`
Stores detected non-conformities from various sources:
- Source tracking (incident, log, forecast, manual, audit)
- Severity levels (critical, high, medium, low)
- Status workflow (detected → analyzing → action_planned → in_progress → resolved → closed)
- Norm/regulation correlation (IMCA, IBAMA, ANP, ISO, etc.)
- AI analysis storage

#### 2. `compliance_corrective_actions`
Stores corrective action plans:
- Action types (immediate, corrective, preventive, training)
- Priority levels
- Timeline management (planned vs actual dates)
- Responsibility assignment
- Verification tracking

#### 3. `compliance_evidence`
Manages evidence for audits:
- Multiple evidence types (document, certificate, photo, video, log_entry, training_record, inspection_report)
- Norm reference linking
- Verification status
- File/URL storage

#### 4. `compliance_training_assignments`
Links trainings to non-conformities:
- Training assignment tracking
- Certificate issuance management
- Quiz/assessment scores
- Due date monitoring

#### 5. `compliance_score_history`
Tracks compliance scores over time:
- Overall and segmented scores (by norm, vessel, practice)
- Score breakdown metrics
- Historical trending

### Service Layer

#### `compliance-engine.ts`

Main service providing all compliance automation functions:

##### Core Functions

**`processNonConformity(log)`**
- Main orchestration function
- Processes a complete non-conformity workflow from detection to evidence storage
- Returns: `{ success, non_conformity_id, actions_created, trainings_assigned, evidence_stored }`

**`matchLogToNorm(log)`**
- Uses AI (GPT-4o-mini) to analyze incident descriptions
- Identifies applicable regulations (IMCA, IMO, ISO, IBAMA, ANP)
- Returns: `NormReference` with type, reference, clause, and description

**`generateCorrectivePlanFromGap(description, norm)`**
- Generates AI-powered corrective action plans
- Creates structured action steps, resources needed, and verification criteria
- Returns: `CorrectiveActionPlan` with title, description, priority, timeline

**`storeCorrectiveAction(nonConformityId, norm, plan)`**
- Stores corrective action in database
- Calculates completion dates based on plan
- Returns: `{ success, action_id }`

**`findRelatedTraining(norm)`**
- Searches for existing training related to a norm
- Falls back to AI-generated training recommendations
- Returns: `TrainingReference`

**`assignTrainingToCrew(nonConformityId, crewMemberId, vesselId, training)`**
- Assigns training to crew members
- Sets due dates (default 30 days)
- Links to triggering non-conformity
- Returns: `{ success, assignment_id }`

**`storeEvidenceLink(evidence)`**
- Creates evidence records for audit trail
- Links evidence to non-conformities and actions
- Returns: `{ success, evidence_id }`

**`calculateComplianceScore(organizationId?, vesselId?)`**
- Calculates real-time compliance score (0-100)
- Provides detailed breakdown:
  - Total conformities/non-conformities
  - Open/closed actions
  - Overdue actions
- Penalizes for overdue actions
- Returns: `{ score, breakdown }`

**`generateComplianceStatusExplanation(organizationId?, vesselId?)`**
- AI-powered status report generation
- Analyzes compliance data and provides:
  - Overall status summary
  - Critical items pending
  - Items in automatic correction
  - Human actions still needed
  - Executive summary
- Returns: structured status object

### Automation

#### Supabase Edge Function: `run-compliance-engine`

**Schedule:** Daily at 5:00 AM UTC (2:00 AM BRT)

**Process:**
1. Scans new DP incidents (last 24 hours)
2. Scans new safety incidents (last 24 hours)
3. For each incident:
   - Matches to applicable norm using AI
   - Creates non-conformity record
   - Generates corrective action plan
   - Stores evidence link
4. Logs execution results to `cron_execution_logs`

**Configuration:** `supabase/functions/cron.yaml`

```yaml
run-compliance-engine:
  schedule: '0 5 * * *' # Daily at 05:00 UTC (02:00 BRT)
  endpoint: '/run-compliance-engine'
  method: POST
```

### Frontend Dashboard

#### `/admin/live-compliance`

**Main Features:**

1. **Compliance Score Card**
   - Dynamic score (0-100) with color coding
   - Progress bar visualization
   - Detailed breakdown metrics
   - Green (≥90), Yellow (70-89), Red (<70)

2. **AI Status Explainer**
   - Overall status summary
   - Critical items pending (with alert icon)
   - Items in automatic correction (with clock icon)
   - Human actions needed (with check icon)
   - Executive summary paragraph

3. **Tabbed Interface**

   **Timeline Tab**
   - Chronological view of all non-conformities
   - Severity and status badges
   - Norm references
   - Detection timestamps
   - Scrollable 600px height

   **Evidence by Norm Tab**
   - Groups evidence by regulation reference
   - Shows evidence count per norm
   - Individual evidence cards with:
     - Evidence type
     - Norm clause
     - Upload timestamp
     - Verification status (checkmark icon)

   **Trainings by Vessel Tab**
   - Groups training assignments by vessel
   - Training status badges
   - Certificate indicators
   - Due dates
   - Completion tracking

   **Corrective Actions Tab**
   - All corrective actions with:
     - Priority badges
     - Status indicators
     - Responsible roles
     - Planned completion dates
     - Action descriptions

4. **Header Actions**
   - Refresh button (with loading animation)
   - Export button (placeholder for future PDF/Excel export)

## 🔄 Workflow

### Automated Flow

```
Incident Detected
      ↓
AI Matches to Norm (IMCA, ISO, etc.)
      ↓
Non-Conformity Created
      ↓
AI Generates Corrective Plan
      ↓
Action Stored in Database
      ↓
Related Training Found/Generated
      ↓
Training Assigned to Crew
      ↓
Evidence Link Created
      ↓
Certificate Issued (upon completion)
      ↓
Attached to HR Dossier
      ↓
Evidence Ready for Audit
```

### Manual Intervention Points

While the system is highly automated, human oversight is needed for:

1. **Verification** of automatically generated corrective actions
2. **Approval** of critical actions before implementation
3. **Validation** of training completion and certificate issuance
4. **Audit Review** of gathered evidence
5. **Closure** of resolved non-conformities

## 📊 Compliance Score Calculation

The compliance score is calculated using the following algorithm:

```typescript
Base Score = 100

If non-conformities exist:
  Resolution Rate = Resolved / Total Non-Conformities
  Score = Resolution Rate × 100
  
  If open actions exist:
    Overdue Rate = Overdue Actions / Open Actions
    Penalty = Overdue Rate × 20
    Score = Score - Penalty

Final Score = max(0, Score)
```

**Example:**
- 10 non-conformities, 8 resolved → 80% base score
- 5 open actions, 2 overdue → 40% overdue rate → 8 point penalty
- Final Score: 72/100

## 🔐 Security

### Row Level Security (RLS)

All tables have RLS enabled with policies:

- **Authenticated users** can view and insert records
- **Service role** (for cron jobs) has full access
- **Admin users** have elevated permissions (from profiles table)

### Data Privacy

- Compliance data is scoped to organizations
- Evidence files require proper authentication
- Audit trail maintained for all actions

## 🚀 Usage

### For Administrators

1. **Access Dashboard**
   ```
   Navigate to: /admin/live-compliance
   ```

2. **Monitor Compliance Score**
   - View real-time score on dashboard
   - Check breakdown metrics
   - Review AI-generated status explanation

3. **Review Non-Conformities**
   - Check Timeline tab for recent detections
   - Verify AI-matched norms are correct
   - Review generated corrective actions

4. **Track Training Assignments**
   - Monitor training status by vessel
   - Verify certificate issuance
   - Check for overdue trainings

5. **Manage Evidence**
   - Review evidence grouped by norm
   - Verify evidence completeness
   - Export for audit preparation

### For Developers

**Manual Trigger (Testing):**

```typescript
import { processNonConformity } from '@/services/compliance-engine';

const log = {
  source_type: 'incident',
  description: 'DP system lost position during operations',
  severity: 'high',
  vessel_id: 'vessel-uuid',
  crew_id: 'crew-uuid'
};

const result = await processNonConformity(log);
console.log(result);
```

**Calculate Score:**

```typescript
import { calculateComplianceScore } from '@/services/compliance-engine';

const score = await calculateComplianceScore(
  'org-uuid', // optional
  'vessel-uuid' // optional
);
console.log(`Compliance Score: ${score.score}/100`);
```

**Generate Status Report:**

```typescript
import { generateComplianceStatusExplanation } from '@/services/compliance-engine';

const status = await generateComplianceStatusExplanation();
console.log(status.summary);
```

## 📈 Integration Points

### Existing Systems

The module integrates with:

1. **DP Incidents** (`dp_incidents` table)
   - Automatically scans new incidents
   - Correlates to IMCA M 103 and other DP standards

2. **Safety Incidents** (`safety_incidents` table)
   - Processes SGSO-related incidents
   - Links to ANP Resolution 43/2007 practices

3. **Training Records** (`sgso_training_records` table)
   - Finds existing related trainings
   - Creates new training assignments

4. **Crew Management** (`crew_members` table)
   - Assigns trainings to crew
   - Tracks certification status

5. **Audits** (`auditorias_imca` table)
   - Provides evidence for audit preparation
   - Links to audit findings

### External APIs

- **OpenAI GPT-4o-mini**: For AI analysis and plan generation
- **Supabase**: Database and Edge Functions
- **Cron**: Scheduled automation

## 🧪 Testing

### Unit Tests

Located in: `src/tests/compliance-engine.test.ts`

Tests cover:
- `matchLogToNorm()` - norm matching
- `generateCorrectivePlanFromGap()` - plan generation
- `calculateComplianceScore()` - score calculation
- `processNonConformity()` - full workflow

### Manual Testing

1. Create a test incident in `dp_incidents`
2. Wait for cron run or trigger manually
3. Check `/admin/live-compliance` for results
4. Verify non-conformity, action, and evidence creation

## 📝 Future Enhancements

### Planned Features

1. **Notification System**
   - Email alerts for critical non-conformities
   - Reminders for overdue actions
   - Training due date notifications

2. **Advanced Analytics**
   - Trend analysis over time
   - Predictive compliance forecasting
   - Comparison between vessels/organizations

3. **Enhanced Evidence Management**
   - Direct file upload from dashboard
   - Digital signatures for evidence
   - Blockchain-based immutable evidence trail

4. **Mobile App Integration**
   - Push notifications for crew
   - Training completion via mobile
   - Evidence capture from device camera

5. **Reporting**
   - PDF export for audit packages
   - Excel reports for analysis
   - Automated audit report generation

6. **Multi-language Support**
   - Portuguese, English, Spanish
   - Regulation library in multiple languages

## 🛠️ Troubleshooting

### Common Issues

**Issue: Compliance score shows 0**
- Check if non-conformities exist in database
- Verify calculateComplianceScore() is receiving correct org/vessel IDs
- Ensure RLS policies allow data access

**Issue: AI not matching norms correctly**
- Verify OpenAI API key is set: `VITE_OPENAI_API_KEY`
- Check incident descriptions are detailed enough
- Review GPT-4o-mini prompt in matchLogToNorm()

**Issue: Cron not running**
- Check Supabase Edge Functions are deployed
- Verify cron.yaml is correctly configured
- Check `cron_execution_logs` for errors

**Issue: Training assignments not creating**
- Verify crew_member_id exists in crew_members table
- Check sgso_training_records table exists
- Ensure proper permissions for insert

## 📚 References

### Regulations Supported

- **IMCA**: International Marine Contractors Association standards
  - IMCA M 103 (DP Incident Reporting)
  - IMCA M 166 (DP FMEA)
  
- **ANP**: Agência Nacional do Petróleo, Gás Natural e Biocombustíveis
  - Resolução 43/2007 (SGSO)
  
- **ISO**: International Organization for Standardization
  - ISO 9001 (Quality Management)
  - ISO 14001 (Environmental Management)
  
- **IBAMA**: Instituto Brasileiro do Meio Ambiente
  - Environmental regulations

### Documentation

- [IMCA M 103 Guidelines](https://www.imca-int.com/)
- [ANP Resolution 43/2007](https://www.gov.br/anp/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## 🤝 Contributing

When extending the module:

1. Follow existing patterns in `compliance-engine.ts`
2. Add tests for new functions
3. Update database migrations as needed
4. Document new features in this README
5. Ensure RLS policies are properly configured

## 📄 License

This module is part of the Travel HR Buddy system and follows the same license terms.

---

**Version:** 1.0.0  
**Last Updated:** October 18, 2025  
**Module Code:** ETAPA 33  
**Status:** ✅ Production Ready
