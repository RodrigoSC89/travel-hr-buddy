/**
 * Revolutionary AI Hub Page
 * Central page for all revolutionary AI features
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Command, Ship, Wrench, Package, Brain, Calculator, 
  FileSearch, Building2, Sparkles, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

// Import all revolutionary features
import { NaturalLanguageCommand } from '@/modules/revolutionary-ai/NaturalLanguageCommand';
import { FleetCockpit360 } from '@/modules/revolutionary-ai/FleetCockpit360';
import { PredictiveMaintenanceScheduler } from '@/modules/revolutionary-ai/PredictiveMaintenanceScheduler';
import { LiveInventoryMap } from '@/modules/revolutionary-ai/LiveInventoryMap';
import { AutonomousAgent } from '@/modules/revolutionary-ai/AutonomousAgent';
import { ScenarioSimulator } from '@/modules/revolutionary-ai/ScenarioSimulator';
import { AuditAssistant } from '@/modules/revolutionary-ai/AuditAssistant';
import { SupplierComparator } from '@/modules/revolutionary-ai/SupplierComparator';

const FEATURES = [
  { 
    id: 'command', 
    name: 'Comando Universal', 
    icon: Command, 
    color: 'text-blue-400',
    description: 'Linguagem natural'
  },
  { 
    id: 'cockpit', 
    name: 'Cockpit 360°', 
    icon: Ship, 
    color: 'text-cyan-400',
    description: 'Visão da frota'
  },
  { 
    id: 'maintenance', 
    name: 'Manutenção Preditiva', 
    icon: Wrench, 
    color: 'text-amber-400',
    description: 'ML + Telemetria'
  },
  { 
    id: 'inventory', 
    name: 'Estoque Vivo', 
    icon: Package, 
    color: 'text-green-400',
    description: 'Mapa geográfico'
  },
  { 
    id: 'agent', 
    name: 'Agente Autônomo', 
    icon: Brain, 
    color: 'text-purple-400',
    description: 'IA proativa'
  },
  { 
    id: 'simulator', 
    name: 'Simulador', 
    icon: Calculator, 
    color: 'text-pink-400',
    description: 'What-if analysis'
  },
  { 
    id: 'audit', 
    name: 'Auditoria', 
    icon: FileSearch, 
    color: 'text-indigo-400',
    description: 'Dossiês automáticos'
  },
  { 
    id: 'suppliers', 
    name: 'Fornecedores', 
    icon: Building2, 
    color: 'text-orange-400',
    description: 'Comparação IA'
  },
];

export default function RevolutionaryAI() {
  const [activeTab, setActiveTab] = useState('command');

  const renderContent = () => {
    switch (activeTab) {
      case 'command': return <NaturalLanguageCommand />;
      case 'cockpit': return <FleetCockpit360 />;
      case 'maintenance': return <PredictiveMaintenanceScheduler />;
      case 'inventory': return <LiveInventoryMap />;
      case 'agent': return <AutonomousAgent />;
      case 'simulator': return <ScenarioSimulator />;
      case 'audit': return <AuditAssistant />;
      case 'suppliers': return <SupplierComparator />;
      default: return <NaturalLanguageCommand />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-primary/10 via-background to-primary/5">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/20">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Funcionalidades Revolucionárias</h1>
              <p className="text-muted-foreground">
                IA de nova geração para operações marítimas
              </p>
            </div>
            <Badge variant="outline" className="ml-auto bg-primary/10 text-primary border-primary/30">
              15 Funcionalidades Ativas
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-3 overflow-x-auto">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              const isActive = activeTab === feature.id;
              return (
                <motion.button
                  key={feature.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(feature.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'bg-background hover:bg-muted border border-border/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? '' : feature.color}`} />
                  <span className="font-medium">{feature.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
}
