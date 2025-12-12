
/**
 * Web Vitals Overlay Component
 * Development tool to visualize real-time performance metrics
 */

import React, { useState } from "react";
import { useWebVitals } from "@/hooks/useWebVitals";
import { cn } from "@/lib/utils";
import { Activity, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WebVitalsOverlayProps {
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  showInProduction?: boolean;
}

const MetricBadge: React.FC<{
  name: string;
  value: string;
  rating: string;
}> = ({ name, value, rating }) => {
  const ratingColors = {
    good: "bg-green-500/20 text-green-400 border-green-500/30",
    "needs-improvement": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    poor: "bg-red-500/20 text-red-400 border-red-500/30",
    unknown: "bg-gray-500/20 text-gray-400 border-gray-500/30"
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-between px-2 py-1 rounded border text-xs",
        ratingColors[rating as keyof typeof ratingColors] || ratingColors.unknown
      )}
    >
      <span className="font-medium">{name}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
};

export const WebVitalsOverlay: React.FC<WebVitalsOverlayProps> = ({
  position = "bottom-right",
  showInProduction = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { score, lcp, fid, cls, ttfb, fcp, inp } = useWebVitals();

  // Only show in development unless explicitly enabled
  if (import.meta.env.PROD && !showInProduction) {
    return null;
  }

  const positionClasses = {
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4"
  };

  const scoreColors = {
    good: "text-green-400",
    "needs-improvement": "text-yellow-400",
    poor: "text-red-400"
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed z-50 bg-background/95 backdrop-blur-sm",
          positionClasses[position]
        )}
      >
        <Activity className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "fixed z-50 w-64 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg",
        positionClasses[position]
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Web Vitals</span>
          <span className={cn("text-sm font-bold", scoreColors[score.rating])}>
            {score.score}%
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Metrics */}
      {!isMinimized && (
        <div className="p-2 space-y-1">
          <MetricBadge name="LCP" value={lcp.formatted} rating={lcp.rating} />
          <MetricBadge name="INP" value={inp.formatted} rating={inp.rating} />
          <MetricBadge name="CLS" value={cls.formatted} rating={cls.rating} />
          <MetricBadge name="TTFB" value={ttfb.formatted} rating={ttfb.rating} />
          <MetricBadge name="FCP" value={fcp.formatted} rating={fcp.rating} />
          
          <div className="pt-2 text-[10px] text-muted-foreground text-center">
            {score.rating === "good" && "✓ All metrics passing"}
            {score.rating === "needs-improvement" && "⚠ Some metrics need work"}
            {score.rating === "poor" && "✗ Performance issues detected"}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebVitalsOverlay;
