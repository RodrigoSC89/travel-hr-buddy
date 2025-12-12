/**
 * Maintenance Test Fixtures - FASE 3
 * Dados de teste para manutenção preventiva
 */

export const maintenanceTypes = [
  "Preventive",
  "Corrective",
  "Predictive",
  "Emergency"
];

export const maintenancePriorities = [
  "low",
  "medium",
  "high",
  "critical"
];

export const maintenanceStatuses = [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
  "overdue"
];

export const maintenanceData = {
  scheduled: {
    id: "MNT-2025-001",
    type: "Preventive",
    title: "Main Engine Oil Change",
    description: "Scheduled oil change for main engine",
    equipment: "Main Engine",
    priority: "medium",
    status: "scheduled",
    scheduledDate: "2025-12-20",
    estimatedDuration: 4,
    assignedTo: "Chief Engineer",
    parts: [
      { name: "Engine Oil", quantity: 200, unit: "L" },
      { name: "Oil Filter", quantity: 2, unit: "pcs" }
    ]
  },
  inProgress: {
    id: "MNT-2025-002",
    type: "Corrective",
    title: "Generator Repair",
    description: "Repair cooling system leak",
    equipment: "Auxiliary Generator #2",
    priority: "high",
    status: "in_progress",
    scheduledDate: "2025-12-11",
    startedAt: "2025-12-11T08:00:00Z",
    estimatedDuration: 6,
    progress: 60,
    assignedTo: "Second Engineer",
    parts: [
      { name: "Cooling Pump Seal", quantity: 1, unit: "pcs" },
      { name: "Coolant", quantity: 50, unit: "L" }
    ]
  },
  completed: {
    id: "MNT-2025-003",
    type: "Preventive",
    title: "Fire Detection System Test",
    description: "Monthly fire detection system test",
    equipment: "Fire Detection System",
    priority: "medium",
    status: "completed",
    scheduledDate: "2025-12-01",
    startedAt: "2025-12-01T10:00:00Z",
    completedAt: "2025-12-01T12:30:00Z",
    actualDuration: 2.5,
    assignedTo: "Electrical Officer",
    result: "passed",
    notes: "All sensors functioning properly"
  },
  overdue: {
    id: "MNT-2025-004",
    type: "Preventive",
    title: "Lifeboat Inspection",
    description: "Monthly lifeboat inspection",
    equipment: "Lifeboat #1",
    priority: "high",
    status: "overdue",
    scheduledDate: "2025-11-30",
    daysOverdue: 11,
    assignedTo: "Safety Officer"
  }
};

export const equipmentList = [
  "Main Engine",
  "Auxiliary Generator #1",
  "Auxiliary Generator #2",
  "Steering Gear",
  "Fire Detection System",
  "HVAC System",
  "Bilge Pump",
  "Lifeboat #1",
  "Lifeboat #2",
  "Emergency Generator"
];
