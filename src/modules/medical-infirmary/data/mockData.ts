/**
 * Mock data for Medical Infirmary Module
 */

import { CrewMember, MedicalSupply, MedicalRecord, MedicalReport } from "../types";

export const mockCrewMembers: CrewMember[] = [
  {
    id: "1",
    name: "João Silva",
    position: "Comandante",
    bloodType: "O+",
    allergies: ["Penicilina"],
    conditions: ["Hipertensão controlada"],
    lastCheckup: "2024-01-15",
    nextCheckup: "2024-07-15",
    status: "fit",
    vaccinations: [
      { name: "Febre Amarela", date: "2023-01-10", expiryDate: "2033-01-10", status: "valid" },
      { name: "Tétano", date: "2022-05-20", expiryDate: "2027-05-20", status: "valid" },
      { name: "Hepatite B", date: "2020-03-15", expiryDate: "2025-03-15", status: "expiring" }
    ]
  },
  {
    id: "2",
    name: "Maria Santos",
    position: "Chefe de Máquinas",
    bloodType: "A+",
    allergies: [],
    conditions: [],
    lastCheckup: "2024-01-10",
    nextCheckup: "2024-07-10",
    status: "fit",
    vaccinations: [
      { name: "Febre Amarela", date: "2023-06-10", expiryDate: "2033-06-10", status: "valid" },
      { name: "Tétano", date: "2023-05-20", expiryDate: "2028-05-20", status: "valid" }
    ]
  },
  {
    id: "3",
    name: "Carlos Lima",
    position: "Oficial de Náutica",
    bloodType: "B-",
    allergies: ["Dipirona", "Sulfas"],
    conditions: [],
    lastCheckup: "2023-12-20",
    nextCheckup: "2024-06-20",
    status: "fit",
    vaccinations: [
      { name: "Febre Amarela", date: "2022-01-10", expiryDate: "2032-01-10", status: "valid" },
      { name: "Tétano", date: "2019-05-20", expiryDate: "2024-05-20", status: "expiring" }
    ]
  },
  {
    id: "4",
    name: "Pedro Almeida",
    position: "Marinheiro",
    bloodType: "AB+",
    allergies: [],
    conditions: ["Diabetes Tipo 2"],
    lastCheckup: "2024-01-05",
    nextCheckup: "2024-04-05",
    status: "restricted",
    vaccinations: [
      { name: "Febre Amarela", date: "2023-01-10", expiryDate: "2033-01-10", status: "valid" }
    ]
  },
  {
    id: "5",
    name: "Ana Oliveira",
    position: "Cozinheira",
    bloodType: "O-",
    allergies: ["Látex"],
    conditions: [],
    lastCheckup: "2024-01-08",
    nextCheckup: "2024-07-08",
    status: "fit",
    vaccinations: [
      { name: "Febre Amarela", date: "2023-08-10", expiryDate: "2033-08-10", status: "valid" },
      { name: "Hepatite A", date: "2023-08-10", expiryDate: "2043-08-10", status: "valid" }
    ]
  },
  {
    id: "6",
    name: "Roberto Costa",
    position: "Eletricista",
    bloodType: "A-",
    allergies: [],
    conditions: [],
    lastCheckup: "2023-11-15",
    nextCheckup: "2024-05-15",
    status: "fit",
    vaccinations: [
      { name: "Tétano", date: "2023-11-15", expiryDate: "2028-11-15", status: "valid" }
    ]
  }
];

