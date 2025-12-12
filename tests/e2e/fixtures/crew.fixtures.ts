/**
 * Crew Management Test Fixtures - FASE 3
 * Dados de teste para gestão de tripulação
 */

export const crewRanks = [
  "Captain",
  "Chief Officer",
  "Second Officer",
  "Third Officer",
  "Chief Engineer",
  "Second Engineer",
  "Third Engineer",
  "Bosun",
  "AB Seaman",
  "Oiler",
  "Wiper",
  "Cook",
  "Steward"
];

export const crewStatuses = [
  "active",
  "on_leave",
  "off_duty",
  "medical_leave",
  "standby"
];

export const crewData = {
  captain: {
    id: "CREW-001",
    name: "John Smith",
    rank: "Captain",
    nationality: "Brazilian",
    dateOfBirth: "1975-03-15",
    joinDate: "2020-01-15",
    status: "active",
    email: "john.smith@nautilus.com",
    phone: "+55 11 98765-4321",
    certifications: [
      { type: "STCW", number: "BR-12345", expiryDate: "2026-06-30" },
      { type: "Master Mariner", number: "MM-67890", expiryDate: "2027-12-31" }
    ],
    medicals: [
      { type: "Medical Exam", date: "2025-01-10", expiryDate: "2026-01-10", status: "valid" }
    ]
  },
  engineer: {
    id: "CREW-002",
    name: "Maria Santos",
    rank: "Chief Engineer",
    nationality: "Brazilian",
    dateOfBirth: "1980-07-22",
    joinDate: "2021-06-01",
    status: "active",
    email: "maria.santos@nautilus.com",
    phone: "+55 11 91234-5678",
    certifications: [
      { type: "STCW", number: "BR-54321", expiryDate: "2026-08-15" },
      { type: "Chief Engineer", number: "CE-98765", expiryDate: "2028-03-31" }
    ],
    medicals: [
      { type: "Medical Exam", date: "2025-06-01", expiryDate: "2026-06-01", status: "valid" }
    ]
  },
  onLeave: {
    id: "CREW-003",
    name: "Carlos Silva",
    rank: "Second Officer",
    nationality: "Brazilian",
    dateOfBirth: "1988-11-05",
    joinDate: "2022-03-10",
    status: "on_leave",
    email: "carlos.silva@nautilus.com",
    phone: "+55 11 99999-8888",
    leaveStart: "2025-12-01",
    leaveEnd: "2025-12-31",
    leaveType: "annual",
    certifications: [
      { type: "STCW", number: "BR-11111", expiryDate: "2026-12-31" }
    ]
  },
  expiringCertificate: {
    id: "CREW-004",
    name: "Ana Costa",
    rank: "Third Engineer",
    nationality: "Brazilian",
    dateOfBirth: "1992-04-18",
    joinDate: "2023-01-05",
    status: "active",
    email: "ana.costa@nautilus.com",
    phone: "+55 11 97777-6666",
    certifications: [
      { type: "STCW", number: "BR-22222", expiryDate: "2025-12-31", status: "expiring" },
      { type: "Engineer Officer", number: "EO-33333", expiryDate: "2027-06-30", status: "valid" }
    ],
    alerts: [
      { type: "certificate_expiring", message: "STCW certificate expiring in 20 days", severity: "warning" }
    ]
  }
};

export const crewWellbeingData = {
  fatigue: {
    level: 65,
    status: "moderate",
    restHours: 10,
    workHours: 12,
    alerts: []
  },
  mentalHealth: {
    score: 75,
    status: "good",
    lastAssessment: "2025-11-15"
  },
  physicalHealth: {
    score: 82,
    status: "good",
    lastCheckup: "2025-10-01"
  }
};
