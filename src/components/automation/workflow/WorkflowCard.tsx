import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Play,
  Pause,
  FileText,
  Calendar,
  User,
  Users,
  TrendingUp,
  Settings,
  Target,
  Workflow as WorkflowIcon,
  Wrench,
  Shield,
  MoreVertical,
  Trash2,
  Copy,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Workflow, WorkflowStep } from "@/hooks/useWorkflows";

interface WorkflowCardProps {
  workflow: Workflow;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onDetails: (workflow: Workflow) => void;
  onEdit: (workflow: Workflow) => void;
  onDuplicate: (workflow: Workflow) => void;
  onDelete: (id: string) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
  case "completed": return <CheckCircle className="h-4 w-4" />;
  case "in_progress": return <RefreshCw className="h-4 w-4 animate-spin" />;
  case "pending": return <Clock className="h-4 w-4" />;
  case "failed": return <AlertTriangle className="h-4 w-4" />;
  case "active": return <Play className="h-4 w-4" />;
  case "paused": return <Pause className="h-4 w-4" />;
  default: return <Clock className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
  case "completed": return "bg-green-500/10 text-green-600 border-green-500/20";
  case "in_progress": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
  case "pending": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  case "failed": return "bg-red-500/10 text-red-600 border-red-500/20";
  case "active": return "bg-green-500/10 text-green-600 border-green-500/20";
  case "paused": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
  case "draft": return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
  case "urgent": return "bg-red-500/10 text-red-600 border-red-500/20";
  case "high": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
  case "medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  case "low": return "bg-green-500/10 text-green-600 border-green-500/20";
  default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
  case "hr": return <Users className="h-5 w-5" />;
  case "finance": return <TrendingUp className="h-5 w-5" />;
  case "operations": return <Settings className="h-5 w-5" />;
  case "marketing": return <Target className="h-5 w-5" />;
  case "maintenance": return <Wrench className="h-5 w-5" />;
  case "compliance": return <Shield className="h-5 w-5" />;
  default: return <WorkflowIcon className="h-5 w-5" />;
  }
};

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onStart,
  onPause,
  onDetails,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A";
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {getCategoryIcon(workflow.category)}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg leading-tight truncate">
                {workflow.name}
              </CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {workflow.description}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className={getPriorityColor(workflow.priority)}>
              {workflow.priority}
            </Badge>
            <Badge variant="outline" className={getStatusColor(workflow.status)}>
              {getStatusIcon(workflow.status)}
              <span className="ml-1 capitalize">{workflow.status === "active" ? "Ativo" : workflow.status}</span>
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(workflow)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(workflow)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(workflow.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{workflow.progress}%</span>
          </div>
          <Progress value={workflow.progress} className="h-2" />
        </div>

        {/* Steps */}
        <div>
          <h4 className="font-medium text-sm mb-2">
            Etapas ({workflow.steps.length})
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
            {workflow.steps.slice(0, 4).map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between p-2 rounded-md bg-muted/50 border border-border/50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`shrink-0 ${getStatusColor(step.status).split(" ")[1]}`}>
                    {getStatusIcon(step.status)}
                  </div>
                  <span className="text-sm truncate">{step.name}</span>
                  {step.assignee && (
                    <Badge variant="outline" className="text-xs shrink-0 hidden sm:inline-flex">
                      {step.assignee}
                    </Badge>
                  )}
                </div>
                <Badge variant="outline" className={`text-xs shrink-0 ${getStatusColor(step.status)}`}>
                  {step.status === "in_progress" ? "Em progresso" : 
                    step.status === "completed" ? "Concluído" :
                      step.status === "pending" ? "Pendente" :
                        step.status === "failed" ? "Falhou" : step.status}
                </Badge>
              </div>
            ))}
            {workflow.steps.length > 4 && (
              <p className="text-xs text-muted-foreground text-center py-1">
                + {workflow.steps.length - 4} etapas adicionais
              </p>
            )}
          </div>
        </div>

        {/* Info and Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(workflow.updated_at)}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {workflow.created_by}
            </span>
            {workflow.estimated_duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(workflow.estimated_duration)} estimado
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onDetails(workflow)}
            >
              <FileText className="h-3 w-3 mr-1" />
              Detalhes
            </Button>

            {workflow.status === "draft" || workflow.status === "paused" ? (
              <Button
                size="sm"
                onClick={() => onStart(workflow.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-3 w-3 mr-1" />
                Iniciar
              </Button>
            ) : workflow.status === "active" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPause(workflow.id)}
                className="border-orange-500/50 text-orange-600 hover:bg-orange-500/10"
              >
                <Pause className="h-3 w-3 mr-1" />
                Pausar
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
