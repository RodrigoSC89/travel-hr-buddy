/**
 * Hook para dados reais da Enfermaria/Medical Infirmary
 * Substitui mockSupplies e mockRecords por dados do Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MedicalSupply {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  expiryDate: string;
  status: "ok" | "low" | "expiring" | "critical";
}

export interface MedicalRecord {
  id: string;
  crewMember: string;
  date: string;
  type: string;
  symptoms: string;
  treatment: string;
  status: "resolved" | "monitoring" | "referred";
}

export interface InfirmaryStats {
  attendanceMonth: number;
  monitoring: number;
  healthyPercentage: number;
  healthyCrew: number;
  totalCrew: number;
  expiringItems: number;
  lowStockItems: number;
  mlcCompliance: number;
}

function calculateSupplyStatus(supply: {
  quantity: number;
  min_stock: number;
}): "ok" | "low" | "expiring" | "critical" {
  if (supply.quantity < supply.min_stock * 0.5) {
    return "critical";
  }
  if (supply.quantity < supply.min_stock) {
    return "low";
  }
  return "ok";
}

export function useInfirmaryRealData() {
  const queryClient = useQueryClient();

  // Fetch medical supplies from inventory
  const { data: supplies = [], isLoading: suppliesLoading } = useQuery({
    queryKey: ["medical-supplies"],
    queryFn: async (): Promise<MedicalSupply[]> => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .or("category.ilike.%medical%,category.ilike.%medicamento%,category.ilike.%saúde%")
        .order("name");
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        category: item.category || "Geral",
        quantity: item.quantity || 0,
        minStock: item.min_quantity || 10,
        expiryDate: "", // inventory_items doesn't have expiry_date
        status: calculateSupplyStatus({
          quantity: item.quantity || 0,
          min_stock: item.min_quantity || 10,
        })
      }));
    },
    staleTime: 30000,
  });

  // Fetch medical records from crew_health_checkins
  const { data: records = [], isLoading: recordsLoading } = useQuery({
    queryKey: ["medical-records"],
    queryFn: async (): Promise<MedicalRecord[]> => {
      const { data, error } = await supabase
        .from("crew_health_checkins")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      return (data || []).map(record => {
        // Calculate wellness score from available fields
        const wellnessScore = Math.round(
          (record.mood + record.energy_level + record.sleep_quality + (100 - record.stress_level)) / 4
        );
        
        return {
          id: record.id,
          crewMember: record.crew_member_name || "Tripulante",
          date: record.created_at.split("T")[0],
          type: wellnessScore < 50 ? "Emergência" : "Consulta",
          symptoms: record.notes || `Bem-estar: ${wellnessScore}%`,
          treatment: wellnessScore > 70 ? "Acompanhamento regular" : "Avaliação médica recomendada",
          status: wellnessScore > 70 
            ? "resolved" 
            : wellnessScore > 50 
              ? "monitoring" 
              : "referred"
        };
      });
    },
    staleTime: 30000,
  });

  // Fetch infirmary stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["infirmary-stats"],
    queryFn: async (): Promise<InfirmaryStats> => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      // Get attendance count this month
      const { count: attendanceMonth } = await supabase
        .from("crew_health_checkins")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonth);

      // Get low wellness count (stress > 70 or mood < 50)
      const { count: monitoring } = await supabase
        .from("crew_health_checkins")
        .select("*", { count: "exact", head: true })
        .or("stress_level.gt.70,mood.lt.50");

      // Get total crew
      const { count: totalCrew } = await supabase
        .from("crew_members")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Get low stock items
      const { count: lowStockCount } = await supabase
        .from("inventory_items")
        .select("*", { count: "exact", head: true })
        .or("category.ilike.%medical%,category.ilike.%medicamento%")
        .lt("quantity", 10);

      const total = totalCrew || 0;
      const issues = monitoring || 0;
      const healthy = Math.max(0, total - issues);

      return {
        attendanceMonth: attendanceMonth || 0,
        monitoring: monitoring || 0,
        healthyPercentage: total > 0 ? Math.round((healthy / total) * 100) : 100,
        healthyCrew: healthy,
        totalCrew: total,
        expiringItems: 0, // No expiry tracking in current schema
        lowStockItems: lowStockCount || supplies.filter(s => s.status === "low" || s.status === "critical").length,
        mlcCompliance: 100, // Assume compliant
      };
    },
    staleTime: 60000,
  });

  // Mutation to add medical record
  const addMedicalRecord = useMutation({
    mutationFn: async (record: {
      crewMemberName: string;
      mood: number;
      energyLevel: number;
      sleepQuality: number;
      stressLevel: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("crew_health_checkins")
        .insert({
          crew_member_name: record.crewMemberName,
          mood: record.mood,
          energy_level: record.energyLevel,
          sleep_quality: record.sleepQuality,
          stress_level: record.stressLevel,
          notes: record.notes,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records"] });
      queryClient.invalidateQueries({ queryKey: ["infirmary-stats"] });
    },
  });

  return {
    supplies,
    records,
    stats: stats || {
      attendanceMonth: 0,
      monitoring: 0,
      healthyPercentage: 100,
      healthyCrew: 0,
      totalCrew: 0,
      expiringItems: 0,
      lowStockItems: 0,
      mlcCompliance: 100,
    },
    isLoading: suppliesLoading || recordsLoading || statsLoading,
    addMedicalRecord,
  };
}
