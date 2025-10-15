/**
 * Example React Component Integration
 * 
 * This example shows how to integrate the MMI Copilot with Resolved Actions
 * into a React component for a maintenance job interface.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import {
  getCopilotRecommendationStreaming,
  getHistoricalActions,
  addResolvedAction,
} from "@/services/mmi/copilotApi";

interface MMICopilotExampleProps {
  jobId: string;
  componentName: string;
}

export function MMICopilotExample({ jobId, componentName }: MMICopilotExampleProps) {
  const [prompt, setPrompt] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historicalCount, setHistoricalCount] = useState(0);

  // Load historical actions count on mount
  React.useEffect(() => {
    const loadHistoricalCount = async () => {
      try {
        const actions = await getHistoricalActions(componentName);
        setHistoricalCount(actions.length);
      } catch (error) {
        console.error("Failed to load historical actions:", error);
      }
    };

    loadHistoricalCount();
  }, [componentName]);

  const handleGetRecommendation = async () => {
    if (!prompt.trim()) {
      return;
    }

    setIsLoading(true);
    setRecommendation("");

    try {
      // Use streaming for real-time updates
      await getCopilotRecommendationStreaming(
        {
          prompt: prompt,
          componente: componentName,
        },
        (chunk) => {
          setRecommendation((prev) => prev + chunk);
        }
      );
    } catch (error) {
      console.error("Error getting recommendation:", error);
      setRecommendation("❌ Failed to get recommendation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordAction = async (action: {
    acao_realizada: string;
    duracao_execucao: string;
    efetiva: boolean;
    observacoes?: string;
  }) => {
    try {
      await addResolvedAction({
        componente: componentName,
        ...action,
      });

      // Refresh historical count
      const actions = await getHistoricalActions(componentName);
      setHistoricalCount(actions.length);
    } catch (error) {
      console.error("Failed to record action:", error);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            MMI Copilot - AI Assistant
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Component: {componentName}
            {historicalCount > 0 && (
              <span className="ml-2 text-green-600">
                ({historicalCount} historical actions available)
              </span>
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input for maintenance job description */}
          <div>
            <label className="text-sm font-medium">
              Describe the maintenance job:
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., 'Manutenção preventiva do sistema hidráulico necessária'"
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Get Recommendation Button */}
          <Button
            onClick={handleGetRecommendation}
            disabled={isLoading || !prompt.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting AI Recommendation...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Get AI Recommendation
              </>
            )}
          </Button>

          {/* Display Recommendation */}
          {recommendation && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                AI Recommendation:
              </h4>
              <div className="text-sm whitespace-pre-wrap text-blue-800 dark:text-blue-200">
                {recommendation}
              </div>
            </div>
          )}

          {/* Example: Record completed action */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-medium mb-2">After completing the job:</h4>
            <Button
              variant="outline"
              onClick={() =>
                handleRecordAction({
                  acao_realizada: "Example action completed",
                  duracao_execucao: "2 horas",
                  efetiva: true,
                  observacoes: "Action was successful",
                })
              }
              size="sm"
            >
              Record Completed Action
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Recording actions helps the AI learn and improve future recommendations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Usage in a parent component:
 * 
 * ```tsx
 * import { MMICopilotExample } from "./MMICopilotExample";
 * 
 * function MaintenanceJobPage() {
 *   return (
 *     <div>
 *       <MMICopilotExample 
 *         jobId="JOB-001"
 *         componentName="Sistema Hidráulico Principal"
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
