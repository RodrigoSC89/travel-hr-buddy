/**
 * Mock Jobs Data for Forecast Testing
 * This file contains sample job completion data for testing the forecast API
 */

interface MockJob {
  id: string;
  component_id: string;
  completed_at: string;
  status: string;
}

export const mockJobs: MockJob[] = [
  // January 2025
  { id: "1", component_id: "comp-001", completed_at: "2025-01-05", status: "completed" },
  { id: "2", component_id: "comp-001", completed_at: "2025-01-12", status: "completed" },
  { id: "3", component_id: "comp-002", completed_at: "2025-01-15", status: "completed" },
  { id: "4", component_id: "comp-003", completed_at: "2025-01-20", status: "completed" },
  { id: "5", component_id: "comp-001", completed_at: "2025-01-25", status: "completed" },
  
  // February 2025
  { id: "6", component_id: "comp-001", completed_at: "2025-02-03", status: "completed" },
  { id: "7", component_id: "comp-002", completed_at: "2025-02-08", status: "completed" },
  { id: "8", component_id: "comp-002", completed_at: "2025-02-12", status: "completed" },
  { id: "9", component_id: "comp-003", completed_at: "2025-02-18", status: "completed" },
  { id: "10", component_id: "comp-001", completed_at: "2025-02-22", status: "completed" },
  { id: "11", component_id: "comp-003", completed_at: "2025-02-25", status: "completed" },
  
  // March 2025
  { id: "12", component_id: "comp-001", completed_at: "2025-03-02", status: "completed" },
  { id: "13", component_id: "comp-001", completed_at: "2025-03-07", status: "completed" },
  { id: "14", component_id: "comp-002", completed_at: "2025-03-10", status: "completed" },
  { id: "15", component_id: "comp-003", completed_at: "2025-03-15", status: "completed" },
  { id: "16", component_id: "comp-001", completed_at: "2025-03-20", status: "completed" },
  { id: "17", component_id: "comp-002", completed_at: "2025-03-22", status: "completed" },
  { id: "18", component_id: "comp-003", completed_at: "2025-03-28", status: "completed" },
  
  // April 2025
  { id: "19", component_id: "comp-001", completed_at: "2025-04-05", status: "completed" },
  { id: "20", component_id: "comp-001", completed_at: "2025-04-08", status: "completed" },
  { id: "21", component_id: "comp-001", completed_at: "2025-04-12", status: "completed" },
  { id: "22", component_id: "comp-002", completed_at: "2025-04-15", status: "completed" },
  { id: "23", component_id: "comp-002", completed_at: "2025-04-18", status: "completed" },
  { id: "24", component_id: "comp-003", completed_at: "2025-04-20", status: "completed" },
  { id: "25", component_id: "comp-001", completed_at: "2025-04-25", status: "completed" },
  { id: "26", component_id: "comp-003", completed_at: "2025-04-28", status: "completed" },
];
