import React, { useState, useEffect } from "react";
import { IntelligentChecklistManager } from "@/components/checklists/intelligent-checklist-manager";
import ModuleActionButton from "@/components/ui/module-action-button";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { logger } from "@/lib/logger";
import { 
  ClipboardCheck,
  Brain,
  Shield,
  TrendingUp,
  Sparkles,
  Star,
  Crown,
  Zap,
  CheckCircle,
  Settings,
  BarChart3,
  Plus,
  FileText,
  RefreshCw,
  Download
} from "lucide-react";

const ChecklistsInteligentes = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const quickStats = [
    { icon: ClipboardCheck, label: "Checklists Ativos", value: "24", color: "primary" },
    { icon: CheckCircle, label: "Completados Hoje", value: "18", color: "success" },
    { icon: Settings, label: "Em Andamento", value: "6", color: "warning" },
    { icon: BarChart3, label: "Taxa de Sucesso", value: "96%", color: "info" }
  ];

  return (
    <ModulePageWrapper gradient="green">
      <ModuleHeader
        icon={ClipboardCheck}
        title="Checklists Inteligentes"
        description="Sistema avançado para operações marítimas"
        gradient="blue"
        badges={[
          { icon: Brain, label: "IA Preditiva" },
          { icon: Shield, label: "Segurança Total" },
          { icon: Zap, label: "Automação Completa" }
        ]}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl
              bg-gradient-to-br from-card via-card/95 to-${stat.color}/5 border-${stat.color}/20 hover:border-${stat.color}/40`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-${stat.color}/20 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Checklist Manager */}
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-card via-card/95 to-primary/5 hover:shadow-2xl transition-all duration-700 backdrop-blur-sm border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                <ClipboardCheck className="w-6 h-6 text-primary" />
              </div>
              <span className="text-gradient">Gerenciador Inteligente de Checklists</span>
              <Star className="w-6 h-6 text-warning animate-pulse" />
            </CardTitle>
            <CardDescription className="text-base flex items-center gap-2">
                Sistema avançado com IA para operações de bordo
              <div className="flex gap-1">
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    DP Operacional
                </Badge>
                <Badge variant="outline" className="bg-info/10 text-info border-info/30">
                    Máquinas
                </Badge>
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                    Náutica
                </Badge>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IntelligentChecklistManager />
          </CardContent>
        </Card>
      </div>

      {/* Module Action Button */}
      <ModuleActionButton
        moduleId="checklists"
        moduleName="Checklists"
        moduleIcon={<ClipboardCheck className="h-4 w-4" />}
        actions={[
          {
            id: "new-checklist",
            label: "Novo Checklist",
            icon: <Plus className="h-4 w-4" />,
            action: () => logger.info("Novo checklist"),
            variant: "default"
          },
          {
            id: "templates",
            label: "Templates",
            icon: <FileText className="h-4 w-4" />,
            action: () => logger.info("Templates"),
            variant: "outline"
          },
          {
            id: "reports",
            label: "Relatórios",
            icon: <BarChart3 className="h-4 w-4" />,
            action: () => logger.info("Relatórios"),
            variant: "outline"
          },
          {
            id: "ai-assist",
            label: "IA Assistente",
            icon: <Brain className="h-4 w-4" />,
            action: () => logger.info("IA Assistente"),
            variant: "outline"
          }
        ]}
        quickActions={[
          {
            id: "refresh",
            label: "Atualizar",
            icon: <RefreshCw className="h-3 w-3" />,
            action: () => window.location.reload(),
            shortcut: "F5"
          },
          {
            id: "export",
            label: "Exportar",
            icon: <Download className="h-3 w-3" />,
            action: () => logger.info("Export checklists")
          }
        ]}
      />
    </ModulePageWrapper>
  );
};

export default ChecklistsInteligentes;