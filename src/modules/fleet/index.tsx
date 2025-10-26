import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Ship, 
  Users, 
  AlertTriangle, 
  Activity,
  MapPin,
  Wrench,
  FileText,
  BarChart3,
  Settings,
  Plus
} from "lucide-react";

/**
 * PATCH 191.0 - Unified Fleet Management Module
 * 
 * Consolidated from operations/fleet and operations/maritime-system
 * 
 * Core fleet management functionality:
 * - Vessel tracking and monitoring
 * - Maintenance scheduling and records
 * - Crew assignments
 * - Route management
 * - Fleet analytics
 * 
 * Database Integration:
 * - vessels: Vessel information, status, location
 * - maintenance: Maintenance records and scheduling
 * - crew_assignments: Crew-to-vessel assignments
 * - routes: Voyage planning and route management
 * 
 * Related Modules:
 * - /maritime: Specialized maritime operations (checklists, certifications, IoT)
 * - /mission-control: Tactical operations hub
 */

interface VesselData {
  id: string;
  name: string;
  status: string;
  location: string;
  lastUpdate: string;
}

interface MaintenanceData {
  id: string;
  vessel_id: string;
  type: string;
  scheduled_date: string;
  status: string;
}

interface CrewAssignment {
  id: string;
  vessel_id: string;
  crew_member_id: string;
  role: string;
  assigned_date: string;
}

const FleetModule = () => {
  const { toast } = useToast();
  const [vessels, setVessels] = useState<VesselData[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceData[]>([]);
  const [crewAssignments, setCrewAssignments] = useState<CrewAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFleetData();
  }, []);

  const loadFleetData = async () => {
    try {
      setLoading(true);

      // Load vessels
      const { data: vesselsData, error: vesselsError } = await supabase
        .from('vessels')
        .select('*')
        .order('name');

      if (vesselsError) {
        console.error('Error loading vessels:', vesselsError);
      } else {
        setVessels((vesselsData as any[]) || []);
      }

      // Load maintenance records
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance' as any)
        .select('*')
        .order('scheduled_date', { ascending: false });

      if (maintenanceError) {
        console.error('Error loading maintenance:', maintenanceError);
      } else {
        setMaintenance((maintenanceData as any[]) || []);
      }

      // Load crew assignments
      const { data: crewData, error: crewError } = await supabase
        .from('crew_assignments' as any)
        .select('*')
        .order('start_date', { ascending: false });

      if (crewError) {
        console.error('Error loading crew assignments:', crewError);
      } else {
        setCrewAssignments((crewData as any[]) || []);
      }

    } catch (error) {
      console.error('Error loading fleet data:', error);
      toast({
        title: "Error",
        description: "Failed to load fleet data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const activeVessels = vessels.filter(v => v.status === 'active').length;
  const pendingMaintenance = maintenance.filter(m => m.status === 'pending').length;
  const totalCrew = crewAssignments.length;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading fleet data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Ship className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Fleet Management</h1>
            <p className="text-muted-foreground">Unified fleet and maritime operations center</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Vessel
        </Button>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Vessels</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVessels}</div>
            <p className="text-xs text-muted-foreground">
              {vessels.length > 0 ? Math.round((activeVessels / vessels.length) * 100) : 0}% operational
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Crew Assigned</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCrew}</div>
            <p className="text-xs text-muted-foreground">Active assignments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingMaintenance}</div>
            <p className="text-xs text-muted-foreground">Pending tasks</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tracked Positions</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVessels}/{vessels.length}</div>
            <p className="text-xs text-muted-foreground">Real-time tracking</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="vessels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vessels">Vessels</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="crew">Crew</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="vessels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vessel Fleet</CardTitle>
              <CardDescription>Manage and monitor all vessels in your fleet</CardDescription>
            </CardHeader>
            <CardContent>
              {vessels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Ship className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No vessels found. Add your first vessel to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vessels.map((vessel) => (
                    <div key={vessel.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Ship className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">{vessel.name}</p>
                          <p className="text-sm text-muted-foreground">{vessel.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={vessel.status === 'active' ? 'default' : 'secondary'}>
                          {vessel.status}
                        </Badge>
                        <Button variant="outline" size="sm">Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
              <CardDescription>Track and manage vessel maintenance activities</CardDescription>
            </CardHeader>
            <CardContent>
              {maintenance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No maintenance records found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenance.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Wrench className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-semibold">{item.type}</p>
                          <p className="text-sm text-muted-foreground">{item.scheduled_date}</p>
                        </div>
                      </div>
                      <Badge variant={item.status === 'pending' ? 'destructive' : 'default'}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crew" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crew Assignments</CardTitle>
              <CardDescription>Manage crew members and their vessel assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {crewAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No crew assignments found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {crewAssignments.slice(0, 5).map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Users className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-semibold">{assignment.role}</p>
                          <p className="text-sm text-muted-foreground">Assigned: {assignment.assigned_date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Route Management</CardTitle>
              <CardDescription>Plan and track vessel routes and navigation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Route management interface coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fleet Analytics</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Analytics dashboard coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FleetModule;
