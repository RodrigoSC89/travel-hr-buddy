/**
 * PATCH 598 - Noncompliance Explainer Component
 * Shows AI-generated explanations for compliance findings
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { explainNoncomplianceLLM, type NoncomplianceFinding } from "@/services/ai-training-engine";
import { Loader2, BookOpen, Lightbulb } from "lucide-react";

interface NoncomplianceExplainerProps {
  finding: NoncomplianceFinding;
  userId: string;
}

export default function NoncomplianceExplainer({ finding, userId }: NoncomplianceExplainerProps) {
  const [explanation, setExplanation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
    setLoading(true);
    try {
      const result = await explainNoncomplianceLLM(finding, userId);
      setExplanation(result);
    } catch (error) {
      console.error("Error getting explanation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          AI Explanation
        </CardTitle>
        <CardDescription>
          Get detailed technical and simple explanations for this finding
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{finding.type}</Badge>
              <Badge variant={finding.severity === 'critical' ? 'destructive' : 'secondary'}>
                {finding.severity}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{finding.description}</p>
          </div>
          {!explanation && (
            <Button onClick={handleExplain} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Explain with AI
            </Button>
          )}
        </div>

        {explanation && (
          <Tabs defaultValue="simple" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="simple">Simple</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="simple" className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm">{explanation.simpleExplanation}</p>
              </div>
              {explanation.learningPoints && explanation.learningPoints.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Key Learning Points
                  </h4>
                  <ul className="space-y-1">
                    {explanation.learningPoints.map((point: string, idx: number) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="technical" className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm">{explanation.technicalExplanation}</p>
              </div>
              {explanation.relatedRegulations && explanation.relatedRegulations.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Related Regulations</h4>
                  <div className="space-y-2">
                    {explanation.relatedRegulations.map((reg: any, idx: number) => (
                      <div key={idx} className="border-l-2 border-primary pl-3">
                        <p className="text-sm font-medium">{reg.code}</p>
                        <p className="text-sm text-muted-foreground">{reg.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="actions" className="space-y-4">
              {explanation.correctiveActions && explanation.correctiveActions.length > 0 ? (
                <div className="space-y-3">
                  {explanation.correctiveActions.map((action: any, idx: number) => (
                    <Card key={idx}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{action.action}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Responsible: {action.responsible} • Time: {action.estimatedTime}
                            </p>
                          </div>
                          <Badge variant={
                            action.priority === 'critical' ? 'destructive' :
                            action.priority === 'high' ? 'default' : 'secondary'
                          }>
                            {action.priority}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No corrective actions provided.</p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
