/**
import { useEffect, useRef, useState } from "react";;
 * Onboarding Overlay - PATCH 836
 * Interactive onboarding spotlight and tooltips
 */

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/lib/ux/onboarding-system";
import { useHapticFeedback } from "@/lib/ux/haptic-feedback";
import { useLocation } from "react-router-dom";

interface OnboardingOverlayProps {
  enabled?: boolean;
}

export function OnboardingOverlay({ enabled = true }: OnboardingOverlayProps) {
  const location = useLocation();
  const {
    isActive,
    currentStep,
    progress,
    next,
    prev,
    skip,
    complete,
  } = useOnboarding(location.pathname);
  
  const { trigger } = useHapticFeedback();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Find and highlight target element
  useEffect(() => {
    if (!isActive || !currentStep?.target) {
      setTargetRect(null);
      return;
    }
    
    const target = document.querySelector(currentStep.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);
      
      // Calculate tooltip position
      const position = currentStep.position || "bottom";
      const tooltipWidth = 320;
      const tooltipHeight = 200;
      const padding = 16;
      
      let top = 0;
      let left = 0;
      
      switch (position) {
      case "top":
        top = rect.top - tooltipHeight - padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case "bottom":
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - padding;
        break;
      case "right":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + padding;
        break;
      }
      
      // Keep within viewport
      top = Math.max(padding, Math.min(window.innerHeight - tooltipHeight - padding, top));
      left = Math.max(padding, Math.min(window.innerWidth - tooltipWidth - padding, left));
      
      setTooltipPosition({ top, left });
      
      // Scroll target into view if needed
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isActive, currentStep]);
  
  if (!enabled || !isActive || !currentStep) {
    return null;
  }
  
  const handleNext = () => {
    trigger("light");
    next();
  };
  
  const handlePrev = () => {
    trigger("light");
    prev();
  };
  
  const handleSkip = () => {
    trigger("medium");
    skip();
  };
  
  const handleComplete = () => {
    trigger("success");
    complete();
  };
  
  const isLastStep = progress.current === progress.total;
  
  const overlay = (
    <>
      {/* Backdrop with spotlight */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        {/* Dark overlay with cutout */}
        <svg className="w-full h-full">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.left - 8}
                  y={targetRect.top - 8}
                  width={targetRect.width + 16}
                  height={targetRect.height + 16}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>
        
        {/* Highlight ring */}
        {targetRect && currentStep.highlight && (
          <div
            className="absolute border-2 border-primary rounded-lg animate-glow pointer-events-none"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
          />
        )}
      </div>
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[9999] w-80 animate-fade-in"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        <div className="bg-card border rounded-xl shadow-xl overflow-hidden">
          {/* Progress bar */}
          <Progress value={progress.percent} className="h-1 rounded-none" />
          
          {/* Content */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="font-semibold text-lg">{currentStep.title}</h3>
              <button
                onClick={handleSkip}
                className="p-1 rounded-full hover:bg-muted transition-colors shrink-0"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            
            <p className="text-muted-foreground text-sm mb-5">
              {currentStep.description}
            </p>
            
            {/* Action button */}
            {currentStep.action && (
              <Button
                size="sm"
                variant="secondary"
                className="mb-4 w-full"
                onClick={currentStep.action.onClick}
              >
                {currentStep.action.label}
              </Button>
            )}
            
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {progress.current} de {progress.total}
              </span>
              
              <div className="flex gap-2">
                {progress.current > 1 && (
                  <Button size="sm" variant="outline" onClick={handlePrev}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                
                {isLastStep ? (
                  <Button size="sm" onClick={handleComplete}>
                    <Check className="h-4 w-4 mr-1" />
                    Concluir
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleNext}>
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
  
  return createPortal(overlay, document.body);
}

/**
 * Onboarding Target Marker
 * Wrap elements that should be highlighted during onboarding
 */
interface OnboardingTargetProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function OnboardingTarget({ id, children, className }: OnboardingTargetProps) {
  return (
    <div data-onboarding={id} className={cn("relative", className)}>
      {children}
    </div>
  );
}

export default OnboardingOverlay;
