import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMissionControlStore, Mission, MissionResource, MissionStatusUpdate } from "../store/useMissionControlStore";

export function useMissionOperations() {
  const { toast } = useToast();
  const {
    setMissions,
    addMission,
    updateMission,
    setMissionResources,
    addMissionResource,
    setMissionUpdates,
    addMissionUpdate
  } = useMissionControlStore();

  const loadMissions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMissions(data as Mission[]);
      return data as Mission[];
    } catch (error: any) {
      console.error("Error loading missions:", error);
      toast({
        title: "Error",
        description: "Failed to load missions",
        variant: "destructive"
      });
      return [];
    }
  }, [setMissions, toast]);

  const createMission = useCallback(async (missionData: Partial<Mission>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("missions")
        .insert([{ ...missionData, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;

      addMission(data as Mission);
      toast({
        title: "Success",
        description: "Mission created successfully"
      });
      return data as Mission;
    } catch (error: any) {
      console.error("Error creating mission:", error);
      toast({
        title: "Error",
        description: "Failed to create mission",
        variant: "destructive"
      });
      return null;
    }
  }, [addMission, toast]);

  return {
    loadMissions,
    createMission
  };
}
