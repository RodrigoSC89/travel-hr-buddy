/**
 * 🏢 useEnterpriseModules Hook
 * Unified access to all 11 enterprise modules
 */

import { useMemo } from 'react';
import {
  VoyageLogisticsEngine,
  voyageLogistics,
} from '@/lib/enterprise/voyage-logistics-types';
import {
  ComplianceRegulatoryEngine,
  complianceRegulatory,
} from '@/lib/enterprise/compliance-regulatory-types';
import {
  SafetyIncidentEngine,
  safetyIncident,
} from '@/lib/enterprise/safety-incident-types';
import {
  InventorySparesEngine,
  inventorySpares,
} from '@/lib/enterprise/inventory-spares-types';
import {
  EnvironmentalEngine,
  environmental,
} from '@/lib/enterprise/environmental-types';
import {
  QualityManagementEngine,
  qualityManagement,
} from '@/lib/enterprise/quality-management-types';
import {
  ContractLegalEngine,
  contractLegal,
} from '@/lib/enterprise/contract-legal-types';
import {
  InsuranceClaimsEngine,
  insuranceClaims,
} from '@/lib/enterprise/insurance-claims-types';
import {
  CrewingPayrollEngine,
  crewingPayroll,
} from '@/lib/enterprise/crewing-payroll-types';
import {
  ReportingAnalyticsEngine,
  reportingAnalytics,
} from '@/lib/enterprise/reporting-analytics-types';
import {
  MobileAppsEngine,
  mobileApps,
} from '@/lib/enterprise/mobile-apps-types';

export interface EnterpriseModules {
  voyageLogistics: VoyageLogisticsEngine;
  complianceRegulatory: ComplianceRegulatoryEngine;
  safetyIncident: SafetyIncidentEngine;
  inventorySpares: InventorySparesEngine;
  environmental: EnvironmentalEngine;
  qualityManagement: QualityManagementEngine;
  contractLegal: ContractLegalEngine;
  insuranceClaims: InsuranceClaimsEngine;
  crewingPayroll: CrewingPayrollEngine;
  reportingAnalytics: ReportingAnalyticsEngine;
  mobileApps: MobileAppsEngine;
}

export function useEnterpriseModules(): EnterpriseModules {
  return useMemo(() => ({
    voyageLogistics,
    complianceRegulatory,
    safetyIncident,
    inventorySpares,
    environmental,
    qualityManagement,
    contractLegal,
    insuranceClaims,
    crewingPayroll,
    reportingAnalytics,
    mobileApps,
  }), []);
}

// Individual module hooks for more granular usage
export function useVoyageLogistics() {
  return useMemo(() => voyageLogistics, []);
}

export function useComplianceRegulatory() {
  return useMemo(() => complianceRegulatory, []);
}

export function useSafetyIncident() {
  return useMemo(() => safetyIncident, []);
}

export function useInventorySpares() {
  return useMemo(() => inventorySpares, []);
}

export function useEnvironmental() {
  return useMemo(() => environmental, []);
}

export function useQualityManagement() {
  return useMemo(() => qualityManagement, []);
}

export function useContractLegal() {
  return useMemo(() => contractLegal, []);
}

export function useInsuranceClaims() {
  return useMemo(() => insuranceClaims, []);
}

export function useCrewingPayroll() {
  return useMemo(() => crewingPayroll, []);
}

export function useReportingAnalytics() {
  return useMemo(() => reportingAnalytics, []);
}

export function useMobileApps() {
  return useMemo(() => mobileApps, []);
}
