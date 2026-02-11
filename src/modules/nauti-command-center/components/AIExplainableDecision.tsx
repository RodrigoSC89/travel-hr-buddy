/**
 * PATCH 855 - AI Explainable Decision Component
 * Shows AI decision with full transparency and justification
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Brain,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  BarChart,
  Clock,
  Undo2,
  ThumbsUp,
  ThumbsDown,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AIDecision {
  id: string;
  title: string;
  description: string;
  type: "optimization" | "alert" | "recommendation" | "automation";
  confidence: number;
  status: "pending" | "approved" | "rejected" | "executed" | "rolled_back";
  createdAt: Date;
  executedAt?: Date;
  justification: {
    reasoning: string;
    evidence: string[];
    risks: string[];
    expectedOutcome: string;
  };
  alternatives?: {
    description: string;
    confidence: number;
  }[];
  impact: "low" | "medium" | "high" | "critical";
  feedback?: {
    wasCorrect: boolean;
    notes?: string;
  };
}

interface AIExplainableDecisionProps {
  decision: AIDecision;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onRollback?: (id: string) => void;
  onFeedback?: (id: string, wasCorrect: boolean, notes?: string) => void;
}

export function AIExplainableDecision({
  decision,
  onApprove,
  onReject,
  onRollback,
  onFeedback,
}: AIExplainableDecisionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const getTypeIcon = () => {
    switch (decision.type) {
      case "optimization":
        return <BarChart className="h-5 w-5" />;
      case "alert":
        return <AlertTriangle className="h-5 w-5" />;
      case "recommendation":
        return <Lightbulb className="h-5 w-5" />;
      case "automation":
        return <Brain className="h-5 w-5" />;
    }
  };

  const getTypeColor = () => {
    switch (decision.type) {
      case "optimization":
        return "bg-primary/20 text-primary border-primary/30";
      case "alert":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "recommendation":
        return "bg-warning/20 text-warning border-warning/30";
      case "automation":
        return "bg-secondary/20 text-secondary border-secondary/30";
    }
  };

  const getStatusBadge = () => {
    switch (decision.status) {
      case "pending":
        return <Badge variant="outline" className="bg-warning/10 text-warning">Pendente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-success/10 text-success">Aprovada</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive">Rejeitada</Badge>;
      case "executed":
        return <Badge variant="outline" className="bg-primary/10 text-primary">Executada</Badge>;
      case "rolled_back":
        return <Badge variant="outline" className="bg-warning/10 text-warning">Revertida</Badge>;
    }
  };

  const getImpactColor = () => {
    switch (decision.impact) {
      case "low":
        return "text-muted-foreground";
      case "medium":
        return "text-warning";
      case "high":
        return "text-warning";
      case "critical":
        return "text-destructive";
    }
  };

  const getConfidenceColor = () => {
    if (decision.confidence >= 90) return "bg-success";
    if (decision.confidence >= 75) return "bg-primary";
    if (decision.confidence >= 60) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <Card className="border-border bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg", getTypeColor())}>
              {getTypeIcon()}
            </div>
            <div>
              <CardTitle className="text-base">{decision.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {decision.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Confidence and Impact */}
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Confiança da IA</span>
              <span className="text-sm font-medium">{decision.confidence}%</span>
            </div>
            <Progress value={decision.confidence} className={cn("h-2", getConfidenceColor())} />
          </div>
          <div className="text-center">
            <span className="text-xs text-muted-foreground block">Impacto</span>
            <span className={cn("text-sm font-bold uppercase", getImpactColor())}>
              {decision.impact}
            </span>
          </div>
          <div className="text-center">
            <span className="text-xs text-muted-foreground block">Criada</span>
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-3 w-3" />
              {decision.createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>

        <Separator />

        {/* Expandable Justification */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Por que a IA tomou essa decisão?
              </span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-4"
                >
                  {/* Reasoning */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-400" />
                      Raciocínio
                    </h4>
                    <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                      {decision.justification.reasoning}
                    </p>
                  </div>

                  {/* Evidence */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-400" />
                      Evidências Analisadas
                    </h4>
                    <ul className="space-y-1">
                      {decision.justification.evidence.map((evidence, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-400 mt-1 shrink-0" />
                          {evidence}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Risks */}
                  {decision.justification.risks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                        Riscos Identificados
                      </h4>
                      <ul className="space-y-1">
                        {decision.justification.risks.map((risk, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <XCircle className="h-3 w-3 text-red-400 mt-1 shrink-0" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Expected Outcome */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-400" />
                      Resultado Esperado
                    </h4>
                    <p className="text-sm text-muted-foreground bg-success/10 p-3 rounded-lg border border-success/20">
                      {decision.justification.expectedOutcome}
                    </p>
                  </div>

                  {/* Alternatives */}
                  {decision.alternatives && decision.alternatives.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Alternativas Consideradas</h4>
                      <div className="space-y-2">
                        {decision.alternatives.map((alt, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <span className="text-sm text-muted-foreground">{alt.description}</span>
                            <Badge variant="outline">{alt.confidence}%</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {decision.status === "pending" && (
            <>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => onApprove?.(decision.id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprovar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onReject?.(decision.id, "Rejeitado pelo operador")}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeitar
              </Button>
            </>
          )}

          {decision.status === "executed" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRollback?.(decision.id)}
              >
                <Undo2 className="h-4 w-4 mr-2" />
                Reverter
              </Button>
              {!decision.feedback && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFeedback(true)}
                >
                  Dar Feedback
                </Button>
              )}
            </>
          )}

          {decision.feedback && (
            <div className="flex items-center gap-2 text-sm">
              {decision.feedback.wasCorrect ? (
                <Badge variant="outline" className="bg-success/10 text-success">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Decisão Correta
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-destructive/10 text-destructive">
                  <ThumbsDown className="h-3 w-3 mr-1" />
                  Precisa Melhorar
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Feedback Form */}
        <AnimatePresence>
          {showFeedback && !decision.feedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 pt-2"
            >
              <span className="text-sm text-muted-foreground">A decisão foi correta?</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onFeedback?.(decision.id, true);
                  setShowFeedback(false);
                }}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Sim
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onFeedback?.(decision.id, false);
                  setShowFeedback(false);
                }}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                Não
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default AIExplainableDecision;
