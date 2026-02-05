/**
 * Maintenance Mega-Hub - Manutenção & Engenharia
 * Rota canônica: /maintenance
 * 
 * Consolida: Maintenance Hub + Drydock + Fuel + Digital Twin + MARPOL + ESG
 */

import React, { Suspense, lazy } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Wrench, Shield, Brain, Anchor, Fuel, Cpu, Trash2, Leaf, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
  const mode = searchParams.get('mode'); // For 3D mode in Digital Twin

  const handleTabChange = (value: string) => {
    const params: Record<string, string> = { tab: value };
    if (value === 'digital-twin' && mode) {
      params.mode = mode;
    }
    setSearchParams(params);
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
            <TabsContent value="overview" className="mt-0">
              <MaintenanceHub />
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
