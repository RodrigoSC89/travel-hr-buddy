import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from './kpi-cards';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/layout/error-boundary';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { usePermissions } from '@/hooks/use-permissions';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  FileCheck, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Target,
  Clock,
  CheckCircle,
  BarChart3,
  PieChart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPI, Cell } from 'recharts';

interface DashboardStats {
  totalEmployees: number;
  activeCertificates: number;
  expiringCertificates: number;
  totalAlerts: number;
  completionRate: number;
  monthlyTrend: Array<{ month: string; certificates: number; alerts: number }>;
  certificatesByType: Array<{ name: string; value: number; color: string }>;
}

export const ExecutiveDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { hasPermission, userRole, getRoleDisplayName } = usePermissions();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar dados dos certificados
      const { data: certificates, error: certError } = await supabase
        .from('employee_certificates')
        .select('*');

      if (certError) throw certError;

      // Buscar dados dos alertas
      const { data: alerts, error: alertsError } = await supabase
        .from('certificate_alerts')
        .select('*');

      if (alertsError) throw alertsError;

      // Buscar dados dos usuários
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Calcular estatísticas
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

      const activeCerts = certificates?.filter(cert => 
        new Date(cert.expiry_date) > now
      ).length || 0;

      const expiringCerts = certificates?.filter(cert => {
        const expiryDate = new Date(cert.expiry_date);
        return expiryDate > now && expiryDate <= thirtyDaysFromNow;
      }).length || 0;

      // Agrupar certificados por tipo
      const certTypes = certificates?.reduce((acc, cert) => {
        acc[cert.certificate_type] = (acc[cert.certificate_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const certificatesByType = Object.entries(certTypes).map(([name, value], index) => ({
        name,
        value,
        color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'][index % 5]
      }));

      // Simular dados mensais (últimos 6 meses)
      const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return {
          month: date.toLocaleDateString('pt-BR', { month: 'short' }),
          certificates: Math.floor(Math.random() * 20) + 10,
          alerts: Math.floor(Math.random() * 8) + 2
        };
      });

      const dashboardStats: DashboardStats = {
        totalEmployees: profiles?.length || 0,
        activeCertificates: activeCerts,
        expiringCertificates: expiringCerts,
        totalAlerts: alerts?.length || 0,
        completionRate: certificates?.length ? Math.round((activeCerts / certificates.length) * 100) : 0,
        monthlyTrend,
        certificatesByType
      };

      setStats(dashboardStats);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard' },
    { label: 'Executivo', current: true }
  ];

  if (!hasPermission('analytics', 'read')) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Você não tem permissão para acessar este dashboard</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        <LoadingSpinner size="lg" text="Carregando dashboard executivo..." className="h-48" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive">{error || 'Erro ao carregar dados'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <Breadcrumbs items={breadcrumbItems} />
            <h1 className="text-3xl font-bold tracking-tight mt-2">Dashboard Executivo</h1>
            <p className="text-muted-foreground">
              Visão estratégica para {getRoleDisplayName(userRole || 'employee')}
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total de Funcionários"
            value={stats.totalEmployees}
            description="Cadastrados no sistema"
            icon={Users}
            trend={{
              value: 5.2,
              isPositive: true,
              period: "mês anterior"
            }}
          />
          
          <KPICard
            title="Certificados Ativos"
            value={stats.activeCertificates}
            description="Válidos atualmente"
            icon={FileCheck}
            trend={{
              value: -2.1,
              isPositive: false,
              period: "mês anterior"
            }}
          />
          
          <KPICard
            title="Expirando em 30 dias"
            value={stats.expiringCertificates}
            description="Requer atenção"
            icon={AlertTriangle}
            className="border-orange-200"
          />
          
          <KPICard
            title="Taxa de Conformidade"
            value={`${stats.completionRate}%`}
            description="Certificados válidos"
            icon={CheckCircle}
            trend={{
              value: 3.8,
              isPositive: true,
              period: "mês anterior"
            }}
          />
        </div>

        {/* Gráficos */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Tendência Mensal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tendência Mensal
              </CardTitle>
              <CardDescription>
                Certificados emitidos e alertas gerados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="certificates" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Certificados"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="alerts" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Alertas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuição por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Certificados por Tipo
              </CardTitle>
              <CardDescription>
                Distribuição dos tipos de certificados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPI>
                  <Tooltip />
                  {stats.certificatesByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPI>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {stats.certificatesByType.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo de Ações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Ações Recomendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Urgente</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats.expiringCertificates} certificados expirando em 30 dias
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Gestão</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Revisar políticas de certificação
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Planejamento</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Agendar treinamentos para Q1
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};