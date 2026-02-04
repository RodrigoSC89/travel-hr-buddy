/**
 * People Hub Module Types
 */

export interface CrewMember {
  id: string;
  name: string;
  rank: string;
  department: string;
  vessel: string;
  competencyScore: number;
}

export interface Certification {
  id: string;
  name: string;
  code: string;
  type: string;
  expiryDate: string;
  status: "valid" | "expiring" | "expired" | "pending";
}

export interface Training {
  id: string;
  name: string;
  type: string;
  status: "completed" | "in-progress" | "overdue" | "scheduled";
  progress: number;
  mandatory: boolean;
}
