/**
 * Maintenance Mega-Hub - Manutenção & Engenharia
 * Rota canônica: /maintenance
 * 
 * Consolida: Maintenance Hub + Drydock + Fuel + Digital Twin + MARPOL + ESG
 * 
 * ✅ WORLD-CLASS COMPONENTS INTEGRATED
 */

import React, { Suspense, lazy, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Wrench, Shield, Brain, Anchor, Fuel, Cpu, Trash2, Leaf, Calendar, Plus, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedActionBar } from '@/components/ui/world-class/EnhancedActionBar';
import { WorkflowStatusBar } from '@/components/ui/world-class/WorkflowStatusBar';
import { MaintenanceGanttCalendar } from '@/components/world-class';

// Lazy load sub-components
const MaintenanceHub = lazy(() => import('@/pages/MaintenanceHubPremium'));
const ClassSurveysPage = lazy(() => import('@/pages/maintenance/ClassSurveysPage'));
const DrydockManagement = lazy(() => import('@/pages/DrydockManagement'));
const PredictiveMaintenancePage = lazy(() => import('@/pages/PredictiveMaintenancePage'));
const FuelManagementPage = lazy(() => import('@/pages/FuelManagementPage'));
const DigitalTwinPage = lazy(() => import('@/pages/DigitalTwinPage'));
const WasteManagementPremium = lazy(() => import('@/pages/WasteManagementPremium'));
const ESGEmissionsPremium = lazy(() => import('@/pages/ESGEmissionsPremium'));

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
  { id: 'overview', label: 'Overview', icon: Wrench },
  { id: 'planning', label: 'Planning', icon: Calendar },
  { id: 'surveys', label: 'Class Surveys', icon: Shield },
  { id: 'predictive', label: 'Predictive', icon: Brain },
  { id: 'drydock', label: 'Drydock', icon: Anchor },
  { id: 'fuel', label: 'Fuel & ROB', icon: Fuel },
  { id: 'digital-twin', label: 'Digital Twin', icon: Cpu },
  { id: 'waste-marpol', label: 'MARPOL & Waste', icon: Trash2 },
  { id: 'esg', label: 'ESG Emissions', icon: Leaf },
];

export default function MaintenanceMegaHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const mode = searchParams.get('mode');

  const handleTabChange = (value: string) => {
    const params: Record<string, string> = { tab: value };
    if (value === 'digital-twin' && mode) {
      params.mode = mode;
    }
    setSearchParams(params);
  };

  const handleActionBarAction = (action: string) => {
    console.log(`Maintenance action: ${action}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Wrench className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Maintenance Hub</h1>
                <p className="text-sm text-muted-foreground">Manutenção, ESG & Digital Twin</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
              MEGA-HUB C
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
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white gap-2"
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
                title="Maintenance Command Center"
                subtitle="Plan, track, and optimize vessel maintenance"
                actions={[
                  {
                    id: 'new-work-order',
                    label: 'New Work Order',
                    icon: <Plus className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('new-work-order'),
                    variant: 'default'
                  },
                  {
                    id: 'schedule-survey',
                    label: 'Schedule Survey',
                    icon: <Calendar className="h-4 w-4" />,
                    onClick: () => setSearchParams({ tab: 'surveys' }),
                    variant: 'outline'
                  },
                  {
                    id: 'export',
                    label: 'Export Report',
                    icon: <Download className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('export'),
                    variant: 'outline'
                  }
                ]}
                showSearch
                searchPlaceholder="Search work orders, vessels, surveys..."
              />

              {/* Workflow Status */}
              <WorkflowStatusBar
                title="Maintenance Workflow"
                steps={[
                  { id: 'request', label: 'Request', status: 'completed' },
                  { id: 'planning', label: 'Planning', status: 'completed' },
                  { id: 'approval', label: 'Approval', status: 'current' },
                  { id: 'execution', label: 'Execution', status: 'pending' },
                  { id: 'verification', label: 'Verification', status: 'pending' }
                ]}
                variant="horizontal"
              />

              {/* Original Maintenance Hub */}
              <MaintenanceHub />
            </TabsContent>

            <TabsContent value="planning" className="mt-0 space-y-6">
              {/* Enhanced Action Bar for Planning */}
              <EnhancedActionBar
                title="Maintenance Planning"
                subtitle="Visual Gantt and calendar view of all maintenance activities"
                actions={[
                  {
                    id: 'new-task',
                    label: 'New Task',
                    icon: <Plus className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('new-task'),
                    variant: 'default'
                  },
                  {
                    id: 'export',
                    label: 'Export Schedule',
                    icon: <Download className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('export-schedule'),
                    variant: 'outline'
                  }
                ]}
              />

              {/* World-Class Gantt Calendar */}
              <MaintenanceGanttCalendar />
            </TabsContent>
            
            <TabsContent value="surveys" className="mt-0">
              <ClassSurveysPage />
            </TabsContent>
            
            <TabsContent value="predictive" className="mt-0">
              <PredictiveMaintenancePage />
            </TabsContent>
            
            <TabsContent value="drydock" className="mt-0">
              <DrydockManagement />
            </TabsContent>
            
            <TabsContent value="fuel" className="mt-0">
              <FuelManagementPage />
            </TabsContent>
            
            <TabsContent value="digital-twin" className="mt-0">
              <DigitalTwinPage />
            </TabsContent>
            
            <TabsContent value="waste-marpol" className="mt-0">
              <WasteManagementPremium />
            </TabsContent>
            
            <TabsContent value="esg" className="mt-0">
              <ESGEmissionsPremium />
            </TabsContent>
          </Suspense>
        </div>
      </Tabs>
    </div>
  );
}
