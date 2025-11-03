/**
 * PATCH 597 - AI Generated Task Panel
 * Interface for generating tasks using AI based on inspections
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, Loader2 } from "lucide-react";
import { useScheduler } from "../hooks/useScheduler";
import type { TaskRecommendation } from "../types";

export function AIGeneratedTaskPanel() {
  const { generateTasks, createTask, loading } = useScheduler();
  const [moduleName, setModuleName] = useState("");
  const [vesselId, setVesselId] = useState("");
  const [score, setScore] = useState<number | undefined>();
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([]);

  const handleGenerate = async () => {
    if (!moduleName) return;

    const context = {
      moduleName,
      vesselId: vesselId || undefined,
      score,
      findings: [],
      history: []
    };

    const results = await generateTasks(context);
    setRecommendations(results);
  };

  const handleCreateTask = async (recommendation: TaskRecommendation) => {
    try {
      await createTask(recommendation);
      // Remove from recommendations after creating
      setRecommendations(prev => prev.filter(r => r !== recommendation));
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical":
      return "destructive";
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Task Generation
          </CardTitle>
          <CardDescription>
            Generate intelligent task recommendations based on module inspections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="module">Module Name *</Label>
              <Input
                id="module"
                placeholder="e.g., PSC, MLC, LSA"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vessel">Vessel ID</Label>
              <Input
                id="vessel"
                placeholder="Optional"
                value={vesselId}
                onChange={(e) => setVesselId(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="score">Current Score</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="100"
                placeholder="0-100"
                value={score || ""}
                onChange={(e) => setScore(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={loading || !moduleName}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Tasks...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI Recommendations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>
              {recommendations.length} task{recommendations.length !== 1 ? "s" : ""} generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <Badge variant={getPriorityColor(rec.priority) as any}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {rec.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Module:</span> {rec.module}
                    </div>
                    <div>
                      <span className="font-medium">Due Date:</span> {rec.suggestedDueDate.toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Risk Score:</span> {rec.riskScore}/10
                    </div>
                    {rec.relatedEntity && (
                      <div>
                        <span className="font-medium">Vessel:</span> {rec.relatedEntity}
                      </div>
                    )}
                  </div>

                  {rec.justification && (
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded text-sm">
                      <span className="font-medium">Justification:</span> {rec.justification}
                    </div>
                  )}

                  {rec.tags && rec.tags.length > 0 && (
                    <div className="flex gap-2">
                      {rec.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => handleCreateTask(rec)}
                    disabled={loading}
                    size="sm"
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Task
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {recommendations.length === 0 && !loading && moduleName && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Sparkles className="mx-auto h-12 w-12 mb-2 text-blue-500" />
              <p>Click "Generate AI Recommendations" to create intelligent tasks</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
