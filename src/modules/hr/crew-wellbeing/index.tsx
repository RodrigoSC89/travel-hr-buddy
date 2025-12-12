/**
import { useState, useCallback } from "react";;
 * Crew Wellbeing Module - PATCH 390 Complete
 * Health and psychological support system with privacy and aggregated reporting
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WellbeingDashboard } from "./components/WellbeingDashboard";
import { WeeklyAssessment } from "./components/WeeklyAssessment";
import { ManagerAlerts } from "./components/ManagerAlerts";
import { WellbeingHistory } from "./components/WellbeingHistory";
import { Heart, Activity, Brain, TrendingUp } from "lucide-react";

export const CrewWellbeing: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Crew Wellbeing</h1>
          <p className="text-muted-foreground">
            Monitor and support crew health, mental wellbeing, and preventive care - PATCH 390
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Module Features - PATCH 390 Complete</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✅ Comprehensive health and psychological assessment tables</li>
            <li>✅ Weekly wellbeing assessment interface</li>
            <li>✅ Individual and confidential access for crew members</li>
            <li>✅ Aggregated reports for HR (privacy-compliant)</li>
            <li>✅ Critical condition alerts (burnout, injury detection)</li>
            <li>✅ Privacy compliance with data protection</li>
            <li>✅ Weekly health check-in system</li>
            <li>✅ Trend analysis and historical tracking</li>
            <li>✅ Manager alerts for critical situations</li>
            <li>✅ Confidential notes and concerns tracking</li>
          </ul>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">
            <Activity className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="assessment">
            <Brain className="mr-2 h-4 w-4" />
            Assessment
          </TabsTrigger>
          <TabsTrigger value="history">
            <TrendingUp className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Heart className="mr-2 h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <WellbeingDashboard />
        </TabsContent>

        <TabsContent value="assessment" className="space-y-4">
          <WeeklyAssessment />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <WellbeingHistory />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <ManagerAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrewWellbeing;
