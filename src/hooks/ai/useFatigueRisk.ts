/**
 * useFatigueRisk Hook
 * React interface for Fatigue Risk AI Engine
 */
import { useState, useCallback } from 'react';
import { 
  fatigueRiskEngine,
  type WorkRestRecord,
  type FatigueAssessment,
  type CrewFatigueReport,
  type FatigueAlert
} from '@/lib/ai/engines/fatigue-risk-ai';

export interface UseFatigueRiskReturn {
  isAssessing: boolean;
  assessment: FatigueAssessment | null;
  report: CrewFatigueReport | null;
  assessFatigue: (crewMemberId: string, crewMemberName: string, records: WorkRestRecord[]) => FatigueAssessment;
  generateCrewReport: (vesselId: string, vesselName: string, crewMembers: { id: string; name: string }[], records: WorkRestRecord[]) => CrewFatigueReport;
  getHighRiskCrew: () => string[];
}

export function useFatigueRisk(): UseFatigueRiskReturn {
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessment, setAssessment] = useState<FatigueAssessment | null>(null);
  const [report, setReport] = useState<CrewFatigueReport | null>(null);

  const assessFatigue = useCallback((
    crewMemberId: string, 
    crewMemberName: string, 
    records: WorkRestRecord[]
  ): FatigueAssessment => {
    setIsAssessing(true);
    try {
      const result = fatigueRiskEngine.assessFatigue(crewMemberId, crewMemberName, records);
      setAssessment(result);
      return result;
    } finally {
      setIsAssessing(false);
    }
  }, []);

  const generateCrewReport = useCallback((
    vesselId: string,
    vesselName: string,
    crewMembers: { id: string; name: string }[],
    records: WorkRestRecord[]
  ): CrewFatigueReport => {
    setIsAssessing(true);
    try {
      const crewReport = fatigueRiskEngine.generateCrewReport(vesselId, vesselName, crewMembers, records);
      setReport(crewReport);
      return crewReport;
    } finally {
      setIsAssessing(false);
    }
  }, []);

  const getHighRiskCrew = useCallback((): string[] => {
    return report?.high_risk_crew || [];
  }, [report]);

  return {
    isAssessing,
    assessment,
    report,
    assessFatigue,
    generateCrewReport,
    getHighRiskCrew
  };
}
