/**
 * ISM Audit Intelligence Module - Automated Checklist
 * PATCH 633
 * Based on IMO Resolution A.1070(28) and ISM Code
 */

import { ISMChecklistItem, ISMSection } from "./types";

/**
 * Comprehensive ISM Code Checklist
 * Each item maps to specific ISM Code requirements
 */
export const ISM_CHECKLIST_ITEMS: ISMChecklistItem[] = [
  // Section 2.0 - Safety and Environmental Protection Policy
  {
    id: "ism-2.1",
    section: "safety_policy",
    requirement: "Safety and environmental protection policy defined",
    description: "Company has established a safety and environmental protection policy which describes how objectives will be achieved",
    imo_reference: "ISM Code 2.1",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 1
  },
  {
    id: "ism-2.2",
    section: "safety_policy",
    requirement: "Policy implementation and maintenance",
    description: "Company ensures that the policy is implemented and maintained at all levels of organization",
    imo_reference: "ISM Code 2.2",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 2
  },

  // Section 3.0 - Company Responsibilities and Authority
  {
    id: "ism-3.1",
    section: "company_responsibility",
    requirement: "Resources and shore-based support provided",
    description: "Company has provided necessary resources and shore-based support to the designated person(s)",
    imo_reference: "ISM Code 3.1",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 3
  },
  {
    id: "ism-3.2",
    section: "company_responsibility",
    requirement: "SMS established and implemented",
    description: "Safety management system (SMS) has been established, implemented and maintained",
    imo_reference: "ISM Code 3.2",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 4
  },

  // Section 4.0 - Designated Person(s)
  {
    id: "ism-4.1",
    section: "designated_person",
    requirement: "Designated person(s) appointed",
    description: "Company has designated person(s) ashore with direct access to highest management",
    imo_reference: "ISM Code 4.1",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 5
  },
  {
    id: "ism-4.2",
    section: "designated_person",
    requirement: "Monitoring safety and pollution prevention",
    description: "Designated person monitors the safety and pollution-prevention aspects of the operation",
    imo_reference: "ISM Code 4.2",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 6
  },

  // Section 5.0 - Master's Responsibility and Authority
  {
    id: "ism-5.1",
    section: "master_responsibility",
    requirement: "Master's overriding authority defined",
    description: "Company has defined and documented the Master's responsibility with regard to SMS implementation",
    imo_reference: "ISM Code 5.1",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 7
  },
  {
    id: "ism-5.2",
    section: "master_responsibility",
    requirement: "Master's authority to make decisions",
    description: "Company ensures that the SMS operating in the ship contains clear statement emphasizing the Master's authority",
    imo_reference: "ISM Code 5.2",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 8
  },

  // Section 6.0 - Resources and Personnel
  {
    id: "ism-6.1",
    section: "resources_personnel",
    requirement: "Properly qualified and certified personnel",
    description: "Company ensures that the Master is properly qualified, fully conversant with SMS and given necessary support",
    imo_reference: "ISM Code 6.1",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 9
  },
  {
    id: "ism-6.2",
    section: "resources_personnel",
    requirement: "Personnel familiar with SMS",
    description: "Company ensures that each ship is manned with qualified, certificated and medically fit seafarers",
    imo_reference: "ISM Code 6.2",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 10
  },
  {
    id: "ism-6.3",
    section: "resources_personnel",
    requirement: "Training and familiarization",
    description: "Company has established procedures to ensure new personnel and personnel transferred receive proper familiarization",
    imo_reference: "ISM Code 6.3",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 11
  },

  // Section 7.0 - Shipboard Operations
  {
    id: "ism-7.1",
    section: "ship_operations",
    requirement: "Procedures for key shipboard operations",
    description: "Company has established procedures for the preparation of plans and instructions for key shipboard operations",
    imo_reference: "ISM Code 7.1",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 12
  },
  {
    id: "ism-7.2",
    section: "ship_operations",
    requirement: "Operational requirements identified",
    description: "Company has identified shipboard operations which may pose risk to personnel, ship or environment",
    imo_reference: "ISM Code 7.2",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 13
  },

  // Section 8.0 - Emergency Preparedness
  {
    id: "ism-8.1",
    section: "emergency_preparedness",
    requirement: "Emergency procedures established",
    description: "Company has established procedures to identify, describe and respond to potential emergency shipboard situations",
    imo_reference: "ISM Code 8.1",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 14
  },
  {
    id: "ism-8.2",
    section: "emergency_preparedness",
    requirement: "Drills and exercises program",
    description: "Company has established programs for drills and exercises to prepare for emergency actions",
    imo_reference: "ISM Code 8.2",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 15
  },

  // Section 9.0 - Reports and Analysis of Non-conformities
  {
    id: "ism-9.1",
    section: "incident_reporting",
    requirement: "Reporting procedures",
    description: "SMS includes procedures ensuring that non-conformities, accidents and hazardous situations are reported",
    imo_reference: "ISM Code 9.1",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 16
  },
  {
    id: "ism-9.2",
    section: "incident_reporting",
    requirement: "Analysis and corrective actions",
    description: "Company has established procedures for implementing corrective action",
    imo_reference: "ISM Code 9.2",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 17
  },

  // Section 10.0 - Maintenance of Ship and Equipment
  {
    id: "ism-10.1",
    section: "maintenance",
    requirement: "Maintenance procedures established",
    description: "Company has established procedures to ensure that the ship is maintained in conformity with regulations",
    imo_reference: "ISM Code 10.1",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 18
  },
  {
    id: "ism-10.2",
    section: "maintenance",
    requirement: "Planned maintenance system",
    description: "Company ensures that inspections are held at appropriate intervals",
    imo_reference: "ISM Code 10.2",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 19
  },
  {
    id: "ism-10.3",
    section: "maintenance",
    requirement: "Critical equipment identification",
    description: "Company has identified equipment and technical systems whose sudden operational failure may result in hazardous situations",
    imo_reference: "ISM Code 10.3",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 20
  },

  // Section 11.0 - Documentation
  {
    id: "ism-11.1",
    section: "documentation",
    requirement: "Safety management manual",
    description: "Company has established and maintains a Safety Management Manual",
    imo_reference: "ISM Code 11.1",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 21
  },
  {
    id: "ism-11.2",
    section: "documentation",
    requirement: "Documents and data control",
    description: "Company has established procedures for controlling all documents and data relevant to SMS",
    imo_reference: "ISM Code 11.2",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 22
  },

  // Section 12.0 - Company Verification, Review and Evaluation
  {
    id: "ism-12.1",
    section: "company_verification",
    requirement: "Internal audit procedures",
    description: "Company has established procedures for internal audits and management reviews",
    imo_reference: "ISM Code 12.1",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 23
  },
  {
    id: "ism-12.2",
    section: "company_verification",
    requirement: "Personnel competence for audits",
    description: "Company ensures that audits are carried out by trained personnel",
    imo_reference: "ISM Code 12.2",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 24
  },
  {
    id: "ism-12.3",
    section: "company_verification",
    requirement: "Management review",
    description: "Management of the Company periodically evaluates SMS effectiveness",
    imo_reference: "ISM Code 12.3",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 25
  },

  // Section 13.0 - Certification and Verification
  {
    id: "ism-13.1",
    section: "certification",
    requirement: "DOC (Document of Compliance) valid",
    description: "Company holds valid Document of Compliance issued by Administration",
    imo_reference: "ISM Code 13.1",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 26
  },
  {
    id: "ism-13.2",
    section: "certification",
    requirement: "SMC (Safety Management Certificate) valid",
    description: "Ship holds valid Safety Management Certificate issued by Administration or recognized organization",
    imo_reference: "ISM Code 13.2",
    compliance_status: "not_verified",
    evidence_required: true,
    order: 27
  }
];

