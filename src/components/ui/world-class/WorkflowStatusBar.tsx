/**
 * WorkflowStatusBar - Barra de Status de Workflow World-Class
 * 
 * Features:
 * - Visualização clara de etapas
 * - Status interativos
 * - Animações de transição
 * - Suporte a aprovações
 * 
 * Benchmark: Jira, ServiceNow, Monday.com
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ArrowRight,
  User,
  Calendar,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type StepStatus = 'completed' | 'current' | 'pending' | 'skipped' | 'error';

interface WorkflowStep {
  id: string;
  label: string;
  description?: string;
  status: StepStatus;
  completedAt?: Date;
  completedBy?: {
    name: string;
    avatar?: string;
  };
  estimatedTime?: string;
  action?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
  };
}

interface WorkflowStatusBarProps {
  steps: WorkflowStep[];
  title?: string;
  className?: string;
  variant?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  showConnectors?: boolean;
  onStepClick?: (step: WorkflowStep) => void;
}

const statusIcons: Record<StepStatus, React.ReactNode> = {
  completed: <CheckCircle2 className="h-5 w-5" />,
  current: <Loader2 className="h-5 w-5 animate-spin" />,
  pending: <Clock className="h-5 w-5" />,
  skipped: <ArrowRight className="h-5 w-5" />,
  error: <XCircle className="h-5 w-5" />,
};

const statusColors: Record<StepStatus, string> = {
  completed: 'bg-success text-success-foreground',
  current: 'bg-primary text-primary-foreground ring-4 ring-primary/20',
  pending: 'bg-muted text-muted-foreground',
  skipped: 'bg-muted-foreground text-background',
  error: 'bg-destructive text-destructive-foreground',
};

const statusLabels: Record<StepStatus, string> = {
  completed: 'Concluído',
  current: 'Em andamento',
  pending: 'Pendente',
  skipped: 'Ignorado',
  error: 'Erro',
};

export function WorkflowStatusBar({
  steps,
  title,
  className,
  variant = 'horizontal',
  size = 'md',
  showConnectors = true,
  onStepClick,
}: WorkflowStatusBarProps) {
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const progress = (completedCount / steps.length) * 100;

  if (variant === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{title}</h3>
            <Badge variant="outline">
              {completedCount}/{steps.length} concluídas
            </Badge>
          </div>
        )}
        
        <div className="relative">
          {/* Vertical line */}
          {showConnectors && (
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          )}

          <div className="space-y-4">
            {steps.map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  'relative flex gap-4 items-start',
                  onStepClick && 'cursor-pointer'
                )}
                onClick={() => onStepClick?.(step)}
              >
                {/* Status icon */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-all',
                        statusColors[step.status]
                      )}>
                        {statusIcons[step.status]}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{statusLabels[step.status]}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      'font-medium',
                      step.status === 'pending' && 'text-muted-foreground'
                    )}>
                      {step.label}
                    </p>
                    {step.status === 'current' && (
                      <Badge variant="secondary" className="text-xs animate-pulse">
                        Atual
                      </Badge>
                    )}
                  </div>
                  
                  {step.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                  )}

                  {/* Completed info */}
                  {step.status === 'completed' && step.completedBy && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{step.completedBy.name}</span>
                      {step.completedAt && (
                        <>
                          <span>•</span>
                          <Calendar className="h-3 w-3" />
                          <span>
                            {step.completedAt.toLocaleDateString('pt-BR')}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Pending info */}
                  {step.status === 'pending' && step.estimatedTime && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Estimativa: {step.estimatedTime}</span>
                    </div>
                  )}

                  {/* Action button */}
                  {step.status === 'current' && step.action && (
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        step.action?.onClick();
                      }}
                      disabled={step.action.loading}
                    >
                      {step.action.loading && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      {step.action.label}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Horizontal variant
  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <Badge variant="outline">
            {Math.round(progress)}% concluído
          </Badge>
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      'flex flex-col items-center gap-2 flex-1',
                      onStepClick && 'cursor-pointer'
                    )}
                    onClick={() => onStepClick?.(step)}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                      statusColors[step.status]
                    )}>
                      {statusIcons[step.status]}
                    </div>
                    <div className="text-center">
                      <p className={cn(
                        'text-xs font-medium',
                        step.status === 'pending' && 'text-muted-foreground'
                      )}>
                        {step.label}
                      </p>
                      {step.status === 'completed' && step.completedAt && (
                        <p className="text-[10px] text-muted-foreground">
                          {step.completedAt.toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-medium">{step.label}</p>
                    {step.description && (
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    )}
                    <Badge className={cn('mt-1', statusColors[step.status])}>
                      {statusLabels[step.status]}
                    </Badge>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Connector */}
            {idx < steps.length - 1 && showConnectors && (
              <div className={cn(
                'flex-1 h-0.5 mx-2 transition-colors',
                steps[idx + 1].status !== 'pending' ? 'bg-primary' : 'bg-muted'
              )} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// Pre-built workflow templates
export const workflowTemplates = {
  purchaseRequisition: (currentStep: number): WorkflowStep[] => [
    {
      id: 'draft',
      label: 'Rascunho',
      description: 'Requisição criada',
      status: currentStep > 0 ? 'completed' : currentStep === 0 ? 'current' : 'pending',
    },
    {
      id: 'review',
      label: 'Revisão',
      description: 'Aguardando aprovação gerencial',
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'pending',
    },
    {
      id: 'approved',
      label: 'Aprovado',
      description: 'Requisição aprovada',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'pending',
    },
    {
      id: 'ordered',
      label: 'Pedido',
      description: 'Pedido enviado ao fornecedor',
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'current' : 'pending',
    },
    {
      id: 'delivered',
      label: 'Entregue',
      description: 'Material recebido',
      status: currentStep > 4 ? 'completed' : currentStep === 4 ? 'current' : 'pending',
    },
  ],

  voyageWorkflow: (currentStep: number): WorkflowStep[] => [
    {
      id: 'planning',
      label: 'Planejamento',
      status: currentStep > 0 ? 'completed' : currentStep === 0 ? 'current' : 'pending',
    },
    {
      id: 'departure',
      label: 'Partida',
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'pending',
    },
    {
      id: 'transit',
      label: 'Navegação',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'pending',
    },
    {
      id: 'arrival',
      label: 'Chegada',
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'current' : 'pending',
    },
    {
      id: 'completed',
      label: 'Concluída',
      status: currentStep > 4 ? 'completed' : currentStep === 4 ? 'current' : 'pending',
    },
  ],

  auditWorkflow: (currentStep: number): WorkflowStep[] => [
    {
      id: 'scheduled',
      label: 'Agendada',
      status: currentStep > 0 ? 'completed' : currentStep === 0 ? 'current' : 'pending',
    },
    {
      id: 'in-progress',
      label: 'Em Execução',
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'pending',
    },
    {
      id: 'review',
      label: 'Revisão',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'pending',
    },
    {
      id: 'findings',
      label: 'Achados',
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'current' : 'pending',
    },
    {
      id: 'closed',
      label: 'Encerrada',
      status: currentStep > 4 ? 'completed' : currentStep === 4 ? 'current' : 'pending',
    },
  ],
};

export default WorkflowStatusBar;
