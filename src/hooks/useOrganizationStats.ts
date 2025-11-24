/**
 * PATCH 609 - Organization Stats Hook with SWR Cache
 * Provides cached organization statistics with automatic revalidation
 */

import useSWR from "swr";
import { supabase } from "@/integrations/supabase/client";

export interface OrganizationStats {
  totalVessels: number;
  activeVessels: number;
  totalCrew: number;
  activeCrew: number;
  totalIncidents: number;
  openIncidents: number;
  complianceScore: number;
  lastUpdated: string;
}

const fetcher = async (organizationId: string): Promise<OrganizationStats> => {
  try {
    // Fetch vessels count
    const vesselsTotal = await supabase
      .from("vessels")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId);

    const totalVessels = vesselsTotal.count || 0;

    const vesselsActive = await supabase
      .from("vessels")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "active");

    const activeVessels = vesselsActive.count || 0;

    // Fetch crew count
    const crewTotal = await supabase
      .from("crew_members")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId);

    const totalCrew = crewTotal.count || 0;

    const crewActive = await supabase
      .from("crew_members")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "active");

    const activeCrew = crewActive.count || 0;

    // Fetch incidents count
    const incidentsTotal = await supabase
      .from("dp_incidents")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId);

    const totalIncidents = incidentsTotal.count || 0;

    const incidentsOpen = await supabase
      .from("dp_incidents")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "open");

    const openIncidents = incidentsOpen.count || 0;

    // Calculate compliance score (simplified)
    const complianceScore = totalIncidents > 0
      ? Math.max(0, 100 - (openIncidents / totalIncidents) * 50)
      : 100;

    return {
      totalVessels,
      activeVessels,
      totalCrew,
      activeCrew,
      totalIncidents,
      openIncidents,
      complianceScore: Math.round(complianceScore),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching organization stats:", error);
    // Return default values on error
    return {
      totalVessels: 0,
      activeVessels: 0,
      totalCrew: 0,
      activeCrew: 0,
      totalIncidents: 0,
      openIncidents: 0,
      complianceScore: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
};

export function useOrganizationStats(organizationId?: string) {
  const { data, error, isLoading, mutate } = useSWR<OrganizationStats>(
    organizationId ? `/api/organization-stats/${organizationId}` : null,
    () => fetcher(organizationId!),
    {
      refreshInterval: 60000, // Refresh every 60 seconds
      revalidateOnFocus: true,
      dedupingInterval: 30000, // Dedupe requests within 30 seconds
    }
  );

  return {
    stats: data || {
      totalVessels: 0,
      activeVessels: 0,
      totalCrew: 0,
      activeCrew: 0,
      totalIncidents: 0,
      openIncidents: 0,
      complianceScore: 0,
      lastUpdated: new Date().toISOString(),
    },
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
