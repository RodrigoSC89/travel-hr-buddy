/**
 * AI Enhanced Modules - Página de demonstração de todos os módulos com IA
 */

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Wrench, Users, ShoppingCart, Navigation,
  GraduationCap, Shield, DollarSign, LayoutDashboard, Anchor,
  Terminal, Bot, FlaskConical
} from "lucide-react";

// AI Enhanced Components
import { PredictiveMaintenanceAI } from "@/components/ai/PredictiveMaintenanceAI";
import { CrewIntelligenceAI } from "@/components/crew/CrewIntelligenceAI";
import { ProcurementIntelligenceAI } from "@/components/procurement/ProcurementIntelligenceAI";
import { VoyageIntelligenceAI } from "@/components/voyage/VoyageIntelligenceAI";
import { TrainingAcademyAI } from "@/components/training/TrainingAcademyAI";
import { QHSEAutonomousAI } from "@/components/qhse/QHSEAutonomousAI";
import { PEODPEnhancedAI } from "@/components/peodp/PEODPEnhancedAI";
import { FinanceAnalyticsAI } from "@/components/finance/FinanceAnalyticsAI";
import { CommandCenterAI } from "@/components/command/CommandCenterAI";
import { NaturalLanguageInterface } from "@/components/ai/NaturalLanguageInterface";
import { AutonomousAgentPanel } from "@/components/ai/AutonomousAgentPanel";
import { ScenarioSimulatorPanel } from "@/components/ai/ScenarioSimulatorPanel";

const modules = [
  { id: "command", label: "Command Center", icon: LayoutDashboard, component: CommandCenterAI },
  { id: "nlp", label: "Linguagem Natural", icon: Terminal, component: NaturalLanguageInterface },
  { id: "agent", label: "Agente Autônomo", icon: Bot, component: AutonomousAgentPanel },
  { id: "simulator", label: "Simulador", icon: FlaskConical, component: ScenarioSimulatorPanel },
  { id: "maintenance", label: "Manutenção", icon: Wrench, component: PredictiveMaintenanceAI },
  { id: "crew", label: "Tripulação", icon: Users, component: CrewIntelligenceAI },
  { id: "procurement", label: "Compras", icon: ShoppingCart, component: ProcurementIntelligenceAI },
  { id: "voyage", label: "Viagem", icon: Navigation, component: VoyageIntelligenceAI },
  { id: "training", label: "Treinamento", icon: GraduationCap, component: TrainingAcademyAI },
  { id: "qhse", label: "QHSE", icon: Shield, component: QHSEAutonomousAI },
  { id: "peodp", label: "PEO-DP", icon: Anchor, component: PEODPEnhancedAI },
  { id: "finance", label: "Financeiro", icon: DollarSign, component: FinanceAnalyticsAI },
];

export default function AIEnhancedModules() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
          <Brain className="h-8 w-8 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Nautilus One - Módulos com IA Integrada
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
              Revolucionário
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            Todos os módulos potencializados com LLM para uma gestão marítima inteligente
          </p>
        </div>
      </div>

      {/* Modules Tabs */}
      <Tabs defaultValue="command" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
          {modules.map((mod) => (
            <TabsTrigger
              key={mod.id}
              value={mod.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <mod.icon className="h-4 w-4 mr-2" />
              {mod.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {modules.map((mod) => (
          <TabsContent key={mod.id} value={mod.id}>
            <mod.component />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
