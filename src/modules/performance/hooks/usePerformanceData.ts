/**
 * PATCH 193.0 - Performance Data Hook
 * Replaces mock data with real Supabase queries
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PerformanceMetrics {
  fuelEfficiency: number;
  navigationHours: number;
  productivity: number;
  downtime: number;
  totalMissions: number;
}

export interface ChartData {
  name: string;
  value: number;
  label?: string;
}

export const usePerformanceData = (period: number = 7) => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [fuelData, setFuelData] = useState<ChartData[]>([]);
  const [productivityData, setProductivityData] = useState<ChartData[]>([]);
  const [downtimeData, setDowntimeData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPerformanceData();
  }, [period]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      // Try to load real data, fall back to empty states
      
      // Load fleet logs (if table exists)
      const { data: fleetLogs, error: fleetError } = await supabase
        .from("fleet_logs" as any)
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      // Load mission activities
      const { data: missions, error: missionsError } = await supabase
        .from("mission_activities" as any)
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      // Load fuel usage
      const { data: fuelUsage, error: fuelError } = await supabase
        .from("fuel_usage" as any)
        .select("*")
        .gte("recorded_at", startDate.toISOString())
        .order("recorded_at", { ascending: false });

      // Calculate metrics from real data if available
      if (!fleetError && !missionsError && !fuelError) {
        calculateMetrics(fleetLogs || [], missions || [], fuelUsage || []);
      } else {
        // Show empty state with helpful message
        console.warn("Some performance tables not found, showing empty state");
        setMetrics({
          fuelEfficiency: 0,
          navigationHours: 0,
          productivity: 0,
          downtime: 0,
          totalMissions: 0
        });
        setFuelData([]);
        setProductivityData([]);
        setDowntimeData([]);
      }

    } catch (err: any) {
      console.error("Error loading performance data:", err);
      setError(err.message);
      // Show empty state on error
      setMetrics({
        fuelEfficiency: 0,
        navigationHours: 0,
        productivity: 0,
        downtime: 0,
        totalMissions: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (
    fleetLogs: any[],
    missions: any[],
    fuelUsage: any[]
  ) => {
    // Calculate actual metrics from real data
    const totalMissions = missions.length;
    const completedMissions = missions.filter(m => m.status === "completed").length;
    
    const totalFuelUsed = fuelUsage.reduce((sum, f) => sum + (f.amount || 0), 0);
    const totalDistance = missions.reduce((sum, m) => sum + (m.distance || 0), 0);
    const fuelEfficiency = totalDistance > 0 ? (totalDistance / totalFuelUsed) * 100 : 0;

    const totalNavigationMinutes = missions.reduce(
      (sum, m) => sum + (m.duration_minutes || 0), 
      0
    );
    const navigationHours = totalNavigationMinutes / 60;

    const productivity = totalMissions > 0 
      ? (completedMissions / totalMissions) * 100 
      : 0;

    const totalDowntime = fleetLogs
      .filter(log => log.event_type === "downtime")
      .reduce((sum, log) => sum + (log.duration_minutes || 0), 0);

    setMetrics({
      fuelEfficiency: Math.round(fuelEfficiency * 10) / 10,
      navigationHours: Math.round(navigationHours * 10) / 10,
      productivity: Math.round(productivity * 10) / 10,
      downtime: Math.round(totalDowntime / 60 * 10) / 10,
      totalMissions
    });

    // Generate chart data
    generateChartData(fuelUsage, missions, fleetLogs);
  };

  const generateChartData = (
    fuelUsage: any[],
    missions: any[],
    fleetLogs: any[]
  ) => {
    // Fuel data by day
    const fuelByDay = new Map<string, number>();
    fuelUsage.forEach(fuel => {
      const day = new Date(fuel.recorded_at).toLocaleDateString();
      fuelByDay.set(day, (fuelByDay.get(day) || 0) + fuel.amount);
    });
    
    setFuelData(
      Array.from(fuelByDay.entries()).map(([name, value]) => ({
        name,
        value: Math.round(value * 10) / 10
      }))
    );

    // Productivity by day
    const missionsByDay = new Map<string, { total: number; completed: number }>();
    missions.forEach(mission => {
      const day = new Date(mission.created_at).toLocaleDateString();
      const current = missionsByDay.get(day) || { total: 0, completed: 0 };
      current.total += 1;
      if (mission.status === "completed") current.completed += 1;
      missionsByDay.set(day, current);
    });

    setProductivityData(
      Array.from(missionsByDay.entries()).map(([name, stats]) => ({
        name,
        value: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
      }))
    );

    // Downtime by type
    const downtimeByType = new Map<string, number>();
    fleetLogs
      .filter(log => log.event_type === "downtime")
      .forEach(log => {
        const type = log.downtime_reason || "Other";
        downtimeByType.set(type, (downtimeByType.get(type) || 0) + (log.duration_minutes || 0));
      });

    setDowntimeData(
      Array.from(downtimeByType.entries()).map(([name, value]) => ({
        name,
        value: Math.round(value / 60 * 10) / 10
      }))
    );
  };

  return {
    metrics,
    fuelData,
    productivityData,
    downtimeData,
    loading,
    error,
    refreshData: loadPerformanceData
  };
};
