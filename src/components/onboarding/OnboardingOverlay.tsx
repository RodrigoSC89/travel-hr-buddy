/**
 * Onboarding Overlay Component
 * Visual overlay for interactive tours
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, ChevronLeft, ChevronRight, SkipForward } from "lucide-react";
import { onboardingManager, OnboardingState } from "@/lib/onboarding/onboarding-flow";
import { cn } from "@/lib/utils";

export function OnboardingOverlay() {
  const [state, setState] = useState<OnboardingState>(onboardingManager.getState());

  useEffect(() => {
    return onboardingManager.subscribe(setState);
  }, []);

  const handleNext = useCallback(() => {
    onboardingManager.nextStep();
  }, []);

  const handlePrevious = useCallback(() => {
    onboardingManager.previousStep();
  }, []);

  const handleSkip = useCallback(() => {
    onboardingManager.skipFlow();
  }, []);

  if (!state.isActive || !state.currentStep) return null;

  const progress = ((state.currentStepIndex + 1) / state.totalSteps) * 100;
  const isFirstStep = state.currentStepIndex === 0;
  const isLastStep = state.currentStepIndex === state.totalSteps - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] pointer-events-none"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 pointer-events-auto" />

        {/* Highlight target element */}
        {state.currentStep.highlight && (
          <HighlightElement selector={state.currentStep.target} />
        )}

        {/* Tooltip Card */}
        <TooltipCard
          step={state.currentStep}
          progress={progress}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSkip={handleSkip}
          stepNumber={state.currentStepIndex + 1}
          totalSteps={state.totalSteps}
        />
      </motion.div>
    </AnimatePresence>
  );
}

function HighlightElement({ selector }: { selector: string }) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const element = document.querySelector(selector);
    if (element) {
      setRect(element.getBoundingClientRect());

      const observer = new ResizeObserver(() => {
        setRect(element.getBoundingClientRect());
      });
      observer.observe(element);

      return () => observer.disconnect();
    }
  }, [selector]);

  if (!rect) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute pointer-events-none"
      style={{
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
        boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
        borderRadius: 8,
        border: "2px solid hsl(var(--primary))",
      }}
    />
  );
}

interface TooltipCardProps {
  step: NonNullable<OnboardingState["currentStep"]>;
  progress: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  stepNumber: number;
  totalSteps: number;
}

function TooltipCard({
  step,
  progress,
  isFirstStep,
  isLastStep,
  onNext,
  onPrevious,
  onSkip,
  stepNumber,
  totalSteps,
}: TooltipCardProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const calculatePosition = () => {
      if (step.position === "center") {
        setPosition({
          x: window.innerWidth / 2 - 200,
          y: window.innerHeight / 2 - 150,
        });
        return;
      }

      const target = document.querySelector(step.target);
      if (!target) {
        setPosition({
          x: window.innerWidth / 2 - 200,
          y: window.innerHeight / 2 - 150,
        });
        return;
      }

      const rect = target.getBoundingClientRect();
      const cardWidth = 400;
      const cardHeight = 200;
      const padding = 20;

      let x = rect.left;
      let y = rect.bottom + padding;

      switch (step.position) {
        case "top":
          y = rect.top - cardHeight - padding;
          break;
        case "left":
          x = rect.left - cardWidth - padding;
          y = rect.top;
          break;
        case "right":
          x = rect.right + padding;
          y = rect.top;
          break;
        default: // bottom
          y = rect.bottom + padding;
      }

      // Keep within viewport
      x = Math.max(padding, Math.min(x, window.innerWidth - cardWidth - padding));
      y = Math.max(padding, Math.min(y, window.innerHeight - cardHeight - padding));

      setPosition({ x, y });
    };

    calculatePosition();
    window.addEventListener("resize", calculatePosition);
    return () => window.removeEventListener("resize", calculatePosition);
  }, [step]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute pointer-events-auto"
      style={{ left: position.x, top: position.y, width: 400 }}
    >
      <Card className="shadow-2xl border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{step.title}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="h-1" />
        </CardHeader>

        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground">{step.content}</p>
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-0">
          <span className="text-xs text-muted-foreground">
            {stepNumber} de {totalSteps}
          </span>

          <div className="flex gap-2">
            {step.skippable !== false && (
              <Button variant="ghost" size="sm" onClick={onSkip}>
                <SkipForward className="h-4 w-4 mr-1" />
                Pular
              </Button>
            )}

            {!isFirstStep && (
              <Button variant="outline" size="sm" onClick={onPrevious}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
            )}

            <Button size="sm" onClick={onNext}>
              {isLastStep ? "Concluir" : "Próximo"}
              {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
