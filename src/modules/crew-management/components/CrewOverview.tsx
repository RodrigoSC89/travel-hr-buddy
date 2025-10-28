/**
 * Crew Overview Component - Dashboard view with key metrics
 * PATCH 446: Consolidated crew management with Supabase integration
 */

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Award, Calendar, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CrewStats {
  totalCrew: number;
  activeCrew: number;
  onRotation: number;
  expiringCerts: number;
}

export function CrewOverview() {
  const [stats, setStats] = useState<CrewStats>({
    totalCrew: 0,
    activeCrew: 0,
    onRotation: 0,
    expiringCerts: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCrewStats();
  }, []);

  const fetchCrewStats = async () => {
    try {
      // Get total crew count
      const { count: totalCrew, error: totalError } = await supabase
        .from("crew_members")
        .select("*", { count: "exact", head: true });

      if (totalError) throw totalError;

      // Get active crew count (onboard)
      const { count: activeCrew, error: activeError } = await supabase
        .from("crew_members")
        .select("*", { count: "exact", head: true })
        .eq("onboard_status", true);

      if (activeError) throw activeError;

      // Get active assignments count
      const { count: onRotation, error: rotationError } = await supabase
        .from("crew_assignments")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      if (rotationError) throw rotationError;

      // Get expiring certifications count (within 90 days)
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

      const { count: expiringCerts, error: expiringError } = await supabase
        .from("crew_certifications")
        .select("*", { count: "exact", head: true })
        .eq("status", "valid")
        .lte("expiry_date", ninetyDaysFromNow.toISOString().split("T")[0])
        .gt("expiry_date", new Date().toISOString().split("T")[0]);

      if (expiringError) throw expiringError;

      setStats({
        totalCrew: totalCrew || 0,
        activeCrew: activeCrew || 0,
        onRotation: onRotation || 0,
        expiringCerts: expiringCerts || 0,
      });
    } catch (error) {
      console.error("Error fetching crew stats:", error);
      toast({
        title: "Error",
        description: "Failed to load crew statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Crew</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCrew}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeCrew} onboard
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.onRotation}</div>
          <p className="text-xs text-muted-foreground">
            Currently assigned
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Certifications</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.expiringCerts}</div>
          <p className="text-xs text-muted-foreground">
            Expiring in 90 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alerts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.expiringCerts}</div>
          <p className="text-xs text-muted-foreground">
            Require attention
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
