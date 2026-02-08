/**
 * Hook para dados reais de Pagamentos do Funcionário
 * Substitui MOCK_PAYMENTS e MOCK_SUMMARY em EmployeePaymentsHistory.tsx
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Payment {
  id: string;
  type: "salary" | "allowance" | "bonus" | "overtime" | "deduction";
  description: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "processing";
  reference?: string;
}

export interface PaymentSummary {
  grossSalary: number;
  allowances: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
}

export function usePayrollData(selectedPeriod: string = "all") {
  const { data, isLoading } = useQuery({
    queryKey: ["payroll-data", selectedPeriod],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { payments: [], summary: getEmptySummary() };

      // Get current crew member
      const { data: crewMember } = await supabase
        .from("crew_members")
        .select("id")
        .or(`auth_user_id.eq.${user.id},user_id.eq.${user.id}`)
        .single();

      if (!crewMember) return { payments: [], summary: getEmptySummary() };

      // Buscar salário base do contrato ativo
      const { data: contract } = await supabase
        .from("crew_contracts")
        .select("base_salary")
        .eq("crew_member_id", crewMember.id)
        .eq("status", "active")
        .order("start_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      const baseSalary = contract?.base_salary || 0;

      // Fetch from expenses (using expenses as payment records)
      // expenses table columns: date, amount, category, description, status
      const { data: expenses, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false })
        .limit(50);

      if (error) throw error;

      const payments: Payment[] = (expenses || []).map((e: any) => ({
        id: e.id,
        type: mapCategoryToType(e.category),
        description: e.description || e.category || "Pagamento",
        amount: e.amount || 0,
        date: e.date || e.created_at,
        status: e.status === "approved" ? "paid" : e.status === "pending" ? "pending" : "processing",
        reference: undefined,
      }));

      // Calculate summary
      const grossSalary = baseSalary;
      const allowances = payments.filter(p => p.type === "allowance").reduce((sum, p) => sum + Math.abs(p.amount), 0);
      const bonuses = payments.filter(p => p.type === "bonus" || p.type === "overtime").reduce((sum, p) => sum + Math.abs(p.amount), 0);
      const deductions = payments.filter(p => p.type === "deduction").reduce((sum, p) => sum + Math.abs(p.amount), 0);

      const summary: PaymentSummary = {
        grossSalary,
        allowances,
        bonuses,
        deductions,
        netSalary: grossSalary + allowances + bonuses - deductions,
      };

      return { payments, summary };
    },
  });

  return {
    payments: data?.payments || [],
    summary: data?.summary || getEmptySummary(),
    isLoading,
  };
}

function mapCategoryToType(category: string): Payment["type"] {
  if (!category) return "salary";
  const cat = category.toLowerCase();
  if (cat.includes("salary") || cat.includes("salário")) return "salary";
  if (cat.includes("allowance") || cat.includes("adicional") || cat.includes("diária")) return "allowance";
  if (cat.includes("bonus") || cat.includes("gratificação")) return "bonus";
  if (cat.includes("overtime") || cat.includes("hora extra")) return "overtime";
  if (cat.includes("deduction") || cat.includes("desconto") || cat.includes("inss") || cat.includes("irrf")) return "deduction";
  return "salary";
}

function getEmptySummary(): PaymentSummary {
  return {
    grossSalary: 0,
    allowances: 0,
    bonuses: 0,
    deductions: 0,
    netSalary: 0,
  };
}
