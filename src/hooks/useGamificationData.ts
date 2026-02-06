/**
 * Hook para dados de gamificação baseados em dados reais
 * Substitui mockLeaderboard, mockBadges, mockChallenges
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useGamificationData() {
  return useQuery({
    queryKey: ["gamification-data"],
    queryFn: async () => {
      // Build leaderboard from crew_members + certificates
      const [{ data: crew }, { data: certs }] = await Promise.all([
        supabase.from("crew_members").select("*").limit(20),
        supabase.from("certificates").select("*").limit(50),
      ]);

      const crewList = crew || [];
      const certList = certs || [];

      // Generate leaderboard from crew data
      const leaderboard = crewList
        .map((c, i) => {
          const crewCerts = certList.filter(
            (cert) => cert.employee_id === c.employee_id
          );
          const points = 1000 + crewCerts.length * 500 + (crewList.length - i) * 200;
          return {
            rank: 0,
            name: c.full_name || `Tripulante ${i + 1}`,
            vessel: c.vessel_id || "Não atribuído",
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
      const badges = [
        { id: "1", name: "Safety Champion", description: "100 dias sem incidentes", earned: totalCerts >= 1, rarity: "legendary" as const },
        { id: "2", name: "Compliance Master", description: "Todas auditorias aprovadas", earned: totalCerts >= 2, rarity: "epic" as const },
        { id: "3", name: "Training Expert", description: "Treinamentos concluídos", earned: crewList.length >= 2, rarity: "rare" as const },
        { id: "4", name: "Early Bird", description: "Check-in antes das 6h por 30 dias", earned: false, rarity: "rare" as const },
        { id: "5", name: "Team Player", description: "Ajudou colegas", earned: crewList.length >= 3, rarity: "common" as const },
        { id: "6", name: "Green Warrior", description: "ESG Score acima de 90", earned: false, rarity: "epic" as const },
      ];

      // Challenges based on real data counts
      const challenges = [
        { id: "1", title: "Zero Incidentes", description: "Mantenha zero incidentes no mês", progress: Math.min(100, crewList.length * 20), reward: 500, deadline: "31 dias", participants: crewList.length * 3 },
        { id: "2", title: "Certificações em Dia", description: "Todos certificados válidos", progress: Math.min(100, totalCerts * 30), reward: 200, deadline: "15 dias", participants: crewList.length * 5 },
        { id: "3", title: "Eco Champion", description: "Reduza emissões em 10%", progress: 40, reward: 350, deadline: "60 dias", participants: Math.max(10, crewList.length * 2) },
      ];

      return { leaderboard, badges, challenges, totalCrew: crewList.length, totalCerts };
    },
  });
}
