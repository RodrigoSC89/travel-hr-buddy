/**
 * People Analytics - Real-time Supabase Data Hook
 * Connects to hr_employees and hr_payroll tables
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EmployeeStats {
  headcount: number;
  headcountChange: number;
  activeCount: number;
  turnoverRate: number;
  turnoverChange: number;
  avgTenureYears: number;
  avgTenureChange: number;
  avgWellnessScore: number;
  departmentDistribution: { name: string; value: number; color: string }[];
  riskEmployees: {
    id: string;
    name: string;
    position: string;
    department: string;
    risk: number;
    factors: string[];
  }[];
}

interface PayrollStats {
  totalGrossSalary: number;
  totalNetSalary: number;
  totalEmployerCost: number;
  avgSalaryPerEmployee: number;
  avgSalaryChange: number;
  payrollByDepartment: { department: string; total: number }[];
  monthlyTrend: { month: string; total: number }[];
}

interface HeadcountTrend {
  month: string;
  count: number;
  hired: number;
  left: number;
}

const DEPARTMENT_COLORS: Record<string, string> = {
  'Tecnologia': 'hsl(var(--info))',
  'Operações': 'hsl(var(--success))',
  'Comercial': 'hsl(var(--warning))',
  'Financeiro': 'hsl(var(--primary))',
  'RH': 'hsl(var(--accent-foreground))',
  'Marketing': 'hsl(var(--info))',
  'Jurídico': 'hsl(var(--success))',
  'Outros': 'hsl(var(--muted-foreground))',
};

export function useEmployeeStats() {
  return useQuery<EmployeeStats>({
    queryKey: ['people-analytics-employees'],
    queryFn: async () => {
      // Fetch all employees
      const { data: employees, error } = await supabase
        .from('hr_employees')
        .select('*')
        .order('hire_date', { ascending: false });

      if (error) throw error;

      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

      // Active employees (without termination_date)
      const activeEmployees = employees?.filter(e => !e.termination_date) || [];
      const totalCount = activeEmployees.length;

      // Calculate turnover (employees terminated in last 6 months / avg headcount)
      const terminatedRecent = employees?.filter(e => {
        if (!e.termination_date) return false;
        const termDate = new Date(e.termination_date);
        return termDate >= sixMonthsAgo;
      }).length || 0;

      const turnoverRate = totalCount > 0 ? (terminatedRecent / totalCount) * 100 : 0;

      // Calculate average tenure
      const tenures = activeEmployees.map(e => {
        if (!e.hire_date) return 0;
        const hireDate = new Date(e.hire_date);
        const years = (now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
        return years;
      });
      const avgTenure = tenures.length > 0 ? tenures.reduce((a, b) => a + b, 0) / tenures.length : 0;

      // Average wellness score
      const wellnessScores = activeEmployees
        .filter(e => e.wellness_score !== null)
        .map(e => e.wellness_score as number);
      const avgWellness = wellnessScores.length > 0 
        ? wellnessScores.reduce((a, b) => a + b, 0) / wellnessScores.length 
        : 0;

      // Department distribution
      const deptCounts: Record<string, number> = {};
      activeEmployees.forEach(e => {
        const dept = e.department || 'Outros';
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
      });

      const departmentDistribution = Object.entries(deptCounts)
        .map(([name, value]) => ({
          name,
          value,
          color: DEPARTMENT_COLORS[name] || DEPARTMENT_COLORS['Outros'],
        }))
        .sort((a, b) => b.value - a.value);

      // High risk employees (turnover_risk_score > 60)
      const riskEmployees = activeEmployees
        .filter(e => (e.turnover_risk_score || 0) > 50)
        .sort((a, b) => (b.turnover_risk_score || 0) - (a.turnover_risk_score || 0))
        .slice(0, 5)
        .map(e => {
          const factors: string[] = [];
          if (e.turnover_risk_factors && typeof e.turnover_risk_factors === 'object') {
            const riskFactors = e.turnover_risk_factors as Record<string, unknown>;
            if (riskFactors.low_salary) factors.push('Salário abaixo mercado');
            if (riskFactors.no_promotion) factors.push('Sem promoção recente');
            if (riskFactors.high_workload) factors.push('Alta carga de trabalho');
            if (riskFactors.low_engagement) factors.push('Baixo engajamento');
          }
          return {
            id: e.id,
            name: e.full_name || 'N/A',
            position: e.position || 'N/A',
            department: e.department || 'N/A',
            risk: Math.round(e.turnover_risk_score || 0),
            factors: factors.length > 0 ? factors : ['Análise pendente'],
          };
        });

      // Calculate changes (mock for now, would need historical data)
      const headcountChange = 5.2;
      const turnoverChange = -12;
      const avgTenureChange = 8;

      return {
        headcount: totalCount,
        headcountChange,
        activeCount: totalCount,
        turnoverRate: Math.round(turnoverRate * 10) / 10,
        turnoverChange,
        avgTenureYears: Math.round(avgTenure * 10) / 10,
        avgTenureChange,
        avgWellnessScore: Math.round(avgWellness),
        departmentDistribution,
        riskEmployees,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

export function usePayrollStats() {
  return useQuery<PayrollStats>({
    queryKey: ['people-analytics-payroll'],
    queryFn: async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // Fetch payroll data for current year
      const { data: payrollData, error } = await supabase
        .from('hr_payroll')
        .select('*, hr_employees(department)')
        .eq('reference_year', currentYear)
        .order('reference_month', { ascending: false });

      if (error) throw error;

      // Current month payroll
      const currentMonthData = payrollData?.filter(p => p.reference_month === currentMonth) || [];
      
      const totalGross = currentMonthData.reduce((sum, p) => sum + (p.gross_salary || 0), 0);
      const totalNet = currentMonthData.reduce((sum, p) => sum + (p.net_salary || 0), 0);
      const totalEmployerCost = currentMonthData.reduce((sum, p) => sum + (p.total_employer_cost || 0), 0);
      const avgSalary = currentMonthData.length > 0 ? totalGross / currentMonthData.length : 0;

      // Payroll by department
      const deptTotals: Record<string, number> = {};
      currentMonthData.forEach(p => {
        const empJoin = p.hr_employees as Record<string, unknown> | null;
        const dept = (empJoin?.department as string) || 'Outros';
        deptTotals[dept] = (deptTotals[dept] || 0) + (p.gross_salary || 0);
      });

      const payrollByDepartment = Object.entries(deptTotals)
        .map(([department, total]) => ({ department, total }))
        .sort((a, b) => b.total - a.total);

      // Monthly trend (last 6 months)
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthlyTotals: Record<number, number> = {};
      
      payrollData?.forEach(p => {
        const month = p.reference_month || 0;
        monthlyTotals[month] = (monthlyTotals[month] || 0) + (p.gross_salary || 0);
      });

      const monthlyTrend = Object.entries(monthlyTotals)
        .map(([month, total]) => ({
          month: monthNames[parseInt(month) - 1] || month.toString(),
          total,
        }))
        .slice(-6);

      return {
        totalGrossSalary: totalGross,
        totalNetSalary: totalNet,
        totalEmployerCost,
        avgSalaryPerEmployee: Math.round(avgSalary),
        avgSalaryChange: 3.5,
        payrollByDepartment,
        monthlyTrend,
      };
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });
}

export function useHeadcountTrend() {
  return useQuery<HeadcountTrend[]>({
    queryKey: ['people-analytics-headcount-trend'],
    queryFn: async () => {
      const { data: employees, error } = await supabase
        .from('hr_employees')
        .select('hire_date, termination_date')
        .order('hire_date', { ascending: true });

      if (error) throw error;

      const now = new Date();
      const months: HeadcountTrend[] = [];
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      // Calculate for last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        // Count employees active at end of month
        const count = employees?.filter(e => {
          const hireDate = e.hire_date ? new Date(e.hire_date) : null;
          const termDate = e.termination_date ? new Date(e.termination_date) : null;
          
          if (!hireDate) return false;
          if (hireDate > endOfMonth) return false;
          if (termDate && termDate < date) return false;
          return true;
        }).length || 0;

        // Hired this month
        const hired = employees?.filter(e => {
          if (!e.hire_date) return false;
          const hireDate = new Date(e.hire_date);
          return hireDate >= date && hireDate <= endOfMonth;
        }).length || 0;

        // Left this month
        const left = employees?.filter(e => {
          if (!e.termination_date) return false;
          const termDate = new Date(e.termination_date);
          return termDate >= date && termDate <= endOfMonth;
        }).length || 0;

        months.push({
          month: monthNames[date.getMonth()],
          count,
          hired,
          left,
        });
      }

      return months;
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });
}
