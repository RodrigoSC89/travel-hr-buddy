/**
 * ComplianceRoadmapPage - Página unificada do Roadmap de Compliance
 * Integra Dashboard, Alertas, Scoring, Workflow NC e Análise Preditiva
 */

import { Suspense, lazy, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LayoutDashboard, Bell, Calculator, GitBranch, Brain
} from 'lucide-react';

// Lazy load components for better performance
const ComplianceRoadmapDashboard = lazy(() => 
  import('@/components/compliance/roadmap/ComplianceRoadmapDashboard').then(m => ({ default: m.ComplianceRoadmapDashboard }))
);
const SmartAlertsSystem = lazy(() => 
  import('@/components/compliance/roadmap/SmartAlertsSystem').then(m => ({ default: m.SmartAlertsSystem }))
);
const AutoScoringEngine = lazy(() => 
  import('@/components/compliance/roadmap/AutoScoringEngine').then(m => ({ default: m.AutoScoringEngine }))
);
const NCAutomaticWorkflow = lazy(() => 
  import('@/components/compliance/roadmap/NCAutomaticWorkflow').then(m => ({ default: m.NCAutomaticWorkflow }))
);
const PredictiveComplianceAI = lazy(() => 
  import('@/components/compliance/roadmap/PredictiveComplianceAI').then(m => ({ default: m.PredictiveComplianceAI }))
);

const LoadingFallback = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
    <Skeleton className="h-64" />
  </div>
);

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'alerts', label: 'Alertas', icon: Bell },
  { id: 'scoring', label: 'Scoring', icon: Calculator },
  { id: 'workflow', label: 'Fluxo NC', icon: GitBranch },
  { id: 'predictive', label: 'Preditivo', icon: Brain }
];

export default function ComplianceRoadmapPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <>
      <Helmet>
        <title>Compliance Roadmap - Nautilus One</title>
        <meta name="description" content="Dashboard avançado de conformidade com alertas inteligentes, scoring automático, workflow de NCs e análise preditiva com IA" />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Centro de Compliance Avançado</h1>
          <p className="text-muted-foreground">
            Gestão inteligente de conformidade com automação e IA preditiva
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mt-6">
            <Suspense fallback={<LoadingFallback />}>
              <TabsContent value="dashboard" className="m-0">
                <ComplianceRoadmapDashboard />
              </TabsContent>
              
              <TabsContent value="alerts" className="m-0">
                <SmartAlertsSystem />
              </TabsContent>
              
              <TabsContent value="scoring" className="m-0">
                <AutoScoringEngine />
              </TabsContent>
              
              <TabsContent value="workflow" className="m-0">
                <NCAutomaticWorkflow />
              </TabsContent>
              
              <TabsContent value="predictive" className="m-0">
                <PredictiveComplianceAI />
              </TabsContent>
            </Suspense>
          </div>
        </Tabs>
      </div>
    </>
  );
}
