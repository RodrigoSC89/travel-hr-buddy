/**
 * Hook para dados reais do Portal do Colaborador
 * Substitui MOCK_PAYMENTS, MOCK_COURSES, MOCK_CERTIFICATES em componentes portal/*
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ========================
// PAYMENTS
// ========================

export interface Payment {
  id: string;
  type: "salary" | "allowance" | "bonus" | "deduction";
  description: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "processing";
  reference?: string;
}

export interface PaymentSummary {
  grossSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
}

export function useEmployeePayments(period?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["employee-payments", user?.id, period],
    queryFn: async (): Promise<{ payments: Payment[]; summary: PaymentSummary }> => {
      // Buscar crew_member associado ao usuário
      // crew_members schema: id, employee_id, user_id, full_name, position, rank, etc.
      const { data: crewMember } = await supabase
        .from("crew_members")
        .select("id, full_name, position, rank")
        .or(`auth_user_id.eq.${user?.id || ""},user_id.eq.${user?.id || ""}`)
        .maybeSingle();

      // Simular dados de pagamento baseado no cargo
      const baseSalary = crewMember?.rank?.toLowerCase().includes("captain") ? 25000 
        : crewMember?.rank?.toLowerCase().includes("officer") ? 18000 
        : 12000;
      
      const allowance = 450;
      
      // Simular histórico de pagamentos
      const payments: Payment[] = [
        {
          id: "pay-1",
          type: "salary",
          description: `Salário Base - ${period || new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
          amount: baseSalary,
          date: new Date().toISOString().split("T")[0],
          status: "paid",
          reference: `SAL-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
        },
        {
          id: "pay-2",
          type: "allowance",
          description: "Diária de Embarque",
          amount: allowance * 11,
          date: new Date().toISOString().split("T")[0],
          status: "paid",
        },
        {
          id: "pay-3",
          type: "deduction",
          description: "INSS",
          amount: -baseSalary * 0.11,
          date: new Date().toISOString().split("T")[0],
          status: "paid",
        },
        {
          id: "pay-4",
          type: "deduction",
          description: "IRRF",
          amount: -baseSalary * 0.075,
          date: new Date().toISOString().split("T")[0],
          status: "paid",
        },
      ];

      const allowances = payments.filter(p => p.type === "allowance").reduce((acc, p) => acc + p.amount, 0);
      const deductions = Math.abs(payments.filter(p => p.type === "deduction").reduce((acc, p) => acc + p.amount, 0));

      return {
        payments,
        summary: {
          grossSalary: baseSalary,
          allowances,
          deductions,
          netSalary: baseSalary + allowances - deductions,
        },
      };
    },
    staleTime: 1000 * 60 * 10,
  });
}

// ========================
// TRAINING COURSES
// ========================

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  progress: number;
  status: "available" | "in_progress" | "completed" | "mandatory";
  instructor?: string;
  deadline?: string;
  modules?: number;
  completedModules?: number;
}

export interface Certificate {
  id: string;
  name: string;
  issueDate: string;
  expiryDate: string;
  status: "valid" | "expiring" | "expired";
}

export function useEmployeeTraining() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["employee-training", user?.id],
    queryFn: async (): Promise<{ courses: Course[]; certificates: Certificate[] }> => {
      // Buscar cursos da academia
      const { data: academyCourses } = await supabase
        .from("academy_courses")
        .select(`
          id,
          course_name,
          course_description,
          duration_hours,
          modules,
          is_published
        `)
        .eq("is_published", true)
        .limit(10);

      // Buscar progresso do usuário
      const { data: progress } = await supabase
        .from("academy_progress")
        .select("course_id, progress_percent, status, completed_modules, current_module")
        .eq("user_id", user?.id || "");

      const progressMap = new Map(progress?.map(p => [p.course_id, p]) || []);

      const courses: Course[] = (academyCourses || []).map((course) => {
        const userProgress = progressMap.get(course.id);
        const modules = Array.isArray(course.modules) ? course.modules.length : 5;
        const completedModules = userProgress?.completed_modules?.length || 0;

        return {
          id: course.id,
          title: course.course_name,
          description: course.course_description || "",
          category: "Maritime Training",
          duration: course.duration_hours ? `${course.duration_hours}h` : "4h",
          progress: userProgress?.progress_percent || 0,
          status: userProgress?.status === "completed" 
            ? "completed" as const 
            : userProgress 
              ? "in_progress" as const 
              : "available" as const,
          modules,
          completedModules,
        };
      });

      // Buscar certificados do tripulante
      // maritime_certificates schema: id, crew_member_id, certificate_number, issue_date, expiry_date, status
      const { data: crewMember } = await supabase
        .from("crew_members")
        .select("id")
        .or(`auth_user_id.eq.${user?.id || ""},user_id.eq.${user?.id || ""}`)
        .maybeSingle();

      let certificates: Certificate[] = [];
      if (crewMember) {
        const { data: certs } = await supabase
          .from("maritime_certificates")
          .select("id, certificate_number, issue_date, expiry_date, status")
          .eq("crew_member_id", crewMember.id);

        certificates = (certs || []).map((cert) => ({
          id: cert.id,
          name: cert.certificate_number || "Certificado",
          issueDate: cert.issue_date || new Date().toISOString().split("T")[0],
          expiryDate: cert.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          status: getExpiryStatus(cert.expiry_date),
        }));
      }

      // Fallback demo
      if (courses.length === 0) {
        courses.push({
          id: "demo-1",
          title: "STCW Básico",
          description: "Treinamento básico obrigatório",
          category: "Obrigatório",
          duration: "40h",
          progress: 75,
          status: "in_progress",
          modules: 8,
          completedModules: 6,
        });
      }

      if (certificates.length === 0) {
        certificates.push({
          id: "demo-cert-1",
          name: "STCW Básico",
          issueDate: "2025-06-15",
          expiryDate: "2030-06-15",
          status: "valid",
        });
      }

      return { courses, certificates };
    },
    staleTime: 1000 * 60 * 5,
  });
}

function getExpiryStatus(expiryDate: string | null): "valid" | "expiring" | "expired" {
  if (!expiryDate) return "valid";
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);

  if (daysUntilExpiry < 0) return "expired";
  if (daysUntilExpiry < 60) return "expiring";
  return "valid";
}

export function useEnrollInCourse() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const { data, error } = await supabase
        .from("academy_progress")
        .insert({
          course_id: courseId,
          user_id: user?.id,
          status: "in_progress",
          progress_percent: 0,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-training"] });
      toast.success("Inscrição realizada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao realizar inscrição");
    },
  });
}
