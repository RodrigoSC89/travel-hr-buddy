/**
 * PATCH 600 - Risk Operations Types
 */

export type ModuleType = 'PSC' | 'MLC' | 'LSA_FFA' | 'OVID' | 'DRILL' | 'GENERAL';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface RiskAssessment {
  id: string;
  vesselId: string;
  moduleType: ModuleType;
  riskLevel: RiskLevel;
  riskScore: number;
  riskTitle: string;
  riskDescription: string;
  status: 'active' | 'mitigating' | 'resolved' | 'accepted';
}

export interface RiskAlert {
  id: string;
  vesselId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  acknowledged: boolean;
  resolved: boolean;
}
