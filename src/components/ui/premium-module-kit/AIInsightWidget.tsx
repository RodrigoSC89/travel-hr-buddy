/**
 * AI Insight Widget - Widget de insights com IA
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, Sparkles, Send, Lightbulb, AlertTriangle, 
  TrendingUp, CheckCircle, RefreshCw, MessageSquare
} from "lucide-react";
import { toast } from "sonner";

export interface AIInsight {
  id: string;
  type: "recommendation" | "warning" | "opportunity" | "success";
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  confidence?: number;
}

interface AIInsightWidgetProps {
  title?: string;
  insights: AIInsight[];
  onAskQuestion?: (question: string) => Promise<string>;
  loading?: boolean;
  onRefresh?: () => void;
}

const insightIcons = {
  recommendation: Lightbulb,
  warning: AlertTriangle,
  opportunity: TrendingUp,
  success: CheckCircle,
};

const insightColors = {
  recommendation: "text-info bg-info/10",
  warning: "text-warning bg-warning/10",
  opportunity: "text-success bg-success/10",
  success: "text-success bg-success/10",
};

export function AIInsightWidget({
  title = "Insights da IA",
  insights,
  onAskQuestion,
  loading = false,
  onRefresh
}: AIInsightWidgetProps) {
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleAsk = async () => {
    if (!question.trim() || !onAskQuestion) return;
    
    setAsking(true);
    setResponse(null);
    
    try {
      const answer = await onAskQuestion(question);
      setResponse(answer);
      setQuestion("");
    } catch (error) {
      toast.error("Erro ao processar pergunta");
    } finally {
      setAsking(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Brain className="h-4 w-4 text-white" />
            </div>
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              GPT-4o
            </Badge>
            {onRefresh && (
              <Button variant="ghost" size="icon" onClick={onRefresh} disabled={loading} aria-label="Atualizar insights" title="Atualizar insights">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Insights List */}
        <ScrollArea className="h-[200px]">
          <div className="space-y-3">
            {insights.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum insight disponível</p>
              </div>
            )}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Analisando dados...
                </div>
              </div>
            )}
            {insights.map((insight) => {
              const Icon = insightIcons[insight.type];
              const colorClass = insightColors[insight.type];
              
              return (
                <div
                  key={insight.id}
                  className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{insight.title}</p>
                        {insight.confidence && (
                          <Badge variant="outline" className="text-[10px] h-5">
                            {insight.confidence}% conf.
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {insight.description}
                      </p>
                      {insight.action && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto mt-2 text-xs"
                          onClick={insight.action.onClick}
                        >
                          {insight.action.label} →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* AI Response */}
        {response && (
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs font-medium text-primary">Resposta da IA</p>
                <p className="text-sm mt-1">{response}</p>
              </div>
            </div>
          </div>
        )}

        {/* Question Input */}
        {onAskQuestion && (
          <div className="flex gap-2">
            <Textarea
              placeholder="Faça uma pergunta à IA..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleAsk}
              disabled={asking || !question.trim()}
              className="shrink-0"
            >
              {asking ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