export const mockSupplies: MedicalSupply[] = [
  { id: "1", name: "Paracetamol 500mg", category: "Analgésicos", quantity: 120, minStock: 50, unit: "comprimidos", expiryDate: "2025-06-15", batchNumber: "PAR2024001", location: "Armário A1", status: "ok", lastRestock: "2024-01-01" },
  { id: "2", name: "Dipirona 1g", category: "Analgésicos", quantity: 85, minStock: 40, unit: "comprimidos", expiryDate: "2024-03-20", batchNumber: "DIP2023045", location: "Armário A1", status: "expiring", lastRestock: "2023-12-15" },
  { id: "3", name: "Ibuprofeno 600mg", category: "Anti-inflamatórios", quantity: 60, minStock: 30, unit: "comprimidos", expiryDate: "2025-08-10", batchNumber: "IBU2024012", location: "Armário A2", status: "ok", lastRestock: "2024-01-05" },
  { id: "4", name: "Bandagem elástica 10cm", category: "Curativos", quantity: 15, minStock: 20, unit: "rolos", expiryDate: "2026-12-01", batchNumber: "BAN2024001", location: "Armário B1", status: "low", lastRestock: "2023-11-20" },
  { id: "5", name: "Soro fisiológico 500ml", category: "Soluções", quantity: 8, minStock: 15, unit: "frascos", expiryDate: "2024-08-10", batchNumber: "SOR2023089", location: "Armário C1", status: "critical", lastRestock: "2023-10-15" },
  { id: "6", name: "Omeprazol 20mg", category: "Gastrointestinal", quantity: 60, minStock: 30, unit: "cápsulas", expiryDate: "2025-11-30", batchNumber: "OME2024003", location: "Armário A3", status: "ok", lastRestock: "2024-01-02" },
  { id: "7", name: "Dramin 100mg", category: "Antieméticos", quantity: 45, minStock: 25, unit: "comprimidos", expiryDate: "2025-04-20", batchNumber: "DRA2024007", location: "Armário A2", status: "ok", lastRestock: "2024-01-03" },
  { id: "8", name: "Gaze estéril 7,5x7,5", category: "Curativos", quantity: 200, minStock: 100, unit: "unidades", expiryDate: "2026-03-15", batchNumber: "GAZ2024015", location: "Armário B1", status: "ok", lastRestock: "2024-01-10" },
  { id: "9", name: "Luvas descartáveis M", category: "EPIs", quantity: 150, minStock: 100, unit: "pares", expiryDate: "2026-06-30", batchNumber: "LUV2024002", location: "Armário B2", status: "ok", lastRestock: "2024-01-08" },
  { id: "10", name: "Adrenalina 1mg/ml", category: "Emergência", quantity: 5, minStock: 10, unit: "ampolas", expiryDate: "2024-12-15", batchNumber: "ADR2023011", location: "Kit Emergência", status: "low", lastRestock: "2023-09-01" },
  { id: "11", name: "Amoxicilina 500mg", category: "Antibióticos", quantity: 40, minStock: 20, unit: "cápsulas", expiryDate: "2024-09-30", batchNumber: "AMO2024001", location: "Armário A4", status: "ok", lastRestock: "2024-01-05" },
  { id: "12", name: "Termômetro digital", category: "Equipamentos", quantity: 3, minStock: 2, unit: "unidades", expiryDate: "2030-01-01", batchNumber: "TER2023001", location: "Bancada", status: "ok", lastRestock: "2023-06-01" }
];

