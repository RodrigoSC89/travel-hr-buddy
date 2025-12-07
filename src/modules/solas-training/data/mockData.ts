import { Drill, CrewMember, Certification, TrainingAlert, DrillExecution } from '../types';

export const mockDrills: Drill[] = [
  { 
    id: "1", 
    name: "Exercício de Incêndio", 
    type: "fire", 
    frequency: "monthly",
    frequencyLabel: "Mensal", 
    lastExecution: "2024-01-10", 
    nextDue: "2024-02-10", 
    status: "completed", 
    participants: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    totalCrew: 24,
    duration: 45,
    reportGenerated: true
  },
  { 
    id: "2", 
    name: "Abandono de Embarcação", 
    type: "abandon", 
    frequency: "monthly",
    frequencyLabel: "Mensal", 
    lastExecution: "2024-01-05", 
    nextDue: "2024-02-05", 
    status: "completed", 
    participants: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"],
    totalCrew: 24,
    duration: 60,
    reportGenerated: true
  },
  { 
    id: "3", 
    name: "Homem ao Mar (MOB)", 
    type: "mob", 
    frequency: "quarterly",
    frequencyLabel: "Trimestral", 
    lastExecution: "2023-11-15", 
    nextDue: "2024-02-15", 
    status: "due", 
    participants: [],
    totalCrew: 24,
    scheduledDate: "2024-02-15T10:00:00"
  },
  { 
    id: "4", 
    name: "Blackout Recovery", 
    type: "blackout", 
    frequency: "semi-annual",
    frequencyLabel: "Semestral", 
    lastExecution: "2023-08-20", 
    nextDue: "2024-02-20", 
    status: "due", 
    participants: [],
    totalCrew: 24
  },
  { 
    id: "5", 
    name: "Combate à Poluição", 
    type: "pollution", 
    frequency: "quarterly",
    frequencyLabel: "Trimestral", 
    lastExecution: "2023-10-01", 
    nextDue: "2024-01-01", 
    status: "overdue", 
    participants: [],
    totalCrew: 24
  },
  { 
    id: "6", 
    name: "Exercício de Segurança ISPS", 
    type: "security", 
    frequency: "quarterly",
    frequencyLabel: "Trimestral", 
    lastExecution: "2023-12-15", 
    nextDue: "2024-03-15", 
    status: "scheduled", 
    participants: [],
    totalCrew: 24,
    scheduledDate: "2024-03-15T14:00:00"
  },
  { 
    id: "7", 
    name: "Primeiros Socorros", 
    type: "medical", 
    frequency: "quarterly",
    frequencyLabel: "Trimestral", 
    lastExecution: "2023-12-01", 
    nextDue: "2024-03-01", 
    status: "due", 
    participants: [],
    totalCrew: 24
  },
  { 
    id: "8", 
    name: "Colisão/Encalhe", 
    type: "collision", 
    frequency: "semi-annual",
    frequencyLabel: "Semestral", 
    lastExecution: "2023-07-10", 
    nextDue: "2024-01-10", 
    status: "overdue", 
    participants: [],
    totalCrew: 24
  },
];

export const mockCrewMembers: CrewMember[] = [
  { 
    id: "1", 
    name: "Capitão João Silva", 
    position: "Master", 
    department: "deck",
    joinDate: "2020-03-15",
    certifications: [],
    drillParticipation: [],
    trainingStatus: "compliant"
  },
  { 
    id: "2", 
    name: "1º Oficial Maria Santos", 
    position: "Chief Officer", 
    department: "deck",
    joinDate: "2021-06-20",
    certifications: [],
    drillParticipation: [],
    trainingStatus: "expiring"
  },
  { 
    id: "3", 
    name: "2º Oficial Carlos Lima", 
    position: "Second Officer", 
    department: "deck",
    joinDate: "2022-01-10",
    certifications: [],
    drillParticipation: [],
    trainingStatus: "expiring"
  },
  { 
    id: "4", 
    name: "3º Oficial Ana Costa", 
    position: "Third Officer", 
    department: "deck",
    joinDate: "2023-02-28",
    certifications: [],
    drillParticipation: [],
    trainingStatus: "non-compliant"
  },
  { 
    id: "5", 
    name: "Chefe de Máquinas Pedro Oliveira", 
    position: "Chief Engineer", 
    department: "engine",
    joinDate: "2019-08-12",
    certifications: [],
    drillParticipation: [],
    trainingStatus: "compliant"
  },
  { 
    id: "6", 
    name: "1º Oficial de Máquinas Roberto Alves", 
    position: "Second Engineer", 
    department: "engine",
    joinDate: "2020-11-05",
    certifications: [],
    drillParticipation: [],
    trainingStatus: "compliant"
  },
  { 
    id: "7", 
    name: "Eletricista Paulo Mendes", 
    position: "Electrician", 
    department: "engine",
    joinDate: "2021-04-18",
    certifications: [],
    drillParticipation: [],
    trainingStatus: "compliant"
  },
  { 
    id: "8", 
    name: "Contramestre José Ferreira", 
    position: "Bosun", 
    department: "deck",
    joinDate: "2018-07-22",
    certifications: [],
    drillParticipation: [],
    trainingStatus: "compliant"
  },
];

