/**
 * Command Mega-Hub - Central Operacional Unificada
 * Rota canônica: /command
 * 
 * Consolida: Central de Comando + NOC + SOC + Comms + Alerts
 * 
 * ✅ WORLD-CLASS COMPONENTS INTEGRATED
 */

import React, { Suspense, lazy } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Compass, Activity, BarChart3, Eye, Shield, Bell, Radio } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedActionBar } from '@/components/ui/world-class/EnhancedActionBar';
import { PremiumTimeline } from '@/components/ui/world-class/PremiumTimeline';
import { WorkflowStatusBar } from '@/components/ui/world-class/WorkflowStatusBar';

// Lazy load sub-components
const CentralComando = lazy(() => import('@/pages/CentralComando'));
const OperationsOverviewPage = lazy(() => import('@/pages/command/OperationsOverviewPage'));
const ExecutiveDashboardPage = lazy(() => import('@/pages/command/ExecutiveDashboardPage'));
const NOC = lazy(() => import('@/pages/NOC'));
const SOCPage = lazy(() => import('@/pages/SOCPage'));
const CommunicationCommandCenter = lazy(() => import('@/pages/CommunicationCommandCenter'));
const AlertsCommandCenter = lazy(() => import('@/pages/AlertsCommandCenter'));

const LoadingSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <Skeleton className="h-64" />
  </div>
);

const tabConfig = [
  { id: 'overview', label: 'Overview', icon: Compass, path: '/command' },
  { id: 'operations', label: 'Operations', icon: Activity, path: '/command/operations' },
  { id: 'executive', label: 'Executive', icon: BarChart3, path: '/command/executive' },
  { id: 'noc', label: 'NOC 24/7', icon: Eye, path: '/command/noc' },
  { id: 'soc', label: 'SOC Security', icon: Shield, path: '/command/soc' },
  { id: 'comms', label: 'Comms', icon: Radio, path: '/command/comms' },
  { id: 'alerts', label: 'Alerts', icon: Bell, path: '/command/alerts' },
];

// Timeline events for command center
const commandTimelineEvents = [
  {
    id: '1',
    title: 'Port Entry Approved',
    description: 'MV Atlantic Star cleared for Santos port entry',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    type: 'success' as const,
    user: 'Captain Silva',
    metadata: { vessel: 'Atlantic Star', port: 'Santos' }
  },
  {
    id: '2',
    title: 'Weather Alert',
    description: 'Storm warning issued for Gulf region - vessel rerouting recommended',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    type: 'warning' as const,
    metadata: { region: 'Gulf of Mexico' }
  },
  {
    id: '3',
    title: 'Maintenance Completed',
    description: 'Engine overhaul completed on MV Pacific Voyager',
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
    type: 'info' as const,
    user: 'Chief Engineer Costa',
    metadata: { vessel: 'Pacific Voyager' }
  },
  {
    id: '4',
    title: 'Security Incident',
    description: 'Unauthorized vessel approach detected - SOC monitoring',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    type: 'error' as const,
    user: 'SOC Operator',
    metadata: { status: 'Active Monitoring' }
  },
];

export default function CommandMegaHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleActionBarAction = (action: string) => {
    console.log(`Command action: ${action}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Compass className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Command Center</h1>
                <p className="text-sm text-muted-foreground">Central Operacional Unificada</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              MEGA-HUB A
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[73px] z-10">
          <div className="container">
            <TabsList className="h-12 bg-transparent gap-2 justify-start overflow-x-auto">
              {tabConfig.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="container py-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <TabsContent value="overview" className="mt-0 space-y-6">
              {/* Enhanced Action Bar */}
              <EnhancedActionBar
                title="Executive Command Panel"
                subtitle="Real-time fleet operations overview"
                actions={[
                  {
                    id: 'refresh',
                    label: 'Refresh Data',
                    icon: <Activity className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('refresh'),
                    variant: 'outline'
                  },
                  {
                    id: 'export',
                    label: 'Export Report',
                    icon: <BarChart3 className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('export'),
                    variant: 'outline'
                  },
                  {
                    id: 'alerts',
                    label: 'View All Alerts',
                    icon: <Bell className="h-4 w-4" />,
                    onClick: () => setSearchParams({ tab: 'alerts' }),
                    variant: 'default'
                  }
                ]}
                showSearch
                searchPlaceholder="Search vessels, voyages, alerts..."
              />

              {/* Workflow Status */}
              <WorkflowStatusBar
                title="Fleet Operations Status"
                steps={[
                  { id: 'planning', label: 'Planning', status: 'completed' },
                  { id: 'dispatch', label: 'Dispatch', status: 'completed' },
                  { id: 'transit', label: 'In Transit', status: 'current' },
                  { id: 'arrival', label: 'Arrival', status: 'pending' },
                  { id: 'completed', label: 'Completed', status: 'pending' }
                ]}
                variant="horizontal"
              />

              {/* Main Content with Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <CentralComando />
                </div>
                <div className="lg:col-span-1">
                  <PremiumTimeline
                    title="Activity Feed"
                    events={commandTimelineEvents}
                    maxItems={10}
                    showFilters
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="operations" className="mt-0">
              <OperationsOverviewPage />
            </TabsContent>
            
            <TabsContent value="executive" className="mt-0">
              <ExecutiveDashboardPage />
            </TabsContent>
            
            <TabsContent value="noc" className="mt-0">
              <NOC />
            </TabsContent>
            
            <TabsContent value="soc" className="mt-0">
              <SOCPage />
            </TabsContent>
            
            <TabsContent value="comms" className="mt-0">
              <CommunicationCommandCenter />
            </TabsContent>
            
            <TabsContent value="alerts" className="mt-0">
              <AlertsCommandCenter />
            </TabsContent>
          </Suspense>
        </div>
      </Tabs>
    </div>
  );
}
