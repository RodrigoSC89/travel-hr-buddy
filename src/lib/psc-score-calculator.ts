/**
 * PSC Score Calculator
 * Calculates compliance scores and risk assessments for PSC inspections
 */

import { PrePSCChecklistItem } from "@/services/pre-psc.service";

export interface ScoreBreakdown {
  category: string;
  totalItems: number;
  compliantItems: number;
  nonCompliantItems: number;
  notApplicableItems: number;
  score: number;
}

export interface RiskAssessment {
  overallRisk: "low" | "medium" | "high" | "critical";
  criticalFindings: number;
  highPriorityFindings: number;
  recommendations: string[];
}

export interface InspectionScore {
  overallScore: number;
  conformityPercentage: number;
  scoreBreakdown: ScoreBreakdown[];
  riskAssessment: RiskAssessment;
  flaggedItems: number;
}

/**
 * PSC Categories based on IMO guidelines
 */
export const PSC_CATEGORIES = [
  "Certificates & Documentation",
  "Fire Safety",
  "Life Saving Appliances",
  "Main Machinery",
  "MARPOL",
  "Navigation",
  "Radio Communications",
  "Structure & Loadline",
  "Accommodation",
  "Security (ISPS/SSP)",
  "ISM Code",
  "MLC 2006",
] as const;

export type PSCCategory = typeof PSC_CATEGORIES[number];

/**
 * Calculate overall inspection score
 */
export function calculateOverallScore(items: PrePSCChecklistItem[]): number {
  if (items.length === 0) return 0;

  const applicableItems = items.filter(
    item => item.status !== "not_applicable" && item.status !== "pending"
  );

  if (applicableItems.length === 0) return 0;

  const compliantItems = applicableItems.filter(
    item => item.status === "compliant" || item.conformity === true
  );

  return Math.round((compliantItems.length / applicableItems.length) * 100);
}

/**
 * Calculate score breakdown by category
 */
export function calculateScoreBreakdown(items: PrePSCChecklistItem[]): ScoreBreakdown[] {
  const categories = new Set(items.map(item => item.category));
  
  return Array.from(categories).map(category => {
    const categoryItems = items.filter(item => item.category === category);
    const applicableItems = categoryItems.filter(
      item => item.status !== "not_applicable" && item.status !== "pending"
    );
    
    const compliantItems = applicableItems.filter(
      item => item.status === "compliant" || item.conformity === true
    ).length;

    const nonCompliantItems = applicableItems.filter(
      item => item.status === "non_compliant" || item.conformity === false
    ).length;

    const notApplicableItems = categoryItems.filter(
      item => item.status === "not_applicable"
    ).length;

    const score = applicableItems.length > 0
      ? Math.round((compliantItems / applicableItems.length) * 100)
      : 0;

    return {
      category,
      totalItems: categoryItems.length,
      compliantItems,
      nonCompliantItems,
      notApplicableItems,
      score,
    };
  }).sort((a, b) => a.category.localeCompare(b.category));
}

/**
 * Assess risk level based on findings
 */
export function assessRisk(items: PrePSCChecklistItem[]): RiskAssessment {
  const criticalFindings = items.filter(
    item => item.action_priority === "critical" && item.status === "non_compliant"
  ).length;

  const highPriorityFindings = items.filter(
    item => item.action_priority === "high" && item.status === "non_compliant"
  ).length;

  let overallRisk: "low" | "medium" | "high" | "critical" = "low";
  const recommendations: string[] = [];

  if (criticalFindings > 0) {
    overallRisk = "critical";
    recommendations.push(
      `${criticalFindings} critical finding(s) detected. Immediate action required before PSC inspection.`
    );
  } else if (highPriorityFindings >= 3) {
    overallRisk = "high";
    recommendations.push(
      `${highPriorityFindings} high-priority findings detected. Address before PSC inspection.`
    );
  } else if (highPriorityFindings > 0) {
    overallRisk = "medium";
    recommendations.push(
      `${highPriorityFindings} high-priority finding(s) detected. Plan corrective actions.`
    );
  } else {
    recommendations.push("No critical findings detected. Vessel appears ready for PSC inspection.");
  }

  // Add category-specific recommendations
  const scoreBreakdown = calculateScoreBreakdown(items);
  scoreBreakdown.forEach(breakdown => {
    if (breakdown.score < 80 && breakdown.score > 0) {
      recommendations.push(
        `${breakdown.category}: Score ${breakdown.score}% - Review and improve compliance in this area.`
      );
    }
  });

  return {
    overallRisk,
    criticalFindings,
    highPriorityFindings,
    recommendations,
  };
}

/**
 * Calculate complete inspection score with all metrics
 */