export const mockCertifications: Certification[] = [
  { 
    id: "1", 
    crewMemberId: "1",
    name: "STCW Basic Safety Training", 
    code: "STCW A-VI/1",
    issueDate: "2022-05-15", 
    expiryDate: "2027-05-15", 
    issuingAuthority: "Maritime Authority",
    status: "valid" 
  },
  { 
    id: "2", 
    crewMemberId: "1",
    name: "Advanced Fire Fighting", 
    code: "STCW A-VI/3",
    issueDate: "2021-08-20", 
    expiryDate: "2024-08-20", 
    issuingAuthority: "Maritime Authority",
    status: "expiring" 
  },
  { 
    id: "3", 
    crewMemberId: "2",
    name: "Medical First Aid", 
    code: "STCW A-VI/4-1",
    issueDate: "2020-03-10", 
    expiryDate: "2024-03-10", 
    issuingAuthority: "Maritime Authority",
    status: "expiring" 
  },
  { 
    id: "4", 
    crewMemberId: "4",
    name: "Survival Craft and Rescue Boats", 
    code: "STCW A-VI/2-1",
    issueDate: "2019-11-25", 
    expiryDate: "2024-01-25", 
    issuingAuthority: "Maritime Authority",
    status: "expired" 
  },
  { 
    id: "5", 
    crewMemberId: "3",
    name: "GMDSS Radio Operator", 
    code: "STCW A-IV/2",
    issueDate: "2022-02-14", 
    expiryDate: "2027-02-14", 
    issuingAuthority: "Maritime Authority",
    status: "valid" 
  },
  { 
    id: "6", 
    crewMemberId: "5",
    name: "Engine Room Resource Management", 
    code: "STCW A-III/1",
    issueDate: "2023-01-20", 
    expiryDate: "2028-01-20", 
    issuingAuthority: "Maritime Authority",
    status: "valid" 
  },
  { 
    id: "7", 
    crewMemberId: "2",
    name: "Security Awareness Training", 
    code: "STCW A-VI/6-1",
    issueDate: "2021-06-30", 
    expiryDate: "2024-06-30", 
    issuingAuthority: "Maritime Authority",
    status: "expiring" 
  },
  { 
    id: "8", 
    crewMemberId: "6",
    name: "High Voltage Equipment", 
    code: "STCW A-III/6",
    issueDate: "2022-09-15", 
    expiryDate: "2027-09-15", 
    issuingAuthority: "Maritime Authority",
    status: "valid" 
  },
];

export const mockAlerts: TrainingAlert[] = [
  {
    id: "1",
    type: "drill_overdue",
    severity: "critical",
    title: "Drill Atrasado: Combate à Poluição",
    description: "O exercício de Combate à Poluição está atrasado desde 01/01/2024. Ação imediata necessária.",
    relatedId: "5",
    createdAt: new Date().toISOString(),
    isRead: false
  },
  {
    id: "2",
    type: "drill_overdue",
    severity: "critical",
    title: "Drill Atrasado: Colisão/Encalhe",
    description: "O exercício de Colisão/Encalhe está atrasado desde 10/01/2024. Ação imediata necessária.",
    relatedId: "8",
    createdAt: new Date().toISOString(),
    isRead: false
  },
  {
    id: "3",
    type: "cert_expired",
    severity: "critical",
    title: "Certificado Expirado: Ana Costa",
    description: "Survival Craft and Rescue Boats expirou em 25/01/2024",
    relatedId: "4",
    createdAt: new Date().toISOString(),
    isRead: false
  },
  {
    id: "4",
    type: "cert_expiring",
    severity: "warning",
    title: "Certificado Expirando: João Silva",
    description: "Advanced Fire Fighting expira em 20/08/2024",
    relatedId: "2",
    createdAt: new Date().toISOString(),
    isRead: true
  },
  {
    id: "5",
    type: "drill_due",
    severity: "info",
    title: "Drill Programado: Homem ao Mar",
    description: "Exercício agendado para 15/02/2024 às 10:00",
    relatedId: "3",
    createdAt: new Date().toISOString(),
    isRead: true
  },
];

export const mockDrillExecutions: DrillExecution[] = [
  {
    id: "exec-1",
    drillId: "1",
    drillName: "Exercício de Incêndio",
    drillType: "fire",
    executedAt: "2024-01-10T14:00:00",
    duration: 45,
    participants: mockCrewMembers.slice(0, 12),
    observations: "Exercício realizado com sucesso. Tempo de resposta dentro do esperado. Equipe de combate demonstrou conhecimento adequado dos procedimentos.",
    nonConformities: [],
    score: 92,
    signedBy: "Capitão João Silva"
  },
  {
    id: "exec-2",
    drillId: "2",
    drillName: "Abandono de Embarcação",
    drillType: "abandon",
    executedAt: "2024-01-05T10:00:00",
    duration: 60,
    participants: mockCrewMembers,
    observations: "Toda tripulação participou. Tempo de abandono: 18 minutos (dentro do limite de 30 min). Verificar lançamento da balsa de popa.",
    nonConformities: ["Atraso no acionamento do alarme geral", "Falta de sinalização no convés superior"],
    score: 85,
    signedBy: "Capitão João Silva"
  }
];
