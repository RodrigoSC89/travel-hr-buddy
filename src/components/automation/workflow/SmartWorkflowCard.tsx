import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play, Pause, CheckCircle, AlertCircle, Edit, Copy, Calendar, Clock,
  FileText, Users, BarChart3, Target, Database, Zap, Workflow
} from "lucide-react";
import { WorkflowItem } from "./types";

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "active": return <CheckCircle className="w-4 h-4 text-success" />;
    case "inactive": return <Pause className="w-4 h-4 text-muted-foreground" />;
    case "draft": return <Edit className="w-4 h-4 text-info" />;
    default: return <AlertCircle className="w-4 h-4 text-warning" />;
  }
};

export const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "documentos": return <FileText className="w-4 h-4" />;
    case "rh": return <Users className="w-4 h-4" />;
    case "monitoramento": return <BarChart3 className="w-4 h-4" />;
    case "financeiro": return <Target className="w-4 h-4" />;
    case "ti": return <Database className="w-4 h-4" />;
    case "vendas": return <Zap className="w-4 h-4" />;
    default: return <Workflow className="w-4 h-4" />;
  }
};

interface SmartWorkflowCardProps {
  workflow: WorkflowItem;
  onExecute: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDuplicate: (workflow: WorkflowItem) => void;
}

export const SmartWorkflowCard: React.FC<SmartWorkflowCardProps> = ({
  workflow, onExecute, onToggleStatus, onDuplicate
}) => (
  <Card className="border-border hover:shadow-md transition-shadow">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getCategoryIcon(workflow.category)}
          <CardTitle className="text-lg">{workflow.name}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(workflow.status)}
          <Badge variant={workflow.status === "active" ? "default" : "secondary"}>
            {workflow.status}
          </Badge>
        </div>
      </div>
      <CardDescription className="line-clamp-2">{workflow.description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Execuções:</span>
          <div className="font-medium">{workflow.executions}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Sucesso:</span>
          <div className="font-medium">{workflow.successRate}%</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span>Taxa de Sucesso</span>
          <span>{workflow.successRate}%</span>
        </div>
        <Progress value={workflow.successRate} className="h-2" />
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="w-3 h-3" />
        <span>Criado: {workflow.createdAt.toLocaleDateString()}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>Última execução: {workflow.lastRun ? workflow.lastRun.toLocaleString() : "Nunca"}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {workflow.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
        ))}
      </div>
      <div className="flex gap-2 pt-2">
        <Button size="sm" onClick={() => onExecute(workflow.id)} disabled={workflow.status !== "active"} className="flex-1">
          <Play className="w-3 h-3 mr-1" /> Executar
        </Button>
        <Button size="sm" variant="outline" onClick={() => onToggleStatus(workflow.id)}>
          {workflow.status === "active" ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDuplicate(workflow)}>
          <Copy className="w-3 h-3" />
        </Button>
      </div>
    </CardContent>
  </Card>
);
