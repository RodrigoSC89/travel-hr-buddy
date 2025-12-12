/**
 * PATCH 539 - useDroneState Hook
 * React hook for drone state management and commands
 */

import { useEffect, useState, useCallback } from "react";
import { 
  droneCommandService, 
  DroneState, 
  DroneCommand, 
  CommandResponse 
} from "@/lib/drone/command-service";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";

export interface UseDroneStateOptions {
  enableSupabase?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useDroneState(options: UseDroneStateOptions = {}) {
  const {
    enableSupabase = false,
    autoRefresh = false,
    refreshInterval = 5000
  } = options;

  const [drones, setDrones] = useState<DroneState[]>([]);
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Subscribe to drone updates
  useEffect(() => {
    const unsubscribe = droneCommandService.subscribe((updatedDrones) => {
      setDrones(updatedDrones);
    });

    // Initial load
    setDrones(droneCommandService.getDrones());
    setIsConnected(droneCommandService.isConnected());

    return unsubscribe;
  }, []);

  // Load drones from Supabase
  useEffect(() => {
    if (!enableSupabase) return;

    const loadDronesFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from("drones" as any)
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          logger.error("Error loading drones from Supabase:", error);
          return;
        }

        if (data) {
          data.forEach((droneData: any) => {
            droneCommandService.registerMockDrone({
              id: droneData.id,
              name: droneData.name,
              status: droneData.status,
              position: droneData.position,
              battery: droneData.battery || 0,
              signal: droneData.signal || 0,
              temperature: droneData.temperature,
              lastUpdate: droneData.last_update || new Date().toISOString(),
              mission: droneData.mission_id,
              errors: droneData.errors || []
            });
          });
        }
      } catch (error) {
        logger.error("Error in loadDronesFromSupabase:", error);
      }
    });

    loadDronesFromSupabase();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("drones-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "drones"
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const droneData = payload.new;
            droneCommandService.registerMockDrone({
              id: droneData.id,
              name: droneData.name,
              status: droneData.status,
              position: droneData.position,
              battery: droneData.battery || 0,
              signal: droneData.signal || 0,
              temperature: droneData.temperature,
              lastUpdate: droneData.last_update || new Date().toISOString(),
              mission: droneData.mission_id,
              errors: droneData.errors || []
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    });
  }, [enableSupabase]);

  // Auto-refresh connection status
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setIsConnected(droneCommandService.isConnected());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Send command to drone
  const sendCommand = useCallback(async (
    droneId: string,
    command: DroneCommand,
    params?: Record<string, any>
  ): Promise<CommandResponse> => {
    if (isSending) {
      return {
        success: false,
        droneId,
        command,
        message: "Another command is being sent",
        timestamp: new Date().toISOString()
      });
    }

    setIsSending(true);
    try {
      const response = await droneCommandService.sendCommand(droneId, command, params);

      // Log to Supabase if enabled
      if (enableSupabase) {
        try {
          await supabase.from("drone_commands" as any).insert({
            drone_id: droneId,
            command,
            params,
            success: response.success,
            message: response.message,
            timestamp: response.timestamp
          });
        } catch (error) {
          logger.error("Error logging command to Supabase:", error);
        }
      }

      // Show toast notification
      if (response.success) {
        toast({
          title: "Command Sent",
          description: `${command} command sent to ${droneId}`
        });
      } else {
        toast({
          title: "Command Failed",
          description: response.message,
          variant: "destructive"
        });
      }

      return response;
    } catch (error) {
      logger.error("Error sending command:", error);
      toast({
        title: "Command Error",
        description: "Failed to send command to drone",
        variant: "destructive"
      });
      return {
        success: false,
        droneId,
        command,
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsSending(false);
    }
  }, [isSending, enableSupabase, toast]);

  // Get drone by ID
  const getDrone = useCallback((droneId: string): DroneState | undefined => {
    return drones.find(d => d.id === droneId);
  }, [drones]);

  // Get drones by status
  const getDronesByStatus = useCallback((status: DroneState["status"]): DroneState[] => {
    return drones.filter(d => d.status === status);
  }, [drones]);

  // Check if drone is available for commands
  const isDroneAvailable = useCallback((droneId: string): boolean => {
    const drone = getDrone(droneId);
    if (!drone) return false;
    return drone.status !== "offline" && drone.status !== "error" && drone.battery > 10;
  }, [getDrone]);

  // Register mock drone (for testing)
  const registerMockDrone = useCallback((drone: DroneState) => {
    droneCommandService.registerMockDrone(drone);
    
    toast({
      title: "Drone Registered",
      description: `${drone.name} has been added`
    });
  }, [toast]);

  // Clear all drones
  const clearDrones = useCallback(() => {
    droneCommandService.clear();
    setSelectedDrone(null);
  }, []);

  return {
    drones,
    selectedDrone,
    setSelectedDrone,
    isConnected,
    isSending,
    sendCommand,
    getDrone,
    getDronesByStatus,
    isDroneAvailable,
    registerMockDrone,
    clearDrones
  };
}
