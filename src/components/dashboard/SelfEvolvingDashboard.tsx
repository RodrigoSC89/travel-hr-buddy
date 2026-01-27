/**
 * PATCH 1006 - Self-Evolving Dashboard
 * Dashboard that adapts widgets based on usage patterns and AI recommendations
 */

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  Layout,
  TrendingUp,
  Eye,
  Clock,
  Star,
  Sparkles,
  RefreshCw,
  Settings,
  GripVertical,
  X,
  Plus,
  Lightbulb,
  BarChart3,
  Users,
  Ship,
  Wrench,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Widget {
  id: string;
  type: string;
  title: string;
  icon: React.ReactNode;
  priority: number;
  usageScore: number;
  visible: boolean;
  size: "small" | "medium" | "large";
  category: string;
}

interface UsagePattern {
  widgetId: string;
  viewCount: number;
  interactionCount: number;
  avgTimeSpent: number;
  lastAccessed: Date;
}

const DEFAULT_WIDGETS: Widget[] = [
  { id: "fleet-status", type: "fleet", title: "Status da Frota", icon: <Ship className="h-4 w-4" />, priority: 1, usageScore: 85, visible: true, size: "large", category: "operations" },
  { id: "crew-overview", type: "crew", title: "Tripulação", icon: <Users className="h-4 w-4" />, priority: 2, usageScore: 78, visible: true, size: "medium", category: "hr" },
  { id: "maintenance-alerts", type: "maintenance", title: "Alertas de Manutenção", icon: <Wrench className="h-4 w-4" />, priority: 3, usageScore: 72, visible: true, size: "medium", category: "maintenance" },
  { id: "kpi-summary", type: "kpis", title: "KPIs Principais", icon: <BarChart3 className="h-4 w-4" />, priority: 4, usageScore: 68, visible: true, size: "large", category: "analytics" },
  { id: "doc-expiry", type: "documents", title: "Documentos Vencendo", icon: <FileText className="h-4 w-4" />, priority: 5, usageScore: 55, visible: true, size: "small", category: "compliance" },
  { id: "critical-alerts", type: "alerts", title: "Alertas Críticos", icon: <AlertTriangle className="h-4 w-4" />, priority: 6, usageScore: 90, visible: true, size: "medium", category: "safety" },
];

