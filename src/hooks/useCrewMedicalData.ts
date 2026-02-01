/**
 * Hook para dados médicos da tripulação - dados reais do Supabase
 * Substitui mockCrewMembers em CrewHealthTab.tsx
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from '@/lib/logger';

export interface CrewMedicalMember {
  id: string;
  name: string;
  position: string;
  vessel?: string;
  bloodType: string;
  status: "fit" | "restricted" | "unfit";
  allergies: string[];
  conditions: string[];
  vaccinations: Array<{
    name: string;
    date: string;
    expiryDate: string;
    status: "valid" | "expiring" | "expired";
  }>;
  lastCheckup: string;
  nextCheckup: string;
  emergencyContact?: string;
}

export function useCrewMedicalData() {
  const queryClient = useQueryClient();

  // Fetch crew members with health data
  const crewQuery = useQuery({
    queryKey: ["crew-medical"],
    queryFn: async (): Promise<CrewMedicalMember[]> => {
      // Get crew members - use only fields that exist in schema
      const { data: crewMembers, error } = await supabase
        .from("crew_members")
        .select(`
          id,
          full_name,
          position,
          rank,
          status,
          vessel_id,
          emergency_contact,
          vessels(name)
        `)
        .order("full_name");

      if (error) {
        logger.error("Error fetching crew medical data:", error);
        throw new Error(`Erro ao buscar dados médicos: ${error.message}`);
      }

      if (!crewMembers?.length) {
        return []; // Return empty array - UI should show EmptyState
      }

      // Get certificates for crew
      const crewIds = crewMembers.map(c => c.id);
      const { data: certificates } = await supabase
        .from("maritime_certificates")
        .select("*")
        .in("crew_member_id", crewIds);

      // Get health checkins - use correct field names
      const { data: healthCheckins } = await supabase
        .from("crew_health_checkins")
        .select("*")
        .order("created_at", { ascending: false });

      // Map to medical members
      return crewMembers.map(member => {
        const memberCerts = certificates?.filter(c => c.crew_member_id === member.id) || [];
        const memberCheckins = healthCheckins?.filter(c => c.crew_member_name === member.full_name) || [];
        const latestCheckin = memberCheckins[0];
        const emergencyData = (member.emergency_contact as Record<string, unknown>) || {};

        // Parse vaccinations from certificates - use certificate_number as identifier
        const vaccinations = memberCerts
          .filter(c => (c.certificate_number || "").toLowerCase().includes("vaccin") || (c.certificate_number || "").toLowerCase().includes("imuniz") || (c.certificate_number || "").toLowerCase().includes("vac"))
          .map(c => {
            const today = new Date();
            const expiry = new Date(c.expiry_date || today);
            const daysToExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            return {
              name: c.certificate_number || "Vacina",
              date: c.issue_date || c.created_at?.split("T")[0] || "",
              expiryDate: c.expiry_date || "",
              status: daysToExpiry < 0 ? "expired" as const : daysToExpiry < 30 ? "expiring" as const : "valid" as const
            };
          });

        // Determine health status based on wellness scores
        let status: "fit" | "restricted" | "unfit" = "fit";
        if (latestCheckin) {
          const avgScore = (
            (latestCheckin.mood || 5) + 
            (latestCheckin.energy_level || 5) + 
            (latestCheckin.sleep_quality || 5) +
            (latestCheckin.physical_health || 5)
          ) / 4;
          
          if (avgScore < 3) status = "unfit";
          else if (avgScore < 5) status = "restricted";
        }
        if (member.status === "inactive") status = "unfit";

        return {
          id: member.id,
          name: member.full_name || "N/A",
          position: member.position || member.rank || "Crew",
          vessel: (member.vessels as { name?: string } | null)?.name,
          bloodType: "Não informado",
          status,
          allergies: emergencyData?.allergies || [],
          conditions: emergencyData?.conditions || [],
          vaccinations,
          lastCheckup: latestCheckin?.created_at?.split("T")[0] || "Não registrado",
          nextCheckup: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          emergencyContact: emergencyData?.phone || emergencyData?.name || undefined
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });

  // Get statistics
  const statusCounts = {
    fit: crewQuery.data?.filter(m => m.status === "fit").length || 0,
    restricted: crewQuery.data?.filter(m => m.status === "restricted").length || 0,
    unfit: crewQuery.data?.filter(m => m.status === "unfit").length || 0,
    total: crewQuery.data?.length || 0,
    expiringVaccines: crewQuery.data?.reduce((acc, m) => 
      acc + m.vaccinations.filter(v => v.status === "expiring").length, 0) || 0,
    upcomingCheckups: crewQuery.data?.filter(m => {
      const next = new Date(m.nextCheckup);
      const today = new Date();
      const diff = (next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 30 && diff > 0;
    }).length || 0
  };

  // Update medical record mutation
  const updateMedicalRecord = useMutation({
    mutationFn: async ({ crewId, data }: { crewId: string; data: Partial<CrewMedicalMember> }) => {
      const { error } = await supabase
        .from("crew_members")
        .update({
          emergency_contact: {
            allergies: data.allergies,
            conditions: data.conditions,
            next_checkup: data.nextCheckup
          }
        })
        .eq("id", crewId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew-medical"] });
      toast.success("Ficha médica atualizada");
    },
    onError: () => {
      toast.error("Erro ao atualizar ficha médica");
    }
  });

  // Schedule checkup mutation
  const scheduleCheckup = useMutation({
    mutationFn: async ({ crewId, crewName, date }: { crewId: string; crewName: string; date: string }) => {
      // Create health checkin record
      const { error } = await supabase
        .from("crew_health_checkins")
        .insert({
          crew_member_name: crewName,
          mood: 5,
          energy_level: 5,
          sleep_quality: 5,
          stress_level: 3,
          notes: `Exame agendado para ${date}`
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew-medical"] });
      toast.success("Exame agendado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao agendar exame");
    }
  });

  return {
    crewMembers: crewQuery.data || [],
    isLoading: crewQuery.isLoading,
    error: crewQuery.error,
    statusCounts,
    updateMedicalRecord: updateMedicalRecord.mutate,
    scheduleCheckup: scheduleCheckup.mutate,
    refetch: crewQuery.refetch
  };
}

// Demo data removed - system should use real data from Supabase
// If no data, components should display EmptyState with CTA to add records
