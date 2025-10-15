/**
 * Mock Jobs Data for Forecast Testing
 * Simulates maintenance job records by component for predictive analysis
 */

export interface MockJob {
  id: string;
  component_id: string;
  component_name: string;
  completed_at: string;
  status: string;
  priority: string;
}

export const mockJobs: MockJob[] = [
  // Engine 001 - High frequency maintenance
  { id: "job-001", component_id: "ENG-001", component_name: "Motor Principal A", completed_at: "2024-08-15T10:30:00Z", status: "completed", priority: "high" },
  { id: "job-002", component_id: "ENG-001", component_name: "Motor Principal A", completed_at: "2024-08-28T14:20:00Z", status: "completed", priority: "medium" },
  { id: "job-003", component_id: "ENG-001", component_name: "Motor Principal A", completed_at: "2024-09-12T09:15:00Z", status: "completed", priority: "high" },
  { id: "job-004", component_id: "ENG-001", component_name: "Motor Principal A", completed_at: "2024-09-25T16:45:00Z", status: "completed", priority: "high" },
  { id: "job-005", component_id: "ENG-001", component_name: "Motor Principal A", completed_at: "2024-10-08T11:30:00Z", status: "completed", priority: "critical" },
  
  // Hydraulic System - Moderate frequency
  { id: "job-006", component_id: "HYD-001", component_name: "Sistema Hidráulico", completed_at: "2024-08-10T08:00:00Z", status: "completed", priority: "medium" },
  { id: "job-007", component_id: "HYD-001", component_name: "Sistema Hidráulico", completed_at: "2024-09-05T13:30:00Z", status: "completed", priority: "medium" },
  { id: "job-008", component_id: "HYD-001", component_name: "Sistema Hidráulico", completed_at: "2024-10-01T10:15:00Z", status: "completed", priority: "low" },
  
  // Cooling System - Regular maintenance
  { id: "job-009", component_id: "COOL-001", component_name: "Sistema de Resfriamento", completed_at: "2024-08-20T15:00:00Z", status: "completed", priority: "low" },
  { id: "job-010", component_id: "COOL-001", component_name: "Sistema de Resfriamento", completed_at: "2024-09-18T12:00:00Z", status: "completed", priority: "low" },
  
  // Electrical System - Increasing frequency (critical pattern)
  { id: "job-011", component_id: "ELEC-001", component_name: "Sistema Elétrico", completed_at: "2024-08-05T09:00:00Z", status: "completed", priority: "medium" },
  { id: "job-012", component_id: "ELEC-001", component_name: "Sistema Elétrico", completed_at: "2024-08-22T14:30:00Z", status: "completed", priority: "medium" },
  { id: "job-013", component_id: "ELEC-001", component_name: "Sistema Elétrico", completed_at: "2024-09-08T11:00:00Z", status: "completed", priority: "high" },
  { id: "job-014", component_id: "ELEC-001", component_name: "Sistema Elétrico", completed_at: "2024-09-20T16:00:00Z", status: "completed", priority: "high" },
  { id: "job-015", component_id: "ELEC-001", component_name: "Sistema Elétrico", completed_at: "2024-10-05T10:30:00Z", status: "completed", priority: "critical" },
  { id: "job-016", component_id: "ELEC-001", component_name: "Sistema Elétrico", completed_at: "2024-10-12T13:45:00Z", status: "completed", priority: "critical" },
  
  // Propulsion System - Stable
  { id: "job-017", component_id: "PROP-001", component_name: "Sistema de Propulsão", completed_at: "2024-08-18T10:00:00Z", status: "completed", priority: "low" },
  { id: "job-018", component_id: "PROP-001", component_name: "Sistema de Propulsão", completed_at: "2024-09-15T11:30:00Z", status: "completed", priority: "low" },
  
  // Navigation System - Low frequency
  { id: "job-019", component_id: "NAV-001", component_name: "Sistema de Navegação", completed_at: "2024-09-01T14:00:00Z", status: "completed", priority: "low" },
  { id: "job-020", component_id: "NAV-001", component_name: "Sistema de Navegação", completed_at: "2024-10-10T09:30:00Z", status: "completed", priority: "low" },
  
  // Fuel System - Sporadic
  { id: "job-021", component_id: "FUEL-001", component_name: "Sistema de Combustível", completed_at: "2024-08-25T16:00:00Z", status: "completed", priority: "medium" },
  { id: "job-022", component_id: "FUEL-001", component_name: "Sistema de Combustível", completed_at: "2024-10-03T12:30:00Z", status: "completed", priority: "medium" },
];
