import { useEffect, useState, useCallback } from "react";;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Ship, Users } from "lucide-react";

interface VesselPerformance {
  id: string;
  vessel_name: string;
  overall_performance_rating: number;
  fuel_efficiency_rating: number;
  schedule_adherence_rate: number;
  performance_trend: string;
  evaluation_period_start: string;
  evaluation_period_end: string;
}

interface CrewPerformance {
  id: string;
  crew_member_id: string;
  overall_performance_rating: number;
  efficiency_rating: number;
  quality_score: number;
  performance_trend: string;
  evaluation_period_start: string;
  evaluation_period_end: string;
}

export const PerformanceEngineV1: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [periodFilter, setPeriodFilter] = useState("7");
  const [vesselPerformance, setVesselPerformance] = useState<VesselPerformance[]>([]);
  const [crewPerformance, setCrewPerformance] = useState<CrewPerformance[]>([]);
  const [outliers, setOutliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPerformanceData();
  }, [periodFilter]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const daysAgo = parseInt(periodFilter);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch vessel performance
      const { data: vesselData, error: vesselError } = await supabase
        .from("vessel_performance")
        .select("*")
        .gte("evaluation_period_end", startDate.toISOString().split("T")[0])
        .order("overall_performance_rating", { ascending: false });

      if (vesselError) throw vesselError;

      // Fetch crew performance
      const { data: crewData, error: crewError } = await supabase
        .from("crew_performance")
        .select("*")
        .gte("evaluation_period_end", startDate.toISOString().split("T")[0])
        .order("overall_performance_rating", { ascending: false });

      if (crewError) throw crewError;

      // Fetch outliers
      const { data: outliersData, error: outliersError } = await supabase
        .from("performance_outliers")
        .select("*")
        .eq("is_resolved", false)
        .order("severity", { ascending: false })
        .limit(10);

      if (outliersError) throw outliersError;

      setVesselPerformance(vesselData || []);
      setCrewPerformance(crewData || []);
      setOutliers(outliersData || []);
    } catch (error) {
      console.error("Error fetching performance data:", error);
      toast({
        title: "Error",
        description: "Failed to load performance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "improving":
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "declining":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical": return "bg-red-500";
    case "major": return "bg-orange-500";
    case "moderate": return "bg-yellow-500";
    case "minor": return "bg-blue-500";
    default: return "bg-gray-500";
    }
  };

  const avgVesselRating = vesselPerformance.length > 0
    ? vesselPerformance.reduce((sum, v) => sum + (v.overall_performance_rating || 0), 0) / vesselPerformance.length
    : 0;

  const avgCrewRating = crewPerformance.length > 0
    ? crewPerformance.reduce((sum, c) => sum + (c.overall_performance_rating || 0), 0) / crewPerformance.length
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitoring Engine v1</h1>
          <p className="text-muted-foreground">Real-time fleet and crew performance tracking</p>
        </div>
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vessels Tracked</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vesselPerformance.length}</div>
            <p className="text-xs text-muted-foreground">Active vessels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Vessel Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgVesselRating.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Fleet average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Crew Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crewPerformance.length}</div>
            <p className="text-xs text-muted-foreground">Evaluated crew</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outliers Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{outliers.length}</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vessels">Vessel Performance</TabsTrigger>
          <TabsTrigger value="crew">Crew Performance</TabsTrigger>
          <TabsTrigger value="outliers">Outliers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={vesselPerformance.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vessel_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="overall_performance_rating" stroke="#8884d8" name="Performance" />
                  <Line type="monotone" dataKey="fuel_efficiency_rating" stroke="#82ca9d" name="Fuel Efficiency" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vessels" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Vessel Performance Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vesselPerformance.map((vessel, index) => (
                  <div key={vessel.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <h4 className="font-semibold">{vessel.vessel_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Overall: {vessel.overall_performance_rating?.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(vessel.performance_trend)}
                      <span className="text-sm">{vessel.performance_trend}</span>
                    </div>
                  </div>
                ))}
                {vesselPerformance.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No vessel data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crew" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Crew Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={crewPerformance.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="crew_member_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="overall_performance_rating" fill="#8884d8" name="Overall" />
                  <Bar dataKey="efficiency_rating" fill="#82ca9d" name="Efficiency" />
                  <Bar dataKey="quality_score" fill="#ffc658" name="Quality" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outliers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Outliers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {outliers.map((outlier) => (
                  <div key={outlier.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{outlier.entity_name || outlier.entity_id}</h4>
                        <p className="text-sm text-muted-foreground">{outlier.metric_name}</p>
                      </div>
                      <Badge className={getSeverityColor(outlier.severity)}>
                        {outlier.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Expected: {outlier.expected_value?.toFixed(2)}</span>
                      <span>Actual: {outlier.actual_value?.toFixed(2)}</span>
                      <span className="text-orange-600">
                        Deviation: {outlier.deviation_percentage?.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
                {outliers.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No outliers detected</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceEngineV1;
