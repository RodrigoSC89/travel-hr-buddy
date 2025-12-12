import { useEffect, useState, useCallback } from "react";;

// PATCH 284: Mission Control - Mission Planner Component
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Play, Clock, AlertCircle, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Mission {
  id: string;
  mission_code: string;
  name: string;
  description: string;
  mission_type: string;
  priority: string;
  status: string;
  progress_percentage: number;
  estimated_start: string;
  estimated_end: string;
}

interface MissionActivationResult {
  success: boolean;
  mission_id: string;
  mission_name: string;
  activated_at: string;
  first_milestone_id?: string;
  error?: string;
}

export const MissionPlanner: React.FC = () => {
  const { toast } = useToast();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setMissions(data || []);
    } catch (error) {
      console.error("Error fetching missions:", error);
      toast({
        title: "Error",
        description: "Failed to load missions",
        variant: "destructive",
      };
    } finally {
      setLoading(false);
    }
  };

  const activateMission = async (missionId: string) => {
    setActivating(missionId);
    try {
      const { data, error } = await supabase.rpc("activate_mission", {
        p_mission_id: missionId,
      };

      if (error) throw error;

      const result = data as MissionActivationResult;
      
      if (result.success) {
        toast({
          title: "Mission Activated",
          description: `${result.mission_name} is now active`,
        };
        fetchMissions(); // Refresh missions list
      } else {
        throw new Error(result.error || "Activation failed");
      }
    } catch (error) {
      console.error("Activation error:", error);
      toast({
        title: "Activation Failed",
        description: error.message || "Failed to activate mission",
        variant: "destructive",
      });
    } finally {
      setActivating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "active":
      return "bg-green-600";
    case "completed":
      return "bg-blue-600";
    case "ready":
      return "bg-yellow-600";
    case "planning":
      return "bg-gray-600";
    case "paused":
      return "bg-orange-600";
    case "cancelled":
    case "failed":
      return "bg-red-600";
    default:
      return "bg-gray-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical":
      return "border-red-600 bg-red-50";
    case "high":
      return "border-orange-600 bg-orange-50";
    case "normal":
      return "border-blue-600 bg-blue-50";
    case "low":
      return "border-gray-600 bg-gray-50";
    default:
      return "border-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Mission Planner</h2>
            <p className="text-sm text-muted-foreground">Tactical mission planning and execution</p>
          </div>
        </div>
        <Button onClick={fetchMissions} disabled={loading} variant="outline">
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {/* Mission Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Missions</p>
                <p className="text-2xl font-bold">
                  {missions.filter(m => m.status === "active").length}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Planning</p>
                <p className="text-2xl font-bold">
                  {missions.filter(m => m.status === "planning" || m.status === "ready").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {missions.filter(m => m.status === "completed").length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Missions</p>
                <p className="text-2xl font-bold">{missions.length}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Missions List */}
      <div className="space-y-4">
        {missions.map((mission) => (
          <Card key={mission.id} className={`border-l-4 ${getPriorityColor(mission.priority)}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getStatusColor(mission.status)}>
                      {mission.status.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {mission.priority}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {mission.mission_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {mission.mission_code}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{mission.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {mission.description || "No description available"}
                  </CardDescription>
                </div>

                {(mission.status === "ready" || mission.status === "planning") && (
                  <Button
                    size="sm"
                    onClick={() => handleactivateMission}
                    disabled={activating === mission.id}
                    className="ml-4"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    {activating === mission.id ? "Activating..." : "Activate"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Progress Bar */}
                {mission.status === "active" && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{mission.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${mission.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Start:</p>
                    <p className="font-semibold">
                      {mission.estimated_start
                        ? new Date(mission.estimated_start).toLocaleDateString()
                        : "Not scheduled"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End:</p>
                    <p className="font-semibold">
                      {mission.estimated_end
                        ? new Date(mission.estimated_end).toLocaleDateString()
                        : "Not scheduled"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {missions.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No missions found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MissionPlanner;
