import React, { useState } from 'react';
import { AIAssistantPanel } from '@/components/innovation/AIAssistantPanel';
import { BusinessIntelligence } from '@/components/innovation/BusinessIntelligence';
import { SmartWorkflow } from '@/components/innovation/SmartWorkflow';
import { SystemHealthDashboard } from '@/components/innovation/SystemHealthDashboard';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, BarChart3, Zap, Shield } from 'lucide-react';

const Innovation = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <BackToDashboard />
      
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-primary/80">
          <Bot className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold gradient-text">Centro de Inovação</h1>
          <p className="text-muted-foreground">
            IA, Automação, Business Intelligence e Segurança Avançada
          </p>
        </div>
      </div>

      <Tabs defaultValue="ai-assistant" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Assistente IA
          </TabsTrigger>
          <TabsTrigger value="business-intelligence" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Business Intelligence
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automações
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-assistant">
          <AIAssistantPanel />
        </TabsContent>

        <TabsContent value="business-intelligence">
          <BusinessIntelligence />
        </TabsContent>

        <TabsContent value="automation">
          <SmartWorkflow />
        </TabsContent>

        <TabsContent value="security">
          <SystemHealthDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Innovation;