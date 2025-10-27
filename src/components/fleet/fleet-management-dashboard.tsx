import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { VesselStatus, MaintenanceAlert, FuelUsage } from '@/types/modules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ship, MapPin, Fuel, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export function FleetManagementDashboard() {
  const [vesselStatuses, setVesselStatuses] = useState<VesselStatus[]>([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlert[]>([]);
  const [fuelUsage, setFuelUsage] = useState<FuelUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFleetData();
    
    // Set up real-time subscription for vessel status updates
    const channel = supabase
      .channel('vessel_status_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vessel_status'
        },
        () => {
          loadFleetData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadFleetData = async () => {
    try {
      const [statusRes, alertsRes, fuelRes] = await Promise.all([
        supabase
          .from('vessel_status')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(10),
        supabase
          .from('maintenance_alerts')
          .select('*')
          .eq('status', 'active')
          .order('severity', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('fuel_usage')
          .select('*')
          .order('recorded_at', { ascending: false })
          .limit(20)
      ]);

      if (statusRes.error) throw statusRes.error;
      if (alertsRes.error) throw alertsRes.error;
      if (fuelRes.error) throw fuelRes.error;

      setVesselStatuses(statusRes.data || []);
      setMaintenanceAlerts(alertsRes.data || []);
      setFuelUsage(fuelRes.data || []);
    } catch (error) {
      console.error('Error loading fleet data:', error);
      toast.error('Failed to load fleet data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      underway: 'default',
      at_anchor: 'secondary',
      moored: 'outline',
      docked: 'outline',
      maintenance: 'destructive',
      emergency: 'destructive',
      offline: 'secondary'
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      low: 'outline',
      medium: 'secondary',
      high: 'default',
      critical: 'destructive'
    };

    return (
      <Badge variant={variants[severity] || 'default'}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const calculateFuelEfficiency = (usage: FuelUsage[]) => {
    if (usage.length === 0) return 0;
    const avgEfficiency = usage.reduce((sum, u) => sum + (u.efficiency_rating || 0), 0) / usage.length;
    return avgEfficiency.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading fleet data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Fleet Management</h2>
          <p className="text-sm text-muted-foreground">
            Real-time vessel tracking, fuel consumption, and maintenance alerts
          </p>
        </div>
        <Button>
          <Ship className="mr-2 h-4 w-4" />
          Add Vessel
        </Button>
      </div>

      <Tabs defaultValue="tracking" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tracking">
            <MapPin className="mr-2 h-4 w-4" />
            Real-Time Tracking
          </TabsTrigger>
          <TabsTrigger value="fuel">
            <Fuel className="mr-2 h-4 w-4" />
            Fuel Management
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Maintenance Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vesselStatuses.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <Ship className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No vessel status data available</p>
                </CardContent>
              </Card>
            ) : (
              vesselStatuses.map((status) => (
                <Card key={status.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <Ship className="mr-2 h-4 w-4" />
                        Vessel {status.vessel_id.substring(0, 8)}
                      </CardTitle>
                      {getStatusBadge(status.status)}
                    </div>
                    <CardDescription>
                      Last update: {new Date(status.timestamp).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {status.latitude && status.longitude && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Position:</span>
                          <span className="font-mono text-xs">
                            {status.latitude.toFixed(4)}, {status.longitude.toFixed(4)}
                          </span>
                        </div>
                      )}
                      {status.speed_knots !== null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Speed:</span>
                          <span className="font-medium">{status.speed_knots} kts</span>
                        </div>
                      )}
                      {status.heading !== null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Heading:</span>
                          <span className="font-medium">{status.heading}°</span>
                        </div>
                      )}
                      {status.fuel_level_percentage !== null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fuel Level:</span>
                          <div className="flex items-center">
                            <div className="w-20 h-2 bg-secondary rounded-full mr-2">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${status.fuel_level_percentage}%` }}
                              />
                            </div>
                            <span className="text-xs">{status.fuel_level_percentage}%</span>
                          </div>
                        </div>
                      )}
                      {status.next_port && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Next Port:</span>
                          <span className="font-medium">{status.next_port}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="fuel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Fuel Efficiency Overview
              </CardTitle>
              <CardDescription>
                Average efficiency rating: {calculateFuelEfficiency(fuelUsage)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {fuelUsage.slice(0, 5).map((usage) => (
                  <div key={usage.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <p className="font-medium">{usage.fuel_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(usage.recorded_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{usage.amount} {usage.unit}</p>
                      {usage.cost && (
                        <p className="text-xs text-muted-foreground">${usage.cost.toFixed(2)}</p>
                      )}
                    </div>
                    {usage.efficiency_rating && (
                      <Badge variant="outline" className="ml-2">
                        {usage.efficiency_rating.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid gap-4">
            {maintenanceAlerts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <Activity className="h-12 w-12 text-green-500 mb-4" />
                  <p className="text-muted-foreground">No active maintenance alerts</p>
                  <p className="text-xs text-muted-foreground mt-2">All systems operating normally</p>
                </CardContent>
              </Card>
            ) : (
              maintenanceAlerts.map((alert) => (
                <Card key={alert.id} className={alert.severity === 'critical' ? 'border-red-500' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        {alert.title}
                      </CardTitle>
                      <div className="flex gap-2">
                        {getSeverityBadge(alert.severity)}
                        <Badge variant="outline">{alert.alert_type.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{alert.description}</p>
                    {alert.due_date && (
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(alert.due_date).toLocaleDateString()}
                      </p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">Acknowledge</Button>
                      <Button size="sm">Resolve</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
