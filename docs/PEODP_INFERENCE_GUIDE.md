# PEO-DP Inference Engine Implementation Guide

## Overview
The PEO-DP (Procedure for Equipment Operation - Dynamic Positioning) Inference Service is an AI-powered recommendation engine that analyzes vessel performance, crew competency, and operational context to provide intelligent guidance for DP operations.

## Features
- Vessel performance analysis
- Crew competency assessment
- Maintenance needs identification
- Training gap analysis
- Operational readiness evaluation
- Risk-based prioritization
- Explainable AI reasoning
- Audit trail logging

## Architecture

### Core Components
1. **PEODPInferenceService** (`src/services/peodp-inference-service.ts`) - Inference engine
2. **PeoDpWizard** (`src/components/peo-dp/peo-dp-wizard.tsx`) - UI wizard
3. **Database Tables** - Data storage for plans and logs

### Data Sources
- Vessel performance metrics
- Crew assignments and certifications
- Incident history
- Maintenance records
- Operational context

## Database Schema

### Required Tables

#### peodp_plans
```sql
CREATE TABLE peodp_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  dp_class TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  crew_composition JSONB NOT NULL,
  training_requirements JSONB NOT NULL,
  maintenance_schedule JSONB NOT NULL,
  emergency_procedures JSONB NOT NULL,
  fmea_analysis JSONB,
  asog_procedures JSONB,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'under_review', 'archived')),
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

CREATE INDEX idx_peodp_plans_vessel ON peodp_plans(vessel_id);
CREATE INDEX idx_peodp_plans_status ON peodp_plans(status);

-- Enable RLS
ALTER TABLE peodp_plans ENABLE ROW LEVEL SECURITY;

-- Users can view plans for vessels they have access to
CREATE POLICY "Users can view accessible plans"
  ON peodp_plans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vessels v
      WHERE v.id = vessel_id
      AND v.company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );
```

#### dp_inference_logs
```sql
CREATE TABLE dp_inference_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recommendations_count INTEGER NOT NULL,
  critical_count INTEGER NOT NULL DEFAULT 0,
  high_count INTEGER NOT NULL DEFAULT 0,
  medium_count INTEGER NOT NULL DEFAULT 0,
  low_count INTEGER NOT NULL DEFAULT 0,
  recommendations JSONB NOT NULL,
  operational_context JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dp_inference_logs_vessel ON dp_inference_logs(vessel_id);
CREATE INDEX idx_dp_inference_logs_timestamp ON dp_inference_logs(timestamp DESC);

-- Enable RLS
ALTER TABLE dp_inference_logs ENABLE ROW LEVEL SECURITY;

-- Users can view logs for their vessels
CREATE POLICY "Users can view vessel inference logs"
  ON dp_inference_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vessels v
      WHERE v.id = vessel_id
      AND v.company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );
```

#### vessel_performance_metrics (if not exists)
```sql
CREATE TABLE vessel_performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id UUID REFERENCES vessels(id) ON DELETE CASCADE,
  positioning_accuracy NUMERIC CHECK (positioning_accuracy >= 0 AND positioning_accuracy <= 100), -- Percentage (0-100)
  fuel_efficiency NUMERIC CHECK (fuel_efficiency >= 0 AND fuel_efficiency <= 100), -- Percentage (0-100)
  thruster_performance NUMERIC CHECK (thruster_performance >= 0 AND thruster_performance <= 100), -- Percentage (0-100)
  sensor_health NUMERIC CHECK (sensor_health >= 0 AND sensor_health <= 100), -- Percentage (0-100)
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  COMMENT ON COLUMN positioning_accuracy IS 'DP positioning accuracy as percentage (0-100)',
  COMMENT ON COLUMN fuel_efficiency IS 'Fuel consumption efficiency rating as percentage (0-100)',
  COMMENT ON COLUMN thruster_performance IS 'Overall thruster system performance as percentage (0-100)',
  COMMENT ON COLUMN sensor_health IS 'Sensor system health status as percentage (0-100)'
);

CREATE INDEX idx_vessel_performance_metrics_vessel ON vessel_performance_metrics(vessel_id);
CREATE INDEX idx_vessel_performance_metrics_recorded ON vessel_performance_metrics(recorded_at DESC);
```

## Usage Examples

### Generating Recommendations

