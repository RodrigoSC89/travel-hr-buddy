/**
 * Revolutionary AI Module - Index
 * Central export for all revolutionary AI features
 */

// Core Features
export { NaturalLanguageCommand } from './NaturalLanguageCommand';
export { FleetCockpit360 } from './FleetCockpit360';
export { PredictiveMaintenanceScheduler } from './PredictiveMaintenanceScheduler';
export { LiveInventoryMap } from './LiveInventoryMap';
export { AutonomousAgent } from './AutonomousAgent';
export { ScenarioSimulator } from './ScenarioSimulator';
export { AuditAssistant } from './AuditAssistant';
export { SupplierComparator } from './SupplierComparator';

// Feature Descriptions for Navigation
export const REVOLUTIONARY_FEATURES = [
  {
    id: 'natural-language',
    name: 'Comando Universal',
    description: 'Controle o sistema por voz ou texto em linguagem natural',
    icon: 'Command',
    component: 'NaturalLanguageCommand',
    category: 'IA Conversacional'
  },
  {
    id: 'fleet-cockpit',
    name: 'Cockpit 360°',
    description: 'Visão completa de cada embarcação com IA contextual',
    icon: 'Ship',
    component: 'FleetCockpit360',
    category: 'Operações'
  },
  {
    id: 'predictive-maintenance',
    name: 'Manutenção Preditiva',
    description: 'Agenda inteligente baseada em ML e telemetria',
    icon: 'Wrench',
    component: 'PredictiveMaintenanceScheduler',
    category: 'Manutenção'
  },
  {
    id: 'live-inventory',
    name: 'Estoque Vivo',
    description: 'Visualização geográfica com previsão de ruptura',
    icon: 'Package',
    component: 'LiveInventoryMap',
    category: 'Logística'
  },
  {
    id: 'autonomous-agent',
    name: 'Agente Autônomo',
    description: 'IA que monitora, decide e age proativamente',
    icon: 'Brain',
    component: 'AutonomousAgent',
    category: 'Automação'
  },
  {
    id: 'scenario-simulator',
    name: 'Simulador de Cenários',
    description: 'Teste hipóteses e veja impacto financeiro',
    icon: 'Calculator',
    component: 'ScenarioSimulator',
    category: 'Análise'
  },
  {
    id: 'audit-assistant',
    name: 'Assistente de Auditoria',
    description: 'Gere dossiês para ANTAQ, DPC, IMO automaticamente',
    icon: 'FileSearch',
    component: 'AuditAssistant',
    category: 'Compliance'
  },
  {
    id: 'supplier-comparator',
    name: 'Comparador de Fornecedores',
    description: 'IA avalia e recomenda melhores fornecedores',
    icon: 'Building2',
    component: 'SupplierComparator',
    category: 'Procurement'
  }
];
