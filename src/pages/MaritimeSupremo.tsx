import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Shield
} from 'lucide-react';

const MaritimeSupremo: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Sparkles className="h-10 w-10 text-primary" />
          NAUTILUS ONE SUPREMO
        </h1>
        <p className="text-xl text-muted-foreground">
          Sistema Marítimo Mundial Definitivo - Superinteligência e Otimização Avançada
        </p>
      </div>

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
    </div>
  );
};

export default MaritimeSupremo;
