/**
 * usePeopleHubData - Hook para integração do People Hub com Supabase
 * PATCH: Eliminação de dados mockados - Integração real
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export interface CrewMember {
  id: string;
  full_name: string;
  employee_id?: string;
  position?: string;
  rank?: string;
  department?: string;
  vessel_id?: string;
  vessel_name?: string;
  status: "active" | "on_leave" | "off_duty" | "training" | "terminated";
  hire_date?: string;
  contract_end?: string;
  nationality?: string;
  email?: string;
  phone?: string;
  certifications?: string[];
  photo_url?: string;
}

export interface Training {
  id: string;
  crew_id?: string;
  crew_name?: string;
  course_name: string;
  course_type?: string;
  provider?: string;
  start_date?: string;
  end_date?: string;
  expiry_date?: string;
  status: "scheduled" | "in_progress" | "completed" | "expired" | "failed";
  score?: number;
  certificate_url?: string;
}

export interface WellnessRecord {
  id: string;
  crew_id?: string;
  crew_name?: string;
  date: string;
  type: "checkup" | "consultation" | "emergency" | "mental_health";
  status: "fit" | "unfit" | "restricted" | "pending";
  notes?: string;
  doctor?: string;
  next_checkup?: string;
}

export interface PeopleSummary {
  totalCrew: number;
  activeOnboard: number;
  onLeave: number;
  inTraining: number;
  expiringCerts: number;
  upcomingTrainings: number;
  fitForDuty: number;
  avgTenure: number;
}

export function usePeopleHubData(vesselId?: string) {
  const queryClient = useQueryClient();

  // Fetch crew members
  const {
    data: crewMembers = [],
    isLoading: isLoadingCrew,
  } = useQuery({
    queryKey: ["people-crew", vesselId],
    queryFn: async (): Promise<CrewMember[]> => {
      try {
        let query = supabase
          .from("crew_members")
          .select(`
            *,
            vessels(name)
          `)
          .order("full_name", { ascending: true });

        if (vesselId) {
          query = query.eq("vessel_id", vesselId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map((c: any) => ({
          id: c.id,
          full_name: c.full_name || `${c.first_name || ""} ${c.last_name || ""}`.trim(),
          employee_id: c.employee_id || c.seafarer_id,
          position: c.position || c.rank,
          rank: c.rank,
          department: c.department,
          vessel_id: c.vessel_id,
          vessel_name: c.vessels?.name,
          status: c.status || "active",
          hire_date: c.hire_date || c.embarkation_date,
          contract_end: c.contract_end_date || c.disembarkation_date,
          nationality: c.nationality,
          email: c.email,
          phone: c.phone,
          certifications: c.certifications || [],
          photo_url: c.photo_url || c.avatar_url,
        }));
      } catch (error) {
        logger.error("Failed to fetch crew members", error);
        return [];
      }
    },
  });

  // Fetch trainings
  const {
    data: trainings = [],
    isLoading: isLoadingTrainings,
  } = useQuery({
    queryKey: ["people-trainings", vesselId],
    queryFn: async (): Promise<Training[]> => {
      try {
        const { data, error } = await supabase
          .from("academy_progress")
          .select(`
            *,
            academy_courses(course_name, duration_hours),
            profiles(full_name)
          `)
          .order("started_at", { ascending: false })
          .limit(50);

        if (error) throw error;

        const now = new Date();

        return (data || []).map((t: any) => {
          let status: Training["status"] = "scheduled";
          if (t.completed_at) status = "completed";
          else if (t.progress_percent > 0) status = "in_progress";

          return {
            id: t.id,
            crew_id: t.user_id,
            crew_name: t.profiles?.full_name,
            course_name: t.academy_courses?.course_name || "Curso",
            course_type: "mandatory",
            start_date: t.started_at,
            end_date: t.completed_at,
            status,
            score: t.assessment_scores ? Object.values(t.assessment_scores as any)[0] as number : undefined,
            certificate_url: t.certificate_issued ? "/certificates" : undefined,
          };
        });
      } catch (error) {
        logger.error("Failed to fetch trainings", error);
        return [];
      }
    },
  });

  // Fetch wellness records
  const {
    data: wellnessRecords = [],
    isLoading: isLoadingWellness,
  } = useQuery({
    queryKey: ["people-wellness", vesselId],
    queryFn: async (): Promise<WellnessRecord[]> => {
      try {
        // Try medical_records or similar table
        const { data, error } = await supabase
          .from("crew_members")
          .select("id, full_name, medical_exam_date, medical_status, next_medical_exam")
          .not("medical_exam_date", "is", null)
          .order("medical_exam_date", { ascending: false })
          .limit(50);

        if (error) throw error;

        return (data || []).map((m: any) => ({
          id: `wellness-${m.id}`,
          crew_id: m.id,
          crew_name: m.full_name,
          date: m.medical_exam_date,
          type: "checkup" as const,
          status: m.medical_status === "fit" ? "fit" as const : "pending" as const,
          next_checkup: m.next_medical_exam,
        }));
      } catch (error) {
        logger.error("Failed to fetch wellness records", error);
        return [];
      }
    },
  });

  // Calculate summary
  const summary: PeopleSummary = {
    totalCrew: crewMembers.length,
    activeOnboard: crewMembers.filter(c => c.status === "active").length,
    onLeave: crewMembers.filter(c => c.status === "on_leave").length,
    inTraining: crewMembers.filter(c => c.status === "training").length,
    expiringCerts: 0, // Would calculate from certifications
    upcomingTrainings: trainings.filter(t => t.status === "scheduled").length,
    fitForDuty: wellnessRecords.filter(w => w.status === "fit").length,
    avgTenure: calculateAvgTenure(crewMembers),
  };

  // Create crew member
  const createCrewMember = useMutation({
    mutationFn: async (data: Partial<CrewMember>) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      if (!userId) throw new Error("User not authenticated");

      const insertData: Record<string, unknown> = {
        full_name: data.full_name,
        position: data.position,
        rank: data.rank,
        vessel_id: data.vessel_id,
        status: "active",
        nationality: data.nationality,
        email: data.email,
        phone: data.phone,
      };

      const { data: result, error } = await supabase
        .from("crew_members")
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people-crew"] });
      toast.success("Tripulante cadastrado com sucesso");
    },
    onError: (error) => {
      logger.error("Failed to create crew member", error);
      toast.error("Erro ao cadastrar tripulante");
    },
  });

  // Update crew status
  const updateCrewStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("crew_members")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people-crew"] });
      toast.success("Status atualizado");
    },
    onError: (error) => {
      logger.error("Failed to update crew status", error);
      toast.error("Erro ao atualizar status");
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["people-crew"] });
    queryClient.invalidateQueries({ queryKey: ["people-trainings"] });
    queryClient.invalidateQueries({ queryKey: ["people-wellness"] });
  };

  return {
    crewMembers,
    trainings,
    wellnessRecords,
    summary,
    isLoading: isLoadingCrew || isLoadingTrainings,
    isLoadingCrew,
    isLoadingTrainings,
    isLoadingWellness,
    createCrewMember,
    updateCrewStatus,
    refresh,
  };
}

function calculateAvgTenure(crew: CrewMember[]): number {
  const withHireDate = crew.filter(c => c.hire_date);
  if (withHireDate.length === 0) return 0;

  const now = new Date();
  const totalMonths = withHireDate.reduce((sum, c) => {
    const hire = new Date(c.hire_date!);
    const months = (now.getFullYear() - hire.getFullYear()) * 12 + 
                   (now.getMonth() - hire.getMonth());
    return sum + months;
  }, 0);

  return Math.round(totalMonths / withHireDate.length);
}
