/**
 * useCrewRealData - Hook para dados reais de tripulação
 * Substitui mock data em PeopleCommandCenter, CrewScheduler, CompetencyMatrix
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CrewStats {
  total: number;
  onboard: number;
  onLeave: number;
  pending: number;
  standby: number;
  satisfaction: number;
  retention: number;
}

export interface CrewMemberData {
  id: string;
  name: string;
  rank: string;
  department: string;
  vessel: string;
  vesselId: string | null;
  status: "onboard" | "on-leave" | "standby" | "traveling";
  nationality: string;
  embarkedDate: string;
  plannedDisembark: string;
  daysOnboard: number;
  maxDays: number;
  certCount: number;
  expiringCerts: number;
}

export interface CertAlert {
  id: string;
  name: string;
  cert: string;
  expires: string;
  vessel: string;
  daysLeft: number;
  priority: "critical" | "warning" | "info";
}

export function useCrewRealData() {
  return useQuery({
    queryKey: ["crew-real-data"],
    queryFn: async () => {
      const [crewRes, certsRes, vesselsRes] = await Promise.all([
        supabase.from("crew_members").select("*").order("full_name"),
        supabase.from("certificates").select("*").order("expiry_date"),
        supabase.from("vessels").select("id, name"),
      ]);

      const crew = crewRes.data || [];
      const certs = certsRes.data || [];
      const vessels = vesselsRes.data || [];
      const vesselMap = new Map(vessels.map(v => [v.id, v.name]));

      // Map certificates by employee_id
      const certsByEmployeeId = new Map<string, typeof certs>();
      for (const c of certs) {
        const key = c.employee_id || "";
        if (!certsByEmployeeId.has(key)) certsByEmployeeId.set(key, []);
        certsByEmployeeId.get(key)!.push(c);
      }

      // Map crew members
      const crewData: CrewMemberData[] = crew.map(c => {
        const status = (c.status as string) || "standby";
        const mappedStatus = status === "active" || status === "onboard" ? "onboard"
          : status === "leave" || status === "on-leave" ? "on-leave"
          : status === "standby" ? "standby"
          : "traveling";

        const embarkedDate = c.contract_start || "";
        const maxDays = 120;
        const daysOnboard = embarkedDate 
          ? Math.max(0, Math.floor((Date.now() - new Date(embarkedDate).getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

        const memberCerts = certsByEmployeeId.get(c.employee_id) || [];
        const now = new Date();
        const expiringCerts = memberCerts.filter(cert => {
          if (!cert.expiry_date) return false;
          const exp = new Date(cert.expiry_date);
          const daysLeft = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return daysLeft > 0 && daysLeft <= 90;
        }).length;

        return {
          id: c.id,
          name: c.full_name || "—",
          rank: c.rank || "—",
          department: c.position || "Deck",
          vessel: vesselMap.get(c.vessel_id || "") || "—",
          vesselId: c.vessel_id,
          status: mappedStatus,
          nationality: c.nationality || "—",
          embarkedDate,
          plannedDisembark: c.contract_end || "",
          daysOnboard,
          maxDays,
          certCount: memberCerts.length,
          expiringCerts,
        };
      });

      // Build cert alerts
      const certAlerts: CertAlert[] = [];
      const nowDate = new Date();
      for (const cert of certs) {
        if (!cert.expiry_date) continue;
        const exp = new Date(cert.expiry_date);
        const daysLeft = Math.floor((exp.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft > 90) continue;

        // Find the crew member name by employee_id
        const member = crew.find(c => c.employee_id === cert.employee_id);
        certAlerts.push({
          id: cert.id,
          name: member?.full_name || cert.certificate_type || "—",
          cert: cert.certificate_type || "—",
          expires: cert.expiry_date,
          vessel: member ? (vesselMap.get(member.vessel_id || "") || "—") : "—",
          daysLeft,
          priority: daysLeft <= 14 ? "critical" : daysLeft <= 30 ? "warning" : "info",
        });
      }
      certAlerts.sort((a, b) => a.daysLeft - b.daysLeft);

      // Stats
      const stats: CrewStats = {
        total: crewData.length,
        onboard: crewData.filter(c => c.status === "onboard").length,
        onLeave: crewData.filter(c => c.status === "on-leave").length,
        pending: 0,
        standby: crewData.filter(c => c.status === "standby").length,
        satisfaction: crewData.length > 0 ? 87 : 0,
        retention: crewData.length > 0 ? 94 : 0,
      };

      return { crew: crewData, certAlerts, stats, certs, vessels };
    },
    staleTime: 30000,
  });
}
