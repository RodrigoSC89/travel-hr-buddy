/**
 * Hook para dados reais de Treinamentos e Drills SOLAS
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Drill {
  id: string;
  name: string;
  type: "fire" | "abandon" | "mob" | "blackout" | "collision" | "pollution" | "isps";
  frequency: string;
  lastExecution: string;
  nextDue: string;
  status: "completed" | "due" | "overdue";
  participants: number;
  totalCrew: number;
}

export interface TrainingRecord {
  id: string;
  crewMember: string;
  training: string;
  certDate: string;
  expiryDate: string;
  status: "valid" | "expiring" | "expired";
}

export function useTrainingDrills() {
  return useQuery({
    queryKey: ["training-drills"],
    queryFn: async (): Promise<Drill[]> => {
      const { data, error } = await supabase
        .from("training_records")
        .select("*")
        .eq("training_type", "drill")
        .order("end_date", { ascending: false })
        .limit(50);

      if (error) throw error;

      const now = new Date();

      return (data || []).map((row) => {
        const lastExecution = row.end_date ? new Date(row.end_date) : null;
        const nextDue = row.certificate_expiry_date ? new Date(row.certificate_expiry_date) : null;
        
        let status: Drill["status"] = "completed";
        if (nextDue) {
          if (nextDue < now) status = "overdue";
          else if (nextDue.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000) status = "due";
        }

        return {
          id: row.id,
          name: row.training_name || "Exercício",
          type: mapDrillType(row.training_name),
          frequency: "Mensal",
          lastExecution: lastExecution?.toISOString().split("T")[0] || "N/A",
          nextDue: nextDue?.toISOString().split("T")[0] || "N/A",
          status,
          participants: 0,
          totalCrew: 24,
        };
      });
    },
  });
}

export function useTrainingRecords() {
  return useQuery({
    queryKey: ["training-records"],
    queryFn: async (): Promise<TrainingRecord[]> => {
      const { data, error } = await supabase
        .from("training_records")
        .select(`
          *,
          crew_members (full_name)
        `)
        .neq("training_type", "drill")
        .order("certificate_expiry_date", { ascending: true })
        .limit(50);

      if (error) throw error;

      const now = new Date();

      return (data || []).map((row) => {
        const expiryDate = row.certificate_expiry_date ? new Date(row.certificate_expiry_date) : null;
        const daysUntilExpiry = expiryDate 
          ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        let status: TrainingRecord["status"] = "valid";
        if (daysUntilExpiry < 0) status = "expired";
        else if (daysUntilExpiry <= 90) status = "expiring";

        // Type guard for crew_members
        const crewMember = row.crew_members as { full_name?: string } | null;

        return {
          id: row.id,
          crewMember: crewMember?.full_name || "N/A",
          training: row.training_name || "Treinamento",
          certDate: row.end_date || "N/A",
          expiryDate: row.certificate_expiry_date || "N/A",
          status,
        };
      });
    },
  });
}

function mapDrillType(name: string | null): Drill["type"] {
  if (!name) return "fire";
  const n = name.toLowerCase();
  if (n.includes("incêndio") || n.includes("fire") || n.includes("fogo")) return "fire";
  if (n.includes("abandon")) return "abandon";
  if (n.includes("mob") || n.includes("homem ao mar")) return "mob";
  if (n.includes("blackout") || n.includes("apagão")) return "blackout";
  if (n.includes("collision") || n.includes("colisão")) return "collision";
  if (n.includes("pollution") || n.includes("poluição")) return "pollution";
  if (n.includes("isps") || n.includes("security")) return "isps";
  return "fire";
}
