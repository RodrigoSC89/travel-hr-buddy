/**
 * Hook para dados reais do PMS Engine (Planned Maintenance System)
 * Retorna dados vazios pois tabela work_orders não existe
 * Pronto para integração quando tabela for criada
 */

import { useQuery } from '@tanstack/react-query';

export interface PMSJob {
  id: string;
  jobCode: string;
  title: string;
  component: string;
  system: string;
  interval: {
    type: "hours" | "calendar" | "both";
    hours?: number;
    days?: number;
  };
  status: "due" | "overdue" | "upcoming" | "completed" | "in_progress";
  priority: "critical" | "high" | "medium" | "low";
  lastDone?: Date;
  nextDue: Date;
  currentHours?: number;
  dueHours?: number;
  classRequired: boolean;
  estimatedTime: number;
  spareParts: string[];
  assignedTo?: string;
}

export interface PMSStats {
  totalJobs: number;
  overdue: number;
  dueThisWeek: number;
  dueThisMonth: number;
  completed: number;
  complianceRate: number;
  classJobs: number;
  avgCompletionTime: number;
}

// Fetch all PMS jobs - returns empty array until work_orders table is created
export function usePMSJobs(_vesselId?: string) {
  return useQuery({
    queryKey: ['pms-jobs', _vesselId],
    queryFn: async (): Promise<PMSJob[]> => {
      // Table work_orders doesn't exist yet
      // Return empty array for now
      return [];
    },
  });
}

// Fetch PMS statistics
export function usePMSStats() {
  return useQuery({
    queryKey: ['pms-stats'],
    queryFn: async (): Promise<PMSStats> => {
      return {
        totalJobs: 0,
        overdue: 0,
        dueThisWeek: 0,
        dueThisMonth: 0,
        completed: 0,
        complianceRate: 100,
        classJobs: 0,
        avgCompletionTime: 0,
      };
    },
  });
}
