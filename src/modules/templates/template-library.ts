/**
 * PATCH 488 - Template Library
 * Predefined templates for common documents
 */

export interface TemplateDefinition {
  id: string;
  title: string;
  type: "document" | "incident" | "fmea" | "contract" | "report";
  description: string;
  content: string;
  placeholders: string[];
  tags: string[];
}

export const TEMPLATE_LIBRARY: TemplateDefinition[] = [
  {
    id: "incident-report-01",
    title: "Maritime Incident Report",
    type: "incident",
    description: "Standard incident report template for maritime operations",
    content: `<h2>INCIDENT REPORT</h2>
<p><strong>Report Number:</strong> {{document_number}}</p>
<p><strong>Date of Incident:</strong> {{date}}</p>
<p><strong>Vessel Name:</strong> {{vessel_name}}</p>
<p><strong>Location:</strong> {{location}}</p>
<p><strong>Port:</strong> {{port}}</p>

<h3>1. INCIDENT SUMMARY</h3>
<p>{{incident_summary}}</p>

<h3>2. PARTIES INVOLVED</h3>
<p><strong>Reporting Officer:</strong> {{officer_name}}</p>
<p><strong>Witness(es):</strong> {{witnesses}}</p>

<h3>3. INCIDENT DETAILS</h3>
<p><strong>Type of Incident:</strong> {{incident_type}}</p>
<p><strong>Severity Level:</strong> {{severity_level}}</p>
<p><strong>Description:</strong></p>
<p>{{incident_description}}</p>

<h3>4. IMMEDIATE ACTIONS TAKEN</h3>
<p>{{immediate_actions}}</p>

<h3>5. ROOT CAUSE ANALYSIS</h3>
<p>{{root_cause}}</p>

<h3>6. CORRECTIVE ACTIONS</h3>
<p>{{corrective_actions}}</p>

<h3>7. PREVENTIVE MEASURES</h3>
<p>{{preventive_measures}}</p>

<h3>8. ATTACHMENTS</h3>
<p>Photos, diagrams, and supporting documentation attached.</p>

<p><strong>Report Prepared By:</strong> {{prepared_by}}</p>
<p><strong>Date:</strong> {{date}}</p>
<p><strong>Signature:</strong> _______________________</p>`,
    placeholders: [
      "{{document_number}}", "{{date}}", "{{vessel_name}}", "{{location}}", 
      "{{port}}", "{{incident_summary}}", "{{officer_name}}", "{{witnesses}}",
      "{{incident_type}}", "{{severity_level}}", "{{incident_description}}",
      "{{immediate_actions}}", "{{root_cause}}", "{{corrective_actions}}",
      "{{preventive_measures}}", "{{prepared_by}}"
    ],
    tags: ["maritime", "incident", "safety", "report"]
  },
  {
    id: "fmea-analysis-01",
    title: "FMEA Analysis Template",
    type: "fmea",
    description: "Failure Mode and Effects Analysis for equipment and processes",
    content: `<h2>FAILURE MODE AND EFFECTS ANALYSIS (FMEA)</h2>
<p><strong>Project/System:</strong> {{project_name}}</p>
<p><strong>Date:</strong> {{date}}</p>
<p><strong>Team Leader:</strong> {{team_leader}}</p>
<p><strong>Vessel/Location:</strong> {{vessel_name}}</p>

<h3>ANALYSIS SCOPE</h3>
<p>{{analysis_scope}}</p>

<h3>SYSTEM COMPONENTS</h3>
<p>{{system_components}}</p>

<h3>FMEA TABLE</h3>
<table>
  <tr>
    <th>Component</th>
    <th>Failure Mode</th>
    <th>Effect</th>
    <th>Severity</th>
    <th>Occurrence</th>
    <th>Detection</th>
    <th>RPN</th>
    <th>Actions</th>
  </tr>
  <tr>
    <td>{{component_1}}</td>
    <td>{{failure_mode_1}}</td>
    <td>{{effect_1}}</td>
    <td>{{severity_1}}</td>
    <td>{{occurrence_1}}</td>
    <td>{{detection_1}}</td>
    <td>{{rpn_1}}</td>
    <td>{{actions_1}}</td>
  </tr>
</table>

<h3>RISK PRIORITY NUMBERS (RPN) LEGEND</h3>
<ul>
  <li>RPN 1-50: Low Risk</li>
  <li>RPN 51-100: Medium Risk</li>
  <li>RPN 101-200: High Risk</li>
  <li>RPN > 200: Critical Risk</li>
</ul>

<h3>RECOMMENDED ACTIONS</h3>
<p>{{recommended_actions}}</p>

<p><strong>Prepared By:</strong> {{prepared_by}}</p>
<p><strong>Date:</strong> {{date}}</p>`,
    placeholders: [
      "{{project_name}}", "{{date}}", "{{team_leader}}", "{{vessel_name}}",
      "{{analysis_scope}}", "{{system_components}}", "{{component_1}}",
      "{{failure_mode_1}}", "{{effect_1}}", "{{severity_1}}", "{{occurrence_1}}",
      "{{detection_1}}", "{{rpn_1}}", "{{actions_1}}", "{{recommended_actions}}",
      "{{prepared_by}}"
    ],
    tags: ["fmea", "risk", "analysis", "safety"]
  },
  {
    id: "charter-contract-01",
    title: "Vessel Charter Contract",
    type: "contract",
    description: "Standard vessel charter party agreement",
    content: `<h2>VESSEL CHARTER PARTY AGREEMENT</h2>
<p><strong>Contract Number:</strong> {{document_number}}</p>
<p><strong>Date:</strong> {{date}}</p>

<h3>PARTIES</h3>
<p><strong>Charterer:</strong> {{client_name}}</p>
<p><strong>Address:</strong> {{client_address}}</p>
<p><strong>Email:</strong> {{email}}</p>
<p><strong>Phone:</strong> {{phone}}</p>

<p><strong>Owner:</strong> {{company_name}}</p>
<p><strong>Address:</strong> {{company_address}}</p>

<h3>VESSEL DETAILS</h3>
<p><strong>Vessel Name:</strong> {{vessel_name}}</p>
<p><strong>IMO Number:</strong> {{imo_number}}</p>
<p><strong>Flag:</strong> {{flag}}</p>
<p><strong>GRT:</strong> {{grt}}</p>
<p><strong>Type:</strong> {{vessel_type}}</p>

<h3>CHARTER TERMS</h3>
<p><strong>Charter Type:</strong> {{charter_type}}</p>
<p><strong>Period:</strong> {{charter_period}}</p>
<p><strong>Delivery Port:</strong> {{delivery_port}}</p>
<p><strong>Redelivery Port:</strong> {{redelivery_port}}</p>
<p><strong>Trading Area:</strong> {{trading_area}}</p>

<h3>FINANCIAL TERMS</h3>
<p><strong>Charter Rate:</strong> {{charter_rate}} per {{rate_period}}</p>
<p><strong>Payment Terms:</strong> {{payment_terms}}</p>
<p><strong>Currency:</strong> {{currency}}</p>

<h3>RESPONSIBILITIES</h3>
<p><strong>Owner's Obligations:</strong></p>
<p>{{owner_obligations}}</p>

<p><strong>Charterer's Obligations:</strong></p>
<p>{{charterer_obligations}}</p>

<h3>INSURANCE</h3>
<p>{{insurance_terms}}</p>

<h3>TERMINATION</h3>
<p>{{termination_terms}}</p>

<p><strong>Owner Signature:</strong> _______________________</p>
<p><strong>Charterer Signature:</strong> _______________________</p>
<p><strong>Date:</strong> {{date}}</p>`,
    placeholders: [
      "{{document_number}}", "{{date}}", "{{client_name}}", "{{client_address}}",
      "{{email}}", "{{phone}}", "{{company_name}}", "{{company_address}}",
      "{{vessel_name}}", "{{imo_number}}", "{{flag}}", "{{grt}}", "{{vessel_type}}",
      "{{charter_type}}", "{{charter_period}}", "{{delivery_port}}", "{{redelivery_port}}",
      "{{trading_area}}", "{{charter_rate}}", "{{rate_period}}", "{{payment_terms}}",
      "{{currency}}", "{{owner_obligations}}", "{{charterer_obligations}}",
      "{{insurance_terms}}", "{{termination_terms}}"
    ],
    tags: ["contract", "charter", "legal", "vessel"]
  },
  {
    id: "maintenance-report-01",
    title: "Vessel Maintenance Report",
    type: "document",
    description: "Comprehensive maintenance report for vessel systems",
    content: `<h2>VESSEL MAINTENANCE REPORT</h2>
<p><strong>Report Number:</strong> {{document_number}}</p>
<p><strong>Date:</strong> {{date}}</p>
<p><strong>Vessel:</strong> {{vessel_name}}</p>
<p><strong>Port/Location:</strong> {{port}}</p>

<h3>MAINTENANCE OVERVIEW</h3>
<p><strong>Maintenance Type:</strong> {{maintenance_type}}</p>
<p><strong>Scheduled/Unscheduled:</strong> {{maintenance_schedule}}</p>
<p><strong>Start Date:</strong> {{start_date}}</p>
<p><strong>Completion Date:</strong> {{completion_date}}</p>

<h3>SYSTEMS SERVICED</h3>
<p>{{systems_serviced}}</p>

<h3>WORK PERFORMED</h3>
<p>{{work_performed}}</p>

<h3>PARTS REPLACED</h3>
<table>
  <tr>
    <th>Part Name</th>
    <th>Part Number</th>
    <th>Quantity</th>
    <th>Serial Number</th>
  </tr>
  <tr>
    <td>{{part_name}}</td>
    <td>{{part_number}}</td>
    <td>{{quantity}}</td>
    <td>{{serial_number}}</td>
  </tr>
</table>

<h3>TEST RESULTS</h3>
<p>{{test_results}}</p>

<h3>NEXT SCHEDULED MAINTENANCE</h3>
<p><strong>Date:</strong> {{next_maintenance_date}}</p>
<p><strong>Items:</strong> {{next_maintenance_items}}</p>

<h3>RECOMMENDATIONS</h3>
<p>{{recommendations}}</p>

<p><strong>Technician:</strong> {{technician_name}}</p>
<p><strong>Supervisor:</strong> {{supervisor_name}}</p>
<p><strong>Date:</strong> {{date}}</p>`,
    placeholders: [
      "{{document_number}}", "{{date}}", "{{vessel_name}}", "{{port}}",
      "{{maintenance_type}}", "{{maintenance_schedule}}", "{{start_date}}",
      "{{completion_date}}", "{{systems_serviced}}", "{{work_performed}}",
      "{{part_name}}", "{{part_number}}", "{{quantity}}", "{{serial_number}}",
      "{{test_results}}", "{{next_maintenance_date}}", "{{next_maintenance_items}}",
      "{{recommendations}}", "{{technician_name}}", "{{supervisor_name}}"
    ],
    tags: ["maintenance", "vessel", "technical", "report"]
  },
  {
    id: "safety-briefing-01",
    title: "Safety Briefing Document",
    type: "document",
    description: "Pre-operation safety briefing template",
    content: `<h2>SAFETY BRIEFING</h2>
<p><strong>Date:</strong> {{date}}</p>
<p><strong>Vessel:</strong> {{vessel_name}}</p>
<p><strong>Operation:</strong> {{operation_name}}</p>
<p><strong>Location:</strong> {{location}}</p>

<h3>BRIEFING ATTENDEES</h3>
<p>{{attendees}}</p>

<h3>OPERATION OVERVIEW</h3>
<p>{{operation_overview}}</p>

<h3>IDENTIFIED HAZARDS</h3>
<ol>
  <li>{{hazard_1}}</li>
  <li>{{hazard_2}}</li>
  <li>{{hazard_3}}</li>
</ol>

<h3>CONTROL MEASURES</h3>
<p>{{control_measures}}</p>

<h3>PERSONAL PROTECTIVE EQUIPMENT (PPE)</h3>
<p>Required PPE for this operation:</p>
<ul>
  <li>{{ppe_item_1}}</li>
  <li>{{ppe_item_2}}</li>
  <li>{{ppe_item_3}}</li>
</ul>

<h3>EMERGENCY PROCEDURES</h3>
<p>{{emergency_procedures}}</p>

<h3>COMMUNICATION PLAN</h3>
<p><strong>Primary Channel:</strong> {{primary_channel}}</p>
<p><strong>Emergency Contact:</strong> {{emergency_contact}}</p>

<h3>WEATHER CONDITIONS</h3>
<p><strong>Wind:</strong> {{wind_conditions}}</p>
<p><strong>Sea State:</strong> {{sea_state}}</p>
<p><strong>Visibility:</strong> {{visibility}}</p>

<h3>QUESTIONS & CLARIFICATIONS</h3>
<p>All personnel confirmed understanding of safety procedures.</p>

<p><strong>Briefing Officer:</strong> {{officer_name}}</p>
<p><strong>Date/Time:</strong> {{date}}</p>`,
    placeholders: [
      "{{date}}", "{{vessel_name}}", "{{operation_name}}", "{{location}}",
      "{{attendees}}", "{{operation_overview}}", "{{hazard_1}}", "{{hazard_2}}",
      "{{hazard_3}}", "{{control_measures}}", "{{ppe_item_1}}", "{{ppe_item_2}}",
      "{{ppe_item_3}}", "{{emergency_procedures}}", "{{primary_channel}}",
      "{{emergency_contact}}", "{{wind_conditions}}", "{{sea_state}}",
      "{{visibility}}", "{{officer_name}}"
    ],
    tags: ["safety", "briefing", "procedures", "maritime"]
  },
  {
    id: "inspection-checklist-01",
    title: "Vessel Inspection Checklist",
    type: "report",
    description: "Comprehensive vessel inspection checklist",
    content: `<h2>VESSEL INSPECTION CHECKLIST</h2>
<p><strong>Inspection Number:</strong> {{document_number}}</p>
<p><strong>Date:</strong> {{date}}</p>
<p><strong>Vessel:</strong> {{vessel_name}}</p>
<p><strong>Inspector:</strong> {{inspector_name}}</p>

<h3>GENERAL CONDITION</h3>
<p>Overall vessel condition: {{overall_condition}}</p>

<h3>HULL AND STRUCTURE</h3>
<ul>
  <li>☐ Hull integrity: {{hull_status}}</li>
  <li>☐ Paint condition: {{paint_status}}</li>
  <li>☐ Corrosion: {{corrosion_status}}</li>
</ul>

<h3>MACHINERY</h3>
<ul>
  <li>☐ Main engine: {{main_engine_status}}</li>
  <li>☐ Auxiliary engines: {{aux_engine_status}}</li>
  <li>☐ Pumps: {{pumps_status}}</li>
  <li>☐ Steering: {{steering_status}}</li>
</ul>

<h3>SAFETY EQUIPMENT</h3>
<ul>
  <li>☐ Life rafts: {{liferafts_status}}</li>
  <li>☐ Lifejackets: {{lifejackets_status}}</li>
  <li>☐ Fire extinguishers: {{fire_extinguishers_status}}</li>
  <li>☐ EPIRB: {{epirb_status}}</li>
</ul>

<h3>NAVIGATION EQUIPMENT</h3>
<ul>
  <li>☐ GPS: {{gps_status}}</li>
  <li>☐ Radar: {{radar_status}}</li>
  <li>☐ Radio: {{radio_status}}</li>
  <li>☐ Charts: {{charts_status}}</li>
</ul>

<h3>DEFICIENCIES IDENTIFIED</h3>
<p>{{deficiencies}}</p>

<h3>CORRECTIVE ACTIONS REQUIRED</h3>
<p>{{corrective_actions}}</p>

<h3>NEXT INSPECTION DUE</h3>
<p>{{next_inspection_date}}</p>

<p><strong>Inspector Signature:</strong> _______________________</p>
<p><strong>Captain Signature:</strong> _______________________</p>
<p><strong>Date:</strong> {{date}}</p>`,
    placeholders: [
      "{{document_number}}", "{{date}}", "{{vessel_name}}", "{{inspector_name}}",
      "{{overall_condition}}", "{{hull_status}}", "{{paint_status}}", "{{corrosion_status}}",
      "{{main_engine_status}}", "{{aux_engine_status}}", "{{pumps_status}}", "{{steering_status}}",
      "{{liferafts_status}}", "{{lifejackets_status}}", "{{fire_extinguishers_status}}",
      "{{epirb_status}}", "{{gps_status}}", "{{radar_status}}", "{{radio_status}}",
      "{{charts_status}}", "{{deficiencies}}", "{{corrective_actions}}", "{{next_inspection_date}}"
    ],
    tags: ["inspection", "checklist", "compliance", "vessel"]
  }
];

export function getTemplatesByType(type: TemplateDefinition["type"]): TemplateDefinition[] {
  return TEMPLATE_LIBRARY.filter(t => t.type === type);
}

export function getTemplateById(id: string): TemplateDefinition | undefined {
  return TEMPLATE_LIBRARY.find(t => t.id === id);
}

export function getAllTypes(): TemplateDefinition["type"][] {
  return ["document", "incident", "fmea", "contract", "report"];
}
