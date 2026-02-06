/**
 * ProgressIndicator - Indicadores de Progresso Padronizados
 * Para uploads, exports e operações longas
 */

import { FC } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export type ProgressStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ProgressIndicatorProps {
  value: number; // 0-100
  status?: ProgressStatus;
  label?: string;
  description?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export const ProgressIndicator: FC<ProgressIndicatorProps> = ({
  value,
  status = 'loading',
  label,
  description,
  showPercentage = true,
  size = 'md',
  className,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      default:
        return null;
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case 'success':
        return 'bg-success';
      case 'error':
        return 'bg-destructive';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {label && (
              <span className="text-sm font-medium text-foreground">
                {label}
              </span>
            )}
          </div>
          {showPercentage && (
            <span className="text-sm text-muted-foreground">
              {Math.round(value)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out rounded-full',
            getProgressColor()
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};

// === STEP PROGRESS ===
export interface Step {
  id: string;
  label: string;
  description?: string;
}

export interface StepProgressProps {
  steps: Step[];
  currentStep: number; // 0-indexed
  status?: ProgressStatus;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const StepProgress: FC<StepProgressProps> = ({
  steps,
  currentStep,
  status = 'loading',
  orientation = 'horizontal',
  className,
}) => {
  const isVertical = orientation === 'vertical';

  return (
    <div
      className={cn(
        'flex',
        isVertical ? 'flex-col' : 'flex-row items-center',
        className
      )}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div
            key={step.id}
            className={cn(
              'flex',
              isVertical ? 'flex-row' : 'flex-col items-center',
              !isLast && (isVertical ? 'pb-8' : 'flex-1')
            )}
          >
            <div className={cn('flex items-center', isVertical && 'flex-col')}>
              {/* Step Circle */}
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                  isCompleted && 'bg-success border-success text-success-foreground',
                  isCurrent && status === 'loading' && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && status === 'error' && 'bg-destructive border-destructive text-destructive-foreground',
                  !isCompleted && !isCurrent && 'bg-muted border-border text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isCurrent && status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    isVertical ? 'w-0.5 h-8' : 'h-0.5 flex-1 min-w-8',
                    isCompleted ? 'bg-success' : 'bg-border'
                  )}
                />
              )}
            </div>

            {/* Step Label */}
            <div
              className={cn(
                isVertical ? 'ml-4' : 'mt-2 text-center',
                'flex-shrink-0'
              )}
            >
              <p
                className={cn(
                  'text-sm font-medium',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// === UPLOAD PROGRESS ===
export interface UploadProgressProps {
  fileName: string;
  fileSize?: string;
  progress: number;
  status: ProgressStatus;
  onCancel?: () => void;
  onRetry?: () => void;
  className?: string;
}

export const UploadProgress: FC<UploadProgressProps> = ({
  fileName,
  fileSize,
  progress,
  status,
  onCancel,
  onRetry,
  className,
}) => {
  return (
    <div className={cn('p-4 border border-border rounded-lg', className)}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
            {fileName}
          </p>
          {fileSize && (
            <p className="text-xs text-muted-foreground">{fileSize}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {status === 'loading' && onCancel && (
            <button
              onClick={onCancel}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Cancelar
            </button>
          )}
          {status === 'error' && onRetry && (
            <button
              onClick={onRetry}
              className="text-xs text-primary hover:underline"
            >
              Tentar novamente
            </button>
          )}
        </div>
      </div>

      <ProgressIndicator
        value={progress}
        status={status}
        showPercentage={false}
        size="sm"
      />

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-muted-foreground">
          {status === 'loading' && `${Math.round(progress)}%`}
          {status === 'success' && 'Concluído'}
          {status === 'error' && 'Falha no upload'}
        </span>
      </div>
    </div>
  );
};

export default ProgressIndicator;
