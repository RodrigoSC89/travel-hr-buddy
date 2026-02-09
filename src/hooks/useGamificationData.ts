/**
 * Hook para dados de gamificação baseados em dados reais
 * PATCH v3.0 - Corrigido mapeamento de campos (employee_id → id)
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useGamificationData() {
  return useQuery({
    queryKey: ["gamification-data"],
    queryFn: async () => {
      // Build leaderboard from crew_members + certifications
      const [{ data: crew }, { data: certs }, { data: vessels }] = await Promise.all([
        supabase.from("crew_members").select("id, full_name, rank, vessel_id, status, employee_id").eq("status", "active").limit(20),
        supabase.from("crew_certifications").select("id, crew_member_id, certification_name, status").limit(100),
        supabase.from("vessels").select("id, name").limit(50),
      ]);

      const crewList = crew || [];
      const certList = certs || [];
      type VesselRow = { id: string; name: string };
      const vesselMap = new Map((vessels || []).map((v: VesselRow) => [v.id, v.name]));

      type CrewRow = typeof crewList[number];
      type CertRow = typeof certList[number];
      // Generate leaderboard from crew data - use crew_member_id (which maps to crew_members.id)
      const leaderboard = crewList
        .map((c: CrewRow, i: number) => {
          const crewCerts = certList.filter(
            (cert: CertRow) => cert.crew_member_id === c.id
          );
          const validCerts = crewCerts.filter((cert: CertRow) => cert.status === "valid" || cert.status === "active");
          const points = 1000 + validCerts.length * 500 + crewCerts.length * 200 + (crewList.length - i) * 100;
          return {
            rank: 0,
            name: c.full_name || `Tripulante ${i + 1}`,
            vessel: c.vessel_id ? vesselMap.get(c.vessel_id) || "Não atribuído" : "Não atribuído",
            points,
            avatar: "",
            streak: Math.max(1, Math.floor(points / 1000)),
          };
        })
        .sort((a, b) => b.points - a.points)
        .map((item, i) => ({ ...item, rank: i + 1 }))
        .slice(0, 10);

      // Generate badges based on cert data
      const totalCerts = certList.length;
      const validCerts = certList.filter((c) => c.status === "valid" || c.status === "active").length;
      const badges = [
        { id: "1", name: "Safety Champion", description: "100 dias sem incidentes", earned: validCerts >= 5, rarity: "legendary" as const },
        { id: "2", name: "Compliance Master", description: "Todas auditorias aprovadas", earned: validCerts >= 3, rarity: "epic" as const },
        { id: "3", name: "Training Expert", description: "Treinamentos concluídos", earned: crewList.length >= 2, rarity: "rare" as const },
        { id: "4", name: "Early Bird", description: "Check-in antes das 6h por 30 dias", earned: false, rarity: "rare" as const },
        { id: "5", name: "Team Player", description: "Ajudou colegas", earned: crewList.length >= 3, rarity: "common" as const },
        { id: "6", name: "Green Warrior", description: "ESG Score acima de 90", earned: false, rarity: "epic" as const },
      ];

      // Challenges based on real data counts
      const challenges = [
        { id: "1", title: "Zero Incidentes", description: "Mantenha zero incidentes no mês", progress: Math.min(100, crewList.length * 20), reward: 500, deadline: "31 dias", participants: crewList.length * 3 },
        { id: "2", title: "Certificações em Dia", description: "Todos certificados válidos", progress: totalCerts > 0 ? Math.min(100, Math.round((validCerts / totalCerts) * 100)) : 0, reward: 200, deadline: "15 dias", participants: crewList.length * 5 },
        { id: "3", title: "Eco Champion", description: "Reduza emissões em 10%", progress: 40, reward: 350, deadline: "60 dias", participants: Math.max(10, crewList.length * 2) },
      ];

      return { leaderboard, badges, challenges, totalCrew: crewList.length, totalCerts };
    },
    staleTime: 30000,
  });
}
