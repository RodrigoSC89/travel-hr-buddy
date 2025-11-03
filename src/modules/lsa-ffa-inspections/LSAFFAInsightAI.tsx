/**
 * LSA & FFA Inspection AI Insight Component
 * Provides AI-powered recommendations and analysis
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { openai } from "@/lib/ai/openai-client";
import type { LSAFFAInspection, AIInsight } from "@/types/lsa-ffa";

interface LSAFFAInsightAIProps {
  inspection: LSAFFAInspection;
  onInsightGenerated?: (insight: AIInsight) => void;
}

export function LSAFFAInsightAI({ inspection, onInsightGenerated }: LSAFFAInsightAIProps) {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");

  const generateInsight = async (additionalContext?: string) => {
    setLoading(true);
    setError(null);

    try {
      const checklistItems = Object.values(inspection.checklist);
      const failedItems = checklistItems.filter((item) => item.status === "fail");
      const criticalIssues = inspection.issues_found.filter(
        (issue) => issue.severity === "critical" && !issue.resolved
      );

      // Build prompt for AI
      const prompt = `You are a maritime safety expert specializing in SOLAS regulations for ${
        inspection.type === "LSA" ? "Life-Saving Appliances" : "Fire-Fighting Appliances"
      }.

Inspection Details:
- Type: ${inspection.type}
- Score: ${inspection.score}%
- Inspector: ${inspection.inspector}
- Date: ${new Date(inspection.date).toLocaleDateString()}

Checklist Summary:
- Total Items: ${checklistItems.length}
- Passed: ${checklistItems.filter((i) => i.status === "pass").length}
- Failed: ${failedItems.length}
- Pending: ${checklistItems.filter((i) => i.status === "pending").length}

${
  failedItems.length > 0
    ? `
Failed Items:
${failedItems.map((item) => `- ${item.category}: ${item.item}`).join("\n")}
`
    : ""
}

${
  inspection.issues_found.length > 0
    ? `
Issues Found:
${inspection.issues_found
    .map(
      (issue) =>
        `- [${issue.severity.toUpperCase()}] ${issue.category}: ${issue.description}`
    )
    .join("\n")}
`
    : ""
}

${additionalContext ? `\nAdditional Context: ${additionalContext}` : ""}

Please provide:
1. A concise summary of the inspection results
2. Key recommendations for addressing the issues (2-5 specific actions)
3. Risk assessment based on SOLAS requirements
4. Next actions the crew should take

Format your response as JSON with this structure:
{
  "summary": "Brief overview",
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "riskAssessment": "Risk analysis text",
  "nextActions": ["action 1", "action 2", ...],
  "confidence": 85
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content:
              "You are an expert maritime safety inspector specializing in SOLAS compliance. Provide clear, actionable recommendations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }

      const parsedInsight: AIInsight = JSON.parse(content);

      // Ensure confidence is between 0 and 100
      parsedInsight.confidence = Math.min(100, Math.max(0, parsedInsight.confidence || 85));

      setInsight(parsedInsight);
      onInsightGenerated?.(parsedInsight);
    } catch (err) {
      console.error("Failed to generate insight:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate AI recommendations"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithContext = () => {
    generateInsight(customPrompt);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI-Powered Insights
        </CardTitle>
        <CardDescription>
          Get intelligent recommendations based on SOLAS regulations and best practices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Generate Button */}
        <div className="flex gap-2">
          <Button
            onClick={() => generateInsight()}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Insights
              </>
            )}
          </Button>
        </div>

        {/* Custom Prompt */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Additional Context (Optional)</label>
          <Textarea
            placeholder="Add specific concerns or questions for the AI to address..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={3}
            disabled={loading}
          />
          {customPrompt && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateWithContext}
              disabled={loading}
            >
              Generate with Context
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Insight Display */}
        {insight && (
          <div className="space-y-4 mt-4">
            {/* Summary */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Summary
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {insight.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Recommendations
              </h4>
              <ul className="space-y-2">
                {insight.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risk Assessment */}
            <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                    Risk Assessment
                  </h4>
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    {insight.riskAssessment}
                  </p>
                </div>
              </div>
            </div>

            {/* Next Actions */}
            <div>
              <h4 className="font-semibold mb-2">Next Actions</h4>
              <ol className="space-y-2">
                {insight.nextActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Badge variant="outline" className="mt-0.5">
                      {idx + 1}
                    </Badge>
                    <span>{action}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Confidence Score */}
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm text-muted-foreground">AI Confidence</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all"
                    style={{ width: `${insight.confidence}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{insight.confidence}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        {!insight && !loading && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Click "Generate Insights" to get AI-powered recommendations based on this
              inspection. The AI will analyze compliance with SOLAS regulations and suggest
              corrective actions.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
