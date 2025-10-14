# DP Intelligence Center - Testing Guide

## Overview
This guide provides test scenarios to validate the DP Intelligence Center integration with the global assistant.

## Test Scenarios

### 1. Basic DP Query Detection
**Test**: Ask assistant about DP
**Query**: "O que é posicionamento dinâmico?"
**Expected**: Assistant recognizes DP context and provides technical explanation

### 2. Specific Incident Query
**Test**: Ask about specific IMCA incident
**Query**: "Explique o incidente IMCA-2025-009"
**Expected**: 
- Fetches incident from database
- Provides detailed analysis including:
  - Incident summary
  - Vessel class and type
  - Root cause
  - IMCA standards referenced
  - Corrective actions

### 3. IMCA Standards Query
**Test**: Ask about IMCA standard
**Query**: "O que diz a norma IMCA M190 sobre Drive Off?"
**Expected**: 
- Explains IMCA M190 standard
- Relates to drive-off incidents
- Provides best practices

### 4. General DP Failure Analysis
**Test**: Ask about common DP failures
**Query**: "Quais as causas mais comuns de perda de posição em DP?"
**Expected**:
- Lists common causes (gyro failure, thruster failure, reference system loss, etc.)
- Searches related incidents in database
- Provides preventive measures

### 5. Comparative Analysis
**Test**: Compare incidents
**Query**: "Compare incidentes DP classe 2 e classe 3"
**Expected**:
- Searches for incidents of both classes
- Provides comparative analysis
- Highlights key differences

### 6. Equipment-Specific Query
**Test**: Ask about specific equipment
**Query**: "Causas possíveis para falha de gyro em operação DP?"
**Expected**:
- Technical explanation of gyro failures
- Related incidents from database
- Preventive maintenance recommendations

### 7. PEO-DP Compliance Query
**Test**: Ask about PEO-DP compliance
**Query**: "Como verificar conformidade com PEO-DP?"
**Expected**:
- Explains PEO-DP requirements
- Links to PEO-DP module
- Provides compliance checklist

## API Endpoints Testing

### Test DP Intel Feed
```bash
# Get all incidents
curl "https://[SUPABASE_URL]/functions/v1/dp-intel-feed"

# Get specific incident
curl "https://[SUPABASE_URL]/functions/v1/dp-intel-feed?incident_id=IMCA-2025-009"

# Search by severity
curl "https://[SUPABASE_URL]/functions/v1/dp-intel-feed?severity=critical"

# Search by type
curl "https://[SUPABASE_URL]/functions/v1/dp-intel-feed?incident_type=drive_off"

# Full-text search
curl "https://[SUPABASE_URL]/functions/v1/dp-intel-feed?search=thruster"
```

### Test DP Intel Analyze
```bash
# Analyze specific incident
curl -X POST "https://[SUPABASE_URL]/functions/v1/dp-intel-analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "incident_id": "IMCA-2025-009",
    "analysis_type": "full"
  }'

# Get recommendations only
curl -X POST "https://[SUPABASE_URL]/functions/v1/dp-intel-analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "incident_id": "IMCA-2025-014",
    "analysis_type": "recommendations"
  }'

# General query
curl -X POST "https://[SUPABASE_URL]/functions/v1/dp-intel-analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Explain IMCA M190 requirements for DP Class 2 vessels"
  }'
```

## Database Validation

### Check Sample Data
```sql
-- Verify incidents are loaded
SELECT incident_id, title, severity, vessel_class 
FROM dp_incidents 
ORDER BY incident_date DESC;

-- Check IMCA standards distribution
SELECT unnest(imca_standards) as standard, COUNT(*) 
FROM dp_incidents 
GROUP BY standard;

-- Check incident types
SELECT incident_type, COUNT(*), AVG(CASE 
  WHEN severity = 'critical' THEN 4 
  WHEN severity = 'high' THEN 3 
  WHEN severity = 'medium' THEN 2 
  ELSE 1 END) as avg_severity
FROM dp_incidents 
GROUP BY incident_type;
```

## Integration Tests

### Test Assistant Integration
1. Open the assistant interface
2. Type: "Mostre incidentes DP recentes"
3. Verify: Should trigger DP Intelligence context
4. Type: "IMCA-2025-009"
5. Verify: Should fetch and display incident details

### Test Voice Assistant Integration
1. Activate voice assistant
2. Say: "O que você sabe sobre incidentes de posicionamento dinâmico?"
3. Verify: Voice response includes DP intelligence context
4. Say: "Navegue para PEO-DP"
5. Verify: System navigates to PEO-DP module

## Expected Behavior

### Keywords that Trigger DP Intelligence
- "dp", "posicionamento dinâmico"
- "imca", "incidente"
- "drive off", "drive-off"
- "perda de posição"
- "thruster", "gyro", "dgps"
- "peo-dp", "peo dp"

### Response Format
Responses should include:
- ✅ Technical summary
- 📚 IMCA standards references
- 📌 Potential causes
- 🧠 AI-powered recommendations
- 📄 Corrective and preventive actions
- 🔗 Link to PEO-DP module

## Sample Data in Database

### Pre-loaded Incidents:
1. **IMCA-2025-009**: Position loss during drilling (DP Class 2)
   - Severity: High
   - Cause: Simultaneous failure of DGPS and Gyro
   - Standards: M190, M103, M182

2. **IMCA-2025-014**: Drive-off during FPSO approach (DP Class 3)
   - Severity: Critical
   - Cause: Human error in control system configuration
   - Standards: M190, M117

3. **INC-2024-087**: Thruster failure during ROV operation (DP Class 2)
   - Severity: Medium
   - Cause: Premature bearing wear
   - Standards: M103, M190

## Troubleshooting

### Common Issues

1. **Assistant not recognizing DP queries**
   - Check keywords are present in query
   - Verify OPENAI_API_KEY is set
   - Check assistant-query function logs

2. **No incidents returned**
   - Verify migration has run: `20251014213000_create_dp_incidents_table.sql`
   - Check database connection
   - Verify RLS policies

3. **AI analysis fails**
   - Check OPENAI_API_KEY is configured
   - Verify incident exists in database
   - Check dp-intel-analyze function logs

## Success Criteria

✅ Assistant detects DP-related keywords
✅ Database queries return sample incidents
✅ AI analysis provides technical responses
✅ IMCA standards are correctly referenced
✅ Links to PEO-DP module work
✅ Voice assistant supports DP queries
✅ All Edge Functions deploy successfully
