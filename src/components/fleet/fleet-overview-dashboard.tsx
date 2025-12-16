import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Ship, 
  Activity, 
  MapPin, 
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Fuel,
  Users,
  Clock,
  BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { useToast } from "@/hooks/use-toast";

interface FleetStats {
  totalVessels: number;
  activeVessels: number;
  maintenanceVessels: number;
  criticalAlerts: number;
  efficiency: number;
}

interface FleetOverviewProps {
  stats: FleetStats;
  onRefresh: () => void;
}

const FleetOverviewDashboard: React.FC<FleetOverviewProps> = ({ stats, onRefresh }) => {
  const { toast } = useToast();
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [fleetDistribution, setFleetDistribution] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Performance data for the last 7 days
    const performance = [
      { day: "Seg", efficiency: 85, fuel: 120, speed: 18 },
      { day: "Ter", efficiency: 87, fuel: 115, speed: 19 },
      { day: "Qua", efficiency: 90, fuel: 110, speed: 20 },
      { day: "Qui", efficiency: 88, fuel: 118, speed: 18.5 },
      { day: "Sex", efficiency: 92, fuel: 108, speed: 21 },
      { day: "Sáb", efficiency: 89, fuel: 112, speed: 19.5 },
      { day: "Dom", efficiency: 91, fuel: 105, speed: 20.5 }
    ];

    // Fleet distribution by type
    const distribution = [
      { name: "Porta-contêineres", value: 8, color: "#22c55e" },
      { name: "Graneleiros", value: 5, color: "#3b82f6" },
      { name: "Petroleiros", value: 3, color: "#f59e0b" },
      { name: "Cargueiros", value: 2, color: "#8b5cf6" }
    ];

    // Recent activities
    const activities = [
      {
        id: "1",
        type: "arrival",
        vessel: "MV Atlântico",
        location: "Porto de Santos",
        time: "2 horas atrás",
        status: "success"
      },
      {
        id: "2",
        type: "departure",
        vessel: "MV Pacífico",
        location: "Porto de Paranaguá",
        time: "4 horas atrás",
        status: "info"
      },
      {
        id: "3",
        type: "maintenance",
        vessel: "MV Índico",
        location: "Estaleiro Suape",
        time: "6 horas atrás",
        status: "warning"
      },
      {
        id: "4",
        type: "alert",
        vessel: "MV Mediterrâneo",
        location: "Alto Mar",
        time: "8 horas atrás",
        status: "error"
      }
    ];

    setPerformanceData(performance);
    setFleetDistribution(distribution);
    setRecentActivities(activities);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
    case "arrival":
      return <MapPin className="h-4 w-4 text-success" />;
    case "departure":
      return <Ship className="h-4 w-4 text-info" />;
    case "maintenance":
      return <Clock className="h-4 w-4 text-warning" />;
    case "alert":
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    default:
      return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityStatus = (status: string) => {
    switch (status) {
    case "success":
      return "bg-success/10 border-success/20";
    case "info":
      return "bg-info/10 border-info/20";
    case "warning":
      return "bg-warning/10 border-warning/20";
    case "error":
      return "bg-destructive/10 border-destructive/20";
    default:
      return "bg-muted/10 border-muted/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Ocupação</p>
                <p className="text-2xl font-bold text-success">94.2%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">+2.1%</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Consumo Médio</p>
                <p className="text-2xl font-bold text-info">112 L/h</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">-3.5%</span>
                </div>
              </div>
              <Fuel className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tripulação Total</p>
                <p className="text-2xl font-bold text-warning">186</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">+1.2%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold text-primary">18.7h</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">-0.8h</span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance da Frota (7 dias)
            </CardTitle>
            <CardDescription>
              Eficiência operacional e consumo de combustível
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="day" 
                  fontSize={12}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  name="Eficiência (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="fuel" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Combustível (L/h)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fleet Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-azure-600" />
              Distribuição da Frota
            </CardTitle>
            <CardDescription>
              Composição por tipo de embarcação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie
                    data={fleetDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {fleetDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="flex-1 space-y-2">
                {fleetDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activities and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimos eventos da frota em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className={`p-4 rounded-lg border ${getActivityStatus(activity.status)}`}
                >
                  <div className="flex items-start gap-3">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{activity.vessel}</p>
                      <p className="text-sm text-muted-foreground">{activity.location}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>
              Operações frequentes da frota
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Ship className="h-4 w-4 mr-2" />
              Adicionar Embarcação
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Agendar Manutenção
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Gerenciar Tripulação
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MapPin className="h-4 w-4 mr-2" />
              Rastrear Frota
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Relatório de Incidentes
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Efficiency Meters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Indicadores de Eficiência
          </CardTitle>
          <CardDescription>
            Métricas de performance em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Eficiência Operacional</span>
                <span className="text-sm text-success">87.5%</span>
              </div>
              <Progress value={87.5} className="h-2" />
              <p className="text-xs text-muted-foreground">Meta: 90%</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Pontualidade</span>
                <span className="text-sm text-success">94.2%</span>
              </div>
              <Progress value={94.2} className="h-2" />
              <p className="text-xs text-muted-foreground">Meta: 95%</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Satisfação da Tripulação</span>
                <span className="text-sm text-warning">78.9%</span>
              </div>
              <Progress value={78.9} className="h-2" />
              <p className="text-xs text-muted-foreground">Meta: 85%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FleetOverviewDashboard;