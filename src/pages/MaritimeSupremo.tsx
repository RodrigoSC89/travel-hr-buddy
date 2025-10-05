import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MaritimeGPT3 } from '@/components/intelligence/maritime-gpt-3';
import { NeuralRouteOptimizer } from '@/components/maritime/neural-route-optimizer';
import { CrewIntelligenceSystem } from '@/components/crew/crew-intelligence-system';
import { 
  Brain, 
  Navigation, 
  Users,
  Sparkles
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="maritimegpt" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            MaritimeGPT 3.0
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Neural Route Optimizer
          </TabsTrigger>
          <TabsTrigger value="crew" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Crew Intelligence
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
      </Tabs>
    </div>
  );
};

export default MaritimeSupremo;
