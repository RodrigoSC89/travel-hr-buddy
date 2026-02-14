/**
 * Intelligent Alerts Center - Connected to Supabase soc_alerts
 * ✅ Zero-Mock: Real alerts from soc_alerts table
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell, Zap, AlertTriangle, TrendingDown, TrendingUp, Activity,
  Clock, Target, Settings, Mail, MessageSquare, Smartphone, Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SmartAlert {
  id: string;
  title: string;
  message: string;
  type: "critical" | "warning" | "info" | "success";
  category: string;
  priority: "high" | "medium" | "low";
  timestamp: Date;
  isRead: boolean;
  actionable: boolean;
  action?: string;
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: "above" | "below" | "equals";
  threshold: number;
  enabled: boolean;
  channels: ("email" | "push" | "slack")[];
  cooldown: number;
}

export const IntelligentAlertsCenter = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real alerts from soc_alerts
  const { data: realAlerts = [], isLoading } = useQuery({
    queryKey: ["intelligent-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("soc_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []).map((a: any) => ({
        id: a.id,
        title: a.title || "System Alert",
        message: a.message || a.description || "",
        type: mapSeverity(a.severity),
        category: a.alert_type || "performance",
        priority: a.severity === "critical" ? "high" as const : a.severity === "warning" ? "medium" as const : "low" as const,
        timestamp: new Date(a.created_at),
        isRead: !!a.acknowledged_at,
        actionable: !a.acknowledged_at,
        action: a.recommended_action || undefined,
      }));
    },
    staleTime: 30_000,
  });

  // Acknowledge alert mutation
  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("soc_alerts")
        .update({ acknowledged_at: new Date().toISOString(), acknowledged_by: "current_user" })
        .eq("id", alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intelligent-alerts"] });
    },
  });

  // Alert rules (configuration - could be stored in ai_configurations)
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    { id: "rule_001", name: "Response Time Alert", description: "Trigger when avg response time exceeds 250ms", metric: "response_time", condition: "above", threshold: 250, enabled: true, channels: ["email", "push"], cooldown: 15 },
    { id: "rule_002", name: "Security Score Alert", description: "Alert when security score drops below 85%", metric: "security_score", condition: "below", threshold: 85, enabled: true, channels: ["email", "slack"], cooldown: 60 },
    { id: "rule_003", name: "Cache Performance Alert", description: "Monitor cache hit rate below 75%", metric: "cache_hit_rate", condition: "below", threshold: 75, enabled: true, channels: ["push"], cooldown: 30 },
    { id: "rule_004", name: "User Satisfaction Alert", description: "Alert on user satisfaction score below 85%", metric: "user_satisfaction", condition: "below", threshold: 85, enabled: false, channels: ["email"], cooldown: 120 },
  ]);

  const [globalSettings, setGlobalSettings] = useState({
    enableAI: true, enablePredictive: true, autoResolution: false,
    quietHours: { enabled: true, start: "22:00", end: "08:00" },
    severity: { critical: true, warning: true, info: false, success: false },
  });

  const toggleRule = (ruleId: string) => {
    setAlertRules(prev => prev.map(rule => rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule));
    toast({ title: "Regra Atualizada", description: "Configuração de alerta atualizada", duration: 2000 });
  };

  const updateThreshold = (ruleId: string, newThreshold: number) => {
    setAlertRules(prev => prev.map(rule => rule.id === ruleId ? { ...rule, threshold: newThreshold } : rule));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical": return AlertTriangle;
      case "warning": return AlertTriangle;
      case "success": return TrendingUp;
      case "info": return Activity;
      default: return Bell;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical": return "border-destructive bg-destructive/5 text-destructive";
      case "warning": return "border-warning bg-warning/5 text-warning";
      case "success": return "border-success bg-success/5 text-success";
      case "info": return "border-info bg-info/5 text-info";
      default: return "border-muted bg-muted/5 text-muted-foreground";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "performance": return Zap;
      case "security": return Shield;
      case "efficiency": return Target;
      default: return Bell;
    }
  };

  const alerts = realAlerts;
  const unreadCount = alerts.filter(a => !a.isRead).length;
  const criticalCount = alerts.filter(a => a.type === "critical" && !a.isRead).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Bell className="h-4 w-4 text-primary" /></div>
              <div>
                <div className="text-2xl font-bold">{unreadCount}</div>
                <p className="text-xs text-muted-foreground">Alertas não lidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10"><AlertTriangle className="h-4 w-4 text-destructive" /></div>
              <div>
                <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
                <p className="text-xs text-muted-foreground">Alertas críticos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10"><Settings className="h-4 w-4 text-success" /></div>
              <div>
                <div className="text-2xl font-bold">{alertRules.filter(r => r.enabled).length}</div>
                <p className="text-xs text-muted-foreground">Regras ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10"><Activity className="h-4 w-4 text-info" /></div>
              <div>
                <div className="text-2xl font-bold">{alerts.length}</div>
                <p className="text-xs text-muted-foreground">Total Alertas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas Inteligentes
            {unreadCount > 0 && <Badge className="bg-destructive text-destructive-foreground">{unreadCount}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Nenhum alerta ativo</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 8).map((alert) => {
                const AlertIcon = getAlertIcon(alert.type);
                const CategoryIcon = getCategoryIcon(alert.category);
                return (
                  <Alert key={alert.id} className={`${getAlertColor(alert.type)} ${alert.isRead ? "opacity-60" : ""}`}>
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-start gap-3">
                        <AlertIcon className="h-4 w-4 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{alert.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              <CategoryIcon className="h-3 w-3 mr-1" />{alert.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">{alert.priority.toUpperCase()}</Badge>
                          </div>
                          <AlertDescription className="text-sm mb-2">{alert.message}</AlertDescription>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />{alert.timestamp.toLocaleString("pt-BR")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!alert.isRead && (
                          <Button size="sm" variant="ghost" onClick={() => acknowledgeMutation.mutate(alert.id)}>
                            Marcar como lido
                          </Button>
                        )}
                      </div>
                    </div>
                  </Alert>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Rules */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Regras de Alerta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alertRules.map((rule) => (
              <Card key={rule.id} className="border border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{rule.name}</h4>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                    <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                  </div>
                  {rule.enabled && (
                    <div className="space-y-3 pt-3 border-t border-border/40">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Threshold: {rule.threshold}</label>
                          <Slider value={[rule.threshold]} onValueChange={(v) => updateThreshold(rule.id, v[0])} max={100} min={0} step={5} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Canais</label>
                          <div className="flex gap-2">
                            {rule.channels.includes("email") && <Badge variant="outline" className="text-xs"><Mail className="h-3 w-3 mr-1" />Email</Badge>}
                            {rule.channels.includes("push") && <Badge variant="outline" className="text-xs"><Smartphone className="h-3 w-3 mr-1" />Push</Badge>}
                            {rule.channels.includes("slack") && <Badge variant="outline" className="text-xs"><MessageSquare className="h-3 w-3 mr-1" />Slack</Badge>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Global Settings */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" />Configurações Globais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="font-medium">IA Preditiva</p><p className="text-sm text-muted-foreground">Previsão de alertas</p></div>
                <Switch checked={globalSettings.enablePredictive} onCheckedChange={(v) => setGlobalSettings(p => ({ ...p, enablePredictive: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="font-medium">Auto-Resolução</p><p className="text-sm text-muted-foreground">Resolver automaticamente alertas de baixa prioridade</p></div>
                <Switch checked={globalSettings.autoResolution} onCheckedChange={(v) => setGlobalSettings(p => ({ ...p, autoResolution: v }))} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="font-medium">Horário Silencioso</p><p className="text-sm text-muted-foreground">{globalSettings.quietHours.start} - {globalSettings.quietHours.end}</p></div>
                <Switch checked={globalSettings.quietHours.enabled} onCheckedChange={(v) => setGlobalSettings(p => ({ ...p, quietHours: { ...p.quietHours, enabled: v } }))} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function mapSeverity(severity: string): "critical" | "warning" | "info" | "success" {
  switch (severity) {
    case "critical": return "critical";
    case "high": return "critical";
    case "warning": case "medium": return "warning";
    case "low": case "info": return "info";
    default: return "info";
  }
}
