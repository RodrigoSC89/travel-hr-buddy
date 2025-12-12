/**
 * ISM Audit Test Fixtures - FASE 3
 * Dados de teste para auditorias ISM
 */

export const auditTypes = [
  "ISM Internal",
  "ISM External",
  "ISPS",
  "MLC",
  "LSA/FFA",
  "PSC",
  "OVID"
];

export const auditData = {
  valid: {
    type: "ISM Internal",
    date: "2025-12-15",
    auditor: "John Doe",
    vessel: "MV Nautilus One",
    status: "scheduled",
    checklist: [
      { item: "Safety Management System", status: "pending", category: "SMS" },
      { item: "Emergency Procedures", status: "pending", category: "Safety" },
      { item: "Crew Training Records", status: "pending", category: "Training" },
      { item: "Equipment Maintenance", status: "pending", category: "Maintenance" },
      { item: "Documentation Review", status: "pending", category: "Documentation" }
    ]
  },
  inProgress: {
    type: "ISM External",
    date: "2025-12-11",
    auditor: "Jane Smith",
    vessel: "MV Nautilus One",
    status: "in_progress",
    progress: 45,
    checklist: [
      { item: "Safety Management System", status: "passed", category: "SMS", notes: "All documents in order" },
      { item: "Emergency Procedures", status: "passed", category: "Safety", notes: "Drills completed" },
      { item: "Crew Training Records", status: "pending", category: "Training" },
      { item: "Equipment Maintenance", status: "pending", category: "Maintenance" },
      { item: "Documentation Review", status: "pending", category: "Documentation" }
    ]
  },
  completed: {
    type: "ISPS",
    date: "2025-12-01",
    auditor: "Robert Johnson",
    vessel: "MV Nautilus One",
    status: "completed",
    progress: 100,
    result: "passed",
    findings: [
      { severity: "low", description: "Minor documentation gap", resolved: true },
      { severity: "medium", description: "Training record update needed", resolved: true }
    ],
    checklist: [
      { item: "Safety Management System", status: "passed", category: "SMS" },
      { item: "Emergency Procedures", status: "passed", category: "Safety" },
      { item: "Crew Training Records", status: "passed", category: "Training" },
      { item: "Equipment Maintenance", status: "passed", category: "Maintenance" },
      { item: "Documentation Review", status: "passed", category: "Documentation" }
    ]
  }
};

export const checklistStatuses = ["pending", "passed", "failed", "n/a"];

export const findingSeverities = ["low", "medium", "high", "critical"];