export function calculateInspectionScore(items: PrePSCChecklistItem[]): InspectionScore {
  const overallScore = calculateOverallScore(items);
  const scoreBreakdown = calculateScoreBreakdown(items);
  const riskAssessment = assessRisk(items);
  
  const flaggedItems = items.filter(
    item => item.status === "non_compliant" || item.conformity === false
  ).length;

  return {
    overallScore,
    conformityPercentage: overallScore,
    scoreBreakdown,
    riskAssessment,
    flaggedItems,
  };
}

/**
 * Get default checklist template
 */
export function getDefaultChecklistTemplate(): Partial<PrePSCChecklistItem>[] {
  return [
    // Certificates & Documentation
    {
      category: "Certificates & Documentation",
      question: "Is the Certificate of Registry valid and onboard?",
      reference_regulation: "SOLAS Chapter I, Reg. 12",
      status: "pending",
    },
    {
      category: "Certificates & Documentation",
      question: "Is the International Tonnage Certificate (1969) valid?",
      reference_regulation: "Tonnage Convention 1969",
      status: "pending",
    },
    {
      category: "Certificates & Documentation",
      question: "Is the International Load Line Certificate valid?",
      reference_regulation: "Load Line Convention 1966",
      status: "pending",
    },
    
    // Fire Safety
    {
      category: "Fire Safety",
      question: "Are fire extinguishers serviced and marked correctly?",
      reference_regulation: "SOLAS Chapter II-2",
      status: "pending",
    },
    {
      category: "Fire Safety",
      question: "Are fire doors and fire dampers in good condition?",
      reference_regulation: "SOLAS Chapter II-2",
      status: "pending",
    },
    {
      category: "Fire Safety",
      question: "Is the fixed fire detection and alarm system operational?",
      reference_regulation: "SOLAS Chapter II-2",
      status: "pending",
    },
    
    // Life Saving Appliances
    {
      category: "Life Saving Appliances",
      question: "Are lifeboats and davits in good condition and operational?",
      reference_regulation: "SOLAS Chapter III",
      status: "pending",
    },
    {
      category: "Life Saving Appliances",
      question: "Are liferafts within certification date?",
      reference_regulation: "SOLAS Chapter III",
      status: "pending",
    },
    {
      category: "Life Saving Appliances",
      question: "Are life jackets adequate in number and properly stored?",
      reference_regulation: "SOLAS Chapter III",
      status: "pending",
    },
    
    // Navigation
    {
      category: "Navigation",
      question: "Are all navigation lights operational?",
      reference_regulation: "COLREG 1972",
      status: "pending",
    },
    {
      category: "Navigation",
      question: "Are nautical charts and publications up to date?",
      reference_regulation: "SOLAS Chapter V",
      status: "pending",
    },
    {
      category: "Navigation",
      question: "Are radar and ECDIS (if applicable) functioning properly?",
      reference_regulation: "SOLAS Chapter V",
      status: "pending",
    },
    
    // MARPOL
    {
      category: "MARPOL",
      question: "Is the Oil Record Book properly maintained?",
      reference_regulation: "MARPOL Annex I",
      status: "pending",
    },
    {
      category: "MARPOL",
      question: "Are oily water separator and oil discharge monitoring equipment operational?",
      reference_regulation: "MARPOL Annex I",
      status: "pending",
    },
    {
      category: "MARPOL",
      question: "Is the Garbage Record Book properly maintained?",
      reference_regulation: "MARPOL Annex V",
      status: "pending",
    },
    
    // ISM Code
    {
      category: "ISM Code",
      question: "Is the Safety Management Certificate (SMC) valid?",
      reference_regulation: "ISM Code",
      status: "pending",
    },
    {
      category: "ISM Code",
      question: "Are crew familiar with safety and environmental procedures?",
      reference_regulation: "ISM Code",
      status: "pending",
    },
    {
      category: "ISM Code",
      question: "Is the Document of Compliance (DOC) valid and available?",
      reference_regulation: "ISM Code",
      status: "pending",
    },
    
    // Radio Communications
    {
      category: "Radio Communications",
      question: "Is the GMDSS equipment tested and operational?",
      reference_regulation: "SOLAS Chapter IV",
      status: "pending",
    },
    {
      category: "Radio Communications",
      question: "Are EPIRB and SART within certification dates?",
      reference_regulation: "SOLAS Chapter IV",
      status: "pending",
    },
    
    // MLC 2006
    {
      category: "MLC 2006",
      question: "Are crew accommodations in good condition and compliant?",
      reference_regulation: "MLC 2006",
      status: "pending",
    },
    {
      category: "MLC 2006",
      question: "Are crew employment agreements properly documented?",
      reference_regulation: "MLC 2006",
      status: "pending",
    },
    {
      category: "MLC 2006",
      question: "Is the Maritime Labour Certificate valid and displayed?",
      reference_regulation: "MLC 2006",
      status: "pending",
    },
  ];
}
