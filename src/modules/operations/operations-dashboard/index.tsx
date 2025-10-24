import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship, Users, Calendar, TrendingUp, AlertCircle, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { runAIContext } from "@/ai/kernel";
import { logger } from "@/lib/logger";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface OperationalStats {
  activeFleet: number;
  activeCrewMembers: number;
  todayMissions: number;
  weeklyOperations: Array<{ week: string; operations: number }>;
}

interface AIInsight {
  type: string;
  message: string;
  confidence: number;
}

const OperationsDashboard = () => {
  const [stats, setStats] = useState<OperationalStats>({
    activeFleet: 0,
    activeCrewMembers: 0,
    todayMissions: 0,
    weeklyOperations: [],
  });
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    logger.info("OperationsDashboard mounted");
    loadOperationalData();
    loadAIInsights();
  }, []);

  const loadOperationalData = async () => {
    try {
      logger.info("Loading operational data from Supabase");
      
      // Query active fleet
      const { data: fleetData, error: fleetError } = await supabase
        .from('vessels')
        .select('id')
        .eq('status', 'active');
      
      if (fleetError) {
        logger.error("Error loading fleet data", fleetError);
      }

      // Query active crew members
      const { data: crewData, error: crewError } = await supabase
        .from('crew_members')
        .select('id')
        .eq('status', 'active');
      
      if (crewError) {
        logger.error("Error loading crew data", crewError);
      }

      // Query missions for today
      const today = new Date().toISOString().split('T')[0];
      const { data: missionsData, error: missionsError } = await supabase
        .from('missions')
        .select('id')
        .gte('scheduled_date', today)
        .lt('scheduled_date', `${today}T23:59:59`);
      
      if (missionsError) {
        logger.error("Error loading missions data", missionsError);
      }

      // Query operations history (last 8 weeks)
      const eightWeeksAgo = new Date();
      eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
      
      const { data: operationsData, error: operationsError } = await supabase
        .from('missions')
        .select('id, scheduled_date')
        .gte('scheduled_date', eightWeeksAgo.toISOString());
      
      if (operationsError) {
        logger.error("Error loading operations history", operationsError);
      }

      // Process weekly operations data
      const weeklyOps = processWeeklyOperations(operationsData || []);

      setStats({
        activeFleet: fleetData?.length || 0,
        activeCrewMembers: crewData?.length || 0,
        todayMissions: missionsData?.length || 0,
        weeklyOperations: weeklyOps,
      });

      logger.info("Operational data loaded successfully", { 
        fleet: fleetData?.length,
        crew: crewData?.length,
        missions: missionsData?.length 
      });
      
      setLoading(false);
    } catch (err) {
      logger.error("Failed to load operational data", err);
      setError("Failed to load operational data");
      setLoading(false);
    }
  };

  const processWeeklyOperations = (operations: any[]) => {
    const weekMap = new Map<string, number>();
    const weeks = [];
    
    // Generate last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      const weekLabel = `Week ${8 - i}`;
      weekMap.set(weekLabel, 0);
      weeks.push(weekLabel);
    }

    // Count operations per week
    operations.forEach((op) => {
      const opDate = new Date(op.scheduled_date);
      const weeksAgo = Math.floor((Date.now() - opDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      if (weeksAgo >= 0 && weeksAgo < 8) {
        const weekLabel = `Week ${8 - weeksAgo}`;
        weekMap.set(weekLabel, (weekMap.get(weekLabel) || 0) + 1);
      }
    });

    return weeks.map(week => ({
      week,
      operations: weekMap.get(week) || 0,
    }));
  };

  const loadAIInsights = async () => {
    try {
      logger.info("Requesting AI insights for operations-dashboard");
      
      const response = await runAIContext({
        module: "operations-dashboard",
        action: "analyze",
        context: {
          timestamp: new Date().toISOString(),
        },
      });

      setAiInsight({
        type: response.type,
        message: response.message,
        confidence: response.confidence,
      });

      logger.info("AI insights loaded successfully", { confidence: response.confidence });
    } catch (err) {
      logger.error("Failed to load AI insights", err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="h-8 w-8 text-primary animate-pulse" />
          <h1 className="text-3xl font-bold">Operations Dashboard</h1>
        </div>
        <p className="text-muted-foreground">Loading operational data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <h1 className="text-3xl font-bold">Operations Dashboard</h1>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Operations Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Fleet</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeFleet}</div>
            <p className="text-xs text-muted-foreground">Vessels in operation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Crew</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCrewMembers}</div>
            <p className="text-xs text-muted-foreground">Crew members on duty</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Missions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayMissions}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Operations Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Operations History (Last 8 Weeks)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.weeklyOperations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="operations" fill="#8884d8" name="Operations" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {aiInsight && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              AI Operational Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Type:</span>
                <span className="text-sm text-muted-foreground capitalize">{aiInsight.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Confidence:</span>
                <span className="text-sm text-muted-foreground">{aiInsight.confidence.toFixed(1)}%</span>
              </div>
              <p className="text-sm mt-4">{aiInsight.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operations Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Module Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Real-time operations dashboard with KPIs for active fleet, crew deployment, and mission scheduling.
            Powered by live Supabase data and AI-driven insights for operational performance optimization.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OperationsDashboard;
