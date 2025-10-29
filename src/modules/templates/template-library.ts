// PATCH 488.0 - Template Library
// 6 production-ready maritime document templates

export interface TemplateDefinition {
  id: string;
  name: string;
  type: "document" | "incident" | "fmea" | "contract" | "report" | "checklist";
  description: string;
  placeholders: string[];
  content: string;
}

export const templateLibrary: TemplateDefinition[] = [
  {
    id: "maritime-incident-report",
    name: "Maritime Incident Report",
    type: "incident",
    description: "Comprehensive incident documentation for maritime operations",
    placeholders: [
      "{{INCIDENT_ID}}",
      "{{DATE}}",
      "{{TIME}}",
      "{{VESSEL_NAME}}",
      "{{VESSEL_IMO}}",
      "{{LOCATION}}",
      "{{COORDINATES}}",
      "{{WEATHER_CONDITIONS}}",
      "{{SEA_STATE}}",
      "{{INCIDENT_TYPE}}",
      "{{SEVERITY}}",
      "{{DESCRIPTION}}",
      "{{IMMEDIATE_ACTIONS}}",
      "{{CASUALTIES}}",
      "{{DAMAGE_ASSESSMENT}}",
      "{{REPORTED_BY}}",
    ],
    content: `# Maritime Incident Report

**Incident ID:** {{INCIDENT_ID}}
**Date:** {{DATE}} **Time:** {{TIME}}

## Vessel Information
- **Vessel Name:** {{VESSEL_NAME}}
- **IMO Number:** {{VESSEL_IMO}}
- **Location:** {{LOCATION}}
- **Coordinates:** {{COORDINATES}}

## Environmental Conditions
- **Weather:** {{WEATHER_CONDITIONS}}
- **Sea State:** {{SEA_STATE}}

## Incident Details
**Type:** {{INCIDENT_TYPE}}
**Severity:** {{SEVERITY}}

### Description
{{DESCRIPTION}}

### Immediate Actions Taken
{{IMMEDIATE_ACTIONS}}

## Impact Assessment
- **Casualties:** {{CASUALTIES}}
- **Damage:** {{DAMAGE_ASSESSMENT}}

**Reported By:** {{REPORTED_BY}}
**Report Date:** {{DATE}}`,
  },
  {
    id: "fmea-analysis-template",
    name: "FMEA Analysis Template",
    type: "fmea",
    description: "Failure Mode and Effects Analysis for maritime systems",
    placeholders: [
      "{{PROJECT_NAME}}",
      "{{SYSTEM_NAME}}",
      "{{ANALYSIS_DATE}}",
      "{{ANALYST_NAME}}",
      "{{COMPONENT}}",
      "{{FUNCTION}}",
      "{{FAILURE_MODE}}",
      "{{EFFECT}}",
      "{{SEVERITY}}",
      "{{OCCURRENCE}}",
      "{{DETECTION}}",
      "{{RPN}}",
      "{{RECOMMENDED_ACTIONS}}",
      "{{RESPONSIBILITY}}",
      "{{TARGET_DATE}}",
      "{{STATUS}}",
    ],
    content: `# FMEA Analysis

**Project:** {{PROJECT_NAME}}
**System:** {{SYSTEM_NAME}}
**Date:** {{ANALYSIS_DATE}}
**Analyst:** {{ANALYST_NAME}}

## Analysis Table

| Component | Function | Failure Mode | Effect | SEV | OCC | DET | RPN |
|-----------|----------|--------------|--------|-----|-----|-----|-----|
| {{COMPONENT}} | {{FUNCTION}} | {{FAILURE_MODE}} | {{EFFECT}} | {{SEVERITY}} | {{OCCURRENCE}} | {{DETECTION}} | {{RPN}} |

### Recommended Actions
{{RECOMMENDED_ACTIONS}}

**Responsibility:** {{RESPONSIBILITY}}
**Target Date:** {{TARGET_DATE}}
**Status:** {{STATUS}}`,
  },
  {
    id: "vessel-charter-contract",
    name: "Vessel Charter Contract",
    type: "contract",
    description: "Standard vessel charter agreement template",
    placeholders: [
      "{{CONTRACT_NUMBER}}",
      "{{CONTRACT_DATE}}",
      "{{CHARTERER_NAME}}",
      "{{CHARTERER_ADDRESS}}",
      "{{OWNER_NAME}}",
      "{{OWNER_ADDRESS}}",
      "{{VESSEL_NAME}}",
      "{{VESSEL_IMO}}",
      "{{VESSEL_DWT}}",
      "{{CHARTER_PERIOD}}",
      "{{CHARTER_RATE}}",
      "{{PAYMENT_TERMS}}",
      "{{LAYCAN}}",
      "{{LOADING_PORT}}",
      "{{DISCHARGE_PORT}}",
      "{{CARGO_DESCRIPTION}}",
      "{{CARGO_QUANTITY}}",
      "{{DEMURRAGE_RATE}}",
      "{{DESPATCH_RATE}}",
      "{{GOVERNING_LAW}}",
      "{{ARBITRATION_CLAUSE}}",
      "{{SPECIAL_TERMS}}",
      "{{CHARTERER_SIGNATURE}}",
      "{{OWNER_SIGNATURE}}",
      "{{WITNESS}}",
      "{{SIGNATURE_DATE}}",
      "{{SIGNATURE_LOCATION}}",
    ],
    content: `# Vessel Charter Contract

**Contract Number:** {{CONTRACT_NUMBER}}
**Date:** {{CONTRACT_DATE}}

## Parties

**Charterer:**
{{CHARTERER_NAME}}
{{CHARTERER_ADDRESS}}

**Owner:**
{{OWNER_NAME}}
{{OWNER_ADDRESS}}

## Vessel Description
- **Name:** {{VESSEL_NAME}}
- **IMO:** {{VESSEL_IMO}}
- **DWT:** {{VESSEL_DWT}}

## Charter Terms
- **Period:** {{CHARTER_PERIOD}}
- **Rate:** {{CHARTER_RATE}}
- **Payment:** {{PAYMENT_TERMS}}
- **Laycan:** {{LAYCAN}}

## Voyage Details
- **Loading Port:** {{LOADING_PORT}}
- **Discharge Port:** {{DISCHARGE_PORT}}
- **Cargo:** {{CARGO_DESCRIPTION}}
- **Quantity:** {{CARGO_QUANTITY}}

## Commercial Terms
- **Demurrage:** {{DEMURRAGE_RATE}}
- **Despatch:** {{DESPATCH_RATE}}

## Legal Terms
- **Governing Law:** {{GOVERNING_LAW}}
- **Arbitration:** {{ARBITRATION_CLAUSE}}

## Special Terms
{{SPECIAL_TERMS}}

---

**Signatures:**
Charterer: {{CHARTERER_SIGNATURE}}
Owner: {{OWNER_SIGNATURE}}
Witness: {{WITNESS}}
Date: {{SIGNATURE_DATE}}
Place: {{SIGNATURE_LOCATION}}`,
  },
  {
    id: "vessel-maintenance-report",
    name: "Vessel Maintenance Report",
    type: "report",
    description: "Routine vessel maintenance documentation",
    placeholders: [
      "{{REPORT_ID}}",
      "{{VESSEL_NAME}}",
      "{{VESSEL_IMO}}",
      "{{MAINTENANCE_DATE}}",
      "{{MAINTENANCE_TYPE}}",
      "{{EQUIPMENT_NAME}}",
      "{{EQUIPMENT_LOCATION}}",
      "{{WORK_PERFORMED}}",
      "{{PARTS_REPLACED}}",
      "{{MATERIALS_USED}}",
      "{{MANHOURS}}",
      "{{TECHNICIAN_NAME}}",
      "{{SUPERVISOR_NAME}}",
      "{{FINDINGS}}",
      "{{RECOMMENDATIONS}}",
      "{{NEXT_MAINTENANCE_DATE}}",
      "{{STATUS}}",
      "{{COST}}",
      "{{APPROVAL_SIGNATURE}}",
      "{{APPROVAL_DATE}}",
    ],
    content: `# Vessel Maintenance Report

**Report ID:** {{REPORT_ID}}
**Vessel:** {{VESSEL_NAME}} ({{VESSEL_IMO}})
**Date:** {{MAINTENANCE_DATE}}

## Maintenance Details
**Type:** {{MAINTENANCE_TYPE}}
**Equipment:** {{EQUIPMENT_NAME}}
**Location:** {{EQUIPMENT_LOCATION}}

## Work Performed
{{WORK_PERFORMED}}

### Parts and Materials
- **Parts Replaced:** {{PARTS_REPLACED}}
- **Materials Used:** {{MATERIALS_USED}}
- **Man-Hours:** {{MANHOURS}}

## Personnel
- **Technician:** {{TECHNICIAN_NAME}}
- **Supervisor:** {{SUPERVISOR_NAME}}

## Findings and Recommendations
**Findings:** {{FINDINGS}}

**Recommendations:** {{RECOMMENDATIONS}}

**Next Maintenance Due:** {{NEXT_MAINTENANCE_DATE}}

## Summary
**Status:** {{STATUS}}
**Total Cost:** {{COST}}

**Approved By:** {{APPROVAL_SIGNATURE}}
**Date:** {{APPROVAL_DATE}}`,
  },
  {
    id: "safety-briefing-document",
    name: "Safety Briefing Document",
    type: "document",
    description: "Pre-operation safety briefing template",
    placeholders: [
      "{{BRIEFING_ID}}",
      "{{OPERATION_NAME}}",
      "{{BRIEFING_DATE}}",
      "{{BRIEFING_TIME}}",
      "{{LOCATION}}",
      "{{BRIEFING_LEADER}}",
      "{{OPERATION_DESCRIPTION}}",
      "{{HAZARDS_IDENTIFIED}}",
      "{{CONTROL_MEASURES}}",
      "{{PPE_REQUIRED}}",
      "{{EMERGENCY_PROCEDURES}}",
      "{{COMMUNICATION_PLAN}}",
      "{{WEATHER_FORECAST}}",
      "{{CREW_RESPONSIBILITIES}}",
      "{{EQUIPMENT_CHECKLIST}}",
      "{{QUESTIONS_ADDRESSED}}",
      "{{ATTENDEES}}",
      "{{ACKNOWLEDGEMENT}}",
      "{{SUPERVISOR_SIGNATURE}}",
      "{{DATE_SIGNED}}",
    ],
    content: `# Safety Briefing Document

**Briefing ID:** {{BRIEFING_ID}}
**Operation:** {{OPERATION_NAME}}
**Date:** {{BRIEFING_DATE}} at {{BRIEFING_TIME}}
**Location:** {{LOCATION}}
**Leader:** {{BRIEFING_LEADER}}

## Operation Description
{{OPERATION_DESCRIPTION}}

## Hazard Assessment
**Identified Hazards:** {{HAZARDS_IDENTIFIED}}

**Control Measures:** {{CONTROL_MEASURES}}

## Safety Requirements
**PPE Required:** {{PPE_REQUIRED}}

**Emergency Procedures:** {{EMERGENCY_PROCEDURES}}

**Communication Plan:** {{COMMUNICATION_PLAN}}

## Environmental Conditions
**Weather Forecast:** {{WEATHER_FORECAST}}

## Responsibilities
{{CREW_RESPONSIBILITIES}}

## Equipment Checklist
{{EQUIPMENT_CHECKLIST}}

## Q&A Session
{{QUESTIONS_ADDRESSED}}

---

**Attendees:**
{{ATTENDEES}}

**Acknowledgement:**
{{ACKNOWLEDGEMENT}}

**Supervisor:** {{SUPERVISOR_SIGNATURE}}
**Date:** {{DATE_SIGNED}}`,
  },
  {
    id: "vessel-inspection-checklist",
    name: "Vessel Inspection Checklist",
    type: "checklist",
    description: "Comprehensive vessel inspection checklist",
    placeholders: [
      "{{INSPECTION_ID}}",
      "{{VESSEL_NAME}}",
      "{{VESSEL_IMO}}",
      "{{INSPECTION_DATE}}",
      "{{INSPECTION_TYPE}}",
      "{{INSPECTOR_NAME}}",
      "{{HULL_CONDITION}}",
      "{{DECK_EQUIPMENT}}",
      "{{ENGINE_ROOM}}",
      "{{NAVIGATION_EQUIPMENT}}",
      "{{SAFETY_EQUIPMENT}}",
      "{{COMMUNICATION_SYSTEMS}}",
      "{{FIREFIGHTING_EQUIPMENT}}",
      "{{LIFESAVING_APPLIANCES}}",
      "{{CARGO_SPACES}}",
      "{{ACCOMMODATION}}",
      "{{ELECTRICAL_SYSTEMS}}",
      "{{PIPING_SYSTEMS}}",
      "{{DEFICIENCIES_FOUND}}",
      "{{CORRECTIVE_ACTIONS}}",
      "{{PRIORITY}}",
      "{{TARGET_COMPLETION}}",
      "{{OVERALL_RATING}}",
      "{{INSPECTOR_SIGNATURE}}",
      "{{CAPTAIN_SIGNATURE}}",
      "{{INSPECTION_COMPLETED_DATE}}",
    ],
    content: `# Vessel Inspection Checklist

**Inspection ID:** {{INSPECTION_ID}}
**Vessel:** {{VESSEL_NAME}} ({{VESSEL_IMO}})
**Date:** {{INSPECTION_DATE}}
**Type:** {{INSPECTION_TYPE}}
**Inspector:** {{INSPECTOR_NAME}}

## Inspection Areas

### 1. Hull and Structure
{{HULL_CONDITION}}

### 2. Deck Equipment
{{DECK_EQUIPMENT}}

### 3. Engine Room
{{ENGINE_ROOM}}

### 4. Navigation Equipment
{{NAVIGATION_EQUIPMENT}}

### 5. Safety Equipment
{{SAFETY_EQUIPMENT}}

### 6. Communication Systems
{{COMMUNICATION_SYSTEMS}}

### 7. Firefighting Equipment
{{FIREFIGHTING_EQUIPMENT}}

### 8. Lifesaving Appliances
{{LIFESAVING_APPLIANCES}}

### 9. Cargo Spaces
{{CARGO_SPACES}}

### 10. Accommodation
{{ACCOMMODATION}}

### 11. Electrical Systems
{{ELECTRICAL_SYSTEMS}}

### 12. Piping Systems
{{PIPING_SYSTEMS}}

## Findings

### Deficiencies Identified
{{DEFICIENCIES_FOUND}}

### Corrective Actions Required
{{CORRECTIVE_ACTIONS}}

**Priority:** {{PRIORITY}}
**Target Completion:** {{TARGET_COMPLETION}}

## Summary
**Overall Rating:** {{OVERALL_RATING}}

---

**Inspector:** {{INSPECTOR_SIGNATURE}}
**Captain:** {{CAPTAIN_SIGNATURE}}
**Completed:** {{INSPECTION_COMPLETED_DATE}}`,
  },
];
