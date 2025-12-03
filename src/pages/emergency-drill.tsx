/**
 * Emergency Drill Simulator Page
 * Consolidated emergency drill interface
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Play, Pause, RotateCcw, CheckCircle, Clock, Users } from "lucide-react";
import { toast } from "sonner";

interface DrillStep {
  id: string;
  name: string;
  description: string;
  duration: number;
  status: "pending" | "active" | "completed";
}

const DRILL_SCENARIOS = [
  { id: "fire", name: "Fire Drill", icon: "🔥", steps: 8 },
  { id: "abandon", name: "Abandon Ship", icon: "🚢", steps: 12 },
  { id: "man-overboard", name: "Man Overboard", icon: "🏊", steps: 6 },
  { id: "collision", name: "Collision Response", icon: "💥", steps: 10 },
];

export default function EmergencyDrillPage() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const startDrill = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    setIsRunning(true);
    setProgress(0);
    setCurrentStep(0);
    toast.success(`Starting ${DRILL_SCENARIOS.find(s => s.id === scenarioId)?.name}`);
    
    // Simulate drill progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          toast.success("Drill completed successfully!");
          return 100;
        }
        return prev + 10;
      });
    }, 1000);
  };

  const resetDrill = () => {
    setSelectedScenario(null);
    setIsRunning(false);
    setProgress(0);
    setCurrentStep(0);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
            Emergency Drill Simulator
          </h1>
          <p className="text-sm text-muted-foreground">
            AI-powered emergency response training
          </p>
        </div>
        {selectedScenario && (
          <Button variant="outline" onClick={resetDrill}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {!selectedScenario ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DRILL_SCENARIOS.map((scenario) => (
            <Card 
              key={scenario.id} 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => startDrill(scenario.id)}
            >
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">{scenario.icon}</div>
                <CardTitle>{scenario.name}</CardTitle>
                <CardDescription>{scenario.steps} steps</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Start Drill
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {DRILL_SCENARIOS.find(s => s.id === selectedScenario)?.icon}
                </span>
                <div>
                  <CardTitle>
                    {DRILL_SCENARIOS.find(s => s.id === selectedScenario)?.name}
                  </CardTitle>
                  <CardDescription>
                    {isRunning ? "Drill in progress..." : "Drill completed"}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={isRunning ? "default" : "secondary"}>
                {isRunning ? "Active" : "Completed"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{Math.floor(progress / 10)}:00</div>
                  <div className="text-sm text-muted-foreground">Elapsed Time</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-sm text-muted-foreground">Participants</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{Math.floor(progress / 10)}/10</div>
                  <div className="text-sm text-muted-foreground">Steps Complete</div>
                </CardContent>
              </Card>
            </div>

            {!isRunning && progress === 100 && (
              <div className="text-center p-6 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <h3 className="text-xl font-bold text-green-500">Drill Completed Successfully</h3>
                <p className="text-muted-foreground mt-2">All emergency procedures were followed correctly.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
