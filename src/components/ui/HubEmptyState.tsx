/**
 * HubEmptyState - Empty state inteligente para Mega-Hubs
 * 
 * Responde: "O que posso fazer aqui?" quando não há dados.
 * Inclui ícone contextual, descrição, dicas e CTA primário.
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Ship, Wrench, Brain, Satellite, Shield, Briefcase, Compass,
  Plus, ArrowRight, Lightbulb, Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HubEmptyStateProps {
  hub: 'command' | 'ops' | 'maintenance' | 'ai' | 'tracking' | 'compliance' | 'workbench';
  onPrimaryAction?: () => void;
  className?: string;
}

const hubConfig = {
  command: {
    icon: Compass,
    title: 'Sua Central de Comando está pronta',
    description: 'Cadastre embarcações e viagens para ver KPIs, alertas e atividades em tempo real aqui.',
    tips: [
      'Cadastre sua primeira embarcação no Hub de Operações',
      'Crie uma viagem para ver o fluxo operacional',
      'Configure alertas para monitoramento automático',
    ],
    actionLabel: 'Ir para Operações',
    actionRoute: '/ops',
  },
  ops: {
    icon: Ship,
    title: 'Nenhuma operação registrada',
    description: 'Cadastre embarcações, crie viagens e gerencie contratos para começar a operar.',
    tips: [
      'Adicione embarcações com dados de IMO e classificação',
      'Crie viagens com portos de origem e destino',
      'Vincule contratos a embarcações e viagens',
    ],
    actionLabel: 'Cadastrar Embarcação',
  },
  maintenance: {
    icon: Wrench,
    title: 'Nenhuma ordem de serviço',
    description: 'Crie ordens de serviço, agende vistorias de classe e monitore a saúde dos equipamentos.',
    tips: [
      'Crie uma OS para registrar manutenção preventiva',
      'Agende vistorias de classe (DNV, BV, LR)',
      'Configure alertas para manutenção preditiva',
    ],
    actionLabel: 'Criar Ordem de Serviço',
  },
  ai: {
    icon: Brain,
    title: 'Hub de IA pronto para operar',
    description: 'Converse com o Nauti Brain, implante agentes de auditoria e configure workflows inteligentes.',
    tips: [
      'Use o Chat IA para análises e recomendações',
      'Implante agentes para auditorias automatizadas',
      'Configure workflows de automação operacional',
    ],
    actionLabel: 'Abrir Chat IA',
  },
  tracking: {
    icon: Satellite,
    title: 'Nenhuma embarcação sendo rastreada',
    description: 'Cadastre embarcações para visualizar posições AIS, telemetria e alertas de geofencing.',
    tips: [
      'Cadastre embarcações no Hub de Operações primeiro',
      'Configure alertas de geofencing para zonas críticas',
      'Habilite previsão meteorológica para rotas ativas',
    ],
    actionLabel: 'Cadastrar Embarcação',
    actionRoute: '/ops',
  },
  compliance: {
    icon: Shield,
    title: 'Nenhuma auditoria registrada',
    description: '12 padrões marítimos (ISM, ISPS, SOLAS, MLC, SIRE...) prontos para uso. Crie sua primeira auditoria.',
    tips: [
      'Inicie uma auditoria interna para avaliar conformidade',
      'Use os 10 agentes IA para análise automatizada',
      'Configure alertas de vencimento de certificados',
    ],
    actionLabel: 'Criar Auditoria',
  },
  workbench: {
    icon: Briefcase,
    title: 'Área de trabalho pronta',
    description: 'Gerencie documentos, tripulação, finanças e configurações do sistema em um só lugar.',
    tips: [
      'Faça upload de documentos e templates marítimos',
      'Cadastre tripulantes com certificados STCW',
      'Configure integrações com sistemas externos',
    ],
    actionLabel: 'Começar',
  },
};

export function HubEmptyState({ hub, onPrimaryAction, className }: HubEmptyStateProps) {
  const config = hubConfig[hub];
  const Icon = config.icon;

  return (
    <Card className={cn('border-dashed border-2 border-muted-foreground/20', className)}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-6">
        <div className="rounded-full bg-primary/10 p-6 mb-6">
          <Icon className="h-12 w-12 text-primary" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2 text-center">{config.title}</h3>
        <p className="text-sm text-muted-foreground max-w-lg text-center mb-8">
          {config.description}
        </p>

        {/* Dicas para começar */}
        <div className="bg-muted/50 rounded-lg p-5 mb-8 max-w-md w-full">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Como começar:</span>
          </div>
          <ul className="space-y-2">
            {config.tips.map((tip, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2.5">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5 flex-shrink-0">
                  <ArrowRight className="h-3 w-3 text-primary" />
                </div>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <Button 
          onClick={onPrimaryAction} 
          size="lg" 
          className="gap-2"
        >
          <Rocket className="h-4 w-4" />
          {config.actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

export default HubEmptyState;
