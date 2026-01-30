/**
 * Hook for Crewing & Payroll AI Module
 * Crew planning, rotation scheduling, payroll automation, MLC compliance
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CrewMemberPayroll {
  id: string;
  name: string;
  position: string;
  vesselId: string;
  employmentType: 'permanent' | 'contract' | 'temporary';
  salary: {
    base: number;
    currency: string;
    paymentFrequency: 'monthly' | 'weekly' | 'daily';
  };
  allowances: Array<{ type: string; amount: number }>;
  deductions: Array<{ type: string; amount: number }>;
  bankDetails: { bank: string; account: string; swift: string };
  taxInfo: { country: string; taxId: string };
}

export interface PayrollCalculation {
  crewMemberId: string;
  period: string;
  baseSalary: number;
  overtime: { hours: number; rate: number; amount: number };
  allowances: Array<{ type: string; amount: number }>;
  deductions: Array<{ type: string; amount: number }>;
  grossPay: number;
  netPay: number;
  currency: string;
  exchangeRate?: number;
  mlcCompliance: { restHours: boolean; wages: boolean; leave: boolean };
}

export interface RotationPlan {
  crewMemberId: string;
  crewName: string;
  position: string;
  currentStatus: 'on_board' | 'on_leave' | 'standby' | 'training';
  currentVessel?: string;
  embarked?: string;
  plannedRelief: string;
  reliefName?: string;
  rotationCycle: { onBoard: number; leave: number };
  travelArrangements?: {
    outbound: { date: string; flight: string; from: string; to: string };
    inbound: { date: string; flight: string; from: string; to: string };
  };
  visaStatus: Array<{ country: string; status: string; expiry: string }>;
}

export interface TravelBooking {
  id: string;
  crewMemberId: string;
  type: 'flight' | 'hotel' | 'transfer';
  status: 'pending' | 'confirmed' | 'cancelled';
  details: {
    provider: string;
    reference: string;
    date: string;
    from?: string;
    to?: string;
    cost: number;
  };
}

export function useCrewingPayrollAI() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatePayroll = useCallback(async (
    crewMemberIds: string[],
    period: string
  ): Promise<PayrollCalculation[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('crewing-payroll-ai', {
        body: { 
          action: 'calculate_payroll',
          crewMemberIds,
          period
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Folha Calculada',
        description: `${data.payrollCalculations?.length || 0} tripulantes processados`,
      });

      return data.payrollCalculations;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao calcular folha';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getRotationPlan = useCallback(async (
    vesselId?: string
  ): Promise<RotationPlan[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('crewing-payroll-ai', {
        body: { 
          action: 'get_rotation_plan',
          vesselId
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.rotationPlans;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar rotações';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const planRotation = useCallback(async (
    crewMemberId: string,
    reliefDate: string,
    reliefId?: string
  ): Promise<RotationPlan | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('crewing-payroll-ai', {
        body: { 
          action: 'plan_rotation',
          crewMemberId,
          reliefDate,
          reliefId
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Rotação Planejada',
        description: `Rendição programada para ${reliefDate}`,
      });

      return data.rotationPlan;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao planejar rotação';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const bookTravel = useCallback(async (
    crewMemberId: string,
    travelType: 'embark' | 'disembark',
    details: { date: string; port: string; homeLocation: string }
  ): Promise<TravelBooking[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('crewing-payroll-ai', {
        body: { 
          action: 'book_travel',
          crewMemberId,
          travelType,
          details
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Viagem Reservada',
        description: 'Confirmação enviada por e-mail',
      });

      return data.travelBookings;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao reservar viagem';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const checkMLCCompliance = useCallback(async (
    vesselId: string
  ): Promise<{
    overallCompliance: number;
    workHours: { compliant: number; violations: number };
    wages: { compliant: boolean; issues: string[] };
    leave: { entitled: number; taken: number; balance: number };
    certificates: Array<{ name: string; status: string; expiry: string }>;
    recommendations: string[];
  } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('crewing-payroll-ai', {
        body: { 
          action: 'check_mlc_compliance',
          vesselId
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.mlcCompliance;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao verificar MLC';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCrewPayroll = useCallback(async (
    vesselId?: string
  ): Promise<CrewMemberPayroll[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('crewing-payroll-ai', {
        body: { 
          action: 'get_crew_payroll',
          vesselId
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.crewPayroll;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar dados de folha';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processPayment = useCallback(async (
    payrollIds: string[]
  ): Promise<{ processed: number; failed: number; totalAmount: number } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('crewing-payroll-ai', {
        body: { 
          action: 'process_payment',
          payrollIds
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Pagamentos Processados',
        description: `${data.paymentResult?.processed || 0} pagamentos efetuados`,
      });

      return data.paymentResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao processar pagamentos';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    error,
    calculatePayroll,
    getRotationPlan,
    planRotation,
    bookTravel,
    checkMLCCompliance,
    getCrewPayroll,
    processPayment
  };
}
