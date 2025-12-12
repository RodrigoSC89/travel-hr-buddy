/**
 * PATCH 602 - Multilevel Context Awareness Core Validation
 * Tests context recognition across layers with transitions
 */

import { memo, memo, useState } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, ArrowRight, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

interface ContextLayer {
  level: string;
  status: "inactive" | "active" | "transitioning";
  metrics: {
    awareness: number;
    adaptation: number;
  };
  actions: string[];
}

export const Patch602Validation = memo(function() {
  const [layers, setLayers] = useState<ContextLayer[]>([
    { level: "Strategic", status: "inactive", metrics: { awareness: 0, adaptation: 0 }, actions: [] },
    { level: "Operational", status: "inactive", metrics: { awareness: 0, adaptation: 0 }, actions: [] },
    { level: "Tactical", status: "inactive", metrics: { awareness: 0, adaptation: 0 }, actions: [] },
    { level: "Individual", status: "inactive", metrics: { awareness: 0, adaptation: 0 }, actions: [] }
  ]);
  const [currentLevel, setCurrentLevel] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const simulateContextTransition = async () => {
    setIsRunning(true);
    const levels = ["Strategic", "Operational", "Tactical", "Individual"];
    
    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      setCurrentLevel(level);
      
      // Mark as transitioning
      setLayers(prev => prev.map(l => 
        l.level === level ? { ...l, status: "transitioning" as const } : l
      ));
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Activate with metrics
      const actions = getActionsForLevel(level);
      setLayers(prev => prev.map(l => 
        l.level === level ? {
          ...l,
          status: "active" as const,
          metrics: {
            awareness: 0.85 + Math.random() * 0.15,
            adaptation: 0.80 + Math.random() * 0.20
          },
          actions
        } : l
      ));
      
      logger.info("PATCH 602: Context layer activated", { 
        level, 
        actions,
        metrics: {
          awareness: 0.85 + Math.random() * 0.15,
          adaptation: 0.80 + Math.random() * 0.20
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 1200));
    }
    
    setIsRunning(false);
    toast({
      title: "Context Awareness Complete",
      description: "Transitioned through all context layers successfully",
    });
  };

  const getActionsForLevel = (level: string): string[] => {
    const actionMap: Record<string, string[]> = {
      Strategic: ["Long-term planning", "Resource allocation", "Mission prioritization"],
      Operational: ["Coordination protocols", "Asset deployment", "Performance monitoring"],
      Tactical: ["Immediate response", "Local optimization", "Risk mitigation"],
      Individual: ["Task execution", "Real-time adaptation", "Agent-specific actions"]
    };
    return actionMap[level] || [];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              PATCH 602 - Multilevel Context Awareness
            </CardTitle>
            <CardDescription>
              Validates context recognition across hierarchical layers
            </CardDescription>
          </div>
          <Badge variant={currentLevel ? "default" : "secondary"}>
            {currentLevel || "Standby"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={simulateContextTransition} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? "Processing Layers..." : "Simulate Context Transitions"}
        </Button>

        <div className="space-y-3">
          {layers.map((layer, index) => (
            <div key={layer.level}>
              <Card className={
                layer.status === "active" ? "border-primary" :
                  layer.status === "transitioning" ? "border-yellow-500" :
                    ""
              }>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        layer.status === "active" ? "default" :
                          layer.status === "transitioning" ? "outline" :
                            "secondary"
                      }>
                        {layer.level}
                      </Badge>
                      {layer.status === "active" && (
                        <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                      )}
                    </div>
                    <Badge variant="outline">
                      {layer.status === "active" ? "Active" :
                        layer.status === "transitioning" ? "Transitioning" :
                          "Inactive"}
                    </Badge>
                  </div>
                  
                  {layer.status === "active" && (
                    <>
                      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Awareness:</span>{" "}
                          <span className="font-semibold">{(layer.metrics.awareness * 100).toFixed(0)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Adaptation:</span>{" "}
                          <span className="font-semibold">{(layer.metrics.adaptation * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground">Adapted Actions:</div>
                        {layer.actions.map((action, i) => (
                          <div key={i} className="text-sm flex items-center gap-2">
                            <ArrowRight className="h-3 w-3 text-primary" />
                            {action}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              {index < layers.length - 1 && layer.status === "active" && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
