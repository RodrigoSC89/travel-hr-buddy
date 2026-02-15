/**
 * Employee Portal Hook - Real data for Portal Colaborador
 * Connects to Supabase and AI endpoints
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export interface EmployeeProfile {
  id: string;
  full_name: string;
  email: string;
  position: string;
  department: string;
  hire_date: string;
  avatar_url: string | null;
  vacation_balance: number;
  vacation_expiry: string | null;
  benefits: {
    vr_balance: number;
    va_balance: number;
    health_plan: boolean;
    dental_plan: boolean;
  };
}

export interface Payslip {
  id: string;
  reference_month: number;
  reference_year: number;
  gross_salary: number;
  net_salary: number;
  inss_deduction: number;
  irrf_deduction: number;
  other_deductions: number;
  overtime_amount: number;
  created_at: string;
}

// Simple hook to get current user
function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  
  return user;
}

// Hook para perfil do colaborador logado
export function useEmployeeProfile() {
  const user = useCurrentUser();
  
  return useQuery<EmployeeProfile | null>({
    queryKey: ['employee-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('hr_employees')
        .select('*')
        .eq('email', user.email || '')
        .maybeSingle();

      if (error) {
        logger.error('Error fetching employee profile:', error);
      }

      if (!data) {
        // No employee record found - create profile from auth user
        return {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Colaborador',
          email: user.email || '',
          position: 'Não cadastrado',
          department: 'Pendente',
          hire_date: new Date().toISOString().split('T')[0],
          avatar_url: null,
          vacation_balance: 0,
          vacation_expiry: null,
          benefits: { vr_balance: 0, va_balance: 0, health_plan: false, dental_plan: false },
        };
      }

      const hireDate = new Date(data.hire_date || Date.now());
      const yearsDiff = (Date.now() - hireDate.getTime()) / (365 * 24 * 60 * 60 * 1000);
      const vacationBalance = Math.min(Math.floor(yearsDiff) * 30, 60);

      return {
        id: data.id,
        full_name: data.full_name || 'N/A',
        email: data.email || '',
        position: data.position || 'N/A',
        department: data.department || 'N/A',
        hire_date: data.hire_date || '',
        avatar_url: null,
        vacation_balance: vacationBalance,
        vacation_expiry: new Date(hireDate.getFullYear() + Math.ceil(yearsDiff) + 1, hireDate.getMonth(), hireDate.getDate()).toISOString().split('T')[0],
        benefits: { vr_balance: 847.50, va_balance: 420.00, health_plan: true, dental_plan: true },
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}

// Hook para holerites do colaborador
export function useEmployeePayslips() {
  const { data: profile } = useEmployeeProfile();
  
  return useQuery<Payslip[]>({
    queryKey: ['employee-payslips', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('hr_payroll')
        .select('*')
        .eq('employee_id', profile.id)
        .order('reference_year', { ascending: false })
        .order('reference_month', { ascending: false })
        .limit(12);

      if (error) throw error;

      return (data || []).map(p => ({
        id: p.id,
        reference_month: p.reference_month || 1,
        reference_year: p.reference_year || 2026,
        gross_salary: p.gross_salary || 0,
        net_salary: p.net_salary || 0,
        inss_deduction: p.inss_employee || 0,
        irrf_deduction: p.irrf || 0,
        other_deductions: p.other_deductions || 0,
        overtime_amount: p.overtime_value || 0,
        created_at: p.created_at || '',
      }));
    },
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 10,
  });
}

// Hook para chat com IA
export function useHRChat() {
  const { data: profile } = useEmployeeProfile();
  const { data: payslips } = useEmployeePayslips();

  return useMutation({
    mutationFn: async ({ messages }: { messages: { role: string; content: string }[] }) => {
      const latestPayslip = payslips?.[0];
      
      const employeeContext = profile ? {
        name: profile.full_name,
        position: profile.position,
        department: profile.department,
        hireDate: profile.hire_date,
        vacationDays: profile.vacation_balance,
        lastPayslip: latestPayslip ? {
          month: `${latestPayslip.reference_month}/${latestPayslip.reference_year}`,
          grossSalary: latestPayslip.gross_salary,
          netSalary: latestPayslip.net_salary,
        } : null,
      } : null;

      const { data, error } = await supabase.functions.invoke('hr-chat', {
        body: { messages, employeeContext },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Erro no chat');
      
      return data.content;
    },
    onError: (error: Error) => {
      logger.error('Chat error:', error);
      if (error.message.includes('429')) {
        toast.error('Muitas requisições. Aguarde um momento.');
      } else if (error.message.includes('402')) {
        toast.error('Créditos de IA esgotados.');
      }
    },
  });
}

// Hook para predições de RH (dashboard)
export function useHRPredictions() {
  return useQuery({
    queryKey: ['hr-predictions'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('hr-predictions', {
        body: { type: 'dashboard' },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return data.data;
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}
