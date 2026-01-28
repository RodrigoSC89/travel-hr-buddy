/**
 * Access Anomaly Dashboard
 * Security anomaly detection and threat monitoring
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Lock, Eye, UserX, Globe, Clock, Activity } from "lucide-react";

interface SecurityEvent {
  id: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  user: string;
  location: string;
  timestamp: string;
  action: string;
  blocked: boolean;
}

export const AccessAnomalyDashboard: React.FC = () => {
  const events: SecurityEvent[] = [
    { id: "1", type: "impossible_travel", severity: "critical", user: "carlos.silva@nautilus.com", location: "São Paulo → Londres (2h)", timestamp: "14:32", action: "Sessão bloqueada", blocked: true },
    { id: "2", type: "brute_force", severity: "high", user: "maria.santos@nautilus.com", location: "IP: 192.168.1.45", timestamp: "14:28", action: "IP bloqueado", blocked: true },
    { id: "3", type: "unusual_time", severity: "medium", user: "joao.oliveira@nautilus.com", location: "Escritório Santos", timestamp: "03:15", action: "Alertado", blocked: false },
    { id: "4", type: "bulk_data_access", severity: "high", user: "ana.costa@nautilus.com", location: "VPN Remoto", timestamp: "12:45", action: "Em análise", blocked: false },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-black";
      case "low": return "bg-blue-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      impossible_travel: "Viagem Impossível",
      brute_force: "Força Bruta",
      unusual_time: "Horário Incomum",
      bulk_data_access: "Acesso em Massa",
      privilege_escalation: "Escalação de Privilégio",
      data_exfiltration: "Exfiltração de Dados"
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-xl font-bold text-green-400">PROTEGIDO</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Lock className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bloqueados Hoje</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessões Ativas</p>
                <p className="text-2xl font-bold">247</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Events */}
        <Card className="lg:col-span-2 bg-card/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Eventos de Segurança
            </CardTitle>
            <Button variant="outline" size="sm">Ver Todos</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    event.severity === "critical" 
                      ? "bg-red-500/10 border-red-500/30" 
                      : "bg-muted/30 border-border"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${event.blocked ? "bg-green-500/20" : "bg-yellow-500/20"}`}>
                        {event.blocked ? (
                          <Lock className={`w-4 h-4 ${event.blocked ? "text-green-400" : "text-yellow-400"}`} />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{getTypeLabel(event.type)}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <UserX className="w-3 h-3" />
                            {event.user}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={event.blocked ? "default" : "secondary"}>
                      {event.action}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Threat Intelligence */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-lg">Inteligência de Ameaças</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Tentativas de Login</span>
                  <span className="font-bold text-red-400">156</span>
                </div>
                <div className="text-xs text-muted-foreground">Últimas 24h</div>
              </div>

              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">IPs Bloqueados</span>
                  <span className="font-bold text-orange-400">23</span>
                </div>
                <div className="text-xs text-muted-foreground">Nesta semana</div>
              </div>

              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Sessões Suspeitas</span>
                  <span className="font-bold text-yellow-400">8</span>
                </div>
                <div className="text-xs text-muted-foreground">Sob monitoramento</div>
              </div>

              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Taxa de Detecção</span>
                  <span className="font-bold text-green-400">99.7%</span>
                </div>
                <div className="text-xs text-muted-foreground">Modelo IA</div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Proteção Autônoma</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sistema detecta e bloqueia automaticamente ameaças críticas sem intervenção humana.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
