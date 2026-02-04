/**
 * Premium Module Shell - Container universal para módulos
 * Estrutura padronizada com header, tabs e áreas de conteúdo
 */

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, Download, Settings, HelpCircle, 
  Brain, Bell, ChevronRight, Sparkles,
  type LucideIcon
} from "lucide-react";
import { toast } from "sonner";

export interface ModuleTab {
  id: string;
  label: string;
  icon: LucideIcon;
  content: React.ReactNode;
  badge?: string | number;
}

export interface PremiumModuleShellProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconGradient?: string;
  tabs: ModuleTab[];
  defaultTab?: string;
  actions?: React.ReactNode;
  onRefresh?: () => Promise<void>;
  onExport?: () => void;
  showAIBadge?: boolean;
  aiStatus?: "active" | "learning" | "offline";
  alerts?: number;
  children?: React.ReactNode;
}

export function PremiumModuleShell({
  title,
  subtitle,
  icon: Icon,
  iconGradient = "from-primary to-primary/80",
  tabs,
  defaultTab,
  actions,
  onRefresh,
  onExport,
  showAIBadge = false,
  aiStatus = "active",
  alerts = 0,
  children
}: PremiumModuleShellProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast.success("Dados atualizados com sucesso");
    } catch {
      toast.error("Erro ao atualizar dados");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Header */}
      <div className="border-b bg-gradient-to-r from-background via-muted/30 to-background">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${iconGradient} text-primary-foreground shadow-lg`}>
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                  {showAIBadge && (
                    <Badge 
                      variant="secondary" 
                      className={`gap-1 ${
                        aiStatus === "active" ? "bg-emerald-500/10 text-emerald-600" :
                        aiStatus === "learning" ? "bg-amber-500/10 text-amber-600" :
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Brain className="h-3 w-3" />
                      {aiStatus === "active" ? "IA Ativa" : aiStatus === "learning" ? "Aprendendo" : "IA Offline"}
                    </Badge>
                  )}
                  {alerts > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <Bell className="h-3 w-3" />
                      {alerts}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {actions}
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              )}
              {onRefresh && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                  Atualizar
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setShowHelp(!showHelp)}>
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="border-b bg-info/5 px-4 py-3">
          <div className="container mx-auto flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-info mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-info">Dicas do módulo</p>
              <p className="text-muted-foreground">
                Use as abas para navegar entre as funcionalidades. 
                Clique em qualquer KPI para ver detalhes. 
                A IA analisa seus dados em tempo real.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowHelp(false)}>
              Fechar
            </Button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="inline-flex h-11 items-center gap-1 rounded-lg bg-muted/50 p-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.badge && (
                  <Badge variant="secondary" className="h-5 min-w-5 px-1 text-[10px]">
                    {tab.badge}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0 focus-visible:outline-none">
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
        
        {children}
      </div>
    </div>
  );
}
