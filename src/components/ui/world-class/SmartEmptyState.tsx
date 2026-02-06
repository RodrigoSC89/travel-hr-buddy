/**
 * SmartEmptyState - Empty States Inteligentes World-Class
 * 
 * Features:
 * - Ilustrações contextuais
 * - CTAs claros
 * - Sugestões de ações
 * - Links para documentação
 * 
 * Benchmark: Notion, Linear, Stripe
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Plus,
  FileText,
  Users,
  Ship,
  Package,
  Settings,
  Search,
  Filter,
  Upload,
  Calendar,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  FolderOpen,
  Database,
  Wrench,
  Shield,
  BarChart3,
  Anchor,
  Brain,
  Satellite,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type EmptyStateType = 
  | 'no-data' 
  | 'no-results' 
  | 'no-filter-results'
  | 'error'
  | 'no-access'
  | 'first-time'
  | 'custom';

type ModuleType = 
  | 'vessels' 
  | 'crew' 
  | 'documents' 
  | 'maintenance'
  | 'compliance'
  | 'operations'
  | 'tracking'
  | 'finance'
  | 'ai'
  | 'procurement'
  | 'generic';

interface SmartEmptyStateProps {
  type?: EmptyStateType;
  module?: ModuleType;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  helpLink?: {
    label: string;
    url: string;
  };
  suggestions?: string[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const moduleIcons: Record<ModuleType, React.ReactNode> = {
  vessels: <Ship className="h-16 w-16" />,
  crew: <Users className="h-16 w-16" />,
  documents: <FolderOpen className="h-16 w-16" />,
  maintenance: <Wrench className="h-16 w-16" />,
  compliance: <Shield className="h-16 w-16" />,
  operations: <Anchor className="h-16 w-16" />,
  tracking: <Satellite className="h-16 w-16" />,
  finance: <BarChart3 className="h-16 w-16" />,
  ai: <Brain className="h-16 w-16" />,
  procurement: <Package className="h-16 w-16" />,
  generic: <Database className="h-16 w-16" />,
};

const moduleColors: Record<ModuleType, string> = {
  vessels: 'text-blue-500',
  crew: 'text-green-500',
  documents: 'text-amber-500',
  maintenance: 'text-orange-500',
  compliance: 'text-violet-500',
  operations: 'text-cyan-500',
  tracking: 'text-teal-500',
  finance: 'text-emerald-500',
  ai: 'text-purple-500',
  procurement: 'text-rose-500',
  generic: 'text-gray-500',
};

const defaultContent: Record<EmptyStateType, { title: string; description: string }> = {
  'no-data': {
    title: 'Nenhum registro encontrado',
    description: 'Comece criando seu primeiro registro ou importe dados existentes.',
  },
  'no-results': {
    title: 'Nenhum resultado para sua busca',
    description: 'Tente usar termos diferentes ou remover alguns filtros.',
  },
  'no-filter-results': {
    title: 'Nenhum resultado com estes filtros',
    description: 'Ajuste os filtros para ver mais resultados.',
  },
  'error': {
    title: 'Erro ao carregar dados',
    description: 'Ocorreu um erro inesperado. Tente novamente ou contate o suporte.',
  },
  'no-access': {
    title: 'Acesso restrito',
    description: 'Você não tem permissão para acessar este recurso.',
  },
  'first-time': {
    title: 'Bem-vindo!',
    description: 'Este é o início da sua jornada. Vamos configurar tudo para você.',
  },
  'custom': {
    title: 'Nenhum item',
    description: 'Não há itens para exibir.',
  },
};

const moduleContent: Partial<Record<ModuleType, { title: string; description: string; action: string }>> = {
  vessels: {
    title: 'Nenhuma embarcação cadastrada',
    description: 'Cadastre suas embarcações para começar a gerenciar sua frota.',
    action: 'Adicionar Embarcação',
  },
  crew: {
    title: 'Nenhum tripulante cadastrado',
    description: 'Adicione tripulantes para gerenciar escalas e compliance STCW/MLC.',
    action: 'Adicionar Tripulante',
  },
  documents: {
    title: 'Nenhum documento encontrado',
    description: 'Faça upload de documentos para começar a organizar sua biblioteca.',
    action: 'Upload de Documento',
  },
  maintenance: {
    title: 'Nenhuma manutenção registrada',
    description: 'Registre atividades de manutenção para acompanhar o histórico técnico.',
    action: 'Nova Manutenção',
  },
  compliance: {
    title: 'Nenhuma auditoria registrada',
    description: 'Inicie uma auditoria para acompanhar a conformidade da sua operação.',
    action: 'Nova Auditoria',
  },
  operations: {
    title: 'Nenhuma operação em andamento',
    description: 'Crie viagens, missões e contratos para gerenciar suas operações.',
    action: 'Nova Operação',
  },
  tracking: {
    title: 'Nenhum rastreamento ativo',
    description: 'Configure integrações AIS/SATCOM para rastrear sua frota.',
    action: 'Configurar Tracking',
  },
  finance: {
    title: 'Nenhum registro financeiro',
    description: 'Adicione transações para acompanhar receitas e despesas.',
    action: 'Nova Transação',
  },
  ai: {
    title: 'Nenhum agente configurado',
    description: 'Configure agentes de IA para automatizar processos.',
    action: 'Configurar IA',
  },
  procurement: {
    title: 'Nenhuma requisição encontrada',
    description: 'Crie requisições de compra para iniciar o processo de procurement.',
    action: 'Nova Requisição',
  },
};

export function SmartEmptyState({
  type = 'no-data',
  module = 'generic',
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  helpLink,
  suggestions = [],
  className,
  size = 'md',
  animated = true,
}: SmartEmptyStateProps) {
  const defaults = defaultContent[type];
  const moduleDefaults = moduleContent[module];
  
  const displayTitle = title || moduleDefaults?.title || defaults.title;
  const displayDescription = description || moduleDefaults?.description || defaults.description;
  const displayIcon = icon || moduleIcons[module];
  
  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-20',
  };
  
  const iconSizeClasses = {
    sm: '[&>svg]:h-10 [&>svg]:w-10',
    md: '[&>svg]:h-16 [&>svg]:w-16',
    lg: '[&>svg]:h-24 [&>svg]:w-24',
  };

  const Wrapper = animated ? motion.div : 'div';
  const wrapperProps = animated ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizeClasses[size],
        className
      )}
    >
      {/* Icon */}
      <div className={cn(
        'mb-4 p-4 rounded-full bg-muted/50',
        iconSizeClasses[size],
        moduleColors[module]
      )}>
        {displayIcon}
      </div>

      {/* Title */}
      <h3 className={cn(
        'font-semibold text-foreground mb-2',
        size === 'sm' && 'text-base',
        size === 'md' && 'text-lg',
        size === 'lg' && 'text-xl'
      )}>
        {displayTitle}
      </h3>

      {/* Description */}
      <p className={cn(
        'text-muted-foreground mb-6 max-w-md',
        size === 'sm' && 'text-sm',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-base'
      )}>
        {displayDescription}
      </p>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-muted-foreground mb-2">Sugestões:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs bg-muted rounded-md text-muted-foreground"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {primaryAction && (
          <Button onClick={primaryAction.onClick} className="gap-2">
            {primaryAction.icon || <Plus className="h-4 w-4" />}
            {primaryAction.label}
          </Button>
        )}
        
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>

      {/* Help Link */}
      {helpLink && (
        <a
          href={helpLink.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          <HelpCircle className="h-3 w-3" />
          {helpLink.label}
          <ArrowRight className="h-3 w-3" />
        </a>
      )}
    </Wrapper>
  );
}

