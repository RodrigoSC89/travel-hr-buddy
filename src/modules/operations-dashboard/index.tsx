import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import VesselManagement from "@/components/fleet/vessel-management";
import { VesselTracking } from "@/components/fleet/vessel-tracking";
import { FleetAnalytics } from "@/components/analytics/fleet-analytics";
import EnhancedMetricsDashboard from "@/components/analytics/enhanced-metrics-dashboard";
import { 
  Ship, 
  Navigation, 
  BarChart3, 
  Users,
  Wrench,
  TrendingUp,
  Activity,
  Zap,
  Target,
  Brain
} from "lucide-react";

/**
 * Operations Dashboard - PATCH 89.0
 * Consolidates: Fleet, Performance, Metrics, and Strategic dashboards
 * 
 * Features:
 * - Fleet management and tracking
 * - Performance optimization
 * - KPI tracking and analytics
 * - Crew management
 * - AI-powered recommendations
 */
export default function OperationsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Operations Dashboard</h1>
            <p className="text-muted-foreground">
              Central hub for fleet, crew, and performance management
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Brain className="h-3 w-3" />
            AI-Powered
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Zap className="h-3 w-3" />
            Real-time
          </Badge>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Vessels</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> since last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fleet Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3%</span> improvement
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Crew Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              Across all vessels
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.7/10</div>
            <p className="text-xs text-muted-foreground">
              Overall operations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2 md:grid-cols-5 min-w-fit">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="fleet" className="flex items-center gap-2">
            <Ship className="h-4 w-4" />
            <span>Fleet</span>
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            <span>Tracking</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span>Maintenance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fleet Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Real-time operational status across all vessels
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Operating</span>
                    <Badge variant="outline" className="bg-green-50">18 vessels</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Maintenance</span>
                    <Badge variant="outline" className="bg-yellow-50">4 vessels</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Docked</span>
                    <Badge variant="outline" className="bg-blue-50">2 vessels</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">Route Optimization</p>
                    <p className="text-xs text-blue-700 mt-1">
                      3 vessels can save 8% fuel by adjusting routes
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-900">Maintenance Alert</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      2 vessels require scheduled maintenance in 7 days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <EnhancedMetricsDashboard />
        </TabsContent>

        <TabsContent value="fleet" className="space-y-6">
          <VesselManagement />
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <VesselTracking />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <FleetAnalytics />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Maintenance Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Comprehensive maintenance tracking and scheduling system
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-yellow-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Scheduled</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">Next 30 days</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">In Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4</div>
                    <p className="text-xs text-muted-foreground">Active maintenance</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">28</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
