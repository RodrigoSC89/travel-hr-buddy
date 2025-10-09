import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';
import { ModuleHeader } from '@/components/ui/module-header';
import { MaritimeGPT3 } from '@/components/intelligence/maritime-gpt-3';
import { NeuralRouteOptimizer } from '@/components/maritime/neural-route-optimizer';
import { CrewIntelligenceSystem } from '@/components/crew/crew-intelligence-system';
import { PredictiveMaintenanceRevolution } from '@/components/maritime/predictive-maintenance-revolution';
import { QuantumSecurityShield } from '@/components/security/quantum-security-shield';
import { 
  Brain, 
  Navigation, 
  Users,
  Sparkles,
  Wrench,
  Shield,
  Zap
} from 'lucide-react';

const MaritimeSupremo: React.FC = () => {
  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Sparkles}
        title="NAUTILUS ONE SUPREMO"
        description="Sistema Marítimo Mundial Definitivo - Superinteligência e Otimização Avançada"
        gradient="purple"
        badges={[
          { icon: Brain, label: 'MaritimeGPT 3.0' },
          { icon: Zap, label: 'IA Avançada' },
          { icon: Shield, label: 'Segurança Quântica' }
        ]}
      />

      <Tabs defaultValue="maritimegpt" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="maritimegpt" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            MaritimeGPT 3.0
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Route Optimizer
          </TabsTrigger>
          <TabsTrigger value="crew" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Crew Intelligence
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Maintenance AI
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Shield
          </TabsTrigger>
        </TabsList>

        <TabsContent value="maritimegpt" className="mt-6">
          <MaritimeGPT3 />
        </TabsContent>

        <TabsContent value="routes" className="mt-6">
          <NeuralRouteOptimizer />
        </TabsContent>

        <TabsContent value="crew" className="mt-6">
          <CrewIntelligenceSystem />
        </TabsContent>

        <TabsContent value="maintenance" className="mt-6">
          <PredictiveMaintenanceRevolution />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <QuantumSecurityShield />
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default MaritimeSupremo;