export const mockRecords: MedicalRecord[] = [
  {
    id: "1",
    crewMemberId: "1",
    crewMemberName: "João Silva",
    date: "2024-01-15",
    time: "14:30",
    type: "consultation",
    chiefComplaint: "Cefaleia persistente há 2 dias",
    symptoms: ["Dor de cabeça", "Fadiga", "Fotofobia leve"],
    diagnosis: "Cefaleia tensional",
    treatment: "Paracetamol 500mg 6/6h por 3 dias",
    medications: [
      { name: "Paracetamol 500mg", dosage: "1 comprimido", frequency: "6/6h", duration: "3 dias" }
    ],
    vitalSigns: { bloodPressure: "130/85", heartRate: 72, temperature: 36.5, oxygenSaturation: 98 },
    notes: "Paciente relata estresse ocupacional. Orientado repouso e hidratação.",
    followUp: "2024-01-18",
    status: "resolved",
    aiSuggestions: ["Verificar PA em próxima consulta", "Considerar avaliação de estresse"]
  },
  {
    id: "2",
    crewMemberId: "2",
    crewMemberName: "Maria Santos",
    date: "2024-01-14",
    time: "09:15",
    type: "emergency",
    chiefComplaint: "Laceração em mão direita",
    symptoms: ["Corte profundo", "Sangramento ativo", "Dor local"],
    diagnosis: "Laceração 3cm dorso mão direita",
    treatment: "Limpeza + sutura 4 pontos + curativo oclusivo",
    medications: [
      { name: "Ibuprofeno 600mg", dosage: "1 comprimido", frequency: "8/8h", duration: "5 dias" }
    ],
    vitalSigns: { bloodPressure: "125/80", heartRate: 88, temperature: 36.8, oxygenSaturation: 99 },
    notes: "Acidente com ferramenta. Vacina antitetânica em dia. Retorno para retirada de pontos.",
    followUp: "2024-01-21",
    status: "monitoring",
    aiSuggestions: ["Monitorar sinais de infecção", "Avaliar necessidade de antibiótico profilático"]
  },
  {
    id: "3",
    crewMemberId: "3",
    crewMemberName: "Carlos Lima",
    date: "2024-01-13",
    time: "16:45",
    type: "consultation",
    chiefComplaint: "Náuseas e tontura",
    symptoms: ["Enjoo", "Tontura", "Mal-estar geral"],
    diagnosis: "Cinetose (enjoo de movimento)",
    treatment: "Dramin 100mg + observação 24h",
    medications: [
      { name: "Dramin 100mg", dosage: "1 comprimido", frequency: "8/8h", duration: "2 dias" }
    ],
    vitalSigns: { bloodPressure: "118/75", heartRate: 68, temperature: 36.4, oxygenSaturation: 98 },
    notes: "Primeiro episódio nesta embarcação. Orientado adaptação gradual.",
    status: "resolved"
  },
  {
    id: "4",
    crewMemberId: "4",
    crewMemberName: "Pedro Almeida",
    date: "2024-01-12",
    time: "08:00",
    type: "routine",
    chiefComplaint: "Controle glicêmico de rotina",
    symptoms: [],
    diagnosis: "Diabetes Tipo 2 - controlado",
    treatment: "Manter medicação atual",
    medications: [
      { name: "Metformina 850mg", dosage: "1 comprimido", frequency: "12/12h", duration: "contínuo" }
    ],
    vitalSigns: { bloodPressure: "125/82", heartRate: 74, temperature: 36.6, oxygenSaturation: 97 },
    notes: "Glicemia jejum: 126 mg/dL. Bom controle. Manter dieta e exercícios.",
    followUp: "2024-01-26",
    status: "monitoring"
  }
];

export const mockReports: MedicalReport[] = [
  {
    id: "1",
    type: "mlc",
    title: "Relatório MLC 2006 - Janeiro 2024",
    generatedAt: "2024-01-31",
    period: "2024-01",
    status: "completed",
    data: { compliance: 100, items: 15 }
  },
  {
    id: "2",
    type: "monthly",
    title: "Relatório Mensal de Atendimentos",
    generatedAt: "2024-01-31",
    period: "2024-01",
    status: "completed",
    data: { consultations: 8, emergencies: 1, routine: 3 }
  },
  {
    id: "3",
    type: "inventory",
    title: "Inventário de Medicamentos",
    generatedAt: "2024-01-15",
    period: "2024-01",
    status: "completed",
    data: { totalItems: 45, lowStock: 3, expiring: 2 }
  }
];

export const medicalCategories = [
  "Analgésicos",
  "Anti-inflamatórios",
  "Antibióticos",
  "Antieméticos",
  "Gastrointestinal",
  "Curativos",
  "Soluções",
  "Emergência",
  "EPIs",
  "Equipamentos"
];