```typescript
import { PEODPInferenceService } from '@/services/peodp-inference-service';

// Basic usage
const recommendations = await PEODPInferenceService.generateRecommendations(vesselId);

// With operational context
const recommendations = await PEODPInferenceService.generateRecommendations(
  vesselId,
  {
    weather_conditions: 'moderate',
    sea_state: 4,
    operation_type: 'drilling',
    critical_operation: true,
    proximity_to_structures: 'close'
  }
);

// Display recommendations
recommendations.forEach(rec => {
  console.log(`${rec.priority.toUpperCase()}: ${rec.title}`);
  console.log(`Confidence: ${rec.confidence}%`);
  console.log(`Risk: ${rec.risk_level}`);
  console.log(`Actions:`);
  rec.suggested_actions.forEach(action => console.log(`  - ${action}`));
});
```

### Integrating with UI

```typescript
// In your component
import { useState, useEffect } from 'react';
import { PEODPInferenceService } from '@/services/peodp-inference-service';

export const PEODPRecommendations = ({ vesselId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const recs = await PEODPInferenceService.generateRecommendations(vesselId);
        setRecommendations(recs);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [vesselId]);

  if (loading) return <div>Loading recommendations...</div>;

  return (
    <div className="space-y-4">
      {recommendations.map((rec, index) => (
        <Card key={index} className={getPriorityClass(rec.priority)}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {rec.title}
              <Badge variant={getPriorityVariant(rec.priority)}>
                {rec.priority}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-2">{rec.description}</p>
            <div className="bg-blue-50 p-3 rounded-md mb-3">
              <p className="text-sm text-blue-900">
                <strong>Reasoning:</strong> {rec.reasoning}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Suggested Actions:</p>
              <ul className="list-disc list-inside space-y-1">
                {rec.suggested_actions.map((action, idx) => (
                  <li key={idx} className="text-sm">{action}</li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span>Confidence: {rec.confidence}%</span>
              <span>Risk: {rec.risk_level}</span>
              <span>Impact: {rec.estimated_impact}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
```

### Creating/Updating PEO-DP Plans

```typescript
// Save plan from wizard
const handleWizardComplete = async (formData) => {
  try {
    const plan = await PEODPInferenceService.savePEODPPlan({
      vessel_id: vesselId,
      dp_class: formData.dp_class,
      operation_type: formData.operation_type,
      crew_composition: {
        dp_master: formData.dp_master,
        certified_operators: formData.certified_operators,
        watch_schedule: formData.watch_schedule
      },
      training_requirements: {
        mandatory_courses: formData.mandatory_courses,
        refresher_schedule: formData.refresher_schedule
      },
      maintenance_schedule: {
        preventive: formData.preventive,
        predictive: formData.predictive
      },
      emergency_procedures: {
        emergency_disconnect: formData.emergency_disconnect,
        loss_of_position: formData.loss_of_position
      },
      status: 'active'
    });

    toast.success('PEO-DP plan saved successfully');
  } catch (error) {
    toast.error('Failed to save plan');
  }
};
```

### Viewing Inference History

```typescript
const [history, setHistory] = useState([]);

useEffect(() => {
  const loadHistory = async () => {
    const logs = await PEODPInferenceService.getInferenceHistory(vesselId, 20);
    setHistory(logs);
  };
  loadHistory();
}, [vesselId]);

// Display history
{history.map(log => (
  <div key={log.id}>
    <p>{new Date(log.timestamp).toLocaleString()}</p>
    <p>Total: {log.recommendations_count} recommendations</p>
    <p>Critical: {log.critical_count}, High: {log.high_count}</p>
  </div>
))}
```

## Recommendation Types

### 1. Crew Recommendations
- Insufficient DP certification
- Expiring certifications
- Low experience level
- Watch-keeping coverage gaps

### 2. Maintenance Recommendations
- Degraded positioning accuracy
- Overdue maintenance items
- Equipment health issues
- Sensor calibration needs

### 3. Training Recommendations
- High incident rates
- New equipment familiarization
- Regulatory requirement changes
- Simulator training needs

### 4. Operational Recommendations
- Missing PEO-DP plan
- Severe weather warnings
- Proximity to structures alerts
- DP class limitations

### 5. Safety Recommendations
- Emergency procedure gaps
- FMEA updates required
- Contingency plan reviews
- Communication system checks

## Priority Levels

