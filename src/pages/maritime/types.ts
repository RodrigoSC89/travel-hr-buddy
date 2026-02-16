export interface CrewMember {
  id: string;
  full_name: string;
  position: string;
  rank?: string;
  nationality: string;
  passport_number?: string;
  phone?: string;
  email?: string;
  employee_id: string;
  status: string;
  vessel_id?: string;
  contract_start?: string;
  contract_end?: string;
  experience_years?: number;
}

export interface MaritimeStats {
  totalChecklists: number;
  completedChecklists: number;
  pendingChecklists: number;
  activeVessels: number;
  averageCompliance: number;
  criticalIssues: number;
  totalCrew: number;
  activeCrew: number;
  certExpiring: number;
  certValid: number;
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-success";
    case "shore_leave": return "bg-warning";
    case "medical_leave": return "bg-warning";
    case "inactive": return "bg-muted-foreground";
    default: return "bg-muted-foreground";
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "active": return "Ativo";
    case "shore_leave": return "Licença Terra";
    case "medical_leave": return "Licença Médica";
    case "inactive": return "Inativo";
    default: return status;
  }
};

export const DEMO_CREW_MEMBERS = (vesselIds: (string | undefined)[]): CrewMember[] => [
  {
    id: "1", full_name: "João Silva", position: "Comandante", rank: "Capitão",
    nationality: "Brasileiro", passport_number: "BR123456789", phone: "+55 11 99999-9999",
    email: "joao.silva@nautilus.com", employee_id: "EMP001", status: "active",
    vessel_id: vesselIds[0], contract_start: "2024-01-01", contract_end: "2024-12-31", experience_years: 15
  },
  {
    id: "2", full_name: "Carlos Santos", position: "Chefe de Máquinas", rank: "Oficial",
    nationality: "Brasileiro", passport_number: "BR987654321", phone: "+55 21 77777-7777",
    email: "carlos.santos@nautilus.com", employee_id: "EMP002", status: "active",
    vessel_id: vesselIds[0], contract_start: "2024-01-01", contract_end: "2024-12-31", experience_years: 12
  },
  {
    id: "3", full_name: "Maria Oliveira", position: "Oficial de Convés", rank: "Oficial",
    nationality: "Brasileira", passport_number: "BR456789123", phone: "+55 11 66666-6666",
    email: "maria.oliveira@nautilus.com", employee_id: "EMP003", status: "active",
    vessel_id: vesselIds[1], contract_start: "2024-01-01", contract_end: "2024-12-31", experience_years: 8
  },
  {
    id: "4", full_name: "Pedro Costa", position: "Marinheiro",
    nationality: "Brasileiro", passport_number: "BR789123456", phone: "+55 31 55555-5555",
    email: "pedro.costa@nautilus.com", employee_id: "EMP004", status: "shore_leave", experience_years: 5
  },
  {
    id: "5", full_name: "Ana Rodrigues", position: "Enfermeira de Bordo",
    nationality: "Brasileira", passport_number: "BR321654987", phone: "+55 11 44444-4444",
    email: "ana.rodrigues@nautilus.com", employee_id: "EMP005", status: "active",
    vessel_id: vesselIds[0], contract_start: "2024-02-01", contract_end: "2024-12-31", experience_years: 6
  }
];
