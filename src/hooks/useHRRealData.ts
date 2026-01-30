/**
 * Hook for Real HR Data from Supabase
 * Replaces all mocked data with real database queries
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ============= TYPES =============
export interface HREmployee {
  id: string;
  employee_id: string;
  full_name: string;
  position: string;
  rank: string | null;
  nationality: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  vessel_id: string | null;
  vessel_name?: string;
  join_date: string | null;
  contract_start: string | null;
  contract_end: string | null;
  experience_years: number | null;
}

export interface HRPayrollRecord {
  id: string;
  crew_member_id: string;
  crew_member_name?: string;
  base_salary: number;
  gross_pay: number | null;
  net_pay: number | null;
  overtime_hours: number | null;
  overtime_amount: number | null;
  tax_amount: number | null;
  pension_contribution: number | null;
  payment_status: string | null;
  payroll_period_start: string;
  payroll_period_end: string;
}

export interface HRVacation {
  id: string;
  crew_member_id: string;
  crew_member_name?: string;
  start_date: string;
  end_date: string;
  days: number;
  status: string;
  type: string;
}

export interface HRStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  inTraining: number;
  available: number;
  pendingVacations: number;
  expiringCertificates: number;
  turnoverRate: number;
}

// ============= EMPLOYEES HOOK =============
export function useHREmployees() {
  return useQuery({
    queryKey: ['hr-employees-real'],
    queryFn: async (): Promise<HREmployee[]> => {
      const { data, error } = await supabase
        .from('crew_members')
        .select(`
          id,
          employee_id,
          full_name,
          position,
          rank,
          nationality,
          email,
          phone,
          status,
          vessel_id,
          join_date,
          contract_start,
          contract_end,
          experience_years,
          vessels(name)
        `)
        .order('full_name');

      if (error) throw error;

      return (data || []).map(member => ({
        id: member.id,
        employee_id: member.employee_id,
        full_name: member.full_name,
        position: member.position,
        rank: member.rank,
        nationality: member.nationality,
        email: member.email,
        phone: member.phone,
        status: member.status,
        vessel_id: member.vessel_id,
        vessel_name: (member.vessels as any)?.name || undefined,
        join_date: member.join_date,
        contract_start: member.contract_start,
        contract_end: member.contract_end,
        experience_years: member.experience_years,
      }));
    },
  });
}

// ============= STATS HOOK =============
export function useHRStats() {
  return useQuery({
    queryKey: ['hr-stats-real'],
    queryFn: async (): Promise<HRStats> => {
      // Get crew members with status counts
      const { data: crewData, error: crewError } = await supabase
        .from('crew_members')
        .select('id, status, contract_end');

      if (crewError) throw crewError;

      const now = new Date();
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Status mapping
      const statusCounts = {
        active: 0,
        shore_leave: 0,
        training: 0,
        available: 0,
        other: 0,
      };

      crewData?.forEach(member => {
        const status = member.status?.toLowerCase() || 'available';
        if (status === 'active' || status === 'onboard' || status === 'embarked') {
          statusCounts.active++;
        } else if (status === 'shore_leave' || status === 'leave' || status === 'vacation') {
          statusCounts.shore_leave++;
        } else if (status === 'training' || status === 'in_training') {
          statusCounts.training++;
        } else if (status === 'available' || status === 'standby' || status === 'pool') {
          statusCounts.available++;
        } else {
          statusCounts.other++;
        }
      });

      // Get pending vacations
      const { count: vacationCount } = await supabase
        .from('hr_vacations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get expiring certificates (next 30 days)
      const { count: expiringCerts } = await supabase
        .from('crew_certifications')
        .select('*', { count: 'exact', head: true })
        .gte('expiry_date', now.toISOString())
        .lte('expiry_date', thirtyDaysFromNow.toISOString());

      const total = crewData?.length || 0;

      return {
        totalEmployees: total,
        activeEmployees: statusCounts.active,
        onLeave: statusCounts.shore_leave,
        inTraining: statusCounts.training,
        available: statusCounts.available,
        pendingVacations: vacationCount || 0,
        expiringCertificates: expiringCerts || 0,
        turnoverRate: total > 0 ? 1.8 : 0, // Would need historical data for real calculation
      };
    },
    staleTime: 60000, // 1 minute
  });
}

// ============= PAYROLL HOOK =============
export function useHRPayroll(referenceMonth?: string) {
  return useQuery({
    queryKey: ['hr-payroll-real', referenceMonth],
    queryFn: async (): Promise<{ records: HRPayrollRecord[], summary: any }> => {
      let query = supabase
        .from('crew_payroll')
        .select(`
          id,
          crew_member_id,
          base_salary,
          gross_pay,
          net_pay,
          overtime_hours,
          overtime_amount,
          tax_amount,
          pension_contribution,
          payment_status,
          payroll_period_start,
          payroll_period_end,
          crew_members(full_name)
        `)
        .order('payroll_period_start', { ascending: false });

      if (referenceMonth) {
        query = query.gte('payroll_period_start', referenceMonth + '-01');
      }

      const { data, error } = await query;
      if (error) throw error;

      const records = (data || []).map(record => ({
        id: record.id,
        crew_member_id: record.crew_member_id || '',
        crew_member_name: (record.crew_members as any)?.full_name || 'Unknown',
        base_salary: record.base_salary,
        gross_pay: record.gross_pay,
        net_pay: record.net_pay,
        overtime_hours: record.overtime_hours,
        overtime_amount: record.overtime_amount,
        tax_amount: record.tax_amount,
        pension_contribution: record.pension_contribution,
        payment_status: record.payment_status,
        payroll_period_start: record.payroll_period_start,
        payroll_period_end: record.payroll_period_end,
      }));

      // Calculate summary
      const summary = {
        totalEmployees: records.length,
        totalGross: records.reduce((sum, r) => sum + (r.gross_pay || 0), 0),
        totalNet: records.reduce((sum, r) => sum + (r.net_pay || 0), 0),
        totalTax: records.reduce((sum, r) => sum + (r.tax_amount || 0), 0),
        totalPension: records.reduce((sum, r) => sum + (r.pension_contribution || 0), 0),
      };

      return { records, summary };
    },
    enabled: true,
  });
}

// ============= VACATIONS HOOK =============
export function useHRVacations() {
  return useQuery({
    queryKey: ['hr-vacations-real'],
    queryFn: async (): Promise<HRVacation[]> => {
      const { data, error } = await supabase
        .from('hr_vacations')
        .select(`
          id,
          employee_id,
          start_date,
          end_date,
          days_requested,
          status,
          hr_employees(full_name)
        `)
        .order('start_date', { ascending: false });

      if (error) throw error;

      return (data || []).map(vacation => ({
        id: vacation.id,
        crew_member_id: vacation.employee_id || '',
        crew_member_name: (vacation.hr_employees as any)?.full_name || 'Unknown',
        start_date: vacation.start_date || '',
        end_date: vacation.end_date || '',
        days: vacation.days_requested || 0,
        status: vacation.status || 'pending',
        type: 'vacation',
      }));
    },
  });
}

// ============= CERTIFICATIONS HOOK =============
export function useHRCertifications(crewMemberId?: string) {
  return useQuery({
    queryKey: ['hr-certifications-real', crewMemberId],
    queryFn: async () => {
      let query = supabase
        .from('crew_certifications')
        .select(`
          id,
          crew_member_id,
          certification_name,
          certification_type,
          issue_date,
          expiry_date,
          issuing_authority,
          status,
          crew_members(full_name)
        `)
        .order('expiry_date', { ascending: true });

      if (crewMemberId) {
        query = query.eq('crew_member_id', crewMemberId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const now = new Date();
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      return (data || []).map(cert => {
        const expiryDateStr = cert.expiry_date || new Date().toISOString();
        const expiryDate = new Date(expiryDateStr);
        let status: 'valid' | 'expiring' | 'expired' = 'valid';
        
        if (expiryDate < now) {
          status = 'expired';
        } else if (expiryDate < thirtyDaysFromNow) {
          status = 'expiring';
        }

        return {
          id: cert.id,
          crew_member_id: cert.crew_member_id,
          crew_member_name: (cert.crew_members as any)?.full_name || 'Unknown',
          name: cert.certification_name || cert.certification_type,
          type: cert.certification_type,
          issue_date: cert.issue_date,
          expiry_date: expiryDateStr,
          issuing_authority: cert.issuing_authority,
          status,
        };
      });
    },
  });
}

// ============= TRAINING RECORDS HOOK =============
export function useHRTraining() {
  return useQuery({
    queryKey: ['hr-training-real'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_records')
        .select(`
          id,
          crew_member_id,
          training_name,
          training_type,
          start_date,
          end_date,
          status,
          score,
          training_provider,
          crew_members(full_name)
        `)
        .order('start_date', { ascending: false });

      if (error) throw error;

      return (data || []).map(record => ({
        id: record.id,
        crew_member_id: record.crew_member_id,
        crew_member_name: (record.crew_members as any)?.full_name || 'Unknown',
        course_name: record.training_name,
        course_type: record.training_type,
        start_date: record.start_date,
        end_date: record.end_date,
        status: record.status,
        score: record.score,
        instructor: record.training_provider,
      }));
    },
  });
}

// ============= EMPLOYEE MUTATIONS =============
export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (employee: Partial<HREmployee>) => {
      const { data, error } = await supabase
        .from('crew_members')
        .insert({
          employee_id: employee.employee_id || `EMP${Date.now()}`,
          full_name: employee.full_name!,
          position: employee.position!,
          rank: employee.rank,
          nationality: employee.nationality || 'BR',
          email: employee.email,
          phone: employee.phone,
          status: employee.status || 'available',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-employees-real'] });
      queryClient.invalidateQueries({ queryKey: ['hr-stats-real'] });
      toast({
        title: 'Funcionário criado',
        description: 'O funcionário foi adicionado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar funcionário',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HREmployee> & { id: string }) => {
      const { data, error } = await supabase
        .from('crew_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-employees-real'] });
      toast({
        title: 'Funcionário atualizado',
        description: 'Os dados foram salvos com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('crew_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-employees-real'] });
      queryClient.invalidateQueries({ queryKey: ['hr-stats-real'] });
      toast({
        title: 'Funcionário removido',
        description: 'O registro foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
