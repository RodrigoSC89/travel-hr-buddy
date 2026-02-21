/**
 * Fleet Analytics - Connected to Supabase
 * Real vessel performance, fuel, and maintenance data
 */
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Activity, Fuel, Ship, Anchor, AlertTriangle, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--info))"];

const FleetAnalytics: React.FC = () => {
  // Fetch vessels
  const { data: vessels = [], isLoading: loadingVessels } = useQuery({
    queryKey: ['fleet-analytics-vessels'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vessels').select('id, name, status, vessel_type, imo_number');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch maintenance tasks
  const { data: maintenance = [] } = useQuery({
    queryKey: ['fleet-analytics-maintenance'],
    queryFn: async () => {
      const { data, error } = await supabase.from('maintenance_tasks').select('id, status, priority, vessel_id, created_at');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch fuel records
  const { data: fuelRecords = [] } = useQuery({
    queryKey: ['fleet-analytics-fuel'],
    queryFn: async () => {
      const { data, error } = await fromUntyped('fuel_records')
        .select('id, vessel_id, quantity_liters, cost_usd, fuel_type, recorded_at')
        .order('recorded_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch compliance items
  const { data: complianceItems = [] } = useQuery({
    queryKey: ['fleet-analytics-compliance'],
    queryFn: async () => {
      const { data, error } = await supabase.from('compliance_items').select('id, status, severity, vessel_id');
      if (error) throw error;
      return data || [];
    },
  });

  // Computed KPIs
  const totalVessels = vessels.length;
  const activeVessels = vessels.filter(v => v.status === 'active' || v.status === 'operational').length;
  const operationalRate = totalVessels > 0 ? ((activeVessels / totalVessels) * 100).toFixed(1) : '0';

  const openMaintenance = maintenance.filter(m => m.status !== 'completed' && m.status !== 'done').length;
  const criticalMaintenance = maintenance.filter(m => m.priority === 'critical' || m.priority === 'high').length;

  const totalFuelLiters = fuelRecords.reduce((sum: number, r: any) => sum + (r.quantity_liters || 0), 0);
  const totalFuelCost = fuelRecords.reduce((sum: number, r: any) => sum + (r.cost_usd || 0), 0);
  const avgFuelPerVessel = totalVessels > 0 ? (totalFuelLiters / totalVessels).toFixed(0) : '0';

  const compliantItems = complianceItems.filter((c: any) => c.status === 'compliant' || c.status === 'active').length;
  const complianceRate = complianceItems.length > 0 ? ((compliantItems / complianceItems.length) * 100).toFixed(1) : '100';

  // Vessel status distribution for pie chart
  const statusCounts: Record<string, number> = {};
  vessels.forEach(v => { statusCounts[v.status || 'unknown'] = (statusCounts[v.status || 'unknown'] || 0) + 1; });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Maintenance by priority
  const priorityCounts: Record<string, number> = {};
  maintenance.forEach(m => { priorityCounts[m.priority || 'normal'] = (priorityCounts[m.priority || 'normal'] || 0) + 1; });
  const priorityData = Object.entries(priorityCounts).map(([name, value]) => ({ name, value }));

  // Fuel by type
  const fuelTypeCounts: Record<string, number> = {};
  fuelRecords.forEach((r: any) => { fuelTypeCounts[r.fuel_type || 'HFO'] = (fuelTypeCounts[r.fuel_type || 'HFO'] || 0) + (r.quantity_liters || 0); });
  const fuelTypeData = Object.entries(fuelTypeCounts).map(([name, value]) => ({ name, value: Math.round(value) }));

  if (loadingVessels) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Fleet Analytics
        </h2>
        <p className="text-muted-foreground">Dados reais agregados de {totalVessels} embarcações</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Ship className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-3xl font-bold">{operationalRate}%</div>
            <div className="text-sm text-muted-foreground">Taxa Operacional</div>
            <Badge variant="secondary" className="mt-2">{activeVessels}/{totalVessels} ativas</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Fuel className="h-8 w-8 mx-auto mb-2 text-warning" />
            <div className="text-3xl font-bold">{Number(avgFuelPerVessel).toLocaleString()} L</div>
            <div className="text-sm text-muted-foreground">Consumo Médio/Embarcação</div>
            <Badge variant="secondary" className="mt-2">USD {totalFuelCost.toLocaleString()}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <div className="text-3xl font-bold">{openMaintenance}</div>
            <div className="text-sm text-muted-foreground">Manutenções Abertas</div>
            <Badge variant="destructive" className="mt-2">{criticalMaintenance} críticas</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
            <div className="text-3xl font-bold">{complianceRate}%</div>
            <div className="text-sm text-muted-foreground">Compliance Rate</div>
            <Badge variant="secondary" className="mt-2">{compliantItems}/{complianceItems.length}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Status da Frota</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {statusData.map((entry, i) => <Cell key={`status-${entry.name}-${i}`} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center py-8">Sem dados</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Manutenção por Prioridade</CardTitle>
          </CardHeader>
          <CardContent>
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center py-8">Sem dados</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Combustível por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {fuelTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={fuelTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--warning))" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center py-8">Sem dados</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FleetAnalytics;
