/**
 * PATCH 406: Consolidated Crew Management Module
 * Unifies src/modules/crew/ and src/modules/operations/crew/
 * Route: /crew-management with redirects from legacy paths
 * Mobile-responsive tabs: overview, members, certifications, rotations, performance
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Award, Calendar, TrendingUp, LayoutGrid } from "lucide-react";
import { CrewOverview } from "./components/CrewOverview";
import { CrewMembers } from "./components/CrewMembers";
import { CrewCertifications } from "./components/CrewCertifications";
import { CrewRotations } from "./components/CrewRotations";
import { CrewPerformance } from "./components/CrewPerformance";

export default function CrewManagement() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Crew Management</h1>
        <p className="text-muted-foreground">
          Unified crew management system for personnel, certifications, rotations, and performance tracking
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Members</span>
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Certifications</span>
          </TabsTrigger>
          <TabsTrigger value="rotations" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Rotations</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Performance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <CrewOverview />
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <CrewMembers />
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <CrewCertifications />
        </TabsContent>

        <TabsContent value="rotations" className="space-y-4">
          <CrewRotations />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <CrewPerformance />
        </TabsContent>
      </Tabs>
    </div>
  );
}
