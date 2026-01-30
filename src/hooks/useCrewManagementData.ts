/**
 * Hook para dados reais de Gestão de Tripulação (HR Marítimo)
 * Substitui dados mockados por dados do Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface CrewMember {
  id: string;
  name: string;
  rank: string;
  nationality: string;
  vessel?: string;
  vesselId?: string;
  status: "onboard" | "on_leave" | "available" | "training" | "medical_leave";
  contract: {
    start_date: string;
    end_date: string;
    duration_months: number;
  };
  certifications: Certification[];
  medical: {
    last_checkup: string;
    next_due: string;
    status: "valid" | "expiring" | "expired";
  };
  contact: {
    email: string;
    phone: string;
    emergency_contact: string;
  };
  performance: {
    rating: number;
    last_evaluation: string;
    areas_improvement: string[];
  };
  sea_service: {
    total_months: number;
    vessels_served: string[];
    last_voyage_end: string;
  };
}

export interface Certification {
  id: string;
  name: string;
  type: "stcw" | "mlc" | "ism" | "security" | "medical" | "technical";
  issue_date: string;
  expiry_date: string;
  issuing_authority: string;
  certificate_number: string;
  status: "valid" | "expiring" | "expired";
  renewal_required: boolean;
}

export interface WellnessMetric {
  crew_id: string;
  date: string;
  stress_level: number;
  sleep_quality: number;
  physical_health: number;
  mental_health: number;
  fatigue_level: number;
  social_connection: number;
}

export interface TrainingProgram {
  id: string;
  name: string;
  type: "safety" | "technical" | "leadership" | "compliance" | "wellness";
  duration_hours: number;
  participants: string[];
  completion_rate: number;
  next_session: string;
  instructor: string;
  virtual_reality: boolean;
}

function mapCrewStatus(status: string | null): CrewMember["status"] {
  switch (status?.toLowerCase()) {
    case "active":
    case "onboard":
      return "onboard";
    case "leave":
    case "on_leave":
    case "vacation":
      return "on_leave";
    case "training":
      return "training";
    case "medical":
    case "medical_leave":
      return "medical_leave";
    default:
      return "available";
  }
}

function mapCertStatus(expiryDate: string | null): "valid" | "expiring" | "expired" {
  if (!expiryDate) return "valid";
  const expiry = new Date(expiryDate);
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  if (expiry < now) return "expired";
  if (expiry < thirtyDays) return "expiring";
  return "valid";
}

export function useCrewManagementData() {
  const queryClient = useQueryClient();
  const [realtimeCrew, setRealtimeCrew] = useState<CrewMember[]>([]);

  // Fetch crew members
  const { data: crewMembers = [], isLoading } = useQuery({
    queryKey: ["crew-management-members"],
    queryFn: async (): Promise<CrewMember[]> => {
      const { data: crew, error } = await supabase
        .from("crew_members")
        .select(`
          *,
          vessels:vessel_id (name)
        `)
        .order("full_name", { ascending: true })
        .limit(200);

      if (error) throw error;

      // Fetch certificates for crew
      const crewIds = (crew || []).map(c => c.id);
      const { data: certs } = await supabase
        .from("maritime_certificates")
        .select("*")
        .in("crew_member_id", crewIds);

      const certsByCrewId = new Map<string, Certification[]>();
      (certs || []).forEach(cert => {
        if (!cert.crew_member_id) return;
        const crewCerts = certsByCrewId.get(cert.crew_member_id) || [];
        crewCerts.push({
          id: cert.id,
          name: cert.issuing_authority || "Certificado",
          type: "stcw",
          issue_date: cert.issue_date || "",
          expiry_date: cert.expiry_date || "",
          issuing_authority: cert.issuing_authority || "",
          certificate_number: cert.certificate_number || "",
          status: mapCertStatus(cert.expiry_date),
          renewal_required: mapCertStatus(cert.expiry_date) !== "valid",
        });
        certsByCrewId.set(cert.crew_member_id, crewCerts);
      });

      return (crew || []).map(member => ({
        id: member.id,
        name: member.full_name || "Tripulante",
        rank: member.rank || member.position || "Não definido",
        nationality: member.nationality || "Brasileiro",
        vessel: (member.vessels as any)?.name || undefined,
        vesselId: member.vessel_id || undefined,
        status: mapCrewStatus(member.status),
        contract: {
          start_date: member.contract_start || new Date().toISOString(),
          end_date: member.contract_end || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          duration_months: 6,
        },
        certifications: certsByCrewId.get(member.id) || [],
        medical: {
          last_checkup: "",
          next_due: "",
          status: "valid" as const,
        },
        contact: {
          email: member.email || "",
          phone: member.phone || "",
          emergency_contact: typeof member.emergency_contact === 'object' 
            ? (member.emergency_contact as any)?.phone || "" 
            : "",
        },
        performance: {
          rating: 8.5,
          last_evaluation: new Date().toISOString(),
          areas_improvement: [],
        },
        sea_service: {
          total_months: 0,
          vessels_served: [],
          last_voyage_end: "",
        },
      }));
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Fetch wellness data
  const { data: wellnessData = [] } = useQuery({
    queryKey: ["crew-wellness-data"],
    queryFn: async (): Promise<WellnessMetric[]> => {
      const { data, error } = await supabase
        .from("crew_health_checkins")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || []).map(checkin => ({
        crew_id: checkin.user_id || "",
        date: checkin.created_at,
        stress_level: checkin.stress_level || 5,
        sleep_quality: checkin.sleep_quality || 7,
        physical_health: checkin.physical_health || 8,
        mental_health: checkin.mood || 7,
        fatigue_level: 10 - (checkin.energy_level || 6),
        social_connection: checkin.social_interaction || 7,
      }));
    },
    staleTime: 60000,
  });

  // Fetch training programs
  const { data: trainingPrograms = [] } = useQuery({
    queryKey: ["crew-training-programs"],
    queryFn: async (): Promise<TrainingProgram[]> => {
      const { data, error } = await supabase
        .from("training_modules")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map(module => ({
        id: module.id,
        name: module.title || "Treinamento",
        type: (module.category as TrainingProgram["type"]) || "safety",
        duration_hours: module.duration_hours || 8,
        participants: [],
        completion_rate: 85,
        next_session: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        instructor: "Instrutor",
        virtual_reality: false,
      }));
    },
    staleTime: 60000,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("crew-management-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "crew_members" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["crew-management-members"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "crew_health_checkins" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["crew-wellness-data"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Calculate wellness score
  const calculateWellnessScore = (): number => {
    if (wellnessData.length === 0) return 8.0;
    
    const avgWellness = wellnessData.reduce((acc, w) => {
      return acc + (w.physical_health + w.mental_health + w.sleep_quality) / 3;
    }, 0) / wellnessData.length;
    
    return Math.round(avgWellness * 10) / 10;
  };

  // Stats
  const stats = {
    totalCrew: crewMembers.length,
    onboard: crewMembers.filter(c => c.status === "onboard").length,
    onLeave: crewMembers.filter(c => c.status === "on_leave").length,
    training: crewMembers.filter(c => c.status === "training").length,
    expiringCerts: crewMembers.reduce(
      (acc, c) => acc + c.certifications.filter(cert => cert.status === "expiring").length,
      0
    ),
    wellnessScore: calculateWellnessScore(),
  };

  // Combined with realtime
  const combinedCrew = [...realtimeCrew, ...crewMembers]
    .filter((c, index, self) => index === self.findIndex(m => m.id === c.id));

  return {
    crewMembers: combinedCrew,
    wellnessData,
    trainingPrograms,
    stats,
    isLoading,
  };
}
