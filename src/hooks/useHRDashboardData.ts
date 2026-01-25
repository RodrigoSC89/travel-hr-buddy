/**
 * Hook para dados do HR Dashboard
 * Substitui dados mockados por queries reais ao Supabase
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HREmployee {
  id: string;
  name: string;
  rank: string;
  position: string;
  vessel: string | null;
  status: 'active' | 'on_leave' | 'training' | 'available';
  contract_end: string | null;
  certifications_count: number;
  email?: string;
  phone?: string;
  nationality?: string;
  join_date?: string;
}

export interface HRDashboardStats {
  totalCrew: number;
  activeOnboard: number;
  onLeave: number;
  inTraining: number;
  available: number;
  expiringDocuments: number;
  contractsEndingSoon: number;
}

export function useHRDashboardData() {
  const employeesQuery = useQuery({
    queryKey: ['hr-dashboard-employees'],
    queryFn: async (): Promise<HREmployee[]> => {
      const { data, error } = await supabase
        .from('crew_members')
        .select(`
          id,
          full_name,
          rank,
          position,
          vessel_id,
          status,
          contract_end,
          email,
          phone,
          nationality,
          join_date,
          vessels!crew_members_vessel_id_fkey(name)
        `)
        .order('full_name');

      if (error) throw error;

      // Get document counts per crew member
      const { data: docData } = await supabase
        .from('crew_documents')
        .select('crew_member_id');

      const docCountMap = new Map<string, number>();
      docData?.forEach(doc => {
        const count = docCountMap.get(doc.crew_member_id) || 0;
        docCountMap.set(doc.crew_member_id, count + 1);
      });

      return (data || []).map(member => ({
        id: member.id,
        name: member.full_name,
        rank: member.rank || 'Unassigned',
        position: member.position || 'General',
        vessel: (member.vessels as any)?.name || null,
        status: mapStatus(member.status),
        contract_end: member.contract_end,
        certifications_count: docCountMap.get(member.id) || 0,
        email: member.email ?? undefined,
        phone: member.phone ?? undefined,
        nationality: member.nationality ?? undefined,
        join_date: member.join_date ?? undefined,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const statsQuery = useQuery({
    queryKey: ['hr-dashboard-stats'],
    queryFn: async (): Promise<HRDashboardStats> => {
      const { data: crewData, error } = await supabase
        .from('crew_members')
        .select('id, status, contract_end');

      if (error) throw error;

      const now = new Date();
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const statusCounts = {
        active: 0,
        on_leave: 0,
        training: 0,
        available: 0,
      };

      let contractsEndingSoon = 0;

      crewData?.forEach(member => {
        const status = mapStatus(member.status);
        statusCounts[status]++;

        if (member.contract_end) {
          const endDate = new Date(member.contract_end);
          if (endDate <= thirtyDaysFromNow && endDate >= now) {
            contractsEndingSoon++;
          }
        }
      });

      // Get documents count
      const { count: docCount } = await supabase
        .from('crew_documents')
        .select('*', { count: 'exact', head: true });

      return {
        totalCrew: crewData?.length || 0,
        activeOnboard: statusCounts.active,
        onLeave: statusCounts.on_leave,
        inTraining: statusCounts.training,
        available: statusCounts.available,
        expiringDocuments: docCount || 0,
        contractsEndingSoon,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    employees: employeesQuery.data || [],
    stats: statsQuery.data,
    isLoading: employeesQuery.isLoading || statsQuery.isLoading,
    error: employeesQuery.error || statsQuery.error,
    refetch: () => {
      employeesQuery.refetch();
      statsQuery.refetch();
    },
  };
}

function mapStatus(status: string | null): 'active' | 'on_leave' | 'training' | 'available' {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'onboard':
    case 'embarked':
      return 'active';
    case 'on_leave':
    case 'leave':
    case 'vacation':
      return 'on_leave';
    case 'training':
    case 'in_training':
      return 'training';
    case 'available':
    case 'standby':
    case 'pool':
    default:
      return 'available';
  }
}
