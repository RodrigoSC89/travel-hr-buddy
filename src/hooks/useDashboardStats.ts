/**
 * PATCH 548.1 - Dashboard Stats Hook
 * Optimized hook for loading dashboard statistics
 * Fixed: Removed hardcoded organization_id - now uses dynamic context
 * PATCH v28: Removed @ts-nocheck - using proper Database types
 */

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logger } from '@/lib/logger';
import type { Database } from '@/integrations/supabase/types';

type VesselRow = Database['public']['Tables']['vessels']['Row'];

interface DashboardStats {
  totalVessels: number;
  activeCrew: number;
  pendingCertifications: number;
  completedAudits: number;
  activeAlerts: number;
  complianceScore: number;
}

interface Vessel {
  id: string;
  name: string;
  imo_number: string | null;
  vessel_type: string;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalVessels: 0,
    activeCrew: 0,
    pendingCertifications: 0,
    completedAudits: 0,
    activeAlerts: 0,
    complianceScore: 0
  });
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  // Get current user's organization
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Try organization_members first, fallback to organization_users
        let { data: orgUser } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();
        
        if (!orgUser) {
          const { data: legacyOrg } = await supabase
            .from("organization_users")
            .select("organization_id")
            .eq("user_id", user.id)
            .eq("status", "active")
            .maybeSingle();
          orgUser = legacyOrg;
        }

        if (orgUser?.organization_id) {
          setOrganizationId(orgUser.organization_id);
        }
      } catch (error) {
        logger.error("Failed to fetch organization:", error);
      }
    };

    fetchOrganization();
  }, []);

  const loadDashboardData = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Load vessels for user's organization (not hardcoded)
      const { data: vesselsData, error: vesselsError } = await supabase
        .from("vessels")
        .select("id, name, imo_number, vessel_type")
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .limit(5);

      if (!vesselsError && vesselsData) {
        setVessels(vesselsData);
        
        // Load real crew count
        const { count: crewCount } = await supabase
          .from("crew_members")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId)
          .eq("status", "active");

        // Load pending certifications
        const { count: pendingCerts } = await supabase
          .from("maritime_certificates")
          .select("id", { count: "exact", head: true })
          .lt("expiry_date", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());

        // Load completed audits
        const { count: auditsCount } = await supabase
          .from("peotram_audits")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId)
          .eq("status", "completed");

        // Load active alerts from vessel_alerts table
        const { count: alertsCount } = await supabase
          .from("vessel_alerts")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId)
          .eq("status", "active");

        // Calculate compliance score from peotram_audits (exists in schema)
        const { count: totalAudits } = await supabase
          .from("peotram_audits")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId);
        
        const { count: passedAudits } = await supabase
          .from("peotram_audits")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId)
          .eq("status", "completed");
        
        const calculatedScore = totalAudits && totalAudits > 0 
          ? Math.round((passedAudits || 0) / totalAudits * 100) 
          : 95; // Default if no records

        setStats({
          totalVessels: vesselsData.length,
          activeCrew: crewCount || 0,
          pendingCertifications: pendingCerts || 0,
          completedAudits: auditsCount || 0,
          activeAlerts: alertsCount || 0,
          complianceScore: calculatedScore
        });
      } else {
        // Fallback with zeros
        setStats({
          totalVessels: 0,
          activeCrew: 0,
          pendingCertifications: 0,
          completedAudits: 0,
          activeAlerts: 0,
          complianceScore: 0
        });
      }
      
    } catch (error) {
      logger.error("Dashboard data error:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  // Auto-load when organization is available
  useEffect(() => {
    if (organizationId) {
      loadDashboardData();
    }
  }, [organizationId, loadDashboardData]);

  return {
    stats,
    vessels,
    loading,
    organizationId,
    loadDashboardData
  };
};