- **Critical**: Immediate action required, operations may be unsafe
- **High**: Action needed soon, potential safety or compliance risk
- **Medium**: Should be addressed, impacts efficiency or future readiness
- **Low**: Nice to have, minor improvements

## Confidence Scoring

Confidence scores (0-100%) are based on:
- Data completeness (higher with more historical data)
- Data quality (recent vs. old data)
- Measurement accuracy
- Sample size

High confidence (>80%): Reliable recommendation based on solid data
Medium confidence (50-80%): Reasonable recommendation, some data gaps
Low confidence (<50%): Preliminary recommendation, needs verification

## Integration with Wizard

Connect the PEO-DP wizard to the inference service:

```typescript
// In PeoDpWizard component
import { PEODPInferenceService } from '@/services/peodp-inference-service';

const handleComplete = async (formData) => {
  // Save plan
  const plan = await PEODPInferenceService.savePEODPPlan({
    ...formData,
    vessel_id: vesselId,
    status: 'active'
  });

  // Generate recommendations
  const recommendations = await PEODPInferenceService.generateRecommendations(
    vesselId
  );

  // Show recommendations to user
  onComplete({ plan, recommendations });
};
```

## Best Practices

1. **Regular Analysis**: Run inference daily or before critical operations
2. **Context Updates**: Provide operational context for accurate recommendations
3. **Action Tracking**: Track which recommendations are implemented
4. **Feedback Loop**: Update inference rules based on effectiveness
5. **Data Quality**: Ensure vessel and crew data is up to date

## Customization

### Adding New Recommendation Rules

Edit `PEODPInferenceService` methods:

```typescript
private static analyzeCustomRule(data: any): InferenceResult[] {
  const recommendations: InferenceResult[] = [];
  
  // Your custom logic here
  if (data.custom_condition) {
    recommendations.push({
      recommendation_type: 'operational',
      priority: 'high',
      title: 'Custom Rule Triggered',
      description: 'Custom condition detected',
      reasoning: 'Explain why this matters',
      confidence: 85,
      suggested_actions: ['Action 1', 'Action 2'],
      risk_level: 'medium',
      estimated_impact: 'Expected improvement'
    });
  }
  
  return recommendations;
}
```

### Adjusting Thresholds

Modify threshold values in the service:

```typescript
// Example: Change crew certification threshold
if (certificationRatio < 0.6) { // Changed from 0.5
  // Generate recommendation
}
```

## Testing

### Unit Tests

```typescript
import { PEODPInferenceService } from '@/services/peodp-inference-service';

describe('PEODPInferenceService', () => {
  it('should detect low crew certification', async () => {
    const mockData = {
      dp_certified_crew: 2,
      total_crew: 10
    };
    
    const recommendations = await PEODPInferenceService.analyzeCrewCompetency(
      mockData
    );
    
    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].priority).toBe('high');
  });
});
```

### Integration Tests

Test with real vessel data:
1. Create test vessel with known data
2. Run inference
3. Verify recommendations match expected results
4. Check inference logs are created

## Monitoring

Track inference service performance:
- Response times
- Recommendation accuracy
- User feedback on recommendations
- Implementation rate of suggestions

## Troubleshooting

### No recommendations generated
- Check vessel data exists in database
- Verify crew assignments are current
- Ensure performance metrics are being recorded

### Incorrect recommendations
- Review data quality
- Check threshold values
- Verify operational context
- Update inference rules

### Performance issues
- Add database indexes
- Implement caching for vessel data
- Batch process multiple vessels
- Optimize queries

## API Reference

### Main Methods

#### generateRecommendations(vesselId, context?)
Generates AI-powered recommendations for a vessel.

**Parameters:**
- `vesselId`: UUID of the vessel
- `context`: Optional operational context

**Returns:** Array of InferenceResult objects

#### savePEODPPlan(plan)
Creates or updates a PEO-DP plan.

**Parameters:**
- `plan`: Partial PEODPPlan object

**Returns:** Saved PEODPPlan object

#### getInferenceHistory(vesselId, limit)
Retrieves inference history for a vessel.

**Parameters:**
- `vesselId`: UUID of the vessel
- `limit`: Number of records to retrieve (default: 20)

**Returns:** Array of inference log objects

## Support

For assistance:
1. Review inference logs in database
2. Check vessel data completeness
3. Verify database schema matches documentation
4. Test with sample data
5. Contact development team for custom rules
