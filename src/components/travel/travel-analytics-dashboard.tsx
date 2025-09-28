import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plane, 
  Building, 
  Globe, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Clock,
  MapPin,
  Star,
  Zap,
  Target,
  Award,
  Briefcase
} from 'lucide-react';

interface TravelMetrics {
  totalTrips: number;
  totalSpent: number;
  avgTripCost: number;
  savedAmount: number;
  topDestinations: Array<{
    city: string;
    country: string;
    trips: number;
    cost: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    trips: number;
    cost: number;
  }>;
  departmentBreakdown: Array<{
    department: string;
    trips: number;
    cost: number;
    percentage: number;
  }>;
  aiRecommendations: Array<{
    type: 'cost_saving' | 'route_optimization' | 'booking_timing';
    title: string;
    description: string;
    potential_savings: number;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export const TravelAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<TravelMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    
    // Simular dados de analytics
    setTimeout(() => {
      const mockMetrics: TravelMetrics = {
        totalTrips: 247,
        totalSpent: 1250000,
        avgTripCost: 5060,
        savedAmount: 185000,
        topDestinations: [
          { city: 'São Paulo', country: 'Brasil', trips: 45, cost: 225000 },
          { city: 'Rio de Janeiro', country: 'Brasil', trips: 38, cost: 190000 },
          { city: 'Salvador', country: 'Brasil', trips: 22, cost: 110000 },
          { city: 'Recife', country: 'Brasil', trips: 18, cost: 90000 },
          { city: 'Miami', country: 'EUA', trips: 15, cost: 180000 }
        ],
        monthlyTrends: [
          { month: 'Jan', trips: 18, cost: 90000 },
          { month: 'Fev', trips: 22, cost: 110000 },
          { month: 'Mar', trips: 25, cost: 125000 },
          { month: 'Abr', trips: 20, cost: 100000 },
          { month: 'Mai', trips: 28, cost: 140000 },
          { month: 'Jun', trips: 32, cost: 160000 }
        ],
        departmentBreakdown: [
          { department: 'Operações', trips: 85, cost: 425000, percentage: 34 },
          { department: 'Comercial', trips: 62, cost: 310000, percentage: 25 },
          { department: 'Engenharia', trips: 48, cost: 240000, percentage: 19 },
          { department: 'RH', trips: 32, cost: 160000, percentage: 13 },
          { department: 'Financeiro', trips: 20, cost: 115000, percentage: 9 }
        ],
        aiRecommendations: [
          {
            type: 'cost_saving',
            title: 'Reserva Antecipada',
            description: 'Reserve voos com 3-4 semanas de antecedência para economizar até 25%',
            potential_savings: 45000,
            priority: 'high'
          },
          {
            type: 'route_optimization',
            title: 'Rota Alternativa',
            description: 'Voos diretos para São Paulo podem ser 15% mais econômicos que conexões',
            potential_savings: 28000,
            priority: 'medium'
          },
          {
            type: 'booking_timing',
            title: 'Horários Flexíveis',
            description: 'Voos de terça e quarta-feira são até 20% mais baratos',
            potential_savings: 35000,
            priority: 'high'
          }
        ]
      };
      
      setMetrics(mockMetrics);
      setIsLoading(false);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="travel-card hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Viagens</p>
                <p className="text-3xl font-bold text-primary">{metrics.totalTrips}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% vs mês anterior
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Plane className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="travel-card hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gasto Total</p>
                <p className="text-3xl font-bold text-info">{formatCurrency(metrics.totalSpent)}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3" />
                  -8% vs mês anterior
                </p>
              </div>
              <div className="p-3 rounded-full bg-info/10">
                <DollarSign className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="travel-card hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custo Médio</p>
                <p className="text-3xl font-bold text-warning">{formatCurrency(metrics.avgTripCost)}</p>
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +5% vs mês anterior
                </p>
              </div>
              <div className="p-3 rounded-full bg-warning/10">
                <BarChart3 className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="travel-card hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Economia IA</p>
                <p className="text-3xl font-bold text-success">{formatCurrency(metrics.savedAmount)}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <Zap className="h-3 w-3" />
                  Otimização automática
                </p>
              </div>
              <div className="p-3 rounded-full bg-success/10">
                <Target className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-14 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="destinations" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Destinos
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Departamentos
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            IA Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="travel-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Tendência Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.monthlyTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {trend.month}
                        </div>
                        <div>
                          <p className="font-medium">{trend.trips} viagens</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(trend.cost)}</p>
                        </div>
                      </div>
                      <Progress value={Math.min((trend.trips / 35) * 100, 100)} className="w-24" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="travel-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-success" />
                  Metas e Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-success" />
                    <span className="font-medium">Meta de Economia</span>
                  </div>
                  <Badge className="bg-success text-success-foreground">87% atingida</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-primary" />
                    <span className="font-medium">Satisfação Média</span>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">4.8/5</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-warning" />
                    <span className="font-medium">Tempo Médio</span>
                  </div>
                  <Badge className="bg-warning text-warning-foreground">3.2 dias</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="destinations" className="space-y-4">
          <Card className="travel-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Top Destinos
              </CardTitle>
              <CardDescription>
                Principais destinos por volume de viagens e gastos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topDestinations.map((destination, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{destination.city}</p>
                        <p className="text-sm text-muted-foreground">{destination.country}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{destination.trips} viagens</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(destination.cost)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card className="travel-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Breakdown por Departamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.departmentBreakdown.map((dept, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{dept.department}</span>
                      <span className="text-sm text-muted-foreground">{dept.percentage}%</span>
                    </div>
                    <Progress value={dept.percentage} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{dept.trips} viagens</span>
                      <span>{formatCurrency(dept.cost)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          <div className="grid gap-4">
            {metrics.aiRecommendations.map((recommendation, index) => (
              <Card key={index} className="travel-card hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{recommendation.title}</h3>
                        <Badge className={`text-xs ${getPriorityColor(recommendation.priority)}`}>
                          {recommendation.priority}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{recommendation.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Economia potencial:</span>
                        <span className="text-success font-bold">{formatCurrency(recommendation.potential_savings)}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="btn-travel">
                      Aplicar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};