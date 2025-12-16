/**
 * PATCH 204.0 - Multi-Vessel Context Provider
 * 
 * Provides vessel-scoped data isolation and filtering across the entire application.
 * All data queries are automatically filtered by the currently selected vessel.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

export interface Vessel {
  id: string;
  name: string;
  type: string;
  imo_number?: string;
  flag?: string;
  status: "active" | "inactive" | "maintenance";
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

interface VesselContextType {
  currentVessel: Vessel | null;
  allVessels: Vessel[];
  setCurrentVessel: (vessel: Vessel | null) => void;
  loadVessels: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const VesselContext = createContext<VesselContextType | undefined>(undefined);

interface VesselProviderProps {
  children: ReactNode;
  defaultVesselId?: string;
}

export const VesselProvider: React.FC<VesselProviderProps> = ({ 
  children, 
  defaultVesselId 
}) => {
  const [currentVessel, setCurrentVesselState] = useState<Vessel | null>(null);
  const [allVessels, setAllVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all vessels from database
   */
  const loadVessels = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("vessels")
        .select("*")
        .order("name", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      // Map Supabase schema to Vessel interface
      const mappedVessels: Vessel[] = (data || []).map(v => ({
        id: v.id,
        name: v.name,
        type: v.vessel_type || "unknown",
        imo_number: v.imo_number || undefined,
        flag: v.flag || undefined,
        status: (v.status as "active" | "inactive" | "maintenance") || "active",
        metadata: (v.metadata as Record<string, any>) || {},
        created_at: v.created_at || undefined,
        updated_at: v.updated_at || undefined,
      }));

      setAllVessels(mappedVessels);
      
      // Set default vessel if specified and not already set
      if (defaultVesselId && !currentVessel) {
        const defaultVessel = mappedVessels.find(v => v.id === defaultVesselId);
        if (defaultVessel) {
          setCurrentVesselState(defaultVessel);
          saveVesselToStorage(defaultVessel.id);
        }
      } else if (!currentVessel && mappedVessels.length > 0) {
        // Load from storage or select first vessel
        const storedVesselId = loadVesselFromStorage();
        const vessel = storedVesselId 
          ? mappedVessels.find(v => v.id === storedVesselId) 
          : mappedVessels[0];
        
        if (vessel) {
          setCurrentVesselState(vessel);
          saveVesselToStorage(vessel.id);
        }
      }

      logger.info("Vessels loaded successfully", { count: data?.length || 0 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load vessels";
      logger.error("Error loading vessels:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Set current vessel and persist to storage
   */
  const setCurrentVessel = (vessel: Vessel | null) => {
    setCurrentVesselState(vessel);
    if (vessel) {
      saveVesselToStorage(vessel.id);
      logger.info("Current vessel changed", { vessel: vessel.name, id: vessel.id });
    } else {
      clearVesselFromStorage();
      logger.info("Current vessel cleared");
    }
  };

  /**
   * Load initial vessels on mount
   */
  useEffect(() => {
    loadVessels();
  }, []);

  /**
   * Subscribe to vessel changes (real-time)
   */
  useEffect(() => {
    const channel = supabase
      .channel("vessels_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vessels",
        },
        (payload) => {
          logger.info("Vessel change detected", { event: payload.eventType });
          loadVessels(); // Reload vessels on any change
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const value: VesselContextType = {
    currentVessel,
    allVessels,
    setCurrentVessel,
    loadVessels,
    loading,
    error,
  };

  return (
    <VesselContext.Provider value={value}>
      {children}
    </VesselContext.Provider>
  );
};

/**
 * Hook to access vessel context
 */
export const useVessel = (): VesselContextType => {
  const context = useContext(VesselContext);
  if (!context) {
    throw new Error("useVessel must be used within a VesselProvider");
  }
  return context;
};

/**
 * Hook to get current vessel ID (convenience)
 */
export const useVesselId = (): string | null => {
  const { currentVessel } = useVessel();
  return currentVessel?.id || null;
};

/**
 * Hook to filter queries by current vessel
 */
export const useVesselFilter = () => {
  const vesselId = useVesselId();
  
  return {
    vesselId,
    applyFilter: <T extends { eq: (col: string, value: string) => T }>(query: T): T => {
      if (vesselId) {
        return query.eq("vessel_id", vesselId);
      }
      return query;
    },
  };
};

// ==================== Storage Helpers ====================

const STORAGE_KEY = "nautilus_current_vessel_id";

function saveVesselToStorage(vesselId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, vesselId);
  } catch (error) {
    logger.error("Failed to save vessel to storage:", error);
  }
}

function loadVesselFromStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    logger.error("Failed to load vessel from storage:", error);
    return null;
  }
}

function clearVesselFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    logger.error("Failed to clear vessel from storage:", error);
  }
}

export default VesselProvider;
