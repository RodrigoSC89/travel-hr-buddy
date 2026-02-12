/**
 * Actionable Dashboard Widget
 * Transform passive cards into interactive command widgets
 * Features: drill-down, actions, comments, quick workflows
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock,
  MessageSquare, ChevronRight, Play, Pause, RefreshCw, 
  Eye, Settings, MoreHorizontal, Send, X, Loader2,
  Target, Zap, Bell, FileText
} from "lucide-react";
import { format } from "date-fns";

interface WidgetMetric {
  label: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "stable";
  status?: "success" | "warning" | "error" | "info";
}

interface WidgetAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: "default" | "outline" | "destructive";
  onClick: () => void;
}

interface WidgetComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

interface ActionableDashboardWidgetProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  metrics: WidgetMetric[];
  actions?: WidgetAction[];
  onDrillDown?: () => void;
  alertCount?: number;
  lastUpdated?: string;
  status?: "operational" | "warning" | "critical" | "maintenance";
  children?: React.ReactNode;
}

export function ActionableDashboardWidget({
  title,
  description,
  icon,
  metrics,
  actions = [],
  onDrillDown,
  alertCount = 0,
  lastUpdated,
  status = "operational",
  children
}: ActionableDashboardWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<WidgetComment[]>([]);
  const [isActionsLoading, setIsActionsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const statusColors = {
    operational: "bg-success",
    warning: "bg-warning",
    critical: "bg-destructive",
    maintenance: "bg-info"
  };

  const statusLabels = {
    operational: "Operacional",
    warning: "Atenção",
    critical: "Crítico",
    maintenance: "Manutenção"
  };

  const getTrendIcon = (trend?: "up" | "down" | "stable") => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-destructive" />;
    return null;
  };

  const getStatusIcon = (status?: "success" | "warning" | "error" | "info") => {
    if (status === "success") return <CheckCircle className="h-4 w-4 text-success" />;
    if (status === "warning") return <AlertTriangle className="h-4 w-4 text-warning" />;
    if (status === "error") return <AlertTriangle className="h-4 w-4 text-destructive" />;
    return null;
  };

  const handleAction = async (action: WidgetAction) => {
    setIsActionsLoading(action.id);
    try {
      action.onClick();
    } finally {
      setIsActionsLoading(null);
    }
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    
    const comment: WidgetComment = {
      id: Date.now().toString(),
      author: "Usuário Atual",
      content: newComment,
      timestamp: new Date().toISOString()
    };
    setComments([comment, ...comments]);
    setNewComment("");
    toast({ title: "Comentário adicionado" });
  };

  return (
    <>
      <Card className={`relative overflow-hidden transition-all ${isExpanded ? "ring-2 ring-primary" : ""}`}>
        {/* Status indicator bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${statusColors[status]}`} />
        
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {title}
                  {alertCount > 0 && (
                    <Badge variant="destructive" className="h-5 px-1.5">
                      {alertCount}
                    </Badge>
                  )}
                </CardTitle>
                {description && (
                  <CardDescription className="text-xs">{description}</CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">
                {statusLabels[status]}
              </Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsCommentsOpen(true)}>
                <MessageSquare className="h-4 w-4" />
              </Button>
              {onDrillDown && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDrillDown}>
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((metric, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{metric.value}</span>
                  {getTrendIcon(metric.trend)}
                  {getStatusIcon(metric.status)}
                  {metric.change !== undefined && (
                    <span className={`text-xs ${metric.change >= 0 ? "text-success" : "text-destructive"}`}>
                      {metric.change >= 0 ? "+" : ""}{metric.change}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {actions.slice(0, isExpanded ? actions.length : 3).map(action => (
                <Button
                  key={action.id}
                  size="sm"
                  variant={action.variant || "outline"}
                  onClick={() => handleAction(action)}
                  disabled={isActionsLoading === action.id}
                >
                  {isActionsLoading === action.id ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    action.icon
                  )}
                  <span className="ml-1">{action.label}</span>
                </Button>
              ))}
              {actions.length > 3 && !isExpanded && (
                <Button size="sm" variant="ghost" onClick={() => setIsExpanded(true)}>
                  +{actions.length - 3} mais
                </Button>
              )}
            </div>
          )}

          {/* Custom children content */}
          {children}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lastUpdated ? format(new Date(lastUpdated), "HH:mm:ss") : "Tempo real"}
            </div>
            {comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {comments.length} comentários
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comments Dialog */}
      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comentários - {title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicionar comentário..."
                onKeyDown={(e) => e.key === "Enter" && addComment()}
              />
              <Button onClick={addComment}>
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[300px]">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum comentário ainda
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map(comment => (
                    <div key={comment.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.timestamp), "dd/MM HH:mm")}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Pre-built operational widgets

interface OperationalCommandPanelProps {
  onNavigate?: (module: string) => void;
}

export function OperationalCommandPanel({ onNavigate }: OperationalCommandPanelProps) {
  const { toast } = useToast();

  const handleQuickAction = (action: string) => {
    toast({
      title: `Ação Executada: ${action}`,
      description: "Workflow iniciado com sucesso"
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <ActionableDashboardWidget
        title="Frota em Operação"
        description="Status da frota ativa"
        icon={<Target className="h-5 w-5 text-primary" />}
        status="operational"
        alertCount={2}
        metrics={[
          { label: "Embarcações Ativas", value: 12, trend: "stable" },
          { label: "Em Trânsito", value: 8, change: 12 },
          { label: "Em Porto", value: 3, status: "success" },
          { label: "Manutenção", value: 1, status: "warning" }
        ]}
        actions={[
          { 
            id: "view-map", 
            label: "Ver Mapa", 
            icon: <Eye className="h-4 w-4" />,
            onClick: () => onNavigate?.("fleet-command")
          },
          { 
            id: "new-voyage", 
            label: "Nova Viagem", 
            icon: <Play className="h-4 w-4" />,
            onClick: () => handleQuickAction("Nova Viagem")
          },
          { 
            id: "alerts", 
            label: "Ver Alertas", 
            icon: <Bell className="h-4 w-4" />,
            variant: "destructive",
            onClick: () => handleQuickAction("Alertas")
          }
        ]}
        onDrillDown={() => onNavigate?.("fleet-command")}
      />

      <ActionableDashboardWidget
        title="Cargas em Trânsito"
        description="Monitoramento de cargas"
        icon={<Zap className="h-5 w-5 text-purple-500" />}
        status="warning"
        alertCount={1}
        metrics={[
          { label: "Total em Trânsito", value: 45, trend: "up" },
          { label: "Entregues Hoje", value: 8, change: 33 },
          { label: "Atrasadas", value: 3, status: "error" },
          { label: "No Prazo", value: "93%", status: "success" }
        ]}
        actions={[
          { 
            id: "track", 
            label: "Rastrear", 
            icon: <Eye className="h-4 w-4" />,
            onClick: () => onNavigate?.("logistics-command")
          },
          { 
            id: "report", 
            label: "Relatório", 
            icon: <FileText className="h-4 w-4" />,
            onClick: () => handleQuickAction("Relatório de Cargas")
          }
        ]}
        onDrillDown={() => onNavigate?.("logistics-command")}
      />

      <ActionableDashboardWidget
        title="Manutenção Preditiva"
        description="Alertas de manutenção"
        icon={<Settings className="h-5 w-5 text-orange-500" />}
        status="warning"
        alertCount={5}
        metrics={[
          { label: "Alertas Ativos", value: 5, status: "warning" },
          { label: "Próximas 24h", value: 2, status: "error" },
          { label: "Resolvidos Hoje", value: 3, change: 50 },
          { label: "Eficiência", value: "87%", trend: "up" }
        ]}
        actions={[
          { 
            id: "view-all", 
            label: "Ver Todos", 
            icon: <Eye className="h-4 w-4" />,
            onClick: () => onNavigate?.("predictive-maintenance")
          },
          { 
            id: "schedule", 
            label: "Agendar OS", 
            icon: <Clock className="h-4 w-4" />,
            onClick: () => handleQuickAction("Agendar OS")
          }
        ]}
        onDrillDown={() => onNavigate?.("predictive-maintenance")}
      >
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Motor Principal - MV Atlantic</span>
            <Badge variant="destructive">Crítico</Badge>
          </div>
          <Progress value={85} className="h-2" />
          <p className="text-xs text-muted-foreground">85% do limite de horas atingido</p>
        </div>
      </ActionableDashboardWidget>
    </div>
  );
}

export default ActionableDashboardWidget;
