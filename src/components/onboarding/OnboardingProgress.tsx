/**
 * Onboarding Progress Component
 * Tracks user onboarding completion
 */

import React, { memo } from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

interface OnboardingProgressProps {
  steps: OnboardingStep[];
  currentStep?: number;
  className?: string;
  compact?: boolean;
}

export const OnboardingProgress = memo(function OnboardingProgress({
  steps,
  currentStep = 0,
  className,
  compact = false
}: OnboardingProgressProps) {
  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium">{completedCount}/{steps.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Configuração do Sistema</h3>
        <span className="text-sm text-muted-foreground">
          {completedCount} de {steps.length} completos
        </span>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg transition-colors",
              step.completed 
                ? "bg-green-500/5" 
                : index === currentStep 
                  ? "bg-primary/5 border border-primary/20" 
                  : "bg-muted/30"
            )}
          >
            <div className={cn(
              "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
              step.completed 
                ? "bg-green-500 text-white" 
                : index === currentStep 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
            )}>
              {step.completed ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-xs font-medium">{index + 1}</span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={cn(
                "font-medium text-sm",
                step.completed && "text-green-600 dark:text-green-400"
              )}>
                {step.title}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default OnboardingProgress;
