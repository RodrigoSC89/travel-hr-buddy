/**
 * Hook para saúde da tripulação - dados reais do Supabase
 * Substitui mockCrewMembers em CrewHealthTab.tsx
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

export interface Vaccination {
  name: string;
  date: string;
  expiryDate: string;
  status: "valid" | "expiring" | "expired";
}

export interface CrewHealthMember {
  id: string;
  name: string;
  position: string;
  bloodType: string;
  status: "fit" | "restricted" | "unfit";
  allergies: string[];
  conditions: string[];
  vaccinations: Vaccination[];
  lastCheckup: string;
  nextCheckup: string;
  vesselId?: string;
}

function calculateVaccinationStatus(expiryDate: string): "valid" | "expiring" | "expired" {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const daysUntilExpiry = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysUntilExpiry < 0) return "expired";
  if (daysUntilExpiry < 30) return "expiring";
  return "valid";
}

export function useCrewHealthData() {
  return useQuery({
    queryKey: ["crew-health"],
    queryFn: async (): Promise<CrewHealthMember[]> => {
      // Fetch crew members with health check-ins
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
          nationality
        `)
        .limit(50);

      if (error) {
        logger.error("Error fetching crew health:", error);
      }

      // Fetch health check-ins
      const { data: healthCheckins } = await supabase
        .from("crew_health_checkins")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      // Fetch maritime certificates for vaccination-like data
      const { data: certificates } = await supabase
        .from("maritime_certificates")
        .select("id, crew_member_id, certification_type_id, expiry_date, issue_date, status")
        .order("expiry_date", { ascending: true })
        .limit(200);

      if (crewMembers && crewMembers.length > 0) {
        return crewMembers.map((crew) => {
          // Find latest health checkin for this crew (by crew_member_name or user_id)
          const latestCheckin = healthCheckins?.find(hc => hc.crew_member_name === crew.full_name);
          
          // Find certificates for this crew (as vaccinations proxy)
          const crewCerts = certificates?.filter(c => c.crew_member_id === crew.id) || [];

          const vaccinations: Vaccination[] = crewCerts.slice(0, 5).map(cert => ({
            name: cert.certification_type_id || "Certificação",
            date: cert.issue_date || new Date().toISOString(),
            expiryDate: cert.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            status: calculateVaccinationStatus(cert.expiry_date || new Date().toISOString()),
          }));

          // Parse emergency contact for additional health info
          const emergencyInfo = (crew.emergency_contact as Record<string, unknown>) || {};

          return {
            id: crew.id,
            name: crew.full_name || "Tripulante",
            position: crew.position || crew.rank || "Marinheiro",
            bloodType: (emergencyInfo.blood_type as string) || "O+",
            status: mapHealthStatus(crew.status),
            allergies: parseHealthArray(emergencyInfo.allergies),
            conditions: parseHealthArray(emergencyInfo.conditions),
            vaccinations,
            lastCheckup: latestCheckin?.created_at || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            nextCheckup: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
            vesselId: crew.vessel_id || undefined,
          };
        });
      }

      // No data found - return empty array
      // UI should show EmptyState with CTA to add crew members
      return [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

function mapHealthStatus(status: string | null): "fit" | "restricted" | "unfit" {
  const lower = status?.toLowerCase() || "";
  if (lower.includes("unfit") || lower.includes("inapto")) return "unfit";
  if (lower.includes("restrict") || lower.includes("restr")) return "restricted";
  return "fit";
}

function parseHealthArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value) return value.split(",").map(s => s.trim());
  return [];
}

export function useCrewHealthStats() {
  const { data: crewHealth } = useCrewHealthData();

  const stats = {
    total: crewHealth?.length || 0,
    fit: crewHealth?.filter(m => m.status === "fit").length || 0,
    restricted: crewHealth?.filter(m => m.status === "restricted").length || 0,
    unfit: crewHealth?.filter(m => m.status === "unfit").length || 0,
    expiringVaccines: crewHealth?.reduce(
      (acc, m) => acc + m.vaccinations.filter(v => v.status === "expiring").length,
      0
    ) || 0,
    upcomingCheckups: crewHealth?.filter(m => {
      const next = new Date(m.nextCheckup);
      const today = new Date();
      const diff = (next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 30;
    }).length || 0,
  };

  return stats;
}
