// @ts-nocheck
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
    const { count: totalVessels } = await supabase
      .from("vessels")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId);

    const { count: activeVessels } = await supabase
      .from("vessels")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "active");

    // Fetch crew count
    const { count: totalCrew } = await supabase
      .from("crew_profiles")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId);

    const { count: activeCrew } = await supabase
      .from("crew_profiles")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "active");

    // Fetch incidents count
    const { count: totalIncidents } = await supabase
      .from("dp_incidents")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId);

    const { count: openIncidents } = await supabase
      .from("dp_incidents")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "open");

    // Calculate compliance score (simplified)
    const complianceScore = openIncidents && totalIncidents
      ? Math.max(0, 100 - (openIncidents / totalIncidents) * 50)
      : 100;

    return {
      totalVessels: totalVessels || 0,
      activeVessels: activeVessels || 0,
      totalCrew: totalCrew || 0,
      activeCrew: activeCrew || 0,
      totalIncidents: totalIncidents || 0,
      openIncidents: openIncidents || 0,
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
