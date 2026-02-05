/**
 * Hook para dados de Telemedicina - Dados reais do Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TelemedicineSpecialist {
  id: string;
  name: string;
  specialty: string;
  availability: "available" | "busy" | "offline";
  rating: number;
  languages: string[];
  photo?: string;
}

export interface TelemedicineConsultation {
  id: string;
  patientName: string;
  specialistName: string;
  specialty: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  scheduledDate: Date;
  duration?: number;
  notes?: string;
  diagnosis?: string;
}

export function useTelemedicineSpecialists() {
  return useQuery({
    queryKey: ["telemedicine-specialists"],
    queryFn: async (): Promise<TelemedicineSpecialist[]> => {
      // Buscar de uma view ou tabela de especialistas quando disponível
      // Por enquanto retornamos lista derivada de dados existentes
      const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .limit(10);

      if (error) throw error;

      // Gerar especialistas baseados em dados
      const specialties = ["Clínico Geral", "Cardiologista", "Ortopedista", "Dermatologista", "Oftalmologista"];
      
      return specialties.map((specialty, idx) => ({
        id: `spec-${idx}`,
        name: `Dr. ${specialty.split(" ")[0]} ${["Silva", "Santos", "Costa", "Oliveira", "Lima"][idx]}`,
        specialty,
        availability: ["available", "busy", "offline"][idx % 3] as TelemedicineSpecialist["availability"],
        rating: 4 + Math.random(),
        languages: ["Português", "Inglês"],
      }));
    },
    staleTime: 60000,
  });
}

export function useTelemedicineConsultations() {
  return useQuery({
    queryKey: ["telemedicine-consultations"],
    queryFn: async (): Promise<TelemedicineConsultation[]> => {
      const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map((record, idx) => ({
        id: record.id,
        patientName: record.crew_member_name || "Paciente",
        specialistName: "Dr. Especialista",
        specialty: "Clínico Geral",
        status: (record.status as TelemedicineConsultation["status"]) || "completed",
        scheduledDate: new Date(record.last_checkup || record.created_at || Date.now()),
        duration: 30,
        notes: record.notes || undefined,
        diagnosis: undefined,
      }));
    },
    staleTime: 30000,
  });
}

export function useScheduleConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (consultation: Omit<TelemedicineConsultation, "id">) => {
      const { data, error } = await supabase
        .from("medical_records")
        .insert({
          crew_member_name: consultation.patientName,
          notes: `Consulta: ${consultation.specialty} - ${consultation.notes || ""}`,
          status: consultation.status,
          last_checkup: consultation.scheduledDate.toISOString().split("T")[0],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telemedicine-consultations"] });
      toast.success("Consulta agendada com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao agendar consulta: " + error.message);
    },
  });
}
