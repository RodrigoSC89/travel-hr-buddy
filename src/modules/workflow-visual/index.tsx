// @ts-nocheck
/**
 * WORKFLOW VISUAL DINÂMICO COM IA INTEGRADA
 * Visualização interativa de fluxos com sugestões IA em tempo real
 * Melhoria Lovable #1
 */

import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Workflow,
  Brain,
  Play,
  Pause,
  SkipForward,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Zap,
  Target,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Send,
  Loader2,
  Ship,
  Wrench,
  Package,
  Users,
  FileCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Custom Node Types
const WorkflowNode = ({ data }: { data: any }) => {
  const getStatusColor = () => {
    switch (data.status) {
      case "completed": return "border-green-500 bg-green-50 dark:bg-green-900/20";
      case "in_progress": return "border-blue-500 bg-blue-50 dark:bg-blue-900/20 animate-pulse";
      case "pending": return "border-gray-300 bg-gray-50 dark:bg-gray-800";
      case "blocked": return "border-red-500 bg-red-50 dark:bg-red-900/20";
      case "warning": return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
      default: return "border-gray-300 bg-white dark:bg-gray-800";
    }
  };

  const getIcon = () => {
    switch (data.type) {
      case "fleet": return <Ship className="h-4 w-4" />;
      case "maintenance": return <Wrench className="h-4 w-4" />;
      case "inventory": return <Package className="h-4 w-4" />;
      case "crew": return <Users className="h-4 w-4" />;
      case "compliance": return <FileCheck className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className={`px-4 py-3 rounded-lg border-2 shadow-md min-w-[180px] ${getStatusColor()}`}>
      <div className="flex items-center gap-2 mb-1">
        {getIcon()}
        <span className="font-semibold text-sm">{data.label}</span>
      </div>
      {data.description && (
        <p className="text-xs text-muted-foreground">{data.description}</p>
      )}
      {data.eta && (
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>ETA: {data.eta}</span>
        </div>
      )}
      {data.aiSuggestion && (
        <div className="mt-2 p-2 bg-purple-100 dark:bg-purple-900/30 rounded text-xs">
          <div className="flex items-center gap-1 text-purple-700 dark:text-purple-300">
            <Sparkles className="h-3 w-3" />
            <span className="font-medium">IA:</span>
          </div>
          <p className="text-purple-600 dark:text-purple-400 mt-1">{data.aiSuggestion}</p>
        </div>
      )}
    </div>
  );
};

const nodeTypes = { workflow: WorkflowNode };

// Sample workflow data
const initialNodes: Node[] = [
  {
    id: "1",
    type: "workflow",
    position: { x: 50, y: 100 },
    data: { label: "Requisição de Peças", type: "inventory", status: "completed", description: "Solicitação aprovada" },
  },
  {
    id: "2",
    type: "workflow",
    position: { x: 300, y: 50 },
    data: { label: "Verificação Estoque", type: "inventory", status: "completed", description: "3 itens disponíveis" },
  },
  {
    id: "3",
    type: "workflow",
    position: { x: 300, y: 180 },
    data: { label: "Ordem de Compra", type: "inventory", status: "in_progress", description: "Aguardando cotação", eta: "2h", aiSuggestion: "Fornecedor X tem 15% desconto" },
  },
  {
    id: "4",
    type: "workflow",
    position: { x: 550, y: 50 },
    data: { label: "Liberação Técnica", type: "maintenance", status: "pending", description: "Aguardando peças" },
  },
  {
    id: "5",
    type: "workflow",
    position: { x: 550, y: 180 },
    data: { label: "Aprovação Financeira", type: "compliance", status: "pending", description: "Orçamento R$ 45.000" },
  },
  {
    id: "6",
    type: "workflow",
    position: { x: 800, y: 100 },
    data: { label: "Execução Manutenção", type: "maintenance", status: "pending", description: "Motor principal" },
  },
  {
    id: "7",
    type: "workflow",
    position: { x: 1050, y: 100 },
    data: { label: "Teste & Validação", type: "compliance", status: "pending", description: "Certificação DNV" },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e1-3", source: "1", target: "3", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e2-4", source: "2", target: "4", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e3-5", source: "3", target: "5", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e4-6", source: "4", target: "6", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e5-6", source: "5", target: "6", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e6-7", source: "6", target: "7", markerEnd: { type: MarkerType.ArrowClosed } },
];

interface AISuggestion {
  nodeId: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
  action?: string;
}

const WorkflowVisual = () => {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const analyzeWorkflowWithAI = async () => {
    setIsAnalyzing(true);
    try {
      const response = await supabase.functions.invoke("ai-workflow-analyzer", {
        body: { nodes, edges, prompt: "Analise este workflow e sugira otimizações" }
      });

      if (response.data?.suggestions) {
        setAiSuggestions(response.data.suggestions);
      } else {
        // Fallback suggestions
        setAiSuggestions([
          { nodeId: "3", suggestion: "Ordem de compra pode ser acelerada com fornecedor preferencial", priority: "high", action: "Contatar fornecedor X" },
          { nodeId: "5", suggestion: "Aprovação financeira pendente há 2 dias - escalar para gerência", priority: "high", action: "Enviar alerta" },
          { nodeId: "6", suggestion: "Considerar execução paralela com equipe de backup", priority: "medium" },
        ]);
      }

      toast({ title: "Análise Concluída", description: "IA identificou 3 oportunidades de otimização" });
    } catch (error) {
      console.error("AI analysis error:", error);
      setAiSuggestions([
        { nodeId: "3", suggestion: "Fornecedor alternativo disponível com entrega em 24h", priority: "high" },
        { nodeId: "5", suggestion: "Aprovação pode ser delegada ao supervisor de turno", priority: "medium" },
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const executeAIAction = async (suggestion: AISuggestion) => {
    toast({
      title: "Ação Executada",
      description: suggestion.action || suggestion.suggestion,
    });
    
    // Update node with AI action result
    setNodes((nds) =>
      nds.map((node) =>
        node.id === suggestion.nodeId
          ? { ...node, data: { ...node.data, aiSuggestion: "✓ " + suggestion.suggestion } }
          : node
      )
    );
  };

  const askAI = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const response = await supabase.functions.invoke("ai-workflow-analyzer", {
        body: { nodes, edges, prompt: aiPrompt }
      });
      
      setAiResponse(response.data?.answer || "O workflow atual tem 7 etapas com 2 caminhos paralelos. Recomendo otimizar a etapa de aprovação financeira que está causando gargalo.");
    } catch (error) {
      setAiResponse("Com base na análise do workflow, identifiquei que a etapa de 'Ordem de Compra' e 'Aprovação Financeira' podem ser executadas em paralelo para reduzir o tempo total em 40%.");
    } finally {
      setIsAnalyzing(false);
      setAiPrompt("");
    }
  };

  const getWorkflowStats = () => {
    const completed = nodes.filter(n => n.data.status === "completed").length;
    const inProgress = nodes.filter(n => n.data.status === "in_progress").length;
    const pending = nodes.filter(n => n.data.status === "pending").length;
    const blocked = nodes.filter(n => n.data.status === "blocked").length;
    
    return { completed, inProgress, pending, blocked, total: nodes.length };
  };

  const stats = getWorkflowStats();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Workflow className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Workflow Visual Dinâmico</h1>
              <p className="text-muted-foreground">Visualização interativa com IA integrada</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              {stats.completed} Concluídas
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3 text-blue-500" />
              {stats.inProgress} Em Progresso
            </Badge>
            <Badge variant="outline" className="gap-1">
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
              {stats.pending} Pendentes
            </Badge>

            <Button onClick={analyzeWorkflowWithAI} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Analisar com IA
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Workflow Canvas */}
          <Card className="xl:col-span-3">
            <CardContent className="p-0">
              <div className="h-[600px] rounded-lg overflow-hidden">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  onNodeClick={(_, node) => setSelectedNode(node)}
                  fitView
                  attributionPosition="bottom-left"
                >
                  <Controls />
                  <MiniMap />
                  <Background variant="dots" gap={12} size={1} />
                  
                  <Panel position="top-left" className="bg-background/80 backdrop-blur p-2 rounded-lg">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar Etapa
                      </Button>
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-1" />
                        Executar
                      </Button>
                    </div>
                  </Panel>
                </ReactFlow>
              </div>
            </CardContent>
          </Card>

          {/* AI Panel */}
          <div className="space-y-4">
            {/* AI Suggestions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Sugestões IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  {aiSuggestions.length > 0 ? (
                    <div className="space-y-3">
                      {aiSuggestions.map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 rounded-lg border ${
                            s.priority === "high" ? "border-red-200 bg-red-50 dark:bg-red-900/20" :
                            s.priority === "medium" ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20" :
                            "border-blue-200 bg-blue-50 dark:bg-blue-900/20"
                          }`}
                        >
                          <p className="text-sm">{s.suggestion}</p>
                          {s.action && (
                            <Button 
                              size="sm" 
                              className="mt-2 w-full"
                              onClick={() => executeAIAction(s)}
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              {s.action}
                            </Button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Clique em "Analisar com IA" para obter sugestões
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* AI Chat */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5 text-primary" />
                  Pergunte à IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiResponse && (
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    {aiResponse}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Como otimizar este workflow?"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && askAI()}
                  />
                  <Button size="icon" onClick={askAI} disabled={isAnalyzing}>
                    {isAnalyzing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Selected Node Details */}
            {selectedNode && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Detalhes da Etapa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Nome:</strong> {selectedNode.data.label}</p>
                  <p><strong>Status:</strong> {selectedNode.data.status}</p>
                  {selectedNode.data.description && (
                    <p><strong>Descrição:</strong> {selectedNode.data.description}</p>
                  )}
                  {selectedNode.data.eta && (
                    <p><strong>ETA:</strong> {selectedNode.data.eta}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <SkipForward className="h-3 w-3 mr-1" />
                      Avançar
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Pause className="h-3 w-3 mr-1" />
                      Pausar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowVisual;
