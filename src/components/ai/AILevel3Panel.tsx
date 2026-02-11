/**
 * AILevel3Panel - Autonomous AI Control Panel
 * Features: Proactive suggestions, Self-corrections, XAI explanations
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Sparkles, AlertTriangle, CheckCircle, 
  Lightbulb, RotateCcw, MessageSquare, Shield,
  TrendingUp, Zap, Eye, Clock, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAILevel3, AIProactiveSuggestion, AISelfCorrection } from "@/hooks/ai/useAILevel3";
import { cn } from "@/lib/utils";

interface AILevel3PanelProps {
  module: string;
  className?: string;
}

export function AILevel3Panel({ module, className }: AILevel3PanelProps) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [activeTab, setActiveTab] = useState("proactive");

  const {
    isProcessing,
    suggestions,
    corrections,
    memory,
    askContextual,
    dismissSuggestion,
    applySuggestion,
    rollbackCorrection,
    explainDecision,
  } = useAILevel3({ module });

  const handleAsk = async () => {
    if (!question.trim()) return;
    const answer = await askContextual(question);
    setResponse(answer);
    setQuestion("");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'opportunity': return TrendingUp;
      case 'optimization': return Zap;
      case 'compliance': return Shield;
      default: return Lightbulb;
    }
  };

  return (
    <Card className={cn("border-primary/20 bg-card/50 backdrop-blur", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">IA Autônoma Level 3</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                </span>
                Proativa • Autocorretiva • Explicável
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            {module}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="proactive" className="gap-1">
              <Lightbulb className="h-3 w-3" />
              Proativo
              {suggestions.length > 0 && (
                <Badge variant="destructive" className="h-4 w-4 p-0 text-[10px]">
                  {suggestions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="corrections" className="gap-1">
              <RotateCcw className="h-3 w-3" />
              Correções
            </TabsTrigger>
            <TabsTrigger value="memory" className="gap-1">
              <Brain className="h-3 w-3" />
              Memória
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-1">
              <MessageSquare className="h-3 w-3" />
              Chat
            </TabsTrigger>
          </TabsList>

          {/* Proactive Suggestions */}
          <TabsContent value="proactive" className="mt-4">
            <ScrollArea className="h-[300px]">
              <AnimatePresence>
                {suggestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                    <CheckCircle className="h-10 w-10 mb-2 text-success" />
                    <p>Nenhuma sugestão pendente</p>
                    <p className="text-sm">A IA está monitorando continuamente</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <SuggestionCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        index={index}
                        onDismiss={() => dismissSuggestion(suggestion.id)}
                        onApply={() => applySuggestion(suggestion)}
                        isProcessing={isProcessing}
                        getPriorityColor={getPriorityColor}
                        getTypeIcon={getTypeIcon}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </TabsContent>

          {/* Self-Corrections */}
          <TabsContent value="corrections" className="mt-4">
            <ScrollArea className="h-[300px]">
              {corrections.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <Shield className="h-10 w-10 mb-2 text-primary" />
                  <p>Nenhuma correção recente</p>
                  <p className="text-sm">Sistema funcionando normalmente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {corrections.map((correction) => (
                    <CorrectionCard
                      key={correction.id}
                      correction={correction}
                      onRollback={() => rollbackCorrection(correction.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Memory View */}
          <TabsContent value="memory" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {memory.slice(0, 10).map((entry) => (
                  <div 
                    key={entry.id} 
                    className="p-3 rounded-lg bg-muted/50 text-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-[10px]">
                        {entry.type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(entry.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{entry.content}</p>
                    <Progress 
                      value={entry.importance * 100} 
                      className="h-1 mt-2" 
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Contextual Chat */}
          <TabsContent value="chat" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder={`Pergunte algo sobre ${module}...`}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                  disabled={isProcessing}
                />
                <Button onClick={handleAsk} disabled={isProcessing || !question.trim()}>
                  {isProcessing ? (
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {response && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-primary/5 border border-primary/20"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-full bg-primary/10">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{response}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 text-xs"
                        onClick={() => explainDecision(response)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Explicar raciocínio
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Suggestion Card Component
interface SuggestionCardProps {
  suggestion: AIProactiveSuggestion;
  index: number;
  onDismiss: () => void;
  onApply: () => void;
  isProcessing: boolean;
  getPriorityColor: (priority: string) => string;
  getTypeIcon: (type: string) => React.ElementType;
}

function SuggestionCard({ 
  suggestion, index, onDismiss, onApply, isProcessing, getPriorityColor, getTypeIcon 
}: SuggestionCardProps) {
  const Icon = getTypeIcon(suggestion.type);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.1 }}
      className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg", 
          suggestion.type === 'warning' ? 'bg-warning/10' :
          suggestion.type === 'compliance' ? 'bg-destructive/10' :
          'bg-primary/10'
        )}>
          <Icon className={cn("h-4 w-4",
            suggestion.type === 'warning' ? 'text-warning' :
            suggestion.type === 'compliance' ? 'text-destructive' :
            'text-primary'
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm truncate">{suggestion.title}</h4>
            <Badge className={cn("text-[10px]", getPriorityColor(suggestion.priority))}>
              {suggestion.priority}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {suggestion.description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">
              Confiança: {(suggestion.confidence * 100).toFixed(0)}%
            </span>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs"
                onClick={onDismiss}
              >
                Ignorar
              </Button>
              <Button 
                size="sm" 
                className="h-6 text-xs"
                onClick={onApply}
                disabled={isProcessing}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Correction Card Component
interface CorrectionCardProps {
  correction: AISelfCorrection;
  onRollback: () => void;
}

function CorrectionCard({ correction, onRollback }: CorrectionCardProps) {
  return (
    <div className="p-3 rounded-lg border bg-success/5 border-success/20">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm">Correção Automática</h4>
            <Badge variant="outline" className="text-[10px]">
              {correction.errorType}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{correction.reason}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">
              {new Date(correction.appliedAt).toLocaleString('pt-BR')}
            </span>
            {correction.rollbackAvailable && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs"
                onClick={onRollback}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reverter
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AILevel3Panel;
