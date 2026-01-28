/**
 * AI Command Center Page
 * Central hub for all AI/ML capabilities
 */

import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UnifiedAIDashboard, 
  AgentOrchestrationPanel, 
  SelfHealingPanel, 
  BlockchainAuditPanel 
} from "@/components/ai/unified";
import { Brain, Users, Activity, Link2 } from "lucide-react";

export default function AICommandCenterPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <>
      <Helmet>
        <title>AI Command Center | Nautilus One</title>
        <meta name="description" content="Central de Inteligência Artificial com 20+ módulos de ML para operações marítimas autônomas" />
      </Helmet>
      
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            AI Command Center
          </h1>
          <p className="text-muted-foreground">
            Plataforma de IA autônoma com 20+ módulos de Machine Learning
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Multi-Agent
            </TabsTrigger>
            <TabsTrigger value="healing" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Self-Healing
            </TabsTrigger>
            <TabsTrigger value="blockchain" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Blockchain Audit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <UnifiedAIDashboard />
          </TabsContent>

          <TabsContent value="agents" className="mt-6">
            <AgentOrchestrationPanel />
          </TabsContent>

          <TabsContent value="healing" className="mt-6">
            <SelfHealingPanel />
          </TabsContent>

          <TabsContent value="blockchain" className="mt-6">
            <BlockchainAuditPanel />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