/**
 * Get checklist items by section
 */
export function getChecklistBySection(section: ISMSection): ISMChecklistItem[] {
  return ISM_CHECKLIST_ITEMS.filter(item => item.section === section);
}

/**
 * Calculate section score based on checklist responses
 */
export function calculateSectionScore(items: ISMChecklistItem[]): number {
  if (items.length === 0) return 0;

  const weights = {
    compliant: 100,
    observation: 75,
    non_conformity: 25,
    major_non_conformity: 0,
    not_verified: 0
  };

  const totalScore = items.reduce((sum, item) => sum + weights[item.compliance_status], 0);
  return Math.round(totalScore / items.length);
}

/**
 * Calculate overall audit score
 */
export function calculateOverallScore(sectionScores: Record<ISMSection, number>): number {
  const scores = Object.values(sectionScores);
  if (scores.length === 0) return 0;
  
  const total = scores.reduce((sum, score) => sum + score, 0);
  return Math.round(total / scores.length);
}

/**
 * Get compliance level description
 */
export function getComplianceLevel(score: number): {
  level: string;
  color: string;
  description: string;
} {
  if (score >= 90) {
    return {
      level: "Excellent",
      color: "green",
      description: "Full compliance with ISM Code requirements"
    };
  } else if (score >= 75) {
    return {
      level: "Good",
      color: "blue",
      description: "Minor observations, generally compliant"
    };
  } else if (score >= 60) {
    return {
      level: "Acceptable",
      color: "yellow",
      description: "Some non-conformities requiring attention"
    };
  } else {
    return {
      level: "Poor",
      color: "red",
      description: "Major non-conformities requiring immediate action"
    };
  }
}
