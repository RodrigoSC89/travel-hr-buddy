/**
 * PATCH 599 - Smart Drills Types
 */

export type DrillType = 'FIRE' | 'ABANDON_SHIP' | 'MAN_OVERBOARD' | 'COLLISION' | 'POLLUTION' | 'MEDICAL' | 'SECURITY' | 'GENERAL';

export interface DrillScenario {
  id: string;
  title: string;
  type: DrillType;
  difficulty: 'basic' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  durationMinutes: number;
  expectedResponses: any[];
  evaluationCriteria: any[];
}

export interface DrillExecution {
  id: string;
  scenarioId: string;
  vesselId: string;
  executionDate: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  participants: string[];
}
