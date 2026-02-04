/**
 * Operations Command Data Hook - Full Backend Integration
 * PATCH OPERATIONS-2.0
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VoyageData {
  id: string;
  vessel_id: string | null;
  origin_port: string | null;
  destination_port: string | null;
  departure_date: string | null;
  arrival_date: string | null;
  status: string | null;
  cargo_type: string | null;
  cargo_quantity: number | null;
  created_at: string | null;
}

export interface MissionData {
  id: string;
  name: string;
  mission_type: string | null;
  status: string;
  priority: string | null;
  start_date: string | null;
  end_date: string | null;
  vessel_id: string | null;
  commander_id: string | null;
  objective: string | null;
  created_at: string | null;
}

export interface PortData {
  id: string;
  name: string;
  code: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  port_type: string | null;
  facilities: any;
  status: string | null;
}

export function useOperationsCommandData() {
  const queryClient = useQueryClient();

  // Fetch voyages
  const { data: voyages = [], isLoading: voyagesLoading } = useQuery({
    queryKey: ["operations-voyages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voyages")
        .select(`
          *,
          vessels:vessel_id (name)
        `)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Fetch missions
  const { data: missions = [], isLoading: missionsLoading } = useQuery({
    queryKey: ["operations-missions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Fetch ports
  const { data: ports = [], isLoading: portsLoading } = useQuery({
    queryKey: ["operations-ports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ports")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  // Fetch vessels for fleet operations
  const { data: vessels = [], isLoading: vesselsLoading } = useQuery({
    queryKey: ["operations-vessels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Calculate logistics metrics from voyages (no separate logistics table)
  const logisticsLoading = false;
  const logistics: any[] = [];

  // Create voyage mutation
  const createVoyage = useMutation({
    mutationFn: async (voyageData: Partial<VoyageData>) => {
      const { data, error } = await supabase
        .from("voyages")
        .insert([{
          voyage_number: voyageData.id || `VYG-${Date.now()}`,
          vessel_id: voyageData.vessel_id,
          origin_port: voyageData.origin_port,
          destination_port: voyageData.destination_port,
          departure_date: voyageData.departure_date,
          arrival_date: voyageData.arrival_date,
          status: voyageData.status || "planned",
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations-voyages"] });
      toast.success("Viagem criada com sucesso");
    },
    onError: (error) => {
      toast.error(`Erro ao criar viagem: ${error.message}`);
    },
  });

  // Create mission mutation
  const createMission = useMutation({
    mutationFn: async (missionData: Partial<MissionData>) => {
      const { data, error } = await supabase
        .from("missions")
        .insert([{
          mission_name: missionData.name || "Nova Missão",
          mission_code: `MSN-${Date.now()}`,
          mission_type: missionData.mission_type || "standard",
          status: missionData.status || "planning",
          priority: missionData.priority || "medium",
          start_date: missionData.start_date,
          end_date: missionData.end_date,
          vessel_id: missionData.vessel_id,
          objectives: missionData.objective ? [missionData.objective] : [],
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations-missions"] });
      toast.success("Missão criada com sucesso");
    },
    onError: (error) => {
      toast.error(`Erro ao criar missão: ${error.message}`);
    },
  });

  // Update voyage status
  const updateVoyageStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("voyages")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations-voyages"] });
      toast.success("Status da viagem atualizado");
    },
  });

  // Update mission status
  const updateMissionStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("missions")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations-missions"] });
      toast.success("Status da missão atualizado");
    },
  });

  // Calculate operational metrics
  const operationalMetrics = {
    activeVoyages: voyages.filter((v: any) => v.status === "in_progress" || v.status === "active").length,
    plannedVoyages: voyages.filter((v: any) => v.status === "planned" || v.status === "scheduled").length,
    completedVoyages: voyages.filter((v: any) => v.status === "completed").length,
    activeMissions: missions.filter((m: any) => m.status === "active" || m.status === "in_progress").length,
    totalVessels: vessels.length,
    operationalVessels: vessels.filter((v: any) => v.status === "active" || v.status === "operational").length,
    pendingLogistics: logistics.filter((l: any) => l.status === "pending").length,
    totalPorts: ports.length,
  };

  return {
    // Data
    voyages,
    missions,
    ports,
    vessels,
    logistics,
    metrics: operationalMetrics,
    
    // Loading states
    isLoading: voyagesLoading || missionsLoading || portsLoading || vesselsLoading || logisticsLoading,
    voyagesLoading,
    missionsLoading,
    portsLoading,
    vesselsLoading,
    logisticsLoading,
    
    // Mutations
    createVoyage,
    createMission,
    updateVoyageStatus,
    updateMissionStatus,
  };
}

export default useOperationsCommandData;
