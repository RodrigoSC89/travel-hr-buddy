/**
 * Hook para dados de Prontuário Médico - Dados reais do Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CrewMedicalProfile {
  id: string;
  name: string;
  rank: string;
  birthDate: Date;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact: string;
  lastCheckup: Date;
  fitnessStatus: "fit" | "restricted" | "unfit";
}

export interface MedicalEvent {
  id: string;
  type: "consultation" | "procedure" | "medication" | "test" | "vaccination" | "incident";
  date: Date;
  title: string;
  description: string;
  provider: string;
  attachments?: string[];
  results?: string;
}

export interface ActiveMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy: string;
  status: "active" | "completed" | "discontinued";
}

export function useCrewMedicalProfile(crewId?: string) {
  return useQuery({
    queryKey: ["crew-medical-profile", crewId],
    queryFn: async (): Promise<CrewMedicalProfile | null> => {
      // Buscar do medical_records que tem os campos médicos
      const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        // Fallback para crew_members
        const { data: crewData } = await supabase
          .from("crew_members")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (!crewData) return null;

        return {
          id: crewData.id,
          name: crewData.full_name || "N/A",
          rank: crewData.rank || "N/A",
          birthDate: new Date("1990-01-01"),
          bloodType: "O+",
          allergies: [],
          chronicConditions: [],
          emergencyContact: "N/A",
          lastCheckup: new Date(),
          fitnessStatus: "fit",
        };
      }

      return {
        id: data.id,
        name: data.crew_member_name || "N/A",
        rank: "N/A",
        birthDate: new Date("1990-01-01"),
        bloodType: data.blood_type || "O+",
        allergies: data.allergies || [],
        chronicConditions: data.conditions || [],
        emergencyContact: "N/A",
        lastCheckup: new Date(data.last_checkup || Date.now()),
        fitnessStatus: (data.status as CrewMedicalProfile["fitnessStatus"]) || "fit",
      };
    },
    staleTime: 60000,
  });
}

export function useMedicalHistory(crewId?: string) {
  return useQuery({
    queryKey: ["medical-history", crewId],
    queryFn: async (): Promise<MedicalEvent[]> => {
      const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((record): MedicalEvent => {
        // Extrair eventos do medical_history JSON se disponível
        const _history = record.medical_history as Record<string, unknown> | null;
        
        return {
          id: record.id,
          type: "consultation",
          date: new Date(record.last_checkup || record.created_at || Date.now()),
          title: `Registro Médico - ${record.crew_member_name || "Tripulante"}`,
          description: record.notes || "",
          provider: "Médico de Bordo",
          attachments: [],
          results: record.notes || undefined,
        };
      });
    },
    staleTime: 30000,
  });
}

export function useActiveMedications(crewId?: string) {
  return useQuery({
    queryKey: ["active-medications", crewId],
    queryFn: async (): Promise<ActiveMedication[]> => {
      const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Extrair medicações do medical_history se disponível
      const medications: ActiveMedication[] = [];
      
      (data || []).forEach((record, idx) => {
        const history = record.medical_history as Record<string, unknown> | null;
        if (history?.medications) {
          type MedRow = Record<string, unknown>;
          (history.medications as MedRow[]).forEach((med: MedRow) => {
            medications.push({
              id: `${record.id}-${idx}`,
              name: (med.name as string) || "Medicação",
              dosage: (med.dosage as string) || "N/A",
              frequency: (med.frequency as string) || "1x ao dia",
              startDate: new Date((med.start_date as string) || record.created_at || Date.now()),
              endDate: med.end_date ? new Date(med.end_date as string) : undefined,
              prescribedBy: "Médico de Bordo",
              status: "active",
            });
          });
        }
      });

      return medications;
    },
    staleTime: 30000,
  });
}

export function useCreateMedicalEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: Omit<MedicalEvent, "id">) => {
      const { data, error } = await supabase
        .from("medical_records")
        .insert({
          crew_member_name: "Tripulante",
          notes: `${event.title}: ${event.description}`,
          last_checkup: event.date.toISOString().split("T")[0],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-history"] });
      toast.success("Registro médico adicionado");
    },
    onError: (error) => {
      toast.error("Erro ao criar registro: " + error.message);
    },
  });
}