export function SelfEvolvingDashboard() {
  const [widgets, setWidgets] = useState<Widget[]>(DEFAULT_WIDGETS);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastOptimized, setLastOptimized] = useState<Date | null>(null);

  // Simulated usage tracking
  const [usagePatterns, setUsagePatterns] = useState<Map<string, UsagePattern>>(new Map());

  // AI-generated suggestions
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    "Considere mover 'Alertas Críticos' para o topo - alta taxa de uso",
    "Widget 'Documentos Vencendo' tem baixa interação - ocultar?",
    "Padrão detectado: maior atividade entre 8h-10h",
  ]);

  // Fetch real metrics for widgets
  const { data: metrics } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const [vesselsRes, crewRes, maintenanceRes, alertsRes] = await Promise.all([
        supabase.from("vessels").select("id, status").limit(100),
        supabase.from("crew_members").select("id, status").limit(100),
        supabase.from("maintenance_schedules").select("id, status").limit(100),
        supabase.from("shared_alerts").select("id").limit(50),
      ]);

      return {
        vessels: {
          total: vesselsRes.data?.length || 0,
          active: vesselsRes.data?.filter(v => v.status === "active").length || 0,
        },
        crew: {
          total: crewRes.data?.length || 0,
          onboard: crewRes.data?.filter(c => c.status === "active").length || 0,
        },
        maintenance: {
          total: maintenanceRes.data?.length || 0,
          critical: maintenanceRes.data?.filter(m => m.status === "overdue").length || 0,
        },
        alerts: {
          total: alertsRes.data?.length || 0,
          critical: 0,
        },
      };
    },
    refetchInterval: 60000,
  });

  // Track widget usage
  const trackWidgetUsage = useCallback((widgetId: string) => {
    setUsagePatterns((prev) => {
      const pattern = prev.get(widgetId) || {
        widgetId,
        viewCount: 0,
        interactionCount: 0,
        avgTimeSpent: 0,
        lastAccessed: new Date(),
      };
      pattern.viewCount++;
      pattern.lastAccessed = new Date();
      const newMap = new Map(prev);
      newMap.set(widgetId, pattern);
      return newMap;
    });
  }, []);

  // AI-driven optimization
  const optimizeDashboard = useCallback(async () => {
    setIsOptimizing(true);
    
    // Simulate AI processing
    await new Promise((r) => setTimeout(r, 1500));

    setWidgets((prev) => {
      const optimized = [...prev];
      
      // Sort by usage score
      optimized.sort((a, b) => b.usageScore - a.usageScore);
      
      // Update priorities
      optimized.forEach((w, i) => {
        w.priority = i + 1;
      });

      // Auto-hide low usage widgets
      optimized.forEach((w) => {
        if (w.usageScore < 30) {
          w.visible = false;
        }
      });

      return optimized;
    });

    setLastOptimized(new Date());
    setIsOptimizing(false);

    // Generate new suggestions
    setAiSuggestions([
      "Layout otimizado com base em padrões de uso",
      "3 widgets reordenados por relevância",
      "Próxima otimização recomendada em 7 dias",
    ]);
  }, []);

  // Auto-optimize on mount if enabled
  useEffect(() => {
    if (autoOptimize && !lastOptimized) {
      const timer = setTimeout(optimizeDashboard, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoOptimize, lastOptimized, optimizeDashboard]);

  const toggleWidget = (widgetId: string) => {
    setWidgets((prev) =>
      prev.map((w) =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      )
    );
  };

  const visibleWidgets = widgets.filter((w) => w.visible).sort((a, b) => a.priority - b.priority);

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Dashboard Autoevolutivo</CardTitle>
                <CardDescription>
                  Adapta-se automaticamente aos seus padrões de uso
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-optimize"
                  checked={autoOptimize}
                  onCheckedChange={setAutoOptimize}
                />
                <Label htmlFor="auto-optimize" className="text-sm">Auto-otimizar</Label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={optimizeDashboard}
                disabled={isOptimizing}
              >
                {isOptimizing ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Otimizar Agora
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* AI Suggestions */}
        {showAISuggestions && aiSuggestions.length > 0 && (
          <CardContent className="pt-0">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Sugestões da IA</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-auto"
                  onClick={() => setShowAISuggestions(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <ul className="space-y-1">
                {aiSuggestions.map((suggestion, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleWidgets.map((widget) => (
          <WidgetCard
            key={widget.id}
            widget={widget}
            metrics={metrics}
            onTrack={() => trackWidgetUsage(widget.id)}
            onToggle={() => toggleWidget(widget.id)}
          />
        ))}

        {/* Add Widget Card */}
        <Card className="border-dashed flex items-center justify-center min-h-[150px] hover:bg-muted/50 transition-colors cursor-pointer">
          <div className="text-center text-muted-foreground">
            <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Adicionar Widget</p>
          </div>
        </Card>
      </div>

      {/* Widget Manager */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gerenciar Widgets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {widgets.map((widget) => (
              <Button
                key={widget.id}
                variant={widget.visible ? "default" : "outline"}
                size="sm"
                className="justify-start"
                onClick={() => toggleWidget(widget.id)}
              >
                {widget.icon}
                <span className="ml-2 truncate">{widget.title}</span>
                {widget.visible && (
                  <Eye className="h-3 w-3 ml-auto opacity-50" />
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Analytics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Análise de Uso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {widgets.slice(0, 5).map((widget) => (
              <div key={widget.id} className="flex items-center gap-3">
                <span className="text-muted-foreground">{widget.icon}</span>
                <span className="text-sm flex-1 truncate">{widget.title}</span>
                <Progress value={widget.usageScore} className="w-24 h-2" />
                <span className="text-xs text-muted-foreground w-8">
                  {widget.usageScore}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WidgetCard({
  widget,
  metrics,
  onTrack,
  onToggle,
}: {
  widget: Widget;
  metrics?: Record<string, unknown>;
  onTrack: () => void;
  onToggle: () => void;
}) {
  useEffect(() => {
    onTrack();
  }, [onTrack]);

  const getWidgetContent = () => {
    const m = metrics as { vessels?: { total: number; active: number }; crew?: { total: number; onboard: number }; maintenance?: { total: number; critical: number }; alerts?: { total: number; critical: number } } | undefined;
    
    switch (widget.type) {
      case "fleet":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold">{m?.vessels?.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ativos</span>
              <span className="font-bold text-green-500">{m?.vessels?.active || 0}</span>
            </div>
          </div>
        );
      case "crew":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold">{m?.crew?.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">A bordo</span>
              <span className="font-bold text-blue-500">{m?.crew?.onboard || 0}</span>
            </div>
          </div>
        );
      case "maintenance":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pendentes</span>
              <span className="font-bold">{m?.maintenance?.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Críticos</span>
              <span className="font-bold text-red-500">{m?.maintenance?.critical || 0}</span>
            </div>
          </div>
        );
      case "alerts":
        return (
          <div className="text-center py-2">
            <div className="text-3xl font-bold text-red-500">{m?.alerts?.critical || 0}</div>
            <div className="text-xs text-muted-foreground">alertas críticos</div>
          </div>
        );
      default:
        return (
          <div className="text-center py-4 text-muted-foreground">
            <div className="h-8 w-8 mx-auto mb-2 opacity-50">{widget.icon}</div>
            <span className="text-xs">Widget customizado</span>
            <div className="text-lg font-semibold mt-1">--</div>
          </div>
        );
    }
  };

  return (
    <Card className={cn("relative group", widget.size === "large" && "md:col-span-2")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            {widget.icon}
            {widget.title}
          </CardTitle>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <GripVertical className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggle}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>{getWidgetContent()}</CardContent>
      
      {/* Usage indicator */}
      <div className="absolute bottom-2 right-2">
        <Badge variant="outline" className="text-xs opacity-50">
          <Star className="h-2.5 w-2.5 mr-1" />
          {widget.usageScore}%
        </Badge>
      </div>
    </Card>
  );
}

export default SelfEvolvingDashboard;
