import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bell,
  Zap,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Activity,
  Clock,
  Target,
  Settings,
  Mail,
  MessageSquare,
  Smartphone,
  Shield,
  Database,
  Server,
  Globe,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SmartAlert {
  id: string;
  title: string;
  message: string;
  type: "critical" | "warning" | "info" | "success";
  category: "performance" | "security" | "efficiency" | "user_experience";
  priority: "high" | "medium" | "low";
  timestamp: Date;
  isRead: boolean;
  actionable: boolean;
  action?: string;
  metrics?: {
    threshold: number;
    current: number;
    trend: "up" | "down" | "stable";
  };
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
  cooldown: number; // minutes
}

export const IntelligentAlertsCenter = () => {
  const { toast } = useToast();

  const [alerts, setAlerts] = useState<SmartAlert[]>([
    {
      id: "alert_001",
      title: "Performance Degradation Detected",
      message:
        "Response time increased by 45% in the last hour. Database queries are showing slower execution.",
      type: "critical",
      category: "performance",
      priority: "high",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isRead: false,
      actionable: true,
      action: "Optimize database queries",
      metrics: {
        threshold: 200,
        current: 290,
        trend: "up",
      },
    },
    {
      id: "alert_002",
      title: "Security Score Improvement",
      message: "Security headers optimization resulted in 12% security score increase.",
      type: "success",
      category: "security",
      priority: "medium",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
      actionable: false,
      metrics: {
        threshold: 90,
        current: 92,
        trend: "up",
      },
    },
    {
      id: "alert_003",
      title: "Cache Hit Rate Warning",
      message: "Cache hit rate dropped to 68%. Consider reviewing cache invalidation strategy.",
      type: "warning",
      category: "efficiency",
      priority: "medium",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isRead: true,
      actionable: true,
      action: "Review cache configuration",
      metrics: {
        threshold: 80,
        current: 68,
        trend: "down",
      },
    },
  ]);

  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: "rule_001",
      name: "Response Time Alert",
      description: "Trigger when average response time exceeds 250ms",
      metric: "response_time",
      condition: "above",
      threshold: 250,
      enabled: true,
      channels: ["email", "push"],
      cooldown: 15,
    },
    {
      id: "rule_002",
      name: "Security Score Alert",
      description: "Alert when security score drops below 85%",
      metric: "security_score",
      condition: "below",
      threshold: 85,
      enabled: true,
      channels: ["email", "slack"],
      cooldown: 60,
    },
    {
      id: "rule_003",
      name: "Cache Performance Alert",
      description: "Monitor cache hit rate below 75%",
      metric: "cache_hit_rate",
      condition: "below",
      threshold: 75,
      enabled: true,
      channels: ["push"],
      cooldown: 30,
    },
    {
      id: "rule_004",
      name: "User Satisfaction Alert",
      description: "Alert on user satisfaction score below 85%",
      metric: "user_satisfaction",
      condition: "below",
      threshold: 85,
      enabled: false,
      channels: ["email"],
      cooldown: 120,
    },
  ]);

  const [globalSettings, setGlobalSettings] = useState({
    enableAI: true,
    enablePredictive: true,
    autoResolution: false,
    quietHours: {
      enabled: true,
      start: "22:00",
      end: "08:00",
    },
    severity: {
      critical: true,
      warning: true,
      info: false,
      success: false,
    },
  });

  useEffect(() => {
    // Simular chegada de novos alertas
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30% chance de novo alerta
        generateRandomAlert();
      }
    }, 30000); // A cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const generateRandomAlert = () => {
    const types: SmartAlert["type"][] = ["warning", "info", "critical"];
    const categories: SmartAlert["category"][] = [
      "performance",
      "security",
      "efficiency",
      "user_experience",
    ];

    const alertMessages = [
      "High CPU utilization detected on production servers",
      "Memory usage approaching threshold limits",
      "Unusual traffic pattern detected - possible optimization opportunity",
      "SSL certificate renewal required in 7 days",
    ];

    const newAlert: SmartAlert = {
      id: `alert_${Date.now()}`,
      title: "System Alert Generated",
      message: alertMessages[Math.floor(Math.random() * alertMessages.length)],
      type: types[Math.floor(Math.random() * types.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      priority: "medium",
      timestamp: new Date(),
      isRead: false,
      actionable: Math.random() > 0.5,
      action: Math.random() > 0.5 ? "Review and optimize" : undefined,
      metrics: {
        threshold: 80,
        current: Math.floor(Math.random() * 100),
        trend: Math.random() > 0.5 ? "up" : "down",
      },
    };

    setAlerts(prev => [newAlert, ...prev]);

    toast({
      title: "Novo Alerta Inteligente",
      description: newAlert.message,
      duration: 4000,
    });
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert => (alert.id === alertId ? { ...alert, isRead: true } : alert))
    );
  };

  const toggleRule = (ruleId: string) => {
    setAlertRules(prev =>
      prev.map(rule => (rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule))
    );

    toast({
      title: "Regra Atualizada",
      description: "Configuração de alerta foi atualizada",
      duration: 2000,
    });
  };

  const updateThreshold = (ruleId: string, newThreshold: number) => {
    setAlertRules(prev =>
      prev.map(rule => (rule.id === ruleId ? { ...rule, threshold: newThreshold } : rule))
    );
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
    case "critical":
      return AlertTriangle;
    case "warning":
      return AlertTriangle;
    case "success":
      return TrendingUp;
    case "info":
      return Activity;
    default:
      return Bell;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
    case "critical":
      return "border-destructive bg-destructive/5 text-destructive";
    case "warning":
      return "border-warning bg-warning/5 text-warning";
    case "success":
      return "border-success bg-success/5 text-success";
    case "info":
      return "border-info bg-info/5 text-info";
    default:
      return "border-muted bg-muted/5 text-muted-foreground";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
    case "performance":
      return Zap;
    case "security":
      return Shield;
    case "efficiency":
      return Target;
    case "user_experience":
      return Activity;
    default:
      return Bell;
    }
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const criticalCount = alerts.filter(alert => alert.type === "critical" && !alert.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header com Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="h-4 w-4 text-primary" />
              </div>
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
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
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
              <div className="p-2 rounded-lg bg-success/10">
                <Settings className="h-4 w-4 text-success" />
              </div>
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
              <div className="p-2 rounded-lg bg-info/10">
                <Activity className="h-4 w-4 text-info" />
              </div>
              <div>
                <div className="text-2xl font-bold">98.2%</div>
                <p className="text-xs text-muted-foreground">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Ativos */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas Inteligentes
            {unreadCount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">{unreadCount}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.slice(0, 5).map(alert => {
              const AlertIcon = getAlertIcon(alert.type);
              const CategoryIcon = getCategoryIcon(alert.category);

              return (
                <Alert
                  key={alert.id}
                  className={`${getAlertColor(alert.type)} ${alert.isRead ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-start gap-3">
                      <AlertIcon className="h-4 w-4 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{alert.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            <CategoryIcon className="h-3 w-3 mr-1" />
                            {alert.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alert.priority.toUpperCase()}
                          </Badge>
                        </div>

                        <AlertDescription className="text-sm mb-2">
                          {alert.message}
                        </AlertDescription>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.timestamp.toLocaleTimeString()}
                          </span>

                          {alert.metrics && (
                            <>
                              <span>Threshold: {alert.metrics.threshold}</span>
                              <span>Current: {alert.metrics.current}</span>
                              <span className="flex items-center gap-1">
                                {alert.metrics.trend === "up" ? (
                                  <TrendingUp className="h-3 w-3 text-destructive" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 text-success" />
                                )}
                                {alert.metrics.trend}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {alert.actionable && alert.action && (
                        <Button size="sm" variant="outline">
                          {alert.action}
                        </Button>
                      )}

                      {!alert.isRead && (
                        <Button size="sm" variant="ghost" onClick={() => markAsRead(alert.id)}>
                          Marcar como lido
                        </Button>
                      )}
                    </div>
                  </div>
                </Alert>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Configuração de Regras */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Regras de Alerta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alertRules.map(rule => (
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
                          <Slider
                            value={[rule.threshold]}
                            onValueChange={value => updateThreshold(rule.id, value[0])}
                            max={100}
                            min={0}
                            step={5}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Canais de Notificação</label>
                          <div className="flex gap-2">
                            {rule.channels.includes("email") && (
                              <Badge variant="outline" className="text-xs">
                                <Mail className="h-3 w-3 mr-1" />
                                Email
                              </Badge>
                            )}
                            {rule.channels.includes("push") && (
                              <Badge variant="outline" className="text-xs">
                                <Smartphone className="h-3 w-3 mr-1" />
                                Push
                              </Badge>
                            )}
                            {rule.channels.includes("slack") && (
                              <Badge variant="outline" className="text-xs">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Slack
                              </Badge>
                            )}
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

      {/* Configurações Globais */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Configurações Globais de Alertas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">IA Preditiva</label>
                <Switch
                  checked={globalSettings.enableAI}
                  onCheckedChange={checked =>
                    setGlobalSettings(prev => ({ ...prev, enableAI: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Análise Preditiva</label>
                <Switch
                  checked={globalSettings.enablePredictive}
                  onCheckedChange={checked =>
                    setGlobalSettings(prev => ({ ...prev, enablePredictive: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto-resolução</label>
                <Switch
                  checked={globalSettings.autoResolution}
                  onCheckedChange={checked =>
                    setGlobalSettings(prev => ({ ...prev, autoResolution: checked }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Níveis de Severidade</h4>
              <div className="space-y-2">
                {Object.entries(globalSettings.severity).map(([level, enabled]) => (
                  <div key={level} className="flex items-center justify-between">
                    <label className="text-sm capitalize">{level}</label>
                    <Switch
                      checked={enabled}
                      onCheckedChange={checked =>
                        setGlobalSettings(prev => ({
                          ...prev,
                          severity: { ...prev.severity, [level]: checked },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
