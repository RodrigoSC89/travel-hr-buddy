/**
 * Fleet Management Service
 * PATCH 103.0
 */

import { supabase } from "@/services/supabase";
import type { Vessel, VesselFilter } from "../types";

/**
 * Fetch all vessels with optional filtering
 */
export async function fetchVessels(filter?: VesselFilter): Promise<Vessel[]> {
  let query = supabase.from("vessels").select("*").order("name", { ascending: true });

  if (filter?.status && filter.status.length > 0) {
    query = query.in("status", filter.status);
  }

  if (filter?.maintenanceStatus && filter.maintenanceStatus.length > 0) {
    query = query.in("maintenance_status", filter.maintenanceStatus);
  }

  if (filter?.searchTerm) {
    query = query.or(
      `name.ilike.%${filter.searchTerm}%,imo_code.ilike.%${filter.searchTerm}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching vessels:", error);
    throw new Error(`Failed to fetch vessels: ${error.message}`);
  }

  return (data as Vessel[]) || [];
}

/**
 * Fetch a single vessel by ID
 */
export async function fetchVesselById(id: string): Promise<Vessel | null> {
  const { data, error } = await supabase
    .from("vessels")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching vessel:", error);
    return null;
  }

  return data as Vessel;
}

/**
 * Update vessel position
 */
export async function updateVesselPosition(
  vesselId: string,
  position: { lat: number; lng: number; course?: number; speed?: number }
): Promise<void> {
  const { error } = await supabase
    .from("vessels")
    .update({
      last_known_position: {
        ...position,
        timestamp: new Date().toISOString(),
      },
    })
    .eq("id", vesselId);

  if (error) {
    console.error("Error updating vessel position:", error);
    throw new Error(`Failed to update vessel position: ${error.message}`);
  }
}

/**
 * Update vessel status
 */
export async function updateVesselStatus(
  vesselId: string,
  status: string,
  maintenanceStatus?: string,
  maintenanceNotes?: string
): Promise<void> {
  const updates: Record<string, unknown> = { status };

  if (maintenanceStatus) {
    updates.maintenance_status = maintenanceStatus;
  }

  if (maintenanceNotes) {
    updates.maintenance_notes = maintenanceNotes;
  }

  const { error } = await supabase
    .from("vessels")
    .update(updates)
    .eq("id", vesselId);

  if (error) {
    console.error("Error updating vessel status:", error);
    throw new Error(`Failed to update vessel status: ${error.message}`);
  }
}

/**
 * Create a new vessel
 */
export async function createVessel(vessel: Partial<Vessel>): Promise<Vessel> {
  const { data, error } = await supabase
    .from("vessels")
    .insert([vessel])
    .select()
    .single();

  if (error) {
    console.error("Error creating vessel:", error);
    throw new Error(`Failed to create vessel: ${error.message}`);
  }

  return data as Vessel;
}

/**
 * Delete a vessel
 */
export async function deleteVessel(vesselId: string): Promise<void> {
  const { error } = await supabase
    .from("vessels")
    .delete()
    .eq("id", vesselId);

  if (error) {
    console.error("Error deleting vessel:", error);
    throw new Error(`Failed to delete vessel: ${error.message}`);
  }
}

/**
 * Subscribe to vessel updates (real-time)
 */
export function subscribeToVesselUpdates(
  callback: (payload: { new: Vessel; old?: Vessel }) => void
) {
  return supabase
    .channel("vessels-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "vessels" },
      (payload) => {
        callback(payload as { new: Vessel; old?: Vessel });
      }
    )
    .subscribe();
}
