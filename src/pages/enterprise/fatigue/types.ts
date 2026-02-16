export interface CrewMember {
  id: string;
  name: string;
  rank: string;
  department: string;
  avatar?: string;
  fatigueScore: number;
  workHoursToday: number;
  workHoursWeek: number;
  restHoursLast24h: number;
  lastBreak: string;
  mlcCompliant: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  predictions: {
    nextHighRisk: string;
    recommendation: string;
  };
}

export interface MLCViolation {
  id: string;
  crewId: string;
  crewName: string;
  type: string;
  description: string;
  date: string;
  severity: 'warning' | 'violation';
}

export const CREW_DATA: CrewMember[] = [
  {
    id: '1', name: 'Carlos Silva', rank: 'Capitão', department: 'Ponte',
    fatigueScore: 25, workHoursToday: 6, workHoursWeek: 42, restHoursLast24h: 10,
    lastBreak: '2h atrás', mlcCompliant: true, riskLevel: 'low',
    predictions: { nextHighRisk: 'Sexta-feira, 18:00', recommendation: 'Manter rotina atual' },
  },
  {
    id: '2', name: 'Roberto Santos', rank: '1º Oficial', department: 'Ponte',
    fatigueScore: 65, workHoursToday: 10, workHoursWeek: 56, restHoursLast24h: 6,
    lastBreak: '5h atrás', mlcCompliant: false, riskLevel: 'high',
    predictions: { nextHighRisk: 'Hoje, 22:00', recommendation: 'Intervalo imediato recomendado' },
  },
  {
    id: '3', name: 'Ana Costa', rank: '2º Oficial', department: 'Ponte',
    fatigueScore: 45, workHoursToday: 8, workHoursWeek: 48, restHoursLast24h: 8,
    lastBreak: '3h atrás', mlcCompliant: true, riskLevel: 'medium',
    predictions: { nextHighRisk: 'Quinta-feira, 14:00', recommendation: 'Programar descanso adicional' },
  },
  {
    id: '4', name: 'João Oliveira', rank: 'Chefe de Máquinas', department: 'Máquinas',
    fatigueScore: 85, workHoursToday: 12, workHoursWeek: 68, restHoursLast24h: 4,
    lastBreak: '8h atrás', mlcCompliant: false, riskLevel: 'critical',
    predictions: { nextHighRisk: 'AGORA', recommendation: 'DESCANSO OBRIGATÓRIO' },
  },
];

export const MLC_VIOLATIONS: MLCViolation[] = [
  { id: '1', crewId: '2', crewName: 'Roberto Santos', type: 'Horas de Trabalho', description: 'Excedeu 14 horas em período de 24h', date: 'Hoje, 10:00', severity: 'violation' },
  { id: '2', crewId: '4', crewName: 'João Oliveira', type: 'Descanso Mínimo', description: 'Menos de 6 horas de descanso contínuo', date: 'Ontem, 22:00', severity: 'violation' },
  { id: '3', crewId: '4', crewName: 'João Oliveira', type: 'Horas Semanais', description: 'Aproximando-se do limite de 72h semanais', date: 'Hoje, 08:00', severity: 'warning' },
];

export const getRiskColor = (level: CrewMember['riskLevel']) => {
  switch (level) {
    case 'low': return 'bg-success';
    case 'medium': return 'bg-warning';
    case 'high': return 'bg-warning';
    case 'critical': return 'bg-destructive';
  }
};

export const getRiskBadgeColor = (level: CrewMember['riskLevel']) => {
  switch (level) {
    case 'low': return 'bg-success/10 text-success border-success/20';
    case 'medium': return 'bg-warning/10 text-warning border-warning/20';
    case 'high': return 'bg-warning/10 text-warning border-warning/20';
    case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
  }
};