// Quick empty states for common scenarios
export const emptyStates = {
  noData: (module: ModuleType, onAdd?: () => void) => (
    <SmartEmptyState
      type="no-data"
      module={module}
      primaryAction={onAdd ? {
        label: moduleContent[module]?.action || 'Adicionar',
        onClick: onAdd,
      } : undefined}
    />
  ),
  
  noResults: (onClear?: () => void) => (
    <SmartEmptyState
      type="no-results"
      module="generic"
      icon={<Search className="h-16 w-16" />}
      primaryAction={onClear ? {
        label: 'Limpar busca',
        onClick: onClear,
        icon: <Search className="h-4 w-4" />,
      } : undefined}
    />
  ),
  
  noFilterResults: (onClearFilters?: () => void) => (
    <SmartEmptyState
      type="no-filter-results"
      module="generic"
      icon={<Filter className="h-16 w-16" />}
      primaryAction={onClearFilters ? {
        label: 'Limpar filtros',
        onClick: onClearFilters,
        icon: <Filter className="h-4 w-4" />,
      } : undefined}
    />
  ),
  
  error: (onRetry?: () => void) => (
    <SmartEmptyState
      type="error"
      module="generic"
      icon={<AlertCircle className="h-16 w-16 text-destructive" />}
      primaryAction={onRetry ? {
        label: 'Tentar novamente',
        onClick: onRetry,
      } : undefined}
    />
  ),
  
  firstTime: (module: ModuleType, onStart?: () => void) => (
    <SmartEmptyState
      type="first-time"
      module={module}
      icon={<Sparkles className="h-16 w-16 text-primary" />}
      primaryAction={onStart ? {
        label: 'Começar',
        onClick: onStart,
        icon: <Sparkles className="h-4 w-4" />,
      } : undefined}
    />
  ),
};

export default SmartEmptyState;
