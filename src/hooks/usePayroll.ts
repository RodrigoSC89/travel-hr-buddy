/**
 * usePayroll - Hook para cálculo de folha de pagamento
 * Suporta cálculo CLT brasileiro com INSS, IRRF, FGTS
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Tabela INSS 2024
const INSS_TABLE = [
  { min: 0, max: 1412.00, rate: 0.075 },
  { min: 1412.01, max: 2666.68, rate: 0.09 },
  { min: 2666.69, max: 4000.03, rate: 0.12 },
  { min: 4000.04, max: 7786.02, rate: 0.14 },
];

// Tabela IRRF 2024
const IRRF_TABLE = [
  { min: 0, max: 2259.20, rate: 0, deduction: 0 },
  { min: 2259.21, max: 2826.65, rate: 0.075, deduction: 169.44 },
  { min: 2826.66, max: 3751.05, rate: 0.15, deduction: 381.44 },
  { min: 3751.06, max: 4664.68, rate: 0.225, deduction: 662.77 },
  { min: 4664.69, max: Infinity, rate: 0.275, deduction: 896.00 },
];

const DEPENDENT_DEDUCTION = 189.59;
const FGTS_RATE = 0.08;

export interface PayrollEmployee {
  id: string;
  employee_id: string;
  full_name: string;
  position: string;
  department: string;
  base_salary: number;
  dependents: number;
  admission_date: string;
}

export interface PayrollCalculation {
  employee_id: string;
  employee_name: string;
  reference_month: string;
  // Proventos
  base_salary: number;
  overtime_hours: number;
  overtime_value: number;
  night_shift_hours: number;
  night_shift_value: number;
  hazard_pay: number;
  unhealthy_pay: number;
  bonus: number;
  commissions: number;
  other_earnings: number;
  gross_salary: number;
  // Descontos
  inss_value: number;
  irrf_value: number;
  other_deductions: number;
  advance_deduction: number;
  transport_voucher: number;
  meal_voucher: number;
  total_deductions: number;
  // Líquido
  net_salary: number;
  // Encargos empregador
  fgts_value: number;
  employer_inss: number;
  // Informações adicionais
  worked_days: number;
  absent_days: number;
}

export interface PayrollSummary {
  month: string;
  totalGross: number;
  totalNet: number;
  totalINSS: number;
  totalIRRF: number;
  totalFGTS: number;
  employeeCount: number;
}

export function usePayroll() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [calculations, setCalculations] = useState<PayrollCalculation[]>([]);
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calcular INSS progressivo
  const calculateINSS = useCallback((grossSalary: number): number => {
    let inss = 0;
    let remaining = grossSalary;

    for (const bracket of INSS_TABLE) {
      if (remaining <= 0) break;
      
      const bracketRange = bracket.max - bracket.min;
      const taxableInBracket = Math.min(remaining, bracketRange);
      inss += taxableInBracket * bracket.rate;
      remaining -= taxableInBracket;
    }

    // Teto INSS
    const ceiling = 7786.02 * 0.14;
    return Math.min(inss, ceiling);
  }, []);

  // Calcular IRRF
  const calculateIRRF = useCallback((grossSalary: number, inssValue: number, dependents: number): number => {
    const baseIRRF = grossSalary - inssValue - (dependents * DEPENDENT_DEDUCTION);
    
    if (baseIRRF <= 0) return 0;

    for (const bracket of IRRF_TABLE) {
      if (baseIRRF >= bracket.min && baseIRRF <= bracket.max) {
        const tax = (baseIRRF * bracket.rate) - bracket.deduction;
        return Math.max(0, tax);
      }
    }

    return 0;
  }, []);

  // Calcular hora extra (50%)
  const calculateOvertime = useCallback((baseSalary: number, hours: number): number => {
    const hourlyRate = baseSalary / 220; // 220 horas mensais padrão
    return hourlyRate * 1.5 * hours;
  }, []);

  // Calcular adicional noturno (20%)
  const calculateNightShift = useCallback((baseSalary: number, hours: number): number => {
    const hourlyRate = baseSalary / 220;
    return hourlyRate * 0.2 * hours;
  }, []);

  // Carregar funcionários para folha
  const loadEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('hr_employees')
        .select('id, full_name, position, department, base_salary, admission_date, metadata')
        .eq('status', 'active')
        .order('full_name');

      if (error) throw error;

      const formattedEmployees: PayrollEmployee[] = (data || []).map((emp) => ({
        id: emp.id,
        employee_id: emp.id,
        full_name: emp.full_name,
        position: emp.position || '',
        department: emp.department || '',
        base_salary: Number(emp.base_salary) || 0,
        dependents: (emp.metadata as any)?.dependents || 0,
        admission_date: emp.admission_date || '',
      }));

      setEmployees(formattedEmployees);
      return formattedEmployees;
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: 'Erro ao carregar funcionários',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Calcular folha de pagamento
  const calculatePayroll = useCallback(async (
    month: string, // formato: "2024-01"
    options?: {
      includeOvertime?: boolean;
      includeNightShift?: boolean;
    }
  ): Promise<PayrollCalculation[]> => {
    setIsCalculating(true);
    
    try {
      // Carregar funcionários se necessário
      let employeeList = employees;
      if (employeeList.length === 0) {
        employeeList = await loadEmployees();
      }

      // Carregar horas extras e adicionais do período
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;

      const { data: timeRecords } = await supabase
        .from('hr_time_tracking')
        .select('employee_id, overtime_hours, night_hours, worked_hours, absence_type')
        .gte('tracking_date', startDate)
        .lte('tracking_date', endDate);

      // Agrupar horas por funcionário
      const hoursMap = new Map<string, { overtime: number; nightShift: number; workedDays: number; absentDays: number }>();
      
      for (const record of timeRecords || []) {
        if (!record.employee_id) continue;
        
        const current = hoursMap.get(record.employee_id) || { overtime: 0, nightShift: 0, workedDays: 0, absentDays: 0 };
        current.overtime += Number(record.overtime_hours) || 0;
        current.nightShift += Number(record.night_hours) || 0;
        current.workedDays += record.worked_hours ? 1 : 0;
        current.absentDays += record.absence_type ? 1 : 0;
        hoursMap.set(record.employee_id, current);
      }

      const payrollCalcs: PayrollCalculation[] = employeeList.map((emp) => {
        const hours = hoursMap.get(emp.id) || { overtime: 0, nightShift: 0, workedDays: 22, absentDays: 0 };
        
        // Proventos
        const baseSalary = emp.base_salary;
        const overtimeValue = options?.includeOvertime ? calculateOvertime(baseSalary, hours.overtime) : 0;
        const nightShiftValue = options?.includeNightShift ? calculateNightShift(baseSalary, hours.nightShift) : 0;
        
        const grossSalary = baseSalary + overtimeValue + nightShiftValue;

        // Descontos
        const inssValue = calculateINSS(grossSalary);
        const irrfValue = calculateIRRF(grossSalary, inssValue, emp.dependents);
        const transportVoucher = grossSalary * 0.06; // 6% para VT
        const mealVoucher = 0; // Configurável
        
        const totalDeductions = inssValue + irrfValue + transportVoucher + mealVoucher;
        const netSalary = grossSalary - totalDeductions;

        // Encargos empregador
        const fgtsValue = grossSalary * FGTS_RATE;
        const employerINSS = grossSalary * 0.20; // RAT + Terceiros simplificado

        return {
          employee_id: emp.id,
          employee_name: emp.full_name,
          reference_month: month,
          base_salary: baseSalary,
          overtime_hours: hours.overtime,
          overtime_value: overtimeValue,
          night_shift_hours: hours.nightShift,
          night_shift_value: nightShiftValue,
          hazard_pay: 0,
          unhealthy_pay: 0,
          bonus: 0,
          commissions: 0,
          other_earnings: 0,
          gross_salary: grossSalary,
          inss_value: inssValue,
          irrf_value: irrfValue,
          other_deductions: 0,
          advance_deduction: 0,
          transport_voucher: transportVoucher,
          meal_voucher: mealVoucher,
          total_deductions: totalDeductions,
          net_salary: netSalary,
          fgts_value: fgtsValue,
          employer_inss: employerINSS,
          worked_days: hours.workedDays,
          absent_days: hours.absentDays,
        };
      });

      setCalculations(payrollCalcs);

      // Calcular resumo
      const payrollSummary: PayrollSummary = {
        month,
        totalGross: payrollCalcs.reduce((acc, c) => acc + c.gross_salary, 0),
        totalNet: payrollCalcs.reduce((acc, c) => acc + c.net_salary, 0),
        totalINSS: payrollCalcs.reduce((acc, c) => acc + c.inss_value, 0),
        totalIRRF: payrollCalcs.reduce((acc, c) => acc + c.irrf_value, 0),
        totalFGTS: payrollCalcs.reduce((acc, c) => acc + c.fgts_value, 0),
        employeeCount: payrollCalcs.length,
      };
      setSummary(payrollSummary);

      toast({
        title: 'Folha calculada com sucesso',
        description: `${payrollCalcs.length} funcionários processados`,
      });

      return payrollCalcs;
    } catch (error) {
      console.error('Error calculating payroll:', error);
      toast({
        title: 'Erro ao calcular folha',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsCalculating(false);
    }
  }, [employees, loadEmployees, calculateOvertime, calculateNightShift, calculateINSS, calculateIRRF, toast]);

  // Salvar folha no banco
  const savePayroll = useCallback(async (month: string): Promise<boolean> => {
    if (calculations.length === 0) {
      toast({
        title: 'Nenhum cálculo para salvar',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const records = calculations.map((calc) => ({
        employee_id: calc.employee_id,
        reference_month: month,
        base_salary: calc.base_salary,
        gross_salary: calc.gross_salary,
        net_salary: calc.net_salary,
        deductions: {
          inss: calc.inss_value,
          irrf: calc.irrf_value,
          transport_voucher: calc.transport_voucher,
          meal_voucher: calc.meal_voucher,
          other: calc.other_deductions,
        },
        earnings: {
          overtime: calc.overtime_value,
          night_shift: calc.night_shift_value,
          hazard_pay: calc.hazard_pay,
          unhealthy_pay: calc.unhealthy_pay,
          bonus: calc.bonus,
          commissions: calc.commissions,
        },
        taxes: {
          fgts: calc.fgts_value,
          employer_inss: calc.employer_inss,
        },
        status: 'calculated',
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('hr_payroll')
        .upsert(records, { onConflict: 'employee_id,reference_month' });

      if (error) throw error;

      toast({
        title: 'Folha salva com sucesso',
      });

      return true;
    } catch (error) {
      console.error('Error saving payroll:', error);
      toast({
        title: 'Erro ao salvar folha',
        variant: 'destructive',
      });
      return false;
    }
  }, [calculations, toast]);

  return {
    employees,
    calculations,
    summary,
    isLoading,
    isCalculating,
    loadEmployees,
    calculatePayroll,
    savePayroll,
    calculateINSS,
    calculateIRRF,
  };
}
